import { useContext } from "react";
import { CartContext } from "../App";
import toast from "react-hot-toast";

// Local, account-free cart. Items live in React state + localStorage so the
// shopping session survives a refresh but needs no login. Each entry is
// { product, quantity }.
export const useCartActions = () => {
  const { userCart, setUserCart } = useContext(CartContext);

  const persist = (cart) => {
    try { localStorage.setItem("cart", JSON.stringify(cart)); } catch { /* ignore */ }
    setUserCart(cart);
  };

  const handleAddItem = (product) => {
    if (!product?._id) return;
    const existing = userCart.find((it) => it.product._id === product._id);
    const next = existing
      ? userCart.map((it) => (it.product._id === product._id ? { ...it, quantity: it.quantity + 1 } : it))
      : [...userCart, { product, quantity: 1 }];
    persist(next);
    toast.success(`Added ${product.title || "item"}`);
  };

  const handleRemoveItem = (product) => {
    if (!product?._id) return;
    const existing = userCart.find((it) => it.product._id === product._id);
    if (!existing) return;
    const next = existing.quantity <= 1
      ? userCart.filter((it) => it.product._id !== product._id)
      : userCart.map((it) => (it.product._id === product._id ? { ...it, quantity: it.quantity - 1 } : it));
    persist(next);
  };

  const clearCart = () => persist([]);

  return { handleAddItem, handleRemoveItem, clearCart };
};
