import React, { useEffect, useState, useRef } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import useAppStore from "../store/store";
import api from "../api/axiosClient";
import { Order, OrderItem } from "../types";
import toast from "react-hot-toast";
import axios from "axios";
import { CreditCard } from "lucide-react";

const CheckoutPage: React.FC = () => {
  const { isAuthenticated, updateCartCount } = useAppStore();
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [timer, setTimer] = useState<number | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const checkoutInitiatedRef = useRef(false);

  const fetchOrderDetails = async () => {
    setLoading(true);
    setApiError(null);
    try {
      if (!orderId) {
        toast.error("Invalid checkout. Redirecting to cart.");
        navigate("/cart");
        return;
      }

      const response = await api.get(`/orders/${orderId}/details`);
      const fetchedOrder: Order = response.data;

      if (fetchedOrder.status !== "PENDING") {
        toast.error(
          "This order is no longer pending. Redirecting to orders page."
        );
        navigate("/orders");
        return;
      }
      setOrder(fetchedOrder);

      if (fetchedOrder.reservation) {
        const reservationExpiryTime = new Date(
          fetchedOrder.reservation.expiresAt
        ).getTime();
        const now = Date.now();
        const remainingTime = Math.max(
          0,
          Math.floor((reservationExpiryTime - now) / 1000)
        );
        setTimer(remainingTime);
      } else {
        toast.error(
          "No reservation found for this order. Redirecting to cart."
        );
        navigate("/cart");
      }
    } catch (err) {
      const errorMessage =
        axios.isAxiosError(err) && err.response?.data?.error
          ? err.response.data.error
          : "Failed to load checkout details. Please try again.";
      setApiError(errorMessage);
      toast.error(errorMessage);
      navigate("/cart");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login?redirect=checkout");
      return;
    }
    // Fetch order details only once when the component mounts
    if (!checkoutInitiatedRef.current) {
      fetchOrderDetails();
      checkoutInitiatedRef.current = true;
    }
  }, [isAuthenticated, navigate, orderId]);

  useEffect(() => {
    if (timer === null || timer <= 0) {
      if (order && order.status === "PENDING") {
        toast.error("Your reservation has expired. Please try again.");
        navigate("/cart");
      }
      return;
    }

    const interval = setInterval(() => {
      setTimer((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [timer, navigate, order]);

  const handlePay = async () => {
    if (!order) return;
    setIsProcessingPayment(true);
    try {
      await api.post(`/orders/${order.id}/pay`);
      toast.success("Payment successful! Your order has been placed.");
      updateCartCount(0); // Clear the cart count in global state
      navigate("/orders");
    } catch (err) {
      const errorMessage =
        axios.isAxiosError(err) && err.response?.data?.error
          ? err.response.data.error
          : "Payment failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  if (loading) {
    return (
      <div className="text-center mt-8 text-lg font-medium">
        Loading checkout details...
      </div>
    );
  }

  if (apiError) {
    return (
      <div className="container mx-auto p-4 max-w-2xl text-center mt-12">
        <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Checkout Failed
          </h1>
          <p className="text-gray-600 mb-6">{apiError}</p>
          <Link
            to="/cart"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all duration-200 shadow-md"
          >
            Return to Cart
          </Link>
        </div>
      </div>
    );
  }

  const orderItems = order?.orderItems;
  if (!orderItems || orderItems.length === 0) {
    return (
      <div className="text-center mt-8 text-lg font-medium">
        No items found for this checkout. Please return to your{" "}
        <Link to="/cart" className="text-blue-600 hover:underline">
          cart
        </Link>
        .
      </div>
    );
  }

  const totalPrice = orderItems.reduce(
    (acc, item) => acc + (item.product?.price || 0) * item.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-900">
          Confirm Your Order
        </h1>

        {timer !== null && timer > 0 && (
          <div className="bg-yellow-100 text-yellow-800 p-4 rounded-lg flex items-center justify-between mb-6 shadow-md animate-pulse">
            <span className="font-semibold text-lg">
              Items are reserved for:
            </span>
            <span className="font-bold text-3xl">{formatTime(timer)}</span>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Order Summary
          </h2>
          <ul className="divide-y divide-gray-200 mb-6">
            {orderItems.map((item: OrderItem) => (
              <li
                key={item.id}
                className="py-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  {item.product?.image && (
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-md border border-gray-200"
                    />
                  )}
                  <div>
                    <span className="text-lg font-medium text-gray-900">
                      {item.product?.name}
                    </span>
                    <span className="text-sm text-gray-600 block">
                      Qty: {item.quantity}
                    </span>
                  </div>
                </div>
                <span className="font-semibold text-gray-900">
                  ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>

          <div className="flex justify-between items-center font-bold text-lg border-t border-gray-200 pt-6">
            <span>Total:</span>
            <span className="text-2xl text-green-700">
              ${totalPrice.toFixed(2)}
            </span>
          </div>

          <button
            onClick={handlePay}
            disabled={isProcessingPayment}
            className="mt-8 w-full flex items-center justify-center gap-3 px-6 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold text-lg transition-all duration-200 shadow-md active:scale-98 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <CreditCard className="w-5 h-5" />
            {isProcessingPayment ? "Processing Payment..." : "Pay Now"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
