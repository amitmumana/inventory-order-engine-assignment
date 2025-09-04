import { Router } from "express";
import { OrderController } from "../controllers/OrderController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();
const orderController = new OrderController();

router.post(
  "/initiate-checkout",
  authMiddleware,
  orderController.initiateCheckout
);
router.post("/:orderId/pay", authMiddleware, orderController.payOrder);
router.get(
  "/:orderId/details",
  authMiddleware,
  orderController.getOrderDetails
);
router.get("/", authMiddleware, orderController.viewMyOrders);
router.delete("/:orderId", authMiddleware, orderController.cancelOrder);

export default router;
