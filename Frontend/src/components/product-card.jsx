import axios from "axios";
import plus_icon from "../imgs/plus.png"
import { useContext, useEffect } from "react";
import { CartContext, UserContext } from "../App";
import toast, { Toaster } from "react-hot-toast";
import { Minus, Plus, Trash2, Heart } from 'lucide-react';
import { Navigate, useNavigate } from "react-router-dom";
import { useCartActions } from "../common/useCartActions";
// import { getCart } from "../pages/homepage";

export const ProductCard = ({content}) => {
    const {handleAddItem,handleRemoveItem} = useCartActions();
    let navigate = useNavigate();

    let {userAuth : {access_token}} = useContext(UserContext);
    let {title,product_img,price} = content;
    let {userCart,setUserCart} = useContext(CartContext);

    // const getCart = async () => {
    //   try {
    //     const res = await axios.get(import.meta.env.VITE_SERVER_DOMAIN + "/get-cart", {
    //       headers: {
    //         Authorization: `Bearer ${access_token}`
    //       }
    //     });

    //     setUserCart(res.data.cart); // ✅ Correctly extract cart
    //     // console.log(userCart);
        
    //   } catch (err) {
    //     console.log("Failed to get cart:", err);
    //   }
    // };

    // let handleAddItem = async () => {
    //     if (access_token){
    //         const payload = {
    //         product: {_id:content._id},
    //         quantity: 1
    //     }

    //     await axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/add-item", payload ,{
    //         headers: {
    //             'Authorization': `Bearer ${access_token}`
    //         }
    //     })
    //     .then(() => {
    //         getCart();
    //         })
    //     .catch(err => {
    //         return toast.error("Failed");
    //     })
    //     }
    //     else{
    //         navigate("/signin")
    //     }
        
        
    // }

    // let handleRemoveItem = async () => {
    //     if (access_token){
    //         const payload = {
    //         product: {_id:content._id},
    //         quantity: 1
    //     }

    //     await axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/remove-item", payload ,{
    //         headers: {
    //             'Authorization': `Bearer ${access_token}`
    //         }
    //     })
    //     .then(() => {
    //         getCart();
    //         })
    //     .catch(err => {
    //         return toast.error("Failed");
    //     })
    //     }
    //     else{
    //         navigate("/signin")
    //     }
        
        
    // }

    const inCart = userCart?.find(item => item.product._id === content._id);
    

    return (
        <div className="min-w-[152px] flex flex-col w-[250px] h-[370px] p-3 py-4 border-[1px] border-grey justify-center items-center align-middle gap-2 m-2 rounded-md
        hover:scale-105 lg:w-[250px] lg:h-[370px]">
            <Toaster />
        <img src={product_img} className="w-[180px] h-[180px] object-contain center lg:w-[180px] lg:h-[180px]"/>
        <h1 className="font-semibold text-lg lg:text-[20px]">${price}</h1>
        <h1 className="line-through scale-90">${(price*1.2).toFixed(2)}</h1>
        <div className="flex gap-1">
            <h1 className="bg-blue-500 px-1 text-sm text-white font-bold rounded-sm">You Save</h1>
            <h1 className="text-sm font-bold"> ${(price*0.2).toFixed(2)}</h1>
        </div>
        <h1 className="text-nowrap block w-fit center text-sm lg:text-lg">{title}</h1>
        

        {
            inCart? (
                <div className="flex gap-4 items-center">
                    <button className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-blue-500 hover:text-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                    onClick={()=>handleRemoveItem(content._id)}>
                        <Minus size={14} />
                    </button>
                    <h1 className="block w-fit font-bold text-lg">{inCart.quantity}</h1>
                    <button className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-blue-500 hover:text-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                    onClick={()=>handleAddItem(content._id)}>
                        <Plus size={14} />
                    </button>
                </div>
                
            )
            :
            <button className="bg-[#0053E2] text-white font-bold py-3 px-5 rounded-full mt-2 flex justify-center items-center gap-2"
            onClick={()=>handleAddItem(content._id)}>
            <img src={plus_icon} className="w-[15px] h-[15px]"/>
             Add
            </button>
        }
        </div>
    )
}