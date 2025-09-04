import { PrismaClient, Order, OrderStatus } from "@prisma/client";

const prisma = new PrismaClient();
const RESERVATION_HOLD_MINUTES = 15;

export class OrderService {
  async buyNow(userId: string): Promise<Order> {
    return prisma.$transaction(async (tx) => {
      const userCart = await tx.cart.findFirst({
        where: { userId, isGuest: false },
        include: { cartItems: { include: { product: true } } },
      });

      if (!userCart || userCart.cartItems.length === 0) {
        throw new Error("Your cart is empty.");
      }

      const orderItemsData = [];
      for (const item of userCart.cartItems) {
        const product = item.product;

        if (product.stock < item.quantity) {
          throw new Error(
            `Not enough stock available for product: ${product.name}`
          );
        }

        await tx.product.update({
          where: { id: product.id },
          data: { stock: { decrement: item.quantity } },
        });

        orderItemsData.push({
          productId: item.productId,
          quantity: item.quantity,
        });
      }

      const newOrder = await tx.order.create({
        data: {
          userId,
          status: OrderStatus.PAID,
          orderItems: {
            create: orderItemsData,
          },
        },
      });

      await tx.cartItem.deleteMany({
        where: { cartId: userCart.id },
      });

      return newOrder;
    });
  }

  async payOrder(orderId: string): Promise<Order> {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      throw new Error("Order not found.");
    }
    if (order.status !== OrderStatus.PENDING) {
      throw new Error("Order cannot be paid. It is not in PENDING status.");
    }

    return prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.PAID },
    });
  }

  async cancelOrder(orderId: string, userId: string): Promise<Order> {
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId, userId },
        include: {
          orderItems: true,
        },
      });

      if (!order) {
        throw new Error("Order not found or access denied.");
      }

      if (order.status !== OrderStatus.PENDING) {
        throw new Error("Only pending orders can be cancelled.");
      }

      for (const item of order.orderItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }

      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.CANCELLED },
      });

      return updatedOrder;
    });
  }

  async viewOrderStatus(
    orderId: string,
    userId: string
  ): Promise<Order | null> {
    return prisma.order.findFirst({
      where: { id: orderId, userId },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });
  }
}
