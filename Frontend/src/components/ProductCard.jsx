import { Tags } from "./Tags";
import { Star, Plus } from 'lucide-react';

export const ProductCard = ({ product, onAddToCart }) => {
  return (
    <div
      key={product.id}
      className="flex flex-col w-72 bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 group"
    >
      {/* 🖼️ Image and tag */}
      <div className="relative mb-4">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-48 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
        />
        {product.tag && (
          <div className="absolute top-2 left-2">
            <Tags tag={product.tag} />
          </div>
        )}
      </div>

      {/* 📦 Product info + button */}
      <div className="flex flex-col flex-grow gap-2">
        <h3 className="font-semibold text-gray-900 text-md group-hover:text-blue-600 transition-colors leading-tight">
          {product.name}
        </h3>
        <p className="text-blue-600 font-medium text-sm">{product.brand}</p>

        <div className="flex items-center gap-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                className={
                  i < Math.floor(product.rating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }
              />
            ))}
          </div>
          <span className="text-sm text-gray-600">({product.rating})</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-gray-900">${product.price}</span>
            {product.originalPrice && (
              <span className="text-sm text-gray-500 line-through">
                ${product.originalPrice}
              </span>
            )}
          </div>
        </div>

        {/* ✅ Push button to bottom */}
        <div className="mt-auto">
          <button
            onClick={() => onAddToCart(product)}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Plus size={16} className="group-hover:rotate-90 transition-transform duration-200" />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};
