import { useState } from "react";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../App";
import { logOutUser } from "../common/session";
import { removeFromSession } from "../common/session";

export const UserNavigationPanel = ({className = ""}) => {

    const {userAuth:{fullname}, setUserAuth} = useContext(UserContext);
    const signOutUser = () => {
        removeFromSession("user");
        setUserAuth({access_token : null});
    }

    return (
        <div className={`${className} bg-white absolute right-1 border border-[#003899] w-60
             overflow-hidden duration-200 rounded-xl`}>
             <button className="text-left p-4 hover:bg-grey w-full pl-8 py-4"
                onClick={signOutUser}>
                    <h1 className="text-red font-bold text-[15px] mb-1">Sign-out</h1> 
                    <p className="text-dark-grey">@{fullname}</p>
            </button>   
        </div>
    )

}