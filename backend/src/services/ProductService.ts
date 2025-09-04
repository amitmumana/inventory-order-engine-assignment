import { PrismaClient, Product } from "@prisma/client";

const prisma = new PrismaClient();

export class ProductService {
  async getAllProducts(): Promise<Product[]> {
    return prisma.product.findMany({});
  }

  async getProductById(id: string): Promise<Product | null> {
    return prisma.product.findUnique({
      where: { id },
    });
  }
}
