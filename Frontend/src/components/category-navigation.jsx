import { useRef, useState } from "react"
import { useEffect } from "react";

export const CategoryNav = ({routes,defaultActiveIndex=0,children}) => {

    let [inPageNavIndex,setInPageNavIndex] = useState(defaultActiveIndex);
    let activeTabLineRef = useRef();
    let activeTabRef = useRef();

    const changePageState = (btn,i) => {
        let {offsetWidth, offsetLeft} = btn;
        activeTabLineRef.current.style.width = offsetWidth + "px";
        activeTabLineRef.current.style.left= offsetLeft + "px";
        setInPageNavIndex(i);
    }

    useEffect(() => {
        changePageState(activeTabRef.current,defaultActiveIndex)
    },[])

   return(
    <>
    <div className="relative mb-8 border-b border-grey flex flex-nowrap gap-5 ">
        {
            routes.map((route,i) => {
                return (
                    <button
                    ref= {i==inPageNavIndex ? activeTabRef : null}
                    key={i} className={`p-4 px-5 capitalize font-bold ` + (inPageNavIndex == i ? "text-[#0053E2]" : "text-black")}
                    onClick={(e)=>{changePageState(e.target,i)}}
                    >
                        {route}
                    </button>
                )
            })
        }
        <hr ref={activeTabLineRef} className="absolute bottom-0 duration-300 border-[#0053E2]"/>
    </div>

    {Array.isArray(children) ? children[inPageNavIndex] : children}

    </>
   ) 
}