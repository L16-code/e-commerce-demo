import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Handle GET request for a single product
 * @param _request The request object (unused)
 * @param params The route parameters containing the product ID
 */
export async function GET(_request: Request, { params }: { params: { id: string } }) {
  // Get the product ID from the route parameters
  const id = params.id;
  
  try {
    // Fetch product by ID
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        variants: true // Include all variants
      }
    });
    
    // Return 404 if product not found
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
