import { PrismaClient, OrderStatus } from "@prisma/client";

const prisma = new PrismaClient();

export const cleanupExpiredReservations = async () => {
  const now = new Date();

  const expiredReservations = await prisma.reservation.findMany({
    where: {
      expiresAt: { lt: now },
      isExpired: false,
      order: {
        status: OrderStatus.PENDING,
      },
    },
    include: { product: true },
  });

  if (expiredReservations.length === 0) {
    console.log("No expired reservations to clean up.");
    return;
  }

  console.log(
    `Found ${expiredReservations.length} expired reservations. Processing...`
  );

  await prisma.$transaction(async (tx) => {
    for (const reservation of expiredReservations) {
      await tx.product.update({
        where: { id: reservation.productId },
        data: { stock: { increment: reservation.quantity } },
      });

      await tx.reservation.update({
        where: { id: reservation.id },
        data: { isExpired: true },
      });

      if (reservation.orderId) {
        await tx.order.update({
          where: { id: reservation.orderId },
          data: { status: OrderStatus.CANCELLED },
        });
      }
    }
  });

  console.log("Expired reservations cleaned up successfully.");
};
