import { Request, Response } from "express";
import { OrderStatus } from "@prisma/client";
import { AdminService } from "../services/AdminService";

const adminService = new AdminService();

export class AdminController {
  async adjustStock(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { stock } = req.body;

      if (typeof stock !== "number" || stock < 0) {
        return res
          .status(400)
          .json({ error: "Stock must be a non-negative number." });
      }

      const product = await adminService.adjustProductStock(id, stock);
      res.status(200).json({ message: "Stock updated successfully.", product });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "An unexpected error occurred." });
      }
    }
  }

  async viewActiveReservations(req: Request, res: Response) {
    try {
      const reservations = await adminService.getActiveReservations();
      res.status(200).json(reservations);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: "An unexpected error occurred." });
      }
    }
  }

  async viewAllOrders(req: Request, res: Response) {
    try {
      const orders = await adminService.getAllOrders();
      res.status(200).json(orders);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: "An unexpected error occurred." });
      }
    }
  }

  async updateOrderStatus(req: Request, res: Response) {
    try {
      const { orderId } = req.params;
      const { status } = req.body;

      if (!Object.values(OrderStatus).includes(status)) {
        return res.status(400).json({ error: "Invalid order status." });
      }

      const updatedOrder = await adminService.updateOrderStatus(
        orderId,
        status
      );
      res.status(200).json({
        message: "Order status updated successfully.",
        order: updatedOrder,
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
