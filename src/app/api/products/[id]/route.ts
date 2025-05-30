import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface Params {
  params: {
    id: string;
  };
}

export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = params;
    
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
