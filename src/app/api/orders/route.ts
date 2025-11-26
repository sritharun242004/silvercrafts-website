import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET() {
  try {
    const session = await auth();
    
    // Only admins can view all orders
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// Generate a 6-character order number
function generateOrderNumber(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const body = await request.json();
    const { name, email, phone, businessName, gstin, items } = body;

    if (!name || !email || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate unique order number
    let orderNumber: string;
    let isUnique = false;
    let attempts = 0;
    
    while (!isUnique && attempts < 10) {
      orderNumber = generateOrderNumber();
      const existing = await prisma.order.findUnique({
        where: { orderNumber },
      });
      if (!existing) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return NextResponse.json(
        { error: 'Failed to generate unique order number' },
        { status: 500 }
      );
    }

    const order = await prisma.order.create({
      data: {
        orderNumber: orderNumber!,
        userId: session?.user?.id || null,
        name,
        email,
        phone: phone || null,
        businessName: businessName || null,
        gstin: gstin || null,
        items: items,
        status: 'PENDING',
        paymentStatus: 'PENDING',
      },
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

