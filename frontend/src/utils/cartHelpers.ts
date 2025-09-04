import { CartItem, Product } from "../types";

const LOCAL_STORAGE_KEY = "guestCartItems";

export const getLocalCart = (): CartItem[] => {
  const cartJson = localStorage.getItem(LOCAL_STORAGE_KEY);
  return cartJson ? JSON.parse(cartJson) : [];
};

export const updateLocalCart = (
  productId: string,
  newQuantity: number,
  product?: Product
): CartItem[] => {
  const cartItems = getLocalCart();

  const existingItemIndex = cartItems.findIndex(
    (item) => item.productId === productId
  );

  if (newQuantity <= 0) {
    if (existingItemIndex > -1) {
      cartItems.splice(existingItemIndex, 1);
    }
  } else {
    if (existingItemIndex > -1) {
      cartItems[existingItemIndex].quantity = newQuantity;
    } else if (product) {
      const newItem: CartItem = {
        id: Math.random().toString(36).substring(2, 15),
        cartId: "guest",
        productId,
        quantity: newQuantity,
        product,
      };
      cartItems.push(newItem);
    }
  }

  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cartItems));
  return cartItems;
};

export const clearLocalCart = () => {
  localStorage.removeItem(LOCAL_STORAGE_KEY);
};
