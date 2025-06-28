import { Link, Outlet } from "react-router-dom"
import wallmart_logo from "../imgs/logo.png"
import search_logo from "../imgs/search.png"
import list_logo from "../imgs/list.png"
import cart_logo from "../imgs/cart.png"
import user_logo from "../imgs/user.png"
import location_logo from "../imgs/location.png"
import drop_logo from "../imgs/drop.png"
import climb_logo from "../imgs/climb.png"
import { useContext, useState,useEffect, useRef } from "react"
import { UserContext } from "../App"
import { UserNavigationPanel } from "./user_navigation_panel"


export const Navbar = () => {

    let [locImg,setLocImg] = useState(drop_logo);
    let {userAuth : {access_token}} = useContext(UserContext);
    // console.log(access_token);
    const [UserNavigationPanelVisibility, setUserNavigationPanelVisibility] = useState(false);

    const handleLocationSelect = () => {
        if(locImg == drop_logo) setLocImg(climb_logo);
        else setLocImg(drop_logo);
    }

    const panelRef = useRef();

    useEffect(() => {
      const handleClickOutside = (e) => {
        if (panelRef.current && !panelRef.current.contains(e.target)) {
          setUserNavigationPanelVisibility(false);
        }
      };

      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    return (
        <>
        <nav className="navbar bg-[#0053E2] gap-3 px-4 justify-center border-none">
            <Link to="/">
                <img className="min-w-[30px] min-h-[30px] w-[30px] h-[30px] rounded-full object-contain" src={wallmart_logo} />
            </Link>
            <div className=" relative min-w-fit text-white rounded-full bg-[#003899] py-2 px-5 pl-4 flex items-center gap-3 cursor-pointer max-lg:hidden"
            onClick={handleLocationSelect}>
                <img src={location_logo} className="w-[25px] h-[25px] rounded-full"/>
                <div className="flex flex-col">
                    <h1 className="text-nowrap font-bold text-[14px]">Select Store</h1>
                    <h1 className="text-nowrap text-sm">Temp address</h1>
                </div>
                <img src={locImg} className="w-[12px] h-[12px]" />
                <div className={`absolute w-[200px] h-[120px] bg-[#0053E2] bottom-[-130px] left-[-17px] 
                rounded-md flex flex-col items-center justify-center gap-2 ` + (locImg == climb_logo ? "":"hidden")}>
                    <h1 className="block p-3 bg-[#003899] px-[70px] rounded-full font-bold">A</h1>
                    <h1 className="block p-3 bg-[#003899] px-[70px] rounded-full font-bold">B</h1>
                    {/* <h1>C</h1> */}
                </div>

            

            </div>

            <div className="relative w-full max-w-[900px]">
                <input 
                type="text"
                placeholder="Search Wallmart"
                className="w-full rounded-[100px] p-4 px-5 pr-[50px]"
                />
                <img src={search_logo} className=" w-[30px] h-[30px] absolute right-[10px] bottom-[10px] rounded-full bg-[#0053E2] p-[5px] hover:cursor-pointer object-contain"/>
            </div>
            <Link className="p-0 m-0 max-md:hidden" to="/mylists">
            <button className="flex justify-center items-center gap-2 p-4 px-7 rounded-full hover:bg-[#003899] md:px-5 lg:px-3 max-md:hidden">
                <img src={list_logo} className="w-[25px] h-[25px] object-contain" />
                <h1 className="text-white text-nowrap font-bold">My Lists</h1>
            </button>
            </Link>
            {
                access_token?
                <div className="relative" ref={panelRef}>
                    <button className={`flex justify-center items-center gap-2 p-4 px-7 rounded-full hover:bg-[#003899] md:px-5 lg:px-3 max-md:py-2 max-md:px-3 `}
                    onClick={() => setUserNavigationPanelVisibility(currentVal => !currentVal)}>
                    <img src={user_logo} className="min-w-[25px] min-h-[25px] w-[25px] h-[25px] object-contain" />
                    <h1 className="text-white text-nowrap font-bold max-md:hidden">Account</h1>
                    </button>
                    <UserNavigationPanel className={`z-50 transition-all duration-300 ${UserNavigationPanelVisibility ? 'opacity-100 visible' : 'opacity-0 invisible' }`} />
                </div>
                 :
                <Link className="p-0 m-0" to="/signin">
                <button className={`flex justify-center items-center gap-2 p-4 px-7 rounded-full hover:bg-[#003899] md:px-5 lg:px-3 max-md:py-2 max-md:px-3 `}>
                <img src={user_logo} className="min-w-[25px] min-h-[25px] w-[25px] h-[25px] object-contain" />
                <h1 className="text-white text-nowrap font-bold max-md:hidden">Sign In</h1>
                </button>
                </Link>
            }
            
            <Link className="p-0 m-0" to="/cart">
            <button className="flex justify-center items-center gap-2 p-4 px-6 rounded-full hover:bg-[#003899] md:px-4 max-md:py-2 max-md:px-3">
                <img src={cart_logo} className="min-w-[25px] min-h-[25px] w-[25px] h-[25px] object-contain" />
                <h1 className="text-white text-nowrap font-bold max-md:hidden">Cart</h1>
            </button>
            </Link>
        </nav>
        {/* Footer */}
      
        <Outlet/>
        <footer className="bg-gray-900 text-white py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-gray-400">© 2025 Walmart. All rights reserved.</p>
            </div>
        </footer>
        </>
    )
}