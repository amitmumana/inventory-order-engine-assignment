export interface User {
  id: string;
  email: string;
  role: "USER" | "ADMIN";
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  image: string;
  rating: string;
  category: string;
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  product?: Product;
}

export interface Cart {
  id: string;
  userId: string | null;
  isGuest: boolean;
  cartItems: CartItem[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  product?: Product;
}

export interface Order {
  id: string;
  userId: string;
  status: "PENDING" | "PAID" | "SHIPPED" | "CANCELLED";
  orderItems: OrderItem[];
  reservation: any;
}

export interface Reservation {
  id: string;
  productId: string;
  quantity: number;
  expiresAt: string;
  isExpired: boolean;
  product: Product;
}

export type OrderStatus = "PENDING" | "PAID" | "SHIPPED" | "CANCELLED";
