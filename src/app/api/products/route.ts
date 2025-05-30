import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Fetch product with its variants
    const products = await prisma.product.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // For each product, fetch its variants
    const productsWithVariants = await Promise.all(
      products.map(async (product) => {
        const variants = await prisma.variant.findMany({
          where: { productId: product.id }
        });
        
        // Separate variants by type (color, size)
        const colors = variants.filter(v => v.type === 'color');
        const sizes = variants.filter(v => v.type === 'size');
        
        return {
          ...product,
          variants: {
            colors,
            sizes
          }
        };
      })
    );
    
    return NextResponse.json(productsWithVariants);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { message: 'Error fetching products' },
      { status: 500 }
    );
  }
}
