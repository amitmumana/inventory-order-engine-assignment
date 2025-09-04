import { PrismaClient, Order, OrderStatus } from "@prisma/client";

const prisma = new PrismaClient();
const RESERVATION_HOLD_MINUTES: any = process.env.RESERVATION_DELAY || "1";

export class OrderService {
  async initiateCheckout(userId: string): Promise<Order> {
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
          throw new Error(`Not enough stock for product: ${product.name}`);
        }
        orderItemsData.push({
          productId: item.productId,
          quantity: item.quantity,
        });

        // Decrement the stock as the transaction is successful.
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // 3. Create the new order with a PENDING status.
      const newOrder = await tx.order.create({
        data: {
          userId,
          status: OrderStatus.PENDING,
          orderItems: { create: orderItemsData },
        },
      });

      // 4. Create a reservation for this pending order.
      const expiresAt = new Date(Date.now() + RESERVATION_HOLD_MINUTES * 60000);
      for (const item of userCart.cartItems) {
        await tx.reservation.create({
          data: {
            orderId: newOrder.id,
            productId: item.productId,
            quantity: item.quantity,
            expiresAt,
          },
        });
      }

      await tx.cartItem.deleteMany({
        where: { cartId: userCart.id },
      });

      return newOrder;
    });
  }

  async payOrder(orderId: string, userId: string): Promise<Order> {
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId, userId },
      });
      if (!order) {
        throw new Error("Order not found or access denied.");
      }
      if (order.status !== OrderStatus.PENDING) {
        throw new Error("Order cannot be paid. It is not in PENDING status.");
      }

      await tx.reservation.deleteMany({ where: { orderId } });

      return tx.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.PAID },
      });
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

      // Return the stock for each item in the order
      for (const item of order.orderItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }

      // Update the order status to CANCELLED
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.CANCELLED },
      });

      return updatedOrder;
    });
  }

  async getOrderDetails(
    orderId: string,
    userId: string
  ): Promise<Order | null> {
    return prisma.order.findFirst({
      where: { id: orderId, userId },
      include: {
        orderItems: {
          include: { product: true },
        },
        reservation: true,
      },
    });
  }

  async viewMyOrders(userId: string): Promise<Order[]> {
    return prisma.order.findMany({
      where: { userId },
      include: {
        orderItems: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }
}
