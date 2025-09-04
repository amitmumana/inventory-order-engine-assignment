import { Router } from "express";
import { CartController } from "../controllers/CartController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();
const cartController = new CartController();

router.get("/", authMiddleware, cartController.getCartItems);
router.patch("/items/:itemId", authMiddleware, cartController.updateItem);
router.post("/items", authMiddleware, cartController.addItem);
router.delete("/items/:itemId", authMiddleware, cartController.removeItem);
router.post("/sync", authMiddleware, cartController.syncCart);

export default router;
