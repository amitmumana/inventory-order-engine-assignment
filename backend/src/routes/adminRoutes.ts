import { Router } from "express";
import { AdminController } from "../controllers/AdminController";
import { authMiddleware } from "../middleware/authMiddleware";
import { roleMiddleware } from "../middleware/roleMiddleware";
import { Role, OrderStatus } from "@prisma/client";

const router = Router();
const adminController = new AdminController();

router.use(authMiddleware);
router.use(roleMiddleware(Role.ADMIN));

router.patch("/products/:id/stock", adminController.adjustStock);
router.get("/reservations", adminController.viewActiveReservations);
router.get("/orders", adminController.viewAllOrders);
router.patch("/orders/:orderId/status", adminController.updateOrderStatus);

export default router;
