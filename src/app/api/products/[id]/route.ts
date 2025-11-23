import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const productUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  category: z.string().min(1).optional(),
  price: z.number().optional(),
  image: z.string().optional(),
  images: z.array(z.string()).optional(),
  weightRange: z.string().optional(),
  isActive: z.boolean().optional(),
  variants: z
    .array(
      z.object({
        id: z.string().optional(),
        weight: z.string(),
        dimensions: z.string().optional(),
        description: z.string().optional(),
        width: z.string().optional(),
        height: z.string().optional(),
        diameter: z.string().optional(),
        purities: z.array(z.string()).optional(),
      })
    )
    .optional(),
});

// GET /api/products/[id] - Get single product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        variants: true,
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/products/[id] - Update product (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const data = productUpdateSchema.parse(body);

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: { variants: true },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Update product
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        category: data.category,
        price: data.price,
        image: data.image,
        images: data.images,
        weightRange: data.weightRange,
        isActive: data.isActive,
      },
      include: {
        variants: true,
      },
    });

    // Update variants if provided
    if (data.variants) {
      // Delete existing variants
      await prisma.productVariant.deleteMany({
        where: { productId: id },
      });

      // Create new variants
      if (data.variants.length > 0) {
        await prisma.productVariant.createMany({
          data: data.variants.map((variant) => ({
            productId: id,
            weight: variant.weight,
            dimensions: variant.dimensions || "",
            description: variant.description || "",
            width: variant.width || "",
            height: variant.height || "",
            diameter: variant.diameter || "",
            purities: variant.purities || [],
          })),
        });
      }

      // Fetch updated product with variants
      const productWithVariants = await prisma.product.findUnique({
        where: { id },
        include: { variants: true },
      });

      return NextResponse.json({ product: productWithVariants });
    }

    return NextResponse.json({ product: updatedProduct });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id] - Delete product (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    // Soft delete by setting isActive to false
    await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

