"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ProductCard from '@/app/components/ProductCard';
import ThemeToggle from '@/app/components/ThemeToggle';
import { Product } from '@/app/data/products';
import Link from 'next/link';

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        console.log('Fetching product with ID:', productId);
        const response = await fetch(`/api/products/${productId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Product not found');
          }
          throw new Error('Failed to fetch product');
        }
        
        const data = await response.json();
        console.log('Product data:', data);
        setProduct(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error loading product';
        setError(errorMessage);
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (productId) {
      fetchProduct();
    } else {
      setError('Invalid product ID');
    }
  }, [productId]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <header className="bg-white shadow">
          <div className="max-w-6xl mx-auto p-4">
            <h1 className="text-2xl font-bold text-blue-600">eCommerce Store</h1>
          </div>
        </header>
        <main className="max-w-6xl mx-auto p-4 py-8">
          <div className="p-8 text-center">Loading product...</div>
        </main>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen">
        <header className="bg-white shadow">
          <div className="max-w-6xl mx-auto p-4">
            <h1 className="text-2xl font-bold text-blue-600">eCommerce Store</h1>
          </div>
        </header>
        <main className="max-w-6xl mx-auto p-4 py-8">
          <div className="p-8 text-center text-red-500">{error}</div>
        </main>
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="min-h-screen">
        <header className="bg-white shadow">
          <div className="max-w-6xl mx-auto p-4">
            <h1 className="text-2xl font-bold text-blue-600">eCommerce Store</h1>
          </div>
        </header>
        <main className="max-w-6xl mx-auto p-4 py-8">
          <div className="p-8 text-center">Product not found</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="header bg-white shadow">
        <div className="max-w-6xl mx-auto p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">eCommerce Store</h1>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium">
              Back to Products
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 py-8">
        <ProductCard product={product} />
      </main>
    </div>
  );
}
