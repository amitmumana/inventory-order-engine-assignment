import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAppStore from "../store/store";
import { getLocalCart } from "../utils/cartHelpers";
import { CartItem } from "../types";
import api from "../api/axiosClient";
import { ShoppingBag } from "lucide-react";

const Header = () => {
  const { isAuthenticated, user, logout, cartCount } = useAppStore();
  const [localCartItems, setLocalCartItems] = useState<CartItem[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // const handleStorageChange = () => {
    //   if (!isAuthenticated) {
    //     setLocalCartItems(getLocalCart());
    //   }
    // };
    // window.addEventListener("storage", handleStorageChange);
    // setLocalCartItems(getLocalCart());
    // return () => {
    //   window.removeEventListener("storage", handleStorageChange);
    // };
  }, [isAuthenticated]);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout failed on server side:", error);
    } finally {
      logout();
      navigate("/login");
    }
  };

  const totalItemsInCart = localCartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return (
    <header className="bg-gray-800 text-white p-4 shadow-lg ">
      <div className="container mx-auto flex justify-between items-center">
        <Link
          to="/"
          className="text-2xl font-bold hover:text-blue-400 transition-colors duration-200"
        >
          E-Commerce
        </Link>
        <nav className="flex items-center space-x-6">
          <Link
            to="/"
            className="hover:text-blue-400 transition-colors duration-200"
          >
            Products
          </Link>
          <div className="relative"></div>
          <Link
            to="/cart"
            className="relative hover:text-blue-400 transition-colors duration-200"
          >
            <ShoppingBag className="w-6 h-6 hover:text-blue-400 cursor-pointer transition-colors duration-200" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                {cartCount}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <>
              {user?.role === "ADMIN" && (
                <Link
                  to="/admin"
                  className="hover:text-blue-400 transition-colors duration-200"
                >
                  Admin
                </Link>
              )}
              <Link
                to="/orders"
                className="hover:text-blue-400 transition-colors duration-200"
              >
                Orders
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded transition-colors duration-200"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded transition-colors duration-200"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="border border-white px-3 py-1 rounded hover:bg-white hover:text-gray-800 transition-colors duration-200"
              >
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
