import React, { useContext, useState } from 'react';
import { ShoppingCart, ArrowLeft } from 'lucide-react';
import CartItem from '../components/CartItem';
import OrderSummary from '../components/OrderSummary';
import ProductSuggestions from '../components/ProductSuggestions';
import FriendsRecommendations from '../components/FriendsRecommendations';
import { cartItems as initialCartItems, suggestions, friendsRecommendations } from '../mockData.js';
import { Link, Navigate } from 'react-router-dom';
import { CartContext, UserContext } from '../App.jsx';
import { useCartActions } from '../common/useCartActions.js';

// export const addToCart = (product) => {
  


  //   const existingItem = cartItems.find(item => item.id === product.id);
    
  //   if (existingItem) {
  //     updateQuantity(product.id, existingItem.quantity + 1);
  //   } else {
  //     const newItem = {
  //       ...product,
  //       quantity: 1,
  //       inStock: true,
  //       color: 'Default',
  //       brand: product.brand || 'Generic'
  //     };
  //     setCartItems(items => [...items, newItem]);
  //   }
  // };

export const Cart = ()=>{

    let {userCart,setUserCart} = useContext(CartContext);
    let {userAuth :{access_token}} = useContext(UserContext);
    let {handleAddItem,handleRemoveItem} = useCartActions();
    // const [cartItems, setCartItems] = useState(initialCartItems);

  // const updateQuantity = (id, quantity) => {
  //   setCartItems(items => 
  //     items.map(item => 
  //       item.id === id ? { ...item, quantity } : item
  //     )
  //   );
  // };

  // const removeItem = (id) => {
  //   setCartItems(items => items.filter(item => item.id !== id));
  // };

  

  // const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    access_token?
    <div className="h-cover bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link to="/">
              <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
                <ArrowLeft size={20} />
              </button>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
            </div>
            <div className="flex items-center gap-2 text-blue-600">
              <ShoppingCart size={20} />
              <span className="font-semibold">{userCart.length} items</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {userCart.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingCart size={64} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600">Add some items to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Cart Items ({userCart.length})
              </h2>
              {userCart.map((item,i) => 
              (
                <CartItem
                  key={i}
                  item={item.product}
                  quantity={item.quantity}
                />
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <OrderSummary items={userCart} />
            </div>
          </div>
        )}
      </main>

      {/* Product Suggestions */}
      {/* <ProductSuggestions suggestions={suggestions}  /> */}

      {/* Friends Recommendations */}
      {/* <FriendsRecommendations friends={friendsRecommendations} /> */}

    </div>
    : <Navigate to="/" />
  );
}