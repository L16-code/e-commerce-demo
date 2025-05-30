// Mock product data for the eCommerce checkout flow

export interface ProductVariant {
  id: string;
  type: string;
  name: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  inventory: number;
  variants: {
    colors: ProductVariant[];
    sizes: ProductVariant[];
  };
}

const products: Product[] = [
  {
    id: "1",
    name: "Converse Chuck Taylor All Star II Hi",
    description: "The Converse Chuck Taylor All Star II Hi gives the classic Chuck Taylor a modern upgrade with premium materials and enhanced comfort features while maintaining the iconic look you love.",
    price: 79.99,
    image: "/images/shoes.png", // Using a placeholder image in public/images folder
    inventory: 50,
    variants: {
      colors: [
        { id: "color-1", type: "color", name: "Black", value: "#000000" },
        { id: "color-2", type: "color", name: "White", value: "#FFFFFF" },
        { id: "color-3", type: "color", name: "Red", value: "#FF0000" },
      ],
      sizes: [
        { id: "size-1", type: "size", name: "US 7", value: "7" },
        { id: "size-2", type: "size", name: "US 8", value: "8" },
        { id: "size-3", type: "size", name: "US 9", value: "9" },
        { id: "size-4", type: "size", name: "US 10", value: "10" },
        { id: "size-5", type: "size", name: "US 11", value: "11" },
      ],
    },
  },
];

export default products;

export const getProductById = (id: string): Product | undefined => {
  return products.find((product) => product.id === id);
};
