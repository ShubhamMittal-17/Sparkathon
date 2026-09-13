import { useRef, useState } from "react"
import { useEffect } from "react";

export const CategoryNav = ({routes,defaultActiveIndex=0,onChange,children}) => {

    let [inPageNavIndex,setInPageNavIndex] = useState(defaultActiveIndex);
    let activeTabLineRef = useRef();
    let activeTabRef = useRef();

    const changePageState = (btn,i) => {
        let {offsetWidth, offsetLeft} = btn;
        activeTabLineRef.current.style.width = offsetWidth + "px";
        activeTabLineRef.current.style.left= offsetLeft + "px";
        setInPageNavIndex(i);
        onChange?.(i);
    }

    useEffect(() => {
        changePageState(activeTabRef.current,defaultActiveIndex)
    },[])

   return(
    <>
    <div className="relative mb-8 border-b border-grey flex flex-nowrap gap-2 sm:gap-5 overflow-x-auto">
        {
            routes.map((route,i) => {
                return (
                    <button
                    ref= {i==inPageNavIndex ? activeTabRef : null}
                    key={i} className={`p-3 px-3 sm:p-4 sm:px-5 text-sm sm:text-base capitalize font-semibold whitespace-nowrap shrink-0 ` + (inPageNavIndex == i ? "text-[#2874F0]" : "text-black")}
                    onClick={(e)=>{changePageState(e.target,i)}}
                    >
                        {route}
                    </button>
                )
            })
        }
        <hr ref={activeTabLineRef} className="absolute bottom-0 duration-300 border-[#2874F0]"/>
    </div>

    {Array.isArray(children) ? children[inPageNavIndex] : children}

    </>
   ) 
}