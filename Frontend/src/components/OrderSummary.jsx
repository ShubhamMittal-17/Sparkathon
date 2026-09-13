import React, { useState } from 'react';
import { Truck, Shield, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';

const OrderSummary = ({ items }) => {

  const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const tax = subtotal * 0.08; // 8% tax
  
  const total = subtotal + tax ;
  

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 h-fit sticky top-[88px]">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>
      
      {/* Order Details */}
      <div className="space-y-4 mb-6">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal ({items.length} items)</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between text-gray-600">
          <span>Tax</span>
          <span>${tax.toFixed(2)}</span>
        </div>
      </div>


      {/* Total */}
      <div className="border-t pt-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold text-gray-900">Total</span>
          <span className="text-2xl font-bold text-blue-600">${total.toFixed(2)}</span>
        </div>
      </div>

      {/* Checkout Button */}
      <Link to="/route">
      <button
        className="w-full bg-[#2874F0] hover:bg-[#1c5fd0] text-white py-3.5 rounded-full font-semibold text-base transition-colors"
      >
        Generate Route
      </button>
      </Link>

      
    </div>
  );
};

export default OrderSummary;