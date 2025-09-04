import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axiosClient";
import { Product } from "../types";
import useAppStore from "../store/store";
import { updateLocalCart } from "../utils/cartHelpers";
import { Package, Shield, ShoppingCart, Truck } from "lucide-react";

const ProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [message, setMessage] = useState<string | null>(null);
  const { isAuthenticated, updateCartCount } = useAppStore();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${id}`);
        setProduct(response.data);
      } catch (err) {
        console.error("Failed to fetch product:", err);
        setError("Product not found or failed to load.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleAddToCart = async () => {
    try {
      if (!product) return;

      if (isAuthenticated) {
        await api.post("/cart/items", { productId: product.id, quantity });
        setMessage(
          `Added ${quantity} of ${product.name} to your persistent cart.`
        );
        const cartResponse = await api.get("/cart");
        const newCount = cartResponse?.data.reduce(
          (sum: any, item: any) => sum + item.quantity,
          0
        );
        updateCartCount(newCount);
      } else {
        const updatedCart = updateLocalCart(product.id, quantity, product);
        const newCount = updatedCart.reduce(
          (sum, item) => sum + item.quantity,
          0
        );
        updateCartCount(newCount);
      }
    } catch (err) {
      console.error("Failed to add to cart:", err);
      setMessage("Failed to add to cart. Check stock or try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-xl">
        Loading...
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center mt-8">{error}</div>;
  }

  if (!product) {
    return <div className="text-center mt-8">Product not found.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"></div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="relative bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
              <div className="relative aspect-square">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                {product.category}
              </span>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 leading-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-3">
              <span className="text-4xl font-bold text-gray-900">
                ${product.price}
              </span>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-6 h-6 text-gray-400" />
              <span className={` font-medium text-2xl px-2 py-1`}>
                {product.stock}
              </span>
            </div>

            <div className="prose prose-gray max-w-none">
              <p className="text-gray-600 leading-relaxed text-lg">
                {product.description}
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700">
                  Quantity:
                </label>
                <div className="flex items-center border border-gray-200 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="px-4 py-2 border-x border-gray-200 min-w-[60px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity(Math.min(product.stock, quantity + 1))
                    }
                    className="px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
                    disabled={quantity >= product.stock || product.stock == 0}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => handleAddToCart()}
                  disabled={product.stock == 0}
                  className={`
                    flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-200
                    ${
                      product.stock == 0
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl active:scale-98"
                    }
                  `}
                >
                  <ShoppingCart className="w-5 h-5" />
                  {product.stock == 0
                    ? "Out of Stock"
                    : `Add ${quantity} to Cart`}
                </button>
              </div>
              {message && (
                <p className="mt-4 text-center text-sm font-medium text-green-600">
                  {message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-100">
                <Truck className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">Free Shipping</p>
                  <p className="text-sm text-gray-600">On orders over $50</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-100">
                <Shield className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-medium text-gray-900">2 Year Warranty</p>
                  <p className="text-sm text-gray-600">Full coverage</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-100">
                <Package className="w-6 h-6 text-purple-600" />
                <div>
                  <p className="font-medium text-gray-900">Easy Returns</p>
                  <p className="text-sm text-gray-600">30-day policy</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductPage;
