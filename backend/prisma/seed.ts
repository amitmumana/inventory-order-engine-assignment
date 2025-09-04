// prisma/seed.ts
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding...");

  // Create a default admin user
  const adminPassword = await bcrypt.hash("adminpassword", 10);
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      password: adminPassword,
      role: Role.ADMIN,
    },
  });

  // Create a default regular user
  const userPassword = await bcrypt.hash("userpassword", 10);
  const regularUser = await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: {
      email: "user@example.com",
      password: userPassword,
      role: Role.USER,
    },
  });

  console.log(
    `Created admin user with email: ${adminUser.email} and password: adminpassword`
  );
  console.log(
    `Created regular user with email: ${regularUser.email} and password: userpassword`
  );

  const products = [
    {
      name: "Smartwatch",
      description:
        "A sleek and modern smartwatch with health tracking features.",
      price: 199.99,
      stock: 50,
      image: "https://picsum.photos/seed/smartwatch/400/300",
      rating: 4.5,
      category: "Electronics",
    },
    {
      name: "Wireless Headphones",
      description:
        "Noise-cancelling headphones with superior sound quality and comfort.",
      price: 149.5,
      stock: 120,
      image: "https://picsum.photos/seed/headphones/400/300",
      rating: 4.8,
      category: "Electronics",
    },
    {
      name: "4K LED Monitor",
      description:
        "A high-resolution monitor perfect for gaming and professional design.",
      price: 399.0,
      stock: 30,
      image: "https://picsum.photos/seed/monitor/400/300",
      rating: 4.2,
      category: "Electronics",
    },
    {
      name: "Vintage Leather Jacket",
      description:
        "Classic vintage jacket made from high-quality distressed leather.",
      price: 250.0,
      stock: 15,
      image: "https://picsum.photos/seed/jacket/400/300",
      rating: 4.7,
      category: "Apparel",
    },
    {
      name: "Running Shoes",
      description:
        "Lightweight and durable shoes designed for long-distance running.",
      price: 85.0,
      stock: 200,
      image: "https://picsum.photos/seed/shoes/400/300",
      rating: 4.6,
      category: "Apparel",
    },
    {
      name: "Ceramic Coffee Mug",
      description: "Hand-crafted ceramic mug with a unique, rustic design.",
      price: 15.0,
      stock: 500,
      image: "https://picsum.photos/seed/mug/400/300",
      rating: 4.9,
      category: "Home & Kitchen",
    },
    {
      name: "Stainless Steel Water Bottle",
      description:
        "Insulated bottle that keeps drinks cold for up to 24 hours.",
      price: 25.0,
      stock: 350,
      image: "https://picsum.photos/seed/bottle/400/300",
      rating: 4.4,
      category: "Home & Kitchen",
    },
    {
      name: "Ergonomic Office Chair",
      description:
        "A chair designed to provide maximum comfort and support for long workdays.",
      price: 299.0,
      stock: 45,
      image: "https://picsum.photos/seed/chair/400/300",
      rating: 4.3,
      category: "Furniture",
    },
    {
      name: "Portable Bluetooth Speaker",
      description:
        "Compact speaker with powerful sound and a long-lasting battery.",
      price: 75.0,
      stock: 90,
      image: "https://picsum.photos/seed/speaker/400/300",
      rating: 4.6,
      category: "Electronics",
    },
    {
      name: "Modern Wall Clock",
      description: "Minimalist design clock that complements any room decor.",
      price: 45.0,
      stock: 60,
      image: "https://picsum.photos/seed/clock/400/300",
      rating: 4.1,
      category: "Home & Kitchen",
    },
    {
      name: "Dumbbell Set",
      description: "Adjustable weight set for a versatile home workout.",
      price: 120.0,
      stock: 75,
      image: "https://picsum.photos/seed/dumbbells/400/300",
      rating: 4.5,
      category: "Sports & Outdoors",
    },
    {
      name: "Yoga Mat",
      description: "Non-slip mat for yoga and other floor exercises.",
      price: 35.0,
      stock: 150,
      image: "https://picsum.photos/seed/yogamat/400/300",
      rating: 4.7,
      category: "Sports & Outdoors",
    },
    {
      name: "Digital Camera",
      description:
        "High-performance camera for capturing stunning photos and videos.",
      price: 550.0,
      stock: 25,
      image: "https://picsum.photos/seed/camera/400/300",
      rating: 4.9,
      category: "Electronics",
    },
    {
      name: "Hardcover Notebook",
      description:
        "Premium notebook with a durable hardcover and high-quality paper.",
      price: 20.0,
      stock: 400,
      image: "https://picsum.photos/seed/notebook/400/300",
      rating: 4.3,
      category: "Stationery",
    },
    {
      name: "Mechanical Keyboard",
      description:
        "RGB mechanical keyboard with a satisfying tactile feel for gaming and typing.",
      price: 130.0,
      stock: 80,
      image: "https://picsum.photos/seed/keyboard/400/300",
      rating: 4.8,
      category: "Electronics",
    },
  ];

  for (const product of products) {
    await prisma.product.create({
      data: product,
    });
  }

  console.log("Sample products created.");

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
