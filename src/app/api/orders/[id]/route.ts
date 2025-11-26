import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    // Only admins can update orders
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, paymentStatus } = body;

    // Map frontend status to database enum values
    const statusMap: { [key: string]: string } = {
      'pending': 'PENDING',
      'processing': 'PROCESSING',
      'completed': 'SHIPPED', // Map completed to SHIPPED
      'delivered': 'DELIVERED',
    };

    // Map frontend payment status to database enum values
    const paymentStatusMap: { [key: string]: string } = {
      'pending': 'PENDING',
      'paid': 'PAID',
      'refunded': 'REFUNDED',
    };

    const statusLower = status ? status.toLowerCase() : null;
    const statusUpper = statusLower ? statusMap[statusLower] || status.toUpperCase() : null;
    
    const paymentStatusLower = paymentStatus ? paymentStatus.toLowerCase() : null;
    const paymentStatusUpper = paymentStatusLower ? paymentStatusMap[paymentStatusLower] || paymentStatus.toUpperCase() : null;
    
    // Validate status
    const validStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (statusUpper && !validStatuses.includes(statusUpper)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Validate payment status
    const validPaymentStatuses = ['PENDING', 'PAID', 'REFUNDED'];
    if (paymentStatusUpper && !validPaymentStatuses.includes(paymentStatusUpper)) {
      return NextResponse.json(
        { error: 'Invalid payment status' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (statusUpper) {
      updateData.status = statusUpper;
    }
    if (paymentStatusUpper) {
      updateData.paymentStatus = paymentStatusUpper;
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ order: updatedOrder });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    // Only admins can delete orders
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    await prisma.order.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json(
      { error: 'Failed to delete order' },
      { status: 500 }
    );
  }
}

