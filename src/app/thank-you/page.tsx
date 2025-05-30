"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface OrderConfirmation {
  orderNumber: string;
  status: 'approved' | 'declined' | 'failed';
  customer: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  order: {
    name: string;
    price: number;
    image: string;
    colorName?: string;
    sizeName?: string;
    quantity: number;
    subtotal: number;
    total: number;
  };
}

export default function ThankYouPage() {
  const router = useRouter();
  const [orderConfirmation, setOrderConfirmation] = useState<OrderConfirmation | null>(null);

  useEffect(() => {
    // Get order confirmation from session storage
    const storedOrderConfirmation = sessionStorage.getItem('orderConfirmation');
    if (storedOrderConfirmation) {
      setOrderConfirmation(JSON.parse(storedOrderConfirmation));
    } else {
      // Redirect to home if no order confirmation
      router.push('/');
    }
  }, [router]);

  if (!orderConfirmation) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  const { status } = orderConfirmation;

  return (
    <div className="max-w-4xl mx-auto p-4">
      {status === 'approved' ? (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-8">
          <div className="flex items-center">
            <svg className="w-6 h-6 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <h1 className="text-2xl font-bold text-green-700">Order Confirmed!</h1>
          </div>
          <p className="mt-2 text-green-700">Thank you for your purchase. Your order has been successfully processed.</p>
        </div>
      ) : status === 'declined' ? (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8">
          <div className="flex items-center">
            <svg className="w-6 h-6 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <h1 className="text-2xl font-bold text-red-700">Transaction Declined</h1>
          </div>
          <p className="mt-2 text-red-700">Your payment was declined by your bank. Please try again with a different payment method.</p>
        </div>
      ) : (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-8">
          <div className="flex items-center">
            <svg className="w-6 h-6 text-yellow-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h1 className="text-2xl font-bold text-yellow-700">Gateway Error</h1>
          </div>
          <p className="mt-2 text-yellow-700">We encountered an error processing your payment. Please try again later or contact support.</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-2">Order Information</h2>
        <p className="text-gray-700">Order Number: <span className="font-mono font-medium">{orderConfirmation.orderNumber}</span></p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="w-20 h-20 bg-gray-100 rounded relative overflow-hidden">
              <Image
                src={orderConfirmation.order.image}
                alt={orderConfirmation.order.name}
                width={80}
                height={80}
                className="object-contain w-full h-full"
              />
            </div>
            
            <div>
              <h3 className="font-medium">{orderConfirmation.order.name}</h3>
              <div className="text-sm text-gray-500">
                {orderConfirmation.order.colorName && <div>Color: {orderConfirmation.order.colorName}</div>}
                {orderConfirmation.order.sizeName && <div>Size: {orderConfirmation.order.sizeName}</div>}
                <div>Quantity: {orderConfirmation.order.quantity}</div>
              </div>
            </div>
          </div>
          
          <div className="border-t pt-4 mt-4">
            <div className="flex justify-between mb-2">
              <span>Subtotal</span>
              <span>${orderConfirmation.order.subtotal.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>${orderConfirmation.order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
          
          <div className="space-y-2">
            <p><span className="font-medium">Name:</span> {orderConfirmation.customer.fullName}</p>
            <p><span className="font-medium">Email:</span> {orderConfirmation.customer.email}</p>
            <p><span className="font-medium">Phone:</span> {orderConfirmation.customer.phone}</p>
            <p><span className="font-medium">Address:</span> {orderConfirmation.customer.address}</p>
            <p><span className="font-medium">City:</span> {orderConfirmation.customer.city}</p>
            <p><span className="font-medium">State:</span> {orderConfirmation.customer.state}</p>
            <p><span className="font-medium">ZIP Code:</span> {orderConfirmation.customer.zipCode}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={() => router.push('/')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
        >
          Return to Home
        </button>
      </div>
    </div>
  );
}
