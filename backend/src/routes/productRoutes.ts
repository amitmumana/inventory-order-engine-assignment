import { Router } from "express";
import { ProductController } from "../controllers/ProductController";

const router = Router();
const productController = new ProductController();

router.get("/", productController.listProducts);
router.get("/:id", productController.getProductDetails);

export default router;
