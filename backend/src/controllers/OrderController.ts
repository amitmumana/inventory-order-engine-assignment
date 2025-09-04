import { Request, Response } from "express";
import { OrderService } from "../services/OrderService";
import { PrismaClient } from "@prisma/client";

const orderService = new OrderService();
const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    userRole: string;
  };
}

export class OrderController {
  async viewMyOrders(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated." });
      }

      const orders = await prisma.order.findMany({
        where: { userId },
        include: {
          orderItems: {
            include: { product: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      res.status(200).json(orders);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: "An unexpected error occurred." });
      }
    }
  }

  async pay(req: AuthenticatedRequest, res: Response) {
    try {
      const { orderId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: "User not authenticated." });
      }

      const order = await orderService.payOrder(orderId);
      res.status(200).json({ message: "Order status updated to PAID.", order });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "An unexpected error occurred." });
      }
    }
  }

  async viewStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const { orderId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: "User not authenticated." });
      }

      const order = await orderService.viewOrderStatus(orderId, userId);
      if (!order) {
        return res
          .status(404)
          .json({ error: "Order not found or access denied." });
      }

      res.status(200).json(order);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: "An unexpected error occurred." });
      }
    }
  }

  async buyNow(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated." });
      }

      const order = await orderService.buyNow(userId);
      res
        .status(201)
        .json({ message: "Order placed and paid successfully.", order });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "An unexpected error occurred." });
      }
    }
  }

  async cancelOrder(req: AuthenticatedRequest, res: Response) {
    try {
      const { orderId } = req.params;
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated." });
      }

      const cancelledOrder = await orderService.cancelOrder(orderId, userId);
      res
        .status(200)
        .json({
          message: "Order cancelled successfully.",
          order: cancelledOrder,
        });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "An unexpected error occurred." });
      }
    }
  }
}
