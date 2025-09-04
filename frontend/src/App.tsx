import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ProductPage from "./pages/ProductPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CartPage from "./pages/CartPage";
import OrderHistoryPage from "./pages/OrderHistoryPage";
import AdminDashboard from "./pages/AdminDashboard";
import PrivateRoute from "./components/PrivateRoute";
import Header from "./components/Header";
import useAppStore from "./store/store";
import { useEffect, useState } from "react";
import { CartItem, User } from "./types";
import api from "./api/axiosClient";
import { Toaster } from "react-hot-toast";
import CheckoutPage from "./pages/CheckoutPage";

function App() {
  const { login, logout, updateCartCount } = useAppStore();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const userResponse = await api.get<User>("/auth/me");
          login(userResponse.data, token);

          const cartResponse = await api.get<CartItem[]>("/cart");
          const newCount = cartResponse.data.reduce(
            (sum, item) => sum + item.quantity,
            0
          );
          updateCartCount(newCount);
        } catch (error) {
          console.error("Session expired or invalid token.", error);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuthStatus();
  }, [login, logout, updateCartCount]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl font-medium text-gray-700">Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-100">
        <Header />
        <main className="flex-grow p-4">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products/:id" element={<ProductPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/cart" element={<CartPage />} />

            <Route element={<PrivateRoute />}>
              <Route path="/checkout/:orderId" element={<CheckoutPage />} />
              <Route path="/orders" element={<OrderHistoryPage />} />
            </Route>

            <Route element={<PrivateRoute roles={["ADMIN"]} />}>
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>
          </Routes>
        </main>
        <Toaster position="bottom-right" />
      </div>
    </Router>
  );
}

export default App;
