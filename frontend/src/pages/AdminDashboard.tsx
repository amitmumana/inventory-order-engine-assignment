import React, { useEffect, useState } from "react";
import api from "../api/axiosClient";
import { Order, Product, Reservation, OrderStatus } from "../types";
import toast from "react-hot-toast";

const ORDER_STATUSES = ["PENDING", "PAID", "SHIPPED", "CANCELLED"];

const AdminDashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [productsRes, ordersRes, reservationsRes] = await Promise.all([
          api.get("/products"),
          api.get("/admin/orders"),
          api.get("/admin/reservations"),
        ]);
        setProducts(productsRes.data);
        setOrders(ordersRes.data);
        setReservations(reservationsRes.data);
      } catch (err) {
        setError("Failed to fetch admin data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  const handleUpdateStock = async (productId: string, newStock: number) => {
    try {
      await api.patch(`/admin/products/${productId}/stock`, {
        stock: newStock,
      });
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, stock: newStock } : p))
      );
    } catch (err) {
      alert("Failed to update stock.");
    }
  };

  const handleUpdateOrderStatus = async (
    orderId: string,
    newStatus: OrderStatus
  ) => {
    try {
      await api.patch(`/admin/orders/${orderId}/status`, { status: newStatus });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      toast.error("Failed to update order status.");
    }
  };

  if (loading) {
    return <div className="text-center mt-8">Loading admin dashboard...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 mt-8">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Product Stock</h2>
          {products.map((p) => (
            <div
              key={p.id}
              className="flex justify-between items-center mb-2 p-2 border-b"
            >
              <span>
                {p.name} - Stock: {p.stock}
              </span>
              <input
                type="number"
                defaultValue={p.stock}
                onBlur={(e) =>
                  handleUpdateStock(p.id, parseInt(e.target.value))
                }
                className="w-20 p-1 border rounded"
              />
            </div>
          ))}
        </div>

        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Orders</h2>
          {orders.map((o) => (
            <div
              key={o.id}
              className="flex justify-between items-center mb-2 p-2 border-b"
            >
              <span>
                Order #{o.id.slice(0, 8)} - Status: {o.status}
              </span>
              <select
                value={o.status}
                onChange={(e) =>
                  handleUpdateOrderStatus(o.id, e.target.value as OrderStatus)
                }
                className="p-1 border rounded"
              >
                {ORDER_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Active Reservations */}
      <div className="bg-white shadow-lg rounded-lg p-6 mt-8">
        <h2 className="text-2xl font-bold mb-4">Active Reservations</h2>
        {reservations.length > 0 ? (
          <ul className="list-disc pl-5">
            {reservations.map((r) => (
              <li key={r.id} className="mb-1 text-sm">
                Product: {r.product.name} | Qty: {r.quantity} | Expires:{" "}
                {new Date(r.expiresAt).toLocaleString()}
              </li>
            ))}
          </ul>
        ) : (
          <p>No active reservations.</p>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
