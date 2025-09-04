import { PrismaClient, Cart, CartItem, Product } from "@prisma/client";

const prisma = new PrismaClient();

export class CartService {
  async findOrCreateCart(
    userId: string | null,
    cartId?: string
  ): Promise<Cart> {
    if (userId) {
      const userCart = await prisma.cart.findFirst({
        where: { userId, isGuest: false },
      });
      if (userCart) return userCart;

      return prisma.cart.create({ data: { userId, isGuest: false } });
    }

    if (cartId) {
      const guestCart = await prisma.cart.findUnique({
        where: { id: cartId, isGuest: true },
      });
      if (guestCart) return guestCart;
    }

    return prisma.cart.create({ data: { isGuest: true } });
  }

  async addItemToCart(
    cartId: string,
    productId: string,
    quantity: number
  ): Promise<CartItem> {
    if (quantity <= 0) {
      throw new Error("Quantity must be a positive integer.");
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      throw new Error("Product not found.");
    }

    const existingItem = await prisma.cartItem.findFirst({
      where: { cartId, productId },
    });

    if (existingItem) {
      return prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: quantity },
      });
    } else {
      if (product.stock < quantity) {
        throw new Error("Not enough stock available.");
      }
      return prisma.cartItem.create({
        data: { cartId, productId, quantity },
      });
    }
  }

  async updateItemInCart(itemId: string, quantity: number): Promise<CartItem> {
    if (quantity <= 0) {
      return prisma.cartItem.delete({ where: { id: itemId } });
    }
    return prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });
  }
  async removeItemFromCart(itemId: string): Promise<void> {
    await prisma.cartItem.delete({ where: { id: itemId } });
  }

  async syncLocalCart(userId: string, localCartItems: any[]): Promise<Cart> {
    return prisma.$transaction(async (tx) => {
      const userCart = await this.findOrCreateCart(userId);

      for (const localItem of localCartItems) {
        const existingItem = await tx.cartItem.findFirst({
          where: { cartId: userCart.id, productId: localItem.productId },
        });

        if (existingItem) {
          await tx.cartItem.update({
            where: { id: existingItem.id },
            data: { quantity: existingItem.quantity + localItem.quantity },
          });
        } else {
          await tx.cartItem.create({
            data: {
              cartId: userCart.id,
              productId: localItem.productId,
              quantity: localItem.quantity,
            },
          });
        }
      }

      return userCart;
    });
  }
}
