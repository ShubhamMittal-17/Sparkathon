import { useContext } from 'react';
import { ShoppingBag, ArrowLeft, Check } from 'lucide-react';
import CartItem from '../components/CartItem';
import OrderSummary from '../components/OrderSummary';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../App.jsx';
import { useCartActions } from '../common/useCartActions';
import toast, { Toaster } from 'react-hot-toast';

export const Cart = () => {
  const { userCart } = useContext(CartContext);
  const { clearCart } = useCartActions();
  const navigate = useNavigate();

  const finishShopping = () => {
    clearCart();
    toast.success("Thanks for shopping!");
    navigate("/");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <Toaster />
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Link to="/" className="p-2 -ml-2 text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">Your List</h1>
          <span className="text-sm text-gray-400">{userCart.length} items</span>
        </div>
        {userCart.length > 0 && (
          <button onClick={finishShopping}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-red-600 border border-gray-200 hover:border-red-200 rounded-full px-4 py-2 transition-colors">
            <Check size={16} /> Finish shopping
          </button>
        )}
      </div>

      {userCart.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <ShoppingBag size={26} className="text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">Your list is empty</h2>
          <p className="text-gray-500 mb-6">Add items and we'll route you through the store.</p>
          <Link to="/">
            <button className="bg-[#2874F0] hover:bg-[#1c5fd0] text-white px-6 py-3 rounded-full font-medium transition-colors">
              Browse products
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-3">
            {userCart.map((item, i) => (
              <CartItem key={item.product._id ?? i} item={item.product} quantity={item.quantity} />
            ))}
          </div>
          <div className="lg:col-span-1">
            <OrderSummary items={userCart} />
          </div>
        </div>
      )}
    </div>
  );
}
