import { Request, Response } from "express";
import { ProductService } from "../services/ProductService";

const productService = new ProductService();

export class ProductController {
  async listProducts(req: Request, res: Response) {
    try {
      const products = await productService.getAllProducts();
      res.status(200).json(products);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: "An unexpected error occurred." });
      }
    }
  }

  async getProductDetails(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const product = await productService.getProductById(id);

      if (!product) {
        return res.status(404).json({ error: "Product not found." });
      }

      res.status(200).json(product);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: "An unexpected error occurred." });
      }
    }
  }
}
