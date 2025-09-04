import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axiosClient";
import useAppStore from "../store/store";
import { clearLocalCart, getLocalCart } from "../utils/cartHelpers";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  // const location = useLocation();
  const login = useAppStore((state) => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await api.post("/auth/login", { email, password });
      const { token, user } = response.data;

      login(user, token);

      const localCartItems = getLocalCart();
      if (localCartItems.length > 0) {
        await api.post("/cart/sync", { cartItems: localCartItems });
        clearLocalCart();
      }

      // const redirectPath =
      //   new URLSearchParams(location.search).get("redirect") || "/";
      navigate("/");
    } catch (err) {
      setError("Login failed. Please check your email and password.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm">
        <h1 className="text-3xl font-bold text-center mb-6">Login</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
          >
            Login
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-500 hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
