// src/cleanup.ts
import { PrismaClient, OrderStatus } from "@prisma/client";

const prisma = new PrismaClient();

export const cleanupExpiredReservations = async () => {
  const now = new Date();

  // Find all reservations linked to a PENDING order that have expired
  const expiredReservations = await prisma.reservation.findMany({
    where: {
      expiresAt: { lt: now },
      order: {
        status: OrderStatus.PENDING,
      },
    },
    include: { product: true, order: true },
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

      if (reservation.orderId) {
        await tx.order.update({
          where: { id: reservation.orderId },
          data: { status: OrderStatus.CANCELLED },
        });
      }

      await tx.reservation.delete({ where: { id: reservation.id } });
    }
  });

  console.log("Expired reservations cleaned up successfully.");
};
