import React from "react";
import { Star, Package } from "lucide-react";
import { Product } from "../types";
import { Link } from "react-router-dom";

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const getStockStatus = () => {
    if (product.stock === 0)
      return { text: "Out of Stock", color: "text-red-600", bg: "bg-red-50" };
    if (product.stock <= 5)
      return {
        text: `Only ${product.stock} left`,
        color: "text-orange-600",
        bg: "bg-orange-50",
      };
    return { text: "In Stock", color: "text-green-600", bg: "bg-green-50" };
  };

  const stockStatus = getStockStatus();

  return (
    <div className="group relative bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-gray-200">
      <div className="relative overflow-hidden bg-gray-50">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
            {product.category}
          </span>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium text-gray-600">
              {product.rating}
            </span>
          </div>
        </div>

        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 leading-tight">
          {product.name}
        </h3>

        <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
          {product.description}
        </p>

        <div className="flex items-center gap-2 mb-4">
          <Package className="w-4 h-4 text-gray-400" />
          <span
            className={`text-xs font-medium px-2 py-1 rounded-full ${stockStatus.bg} ${stockStatus.color}`}
          >
            {stockStatus.text}
          </span>
        </div>

        <div className="flex items-center gap-2 mb-6">
          <span className="text-2xl font-bold text-gray-900">
            ${product.price}
          </span>
        </div>

        <div className="flex gap-3">
          <Link
            to={`/products/${product.id}`}
            className="px-4 py-3 border-2 border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-900 rounded-lg font-medium transition-all duration-200 hover:bg-gray-50"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
