import {
  PrismaClient,
  Product,
  Order,
  OrderStatus,
  Reservation,
} from "@prisma/client";

const prisma = new PrismaClient();

export class AdminService {
  async adjustProductStock(productId: string, stock: number): Promise<Product> {
    if (stock < 0) {
      throw new Error("Stock cannot be a negative number.");
    }
    return prisma.product.update({
      where: { id: productId },
      data: { stock },
    });
  }

  async getActiveReservations(): Promise<Reservation[]> {
    return prisma.reservation.findMany({
      where: { isExpired: false },
      include: { product: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async getAllOrders(): Promise<Order[]> {
    return prisma.order.findMany({
      include: {
        orderItems: {
          include: { product: true },
        },
        user: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus
  ): Promise<Order> {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      throw new Error("Order not found.");
    }

    return prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus },
    });
  }
}
