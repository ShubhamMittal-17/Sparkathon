
import { useContext } from "react";
import axios from "axios";
import { CartContext, UserContext } from "../App";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export const useCartActions = () => {
  const { userAuth: { access_token } } = useContext(UserContext);
  const { setUserCart } = useContext(CartContext);
  const navigate = useNavigate();

  const getCart = async () => {
    try {
      const res = await axios.get(import.meta.env.VITE_SERVER_DOMAIN + "/get-cart", {
        headers: {
          Authorization: `Bearer ${access_token}`
        }
      });
      setUserCart(res.data.cart);
    } catch (err) {
      console.error("❌ Failed to get cart:", err);
    }
  };

  const handleAddItem = async (productId) => {
    if (!access_token) return navigate("/signin");

    try {
      await axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/add-item", {
        product: { _id: productId },
        quantity: 1
      }, {
        headers: {
          Authorization: `Bearer ${access_token}`
        }
      });
      getCart();
    } catch (err) {
      toast.error("Failed to add");
    }
  };

  const handleRemoveItem = async (productId) => {
    if (!access_token) return navigate("/signin");

    try {
      await axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/remove-item", {
        product: { _id: productId },
        quantity: 1
      }, {
        headers: {
          Authorization: `Bearer ${access_token}`
        }
      });
      getCart();
    } catch (err) {
      toast.error("Failed to remove");
    }
  };

  return { handleAddItem, handleRemoveItem };
};
