"use client";

import { useEffect, useState } from 'react';
import ProductCard from './ProductCard';
import ThemeToggle from './ThemeToggle';
import { Product } from '../data/products';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/products');
        
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const data = await response.json();
        if (data && data.length > 0) {
          setProducts(data);
        } else {
          setError('No products found');
        }
      } catch (err) {
        setError('Error loading products');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  const handleProductClick = (productId: string, inventory: number) => {
    if (inventory > 0) {
      router.push(`/product/${productId}`);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading products...</div>;
  }
  
  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }
  
  if (products.length === 0) {
    return <div className="p-8 text-center">No products found</div>;
  }

  return (
    <div className="min-h-screen">
      <header className="header bg-white shadow">
        <div className="max-w-6xl mx-auto p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">eCommerce Store</h1>
          <div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 py-8">
        <h2 className="text-2xl font-semibold mb-6">Our Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div 
              key={product.id}
              onClick={() => {
                handleProductClick(product.id , product.inventory );
              }}
              className="cursor-pointer transition-transform hover:scale-105 block"
            >
              <ProductCard product={product} isListing={true} />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
