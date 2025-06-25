import React from 'react';
import { Star, Plus } from 'lucide-react';
import { Tags } from './Tags';
import { ProductCard } from './ProductCard';

const ProductSuggestions = ({ suggestions, onAddToCart }) => {
  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">You might also like</h2>
          <p className="text-gray-600">Complete your purchase with these popular items</p>
        </div>
        
        
        <div className="flex overflow-x-scroll pb-6 -mx-4 px-4 ">
          <div className="flex space-x-6">
            {suggestions.map((product) => (
              <ProductCard key={product.id} onAddToCart={onAddToCart} product={product} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductSuggestions;