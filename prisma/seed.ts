import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  try {
    // Clear existing data
    console.log('Cleaning existing data...');
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.variant.deleteMany();
    await prisma.product.deleteMany();
    await prisma.customer.deleteMany();
    
    console.log('Seeding database...');
    
    // Define product data
    const productsData = [
      {
        name: "Converse Chuck Taylor All Star II Hi",
        description: "The Converse Chuck Taylor All Star II Hi gives the classic Chuck Taylor a modern upgrade with premium materials and enhanced comfort features while maintaining the iconic look you love.",
        price: 79.99,
        image: "/images/shoes.png",
        inventory: 50,
      },
      {
        name: "Nike Air Max 270",
        description: "The Nike Air Max 270 delivers visible cushioning under every step with a large Air unit and comfortable foam. It features a stretchy inner sleeve for a snug, sock-like fit while the padded heel adds extra comfort.",
        price: 149.99,
        image: "/images/nike-air-max.png",
        inventory: 35,
      },
      {
        name: "Adidas Ultraboost 21",
        description: "Feel the energy with each step in the Adidas Ultraboost 21. Featuring responsive Boost cushioning and a supportive Primeknit upper, these running shoes deliver comfort and performance for every run.",
        price: 179.99,
        image: "/images/adidas-ultraboost.png",
        inventory: 40,
      },
      {
        name: "New Balance 574 Classic",
        description: "The New Balance 574 Classic is a comfortable, casual sneaker with a suede and mesh upper and ENCAP midsole technology for support. Perfect for everyday wear with iconic style.",
        price: 89.99,
        image: "/images/new-balance.png",
        inventory: 45,
      },
      {
        name: "Puma RS-X Reinvention",
        description: "The Puma RS-X Reinvention is a bold, chunky sneaker that reimagines Puma's classic Running System technology with exaggerated design elements and vibrant color combinations.",
        price: 110.00,
        image: "/images/puma-rs.png",
        inventory: 30,
      },
      {
        name: "Vans Old Skool",
        description: "The Vans Old Skool is a classic skate shoe with the iconic side stripe, featuring a durable suede and canvas upper with padded collars for support and flexibility.",
        price: 65.00,
        image: "/images/vans-old-skool.png",
        inventory: 55,
      }
    ];
    
    // Create all products
    for (const productData of productsData) {
      const product = await prisma.product.create({
        data: productData,
      });
      
      console.log(`Created product with ID: ${product.id}`);
      
      // Create color variants
      const colors = [
        { type: "color", name: "Black", value: "#000000" },
        { type: "color", name: "White", value: "#FFFFFF" },
        { type: "color", name: "Red", value: "#FF0000" },
      ];
      
      for (const color of colors) {
        await prisma.variant.create({
          data: {
            type: color.type,
            name: color.name,
            value: color.value,
            productId: product.id,
          },
        });
      }
      
      // Create size variants
      const sizes = [
        { type: "size", name: "US 7", value: "7" },
        { type: "size", name: "US 8", value: "8" },
        { type: "size", name: "US 9", value: "9" },
        { type: "size", name: "US 10", value: "10" },
        { type: "size", name: "US 11", value: "11" },
      ];
    
      for (const size of sizes) {
        await prisma.variant.create({
          data: {
            type: size.type,
            name: size.name,
            value: size.value,
            productId: product.id,
          },
        });
      }
    }
    
    console.log('Seeding completed!');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
