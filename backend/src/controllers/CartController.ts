import { Request, Response } from "express";
import { CartService } from "../services/CartService";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const cartService = new CartService();

export class CartController {
  async getCartItems(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        return res
          .status(401)
          .json({ error: "Authentication required to fetch cart." });
      }
      const cart = await cartService.findOrCreateCart(userId);
      const cartItems = await prisma.cartItem.findMany({
        where: { cartId: cart.id },
        include: { product: true },
      });
      res.status(200).json(cartItems);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "An unexpected error occurred." });
      }
    }
  }

  async addItem(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        return res
          .status(401)
          .json({ error: "Login required to add items to cart." });
      }
      const { productId, quantity } = req.body;
      const cart = await cartService.findOrCreateCart(userId);
      const cartItem = await cartService.addItemToCart(
        cart.id,
        productId,
        quantity
      );
      res.status(200).json(cartItem);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "An unexpected error occurred." });
      }
    }
  }

  async removeItem(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        return res
          .status(401)
          .json({ error: "Login required to remove items from cart." });
      }
      const { itemId } = req.params;
      await cartService.removeItemFromCart(itemId);
      res.status(204).send(); // No content
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "An unexpected error occurred." });
      }
    }
  }

  async syncCart(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      const { cartItems } = req.body;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated." });
      }
      const userCart = await cartService.syncLocalCart(userId, cartItems);
      res
        .status(200)
        .json({ message: "Cart synchronized successfully.", userCart });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "An unexpected error occurred." });
      }
    }
  }

  async updateItem(req: Request, res: Response) {
    try {
      const { itemId } = req.params;
      const { quantity } = req.body;

      if (typeof quantity !== "number" || quantity < 0) {
        return res.status(400).json({ error: "Invalid quantity." });
      }

      const userId = (req as any).user?.userId;
      const cartItem = await prisma.cartItem.findUnique({
        where: { id: itemId },
        include: { cart: true },
      });

      if (!cartItem || cartItem.cart.userId !== userId) {
        return res.status(403).json({ error: "Access denied." });
      }

      const updatedItem = await cartService.updateItemInCart(itemId, quantity);
      res.status(200).json(updatedItem);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "An unexpected error occurred." });
      }
    }
  }
}
