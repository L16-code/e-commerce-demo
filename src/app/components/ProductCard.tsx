"use client";

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Product, ProductVariant } from '../data/products';

interface ProductCardProps {
  product: Product;
  isListing?: boolean;
}

export default function ProductCard({ product, isListing = false }: ProductCardProps) {
  const router = useRouter();
  const [selectedColor, setSelectedColor] = useState<ProductVariant | null>(product.variants.colors[0]);
  const [selectedSize, setSelectedSize] = useState<ProductVariant | null>(product.variants.sizes[0]);
  const [quantity, setQuantity] = useState(1);

  const handleQuantityChange = (value: number) => {
    if (value >= 1 && value <= product.inventory) {
      setQuantity(value);
    }
  };

  const handleBuyNow = () => {
    // Store selection in session storage to retrieve on checkout page
    const orderDetails = {
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      colorId: selectedColor?.id,
      colorName: selectedColor?.name,
      sizeId: selectedSize?.id,
      sizeName: selectedSize?.name,
      quantity,
      subtotal: product.price * quantity,
      total: product.price * quantity, // In a real app, would add tax, shipping, etc.
    };
    
    // Save to session storage
    sessionStorage.setItem('orderDetails', JSON.stringify(orderDetails));
    
    // Navigate to checkout
    router.push('/checkout');
  };

  // Listing view (simplified card for product listing)
  if (isListing) {
    return (
      <div className="h-full border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <div className="relative w-full h-48 bg-gray-100">
          <Image 
            src={product.image} 
            alt={product.name}
            fill
            style={{ objectFit: 'contain' }}
            priority
          />
        </div>
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-2 truncate">{product.name}</h2>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-blue-600">${product.price.toFixed(2)}</span>
            <span className="text-xs text-gray-500">
              {product.inventory > 0 ? `${product.inventory} in stock` : 'Out of stock'}
            </span>
          </div>
        </div>
      </div>
    );
  }
  
  // Detail view (full product details)
  return (
    <div className="max-w-6xl mx-auto p-4 flex flex-col lg:flex-row gap-8">
      <div className="lg:w-1/2 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
        <div className="relative w-full h-[400px]">
          <Image 
            src={product.image} 
            alt={product.name}
            fill
            style={{ objectFit: 'contain' }}
            priority
          />
        </div>
      </div>
      
      <div className="lg:w-1/2 flex flex-col gap-4">
        <h1 className="text-3xl font-bold">{product.name}</h1>
        <p className="text-gray-600">{product.description}</p>
        
        <div className="text-2xl font-bold mt-2">${product.price.toFixed(2)}</div>
        
        <div className="mt-4">
          <h3 className="text-lg font-medium mb-2">Color</h3>
          <div className="flex gap-2">
            {product.variants.colors.map((color) => (
              <button
                key={color.id}
                onClick={() => setSelectedColor(color)}
                className={`w-10 h-10 rounded-full border-2 ${selectedColor?.id === color.id ? 'border-blue-500' : 'border-gray-300'}`}
                style={{ backgroundColor: color.value }}
                aria-label={`Select ${color.name} color`}
              />
            ))}
          </div>
          {selectedColor && (
            <div className="mt-1 text-sm">{selectedColor.name}</div>
          )}
        </div>
        
        <div className="mt-4">
          <h3 className="text-lg font-medium mb-2">Size</h3>
          <div className="flex flex-wrap gap-2">
            {product.variants.sizes.map((size) => (
              <button
                key={size.id}
                onClick={() => setSelectedSize(size)}
                className={`px-4 py-2 border rounded ${selectedSize?.id === size.id ? 'bg-blue-500 text-white' : 'border-gray-300'}`}
              >
                {size.name}
              </button>
            ))}
          </div>
        </div>
        
        <div className="mt-4">
          <h3 className="text-lg font-medium mb-2">Quantity</h3>
          <div className="flex items-center">
            <button 
              onClick={() => handleQuantityChange(quantity - 1)}
              className="px-3 py-1 border border-gray-300 rounded-l"
              disabled={quantity <= 1}
            >
              -
            </button>
            <input 
              type="number" 
              value={quantity}
              onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
              className="w-16 text-center border-t border-b border-gray-300 py-1"
              min={1}
              max={product.inventory}
            />
            <button 
              onClick={() => handleQuantityChange(quantity + 1)}
              className="px-3 py-1 border border-gray-300 rounded-r"
              disabled={quantity >= product.inventory}
            >
              +
            </button>
          </div>
        </div>
        
        <button 
          onClick={handleBuyNow}
          className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors w-full md:w-auto"
        >
          Buy Now
        </button>
        
        <div className="mt-4 text-sm text-gray-500">
          {product.inventory > 0 ? `${product.inventory} items in stock` : 'Out of stock'}
        </div>
      </div>
    </div>
  );
}
