// src/pages/CartPage.tsx
import React, { useEffect, useState, useRef } from "react";
import api from "../api/axiosClient";
import { CartItem } from "../types";
import { Link, useNavigate } from "react-router-dom";
import useAppStore from "../store/store";
import { getLocalCart, updateLocalCart } from "../utils/cartHelpers";
import axios from "axios";
import {
  CreditCard,
  Gift,
  Minus,
  Plus,
  Shield,
  ShoppingBag,
  Trash2,
  Truck,
} from "lucide-react";
import toast from "react-hot-toast";

const CartPage = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, user, updateCartCount } = useAppStore();
  const navigate = useNavigate();
  const cartFetchedRef = useRef(false);

  useEffect(() => {
    const fetchCart = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!isAuthenticated) {
          const localCartItems = getLocalCart();
          setCartItems(localCartItems);
        } else {
          const response = await api.get("/cart");
          setCartItems(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch cart:", err);
        setError("Failed to load cart. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (!cartFetchedRef.current) {
      fetchCart();
      cartFetchedRef.current = true;
    }
  }, [isAuthenticated, user]);

  const handleUpdateQuantity = async (
    item: CartItem,
    newQuantity: number,
    isGuest: boolean
  ) => {
    if (newQuantity <= 0) {
      await handleRemoveItem(item, isGuest);
      return;
    }

    try {
      if (isGuest) {
        const updatedCart = updateLocalCart(
          item.productId,
          newQuantity,
          item.product!
        );
        setCartItems(updatedCart);
        const newCount = updatedCart.reduce(
          (sum, currentItem) => sum + currentItem.quantity,
          0
        );
        updateCartCount(newCount);
      } else {
        await api.patch(`/cart/items/${item.id}`, { quantity: newQuantity });
        const updatedCartItems = await api.get("/cart");
        setCartItems(updatedCartItems.data);
        const newCount = updatedCartItems.data.reduce(
          (sum: number, currentItem: any) => sum + currentItem?.quantity,
          0
        );
        updateCartCount(newCount);
      }
    } catch (err) {
      console.error("Failed to update item quantity:", err);
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        toast.error(err.response.data.error);
      } else {
        toast.error("Failed to update item quantity. Not enough stock.");
      }
    }
  };

  const handleRemoveItem = async (item: CartItem, isGuest: boolean) => {
    try {
      if (isGuest) {
        const updatedCart = updateLocalCart(item.productId, 0, item.product!);
        setCartItems(updatedCart);
        const newCount = updatedCart.reduce(
          (sum, currentItem) => sum + currentItem.quantity,
          0
        );
        updateCartCount(newCount);
      } else {
        await api.delete(`/cart/items/${item.id}`);
        const updatedCartItems = await api.get("/cart");
        setCartItems(updatedCartItems.data);
        const newCount = updatedCartItems.data.reduce(
          (sum: number, currentItem: any) => sum + currentItem.quantity,
          0
        );
        updateCartCount(newCount);
      }
    } catch (err) {
      console.error("Failed to remove item:", err);
      toast.error("Failed to remove item from cart.");
    }
  };

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      toast.error("You must be logged in to proceed to checkout.");
      navigate("/login?redirect=cart");
    } else {
      try {
        const response = await api.post("/orders/initiate-checkout");
        const orderId = response.data.order.id;
        navigate(`/checkout/${orderId}`);
      } catch (err) {
        const errorMessage =
          axios.isAxiosError(err) && err.response?.data?.error
            ? err.response.data.error
            : "An error occurred during checkout initiation.";
        toast.error(errorMessage);
      }
    }
  };

  if (loading) {
    return <div className="text-center mt-8">Loading cart...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 mt-8">{error}</div>;
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-16 h-16 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Your cart is empty
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Looks like you haven't added any items to your cart yet. Start
              shopping to fill it up!
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Start Shopping!
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const totalPrice = cartItems.reduce(
    (acc, item) => acc + (item.product?.price || 0) * item.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">
                  Cart Items (
                  {cartItems.reduce((sum, item) => sum + item.quantity, 0)})
                </h2>
              </div>

              <div className="divide-y divide-gray-100">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-6 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <img
                          src={item.product?.image}
                          alt={item.id}
                          className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900 line-clamp-2">
                              {item.product?.name}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {item.product?.category}
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              handleRemoveItem(item, !isAuthenticated)
                            }
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors duration-200"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                          {item.product?.description}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center border border-gray-200 rounded-lg">
                            <button
                              onClick={() =>
                                handleUpdateQuantity(
                                  item,
                                  item.quantity - 1,
                                  !isAuthenticated
                                )
                              }
                              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200 rounded-l-lg"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="px-4 py-2 border-x border-gray-200 min-w-[60px] text-center font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                handleUpdateQuantity(
                                  item,
                                  item.quantity + 1,
                                  !isAuthenticated
                                )
                              }
                              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200 rounded-r-lg"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Order Summary
              </h2>

              <div className="flex justify-between text-gray-600 space-y-4 mb-6">
                <span>
                  Subtotal (
                  {cartItems.reduce((sum, item) => sum + item.quantity, 0)}{" "}
                  items)
                </span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-lg transition-all duration-200 shadow-md hover:shadow-lg active:scale-98 mb-4"
              >
                <CreditCard className="w-5 h-5" />
                Proceed to Checkout
              </button>

              <div className="space-y-3 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span>Secure checkout with SSL encryption</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Truck className="w-4 h-4 text-blue-600" />
                  <span>Free shipping on orders over $50</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Gift className="w-4 h-4 text-purple-600" />
                  <span>30-day return policy</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CartPage;
