import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();
const authController = new AuthController();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.get("/me", authMiddleware, authController.getMe);

export default router;
