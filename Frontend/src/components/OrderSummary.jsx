import React, { useState } from 'react';
import { Truck, Shield, CreditCard } from 'lucide-react';

const OrderSummary = ({ items }) => {

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08; // 8% tax
  
  const total = subtotal + tax ;
  

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 h-fit sticky top-8">
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
      <button
        className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
      >
        Generate Route
      </button>

      
    </div>
  );
};

export default OrderSummary;