import React from 'react';
import { Minus, Plus, Trash2, Heart } from 'lucide-react';
import {Tags} from './Tags'
import { useCartActions } from '../common/useCartActions';

const CartItem = ({item,quantity}) => {
  // const handleQuantityChange = (change) => {
  //   const newQuantity = Math.max(0, item.quantity + change);
  //   if (newQuantity === 0) {
  //     onRemove(item.id);
  //   } else {
  //     onUpdateQuantity(item.id, newQuantity);
  //   }
  // };
  const {handleAddItem,handleRemoveItem} = useCartActions();
  let {title,product_img,price,tags,_id} = item;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative">
          <img
            src={product_img}
            alt={title}
            className="w-full sm:w-24 h-32 sm:h-24 object-cover rounded-lg"
          />
          {/* {!item.inStock && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-medium">Out of Stock</span>
            </div>
          )} */}
        </div>
        
        <div className="flex-1 space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">{title}</h3>
              {/* <p className="text-blue-600 font-medium">{item.brand}</p> */}
              <div className="flex gap-4 text-sm text-gray-600 mt-1">
                {tags &&  <Tags tag={tags} /> }
              </div>
            </div>
            {/* <div className="flex gap-2">
              <button
                onClick={() => onRemove(item.id)}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div> */}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleRemoveItem(_id)}
                // disabled={!item.inStock}
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-blue-500 hover:text-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Minus size={14} />
              </button>
              <span className="font-medium text-gray-900 min-w-[2rem] text-center">
                {quantity}
              </span>
              <button
                onClick={() => handleAddItem(_id)}
                // disabled={!item.inStock}
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-blue-500 hover:text-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={14} />
              </button>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-gray-900">
                ${(price * quantity).toFixed(2)}
              </p>
              <p className="text-sm text-gray-600">${price.toFixed(2)} each</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;