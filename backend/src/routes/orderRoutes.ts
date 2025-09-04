import { Router } from "express";
import { OrderController } from "../controllers/OrderController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();
const orderController = new OrderController();

router.get("/", authMiddleware, orderController.viewMyOrders);
router.post("/buy-now", authMiddleware, orderController.buyNow);
router.post("/:orderId/pay", authMiddleware, orderController.pay);
router.get("/:orderId/status", authMiddleware, orderController.viewStatus);
router.delete("/:orderId", authMiddleware, orderController.cancelOrder);

export default router;
