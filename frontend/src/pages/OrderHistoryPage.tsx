import { useEffect, useState } from "react";
import useAppStore from "../store/store";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosClient";
import { Order, OrderStatus } from "../types";
import axios from "axios";

const OrderHistoryPage = () => {
  const { isAuthenticated } = useAppStore();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const fetchOrders = async () => {
      try {
        const response = await api.get("/orders");
        setOrders(response.data);
      } catch (err) {
        setError("Failed to fetch order history.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, navigate]);

  const handleCancelOrder = async (orderId: string) => {
    try {
      await api.delete(`/orders/${orderId}`);
      alert("Order cancelled successfully. Stock has been returned.");

      // Refetch orders to update the UI
      const response = await api.get("/orders");
      setOrders(response.data);
    } catch (err) {
      const errorMessage =
        axios.isAxiosError(err) && err.response?.data?.error
          ? err.response.data.error
          : "Failed to cancel order.";
      alert(errorMessage);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "PAID":
        return "bg-green-100 text-green-800";
      case "SHIPPED":
        return "bg-blue-100 text-blue-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!isAuthenticated || loading) {
    return <div className="text-center mt-8">Loading order history...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 mt-8">{error}</div>;
  }

  if (orders.length === 0) {
    return <div className="text-center mt-8">You have no past orders.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Your Order History
      </h1>
      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order.id} className="bg-white shadow-lg rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold">
                Order #{order.id.slice(0, 8)}{" "}
              </span>

              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(
                  order.status
                )}`}
              >
                {order.status}
              </span>
            </div>
            {order.status === "PENDING" && (
              <button
                onClick={() => handleCancelOrder(order.id)}
                className="text-red-600 hover:text-red-800 font-medium text-sm transition-colors duration-200"
              >
                Cancel Order
              </button>
            )}
            <ul className="divide-y divide-gray-200">
              {order.orderItems.map((item) => (
                <li key={item.id} className="py-2 flex justify-between">
                  <span>
                    {item.product?.name} x {item.quantity}
                  </span>
                  <span>
                    ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderHistoryPage;
