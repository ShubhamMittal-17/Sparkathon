import { useContext } from "react";
import { CartContext } from "../App";
import { Toaster } from "react-hot-toast";
import { Minus, Plus, Star } from 'lucide-react';
import { useCartActions } from "../common/useCartActions";

export const ProductCard = ({ content }) => {
    const { handleAddItem, handleRemoveItem } = useCartActions();
    const { title, product_img, price, rating } = content;
    const { userCart } = useContext(CartContext);

    const inCart = userCart?.find(item => item.product._id === content._id);
    const mrp = price * 1.25;
    const off = Math.round(((mrp - price) / mrp) * 100);
    const rate = (parseFloat(rating) || 4.2).toFixed(1);
    const reviews = content.count?.total_sold ?? 120;

    return (
        <div className="group flex flex-col min-w-0 bg-white rounded-lg border border-gray-200 hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] transition-shadow overflow-hidden">
            <Toaster />
            <div className="p-3 flex items-center justify-center h-40 sm:h-44">
                <img src={product_img} alt={title} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200" />
            </div>

            <div className="px-3 pb-3 flex flex-col flex-1">
                <h3 className="text-sm text-gray-800 leading-snug line-clamp-2 min-h-[2.5rem]">{title}</h3>

                <div className="flex items-center gap-2 mt-1.5 mb-1">
                    <span className="inline-flex items-center gap-0.5 bg-green-600 text-white text-[11px] font-bold px-1.5 py-0.5 rounded">
                        {rate} <Star size={9} className="fill-white" />
                    </span>
                    <span className="text-[11px] text-gray-400 font-medium">({reviews})</span>
                </div>

                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 mb-3">
                    <span className="text-base font-bold text-gray-900">${price}</span>
                    <span className="text-xs text-gray-400 line-through">${mrp.toFixed(0)}</span>
                    <span className="text-xs font-bold text-green-700">{off}% off</span>
                </div>

                <div className="mt-auto">
                    {inCart ? (
                        <div className="flex items-center justify-between border-2 border-[#2874F0] rounded overflow-hidden">
                            <button className="w-9 h-9 flex items-center justify-center text-[#2874F0] hover:bg-blue-50"
                                onClick={() => handleRemoveItem(content)}>
                                <Minus size={16} />
                            </button>
                            <span className="font-bold text-sm text-gray-900">{inCart.quantity}</span>
                            <button className="w-9 h-9 flex items-center justify-center text-[#2874F0] hover:bg-blue-50"
                                onClick={() => handleAddItem(content)}>
                                <Plus size={16} />
                            </button>
                        </div>
                    ) : (
                        <button className="w-full bg-[#ff9f00] hover:bg-[#f39200] text-white font-bold py-2 rounded flex justify-center items-center gap-1.5 text-sm shadow-sm transition-colors"
                            onClick={() => handleAddItem(content)}>
                            <Plus size={16} /> ADD
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
