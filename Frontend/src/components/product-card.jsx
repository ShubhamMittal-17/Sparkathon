import plus_icon from "../imgs/plus.png"

export const ProductCard = ({content}) => {

    let {title,product_img,price} = content;

    return (
        <div className="min-w-[152px] flex flex-col w-[250px] h-[370px] p-3 py-4 border-[1px] border-grey justify-center items-center align-middle gap-2 m-2 rounded-md
        hover:scale-105 lg:w-[250px] lg:h-[370px]">
        <img src={product_img} className="w-[180px] h-[180px] object-contain center lg:w-[180px] lg:h-[180px]"/>
        <h1 className="font-semibold text-lg lg:text-[20px]">${price}</h1>
        <h1 className="line-through scale-90">${(price*1.2).toFixed(2)}</h1>
        <div className="flex gap-1">
            <h1 className="bg-blue-500 px-1 text-sm text-white font-bold rounded-sm">You Save</h1>
            <h1 className="text-sm font-bold"> ${(price*0.2).toFixed(2)}</h1>
        </div>
        <h1 className="text-nowrap block w-fit center text-sm lg:text-lg">{title}</h1>
        <button className="bg-[#0053E2] text-white font-bold py-3 px-5 rounded-full mt-2 flex justify-center items-center gap-2">
            <img src={plus_icon} className="w-[15px] h-[15px]"/>
            Add
            </button>
        </div>
    )
}