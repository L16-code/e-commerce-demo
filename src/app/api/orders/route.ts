import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';

// Configure Nodemailer with Mailtrap credentials
const MAILTRAP_HOST = process.env.MAILTRAP_HOST || 'sandbox.smtp.mailtrap.io';
const MAILTRAP_PORT = parseInt(process.env.MAILTRAP_PORT || '2525');
const MAILTRAP_USER = process.env.MAILTRAP_USER || 'your_mailtrap_user';
const MAILTRAP_PASS = process.env.MAILTRAP_PASS || 'your_mailtrap_password';

// Log email config for debugging (remove in production)
console.log('Email Configuration:', {
  host: MAILTRAP_HOST,
  port: MAILTRAP_PORT,
  user: MAILTRAP_USER ? 'Provided' : 'Not provided',
  pass: MAILTRAP_PASS ? 'Provided' : 'Not provided'
});

const transporter = nodemailer.createTransport({
  host: MAILTRAP_HOST,
  port: MAILTRAP_PORT,
  auth: {
    user: MAILTRAP_USER,
    pass: MAILTRAP_PASS,
  },
  secure: false
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customer, payment, order } = body;
    
    // For simulation purposes only - in a real app we'd use actual DB data
    // First, check if we need to create mock data for the simulation

    // Validate required fields
    if (!customer || !payment || !order) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Determine transaction status based on first digit of card number
    // 1: Approved, 2: Declined, 3: Gateway Error
    let status = 'approved';
    if (payment.cardNumber.startsWith('2')) {
      status = 'declined';
    } else if (payment.cardNumber.startsWith('3')) {
      status = 'failed';
    }

    // Create customer and order in database
    if (status === 'approved') {
      try {
        // Find the actual product by ID that was purchased
        console.log('Looking for product with ID:', order.productId);
        
        let product;
        
        if (order.productId) {
          // Try to find the actual product first
          product = await prisma.product.findUnique({
            where: { id: order.productId }
          });
          
          console.log(product ? 'Found product by ID' : 'Product not found by ID');
        }
        
        // Fallback to finding any product if the exact one wasn't found
        if (!product) {
          product = await prisma.product.findFirst();
          console.log(product ? 'Using fallback product' : 'No products found in database');
        }
        
        // Create a mock product as a last resort
        if (!product) {
          console.log('Creating mock product as last resort');
          product = await prisma.product.create({
            data: {
              name: order.name || 'Demo Product',
              description: 'This is a demo product for simulation',
              price: order.price || 79.99,
              image: order.image || '/images/shoes.png',
              inventory: 100,
            },
          });
          
          // Create a mock variant for the product
          if (order.colorName) {
            await prisma.variant.create({
              data: {
                name: order.colorName,
                type: 'color',
                value: '#000000',
                productId: product.id,
              },
            });
          }
        }
        
        // Create customer
        const newCustomer = await prisma.customer.create({
          data: {
            fullName: customer.fullName,
            email: customer.email,
            phone: customer.phone,
            address: customer.address,
            city: customer.city,
            state: customer.state,
            zipCode: customer.zipCode,
          },
        });

        // Create order
        await prisma.order.create({
          data: {
            orderNumber,
            customerId: newCustomer.id,
            subtotal: order.subtotal,
            total: order.total,
            status,
            transactionId: `TXN-${Date.now()}`,
            items: {
              create: [
                {
                  productId: product.id, // Use our product ID
                  variantId: null, // Simplified for the simulation
                  quantity: order.quantity,
                  price: order.price,
                  totalPrice: order.price * order.quantity,
                },
              ],
            },
          },
        });

        // Update product inventory
        try {
          console.log(`Updating inventory for product ${product.id}, decreasing by ${order.quantity} units`);
          const updatedProduct = await prisma.product.update({
            where: { id: product.id },
            data: { inventory: { decrement: order.quantity } },
          });
          console.log('Inventory updated successfully:', {
            productId: updatedProduct.id,
            newInventory: updatedProduct.inventory
          });
        } catch (inventoryError) {
          console.error('Failed to update product inventory:', inventoryError);
          // Continue with the order process but log the error
        }
      } catch (dbError) {
        console.error('Database error:', dbError);
        // Continue with the process even if DB operations fail
        // In a real application, we would handle this differently
      }
    }

    // Send email based on transaction status
    try {
      if (status === 'approved') {
        // Send success email
        const successHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #4CAF50;">Order Confirmed!</h1>
            <p>Dear ${customer.fullName},</p>
            <p>Thank you for your purchase. Your order has been successfully processed.</p>
            <div style="border: 1px solid #eee; padding: 15px; margin: 15px 0;">
              <h2 style="margin-top: 0;">Order Details</h2>
              <p><strong>Order Number:</strong> ${orderNumber}</p>
              <p><strong>Product:</strong> ${order.name}</p>
              <p><strong>Quantity:</strong> ${order.quantity}</p>
              <p><strong>Total:</strong> $${order.total.toFixed(2)}</p>
            </div>
            <p>We will ship your order soon. You will receive a notification when it's on the way.</p>
            <p>Thank you for shopping with us!</p>
          </div>
        `;
        const sender = {
          email: "hello@demomailtrap.co",
          name: "Mailtrap Test",
        };
        await transporter.sendMail({
          from: sender,
          to: customer.email,
          subject: 'Your Order Confirmation',
          html: successHtml
        });
        console.log('Success email sent to:', customer.email);
      } else {
        // Send failure email
        const failureHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #F44336;">Order Issue</h1>
            <p>Dear ${customer.fullName},</p>
            <p>We're sorry, but there was an issue processing your order.</p>
            <p>This is usually due to payment issues. Please check your payment details and try again.</p>
            <p>If you continue to experience problems, please contact our customer support.</p>
            <p>Thank you for your understanding.</p>
          </div>
        `;
        
        await transporter.sendMail({
          from: '"E-Commerce Store" <no-reply@your-ecommerce-store.com>',
          to: customer.email,
          subject: 'Issue with Your Order',
          html: failureHtml
        });
        console.log('Failure email sent to:', customer.email);
      }
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Continue the process even if email sending fails
      // In a real application, we would handle this differently
    }

    // Return response based on transaction status
    if (status === 'approved') {
      return NextResponse.json({
        message: 'Order placed successfully',
        orderNumber,
        status,
      });
    } else if (status === 'declined') {
      return NextResponse.json(
        {
          message: 'Transaction declined by bank',
          orderNumber,
          status,
        },
        { status: 400 }
      );
    } else {
      return NextResponse.json(
        {
          message: 'Payment gateway error',
          orderNumber,
          status,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error processing order:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
