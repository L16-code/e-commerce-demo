import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type RouteParams = { params: { id: string } };

// Using Next.js 15 App Router pattern for dynamic routes
export async function GET(request: Request, context: RouteParams) {
  try {
    const id = context.params.id;
    
    // Fetch product by ID
    const product = await prisma.product.findUnique({
      where: { id }
    });
    
    if (!product) {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      );
    }
    
    // Fetch variants for this product
    const variants = await prisma.variant.findMany({
      where: { productId: id }
    });
    
    // Separate variants by type (color, size)
    const colors = variants.filter(v => v.type === 'color');
    const sizes = variants.filter(v => v.type === 'size');
    
    // Return product with its variants
    return NextResponse.json({
      ...product,
      variants: {
        colors,
        sizes
      }
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { message: 'Error fetching product' },
      { status: 500 }
    );
  }
}
