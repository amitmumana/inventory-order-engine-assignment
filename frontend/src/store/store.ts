// src/store/store.ts
import { create } from "zustand";
import { User, Cart } from "../types";

interface AppState {
  user: User | null;
  cart: Cart | null;
  isAuthenticated: boolean;
  cartCount: number;
  login: (user: User, token: string) => void;
  logout: () => void;
  setCart: (cart: Cart) => void;
  updateCartCount: (count: number) => void;
}

const useAppStore = create<AppState>((set) => ({
  user: null,
  cart: null,
  isAuthenticated: false,
  cartCount: 0,

  login: (user, token) => {
    localStorage.setItem("token", token);
    set({ user, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem("token");
    set({ user: null, isAuthenticated: false, cart: null, cartCount: 0 });
  },

  setCart: (cart) => {
    set({ cart });
  },
  updateCartCount: (count: number) => {
    set({ cartCount: count });
  },
}));

export default useAppStore;
