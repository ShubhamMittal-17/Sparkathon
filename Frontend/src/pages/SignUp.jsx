import React from 'react';
import { Navigate,useNavigate } from 'react-router';
import axios from 'axios';
import {toast , Toaster} from 'react-hot-toast';
import { useContext } from 'react';
import { UserContext } from '../App';
import { storeInSession } from '../common/session';

export const SignUp = () => {
        
    let {userAuth: {access_token},setUserAuth} = useContext(UserContext);

    const userAuthThroughServer = (formData) => {
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/signup" , formData)
        .then(({data}) => {
            storeInSession("user",JSON.stringify(data));
            setUserAuth(data);
        })
        .catch(({response})=>{
            toast.error(response.data.error);
        })
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
        let passwordRegex = /^(?=.*[^A-Za-z0-9])(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

        let form = new FormData(e.target);
        let formData = {};

         for (let [key, value] of form.entries()) {
            formData[key] = value;
         }
        

        let {fullname,email,password} = formData;
        // console.log({email});

        if(fullname){
            if(fullname.length < 3){
                return toast.error("Fullname must be atleast 3 characters long");
            }
        }

        if(!email?.length){
            return toast.error("Enter Email");
        }

        if(!emailRegex.test(email)){
             return toast.error("Email is invalid");
        }

        if(!passwordRegex.test(password)){
            return toast.error("Password should be 6-20 characters long with a numeric, 1 uppercase, 1 lowercase and 1 special character.");
        }

        userAuthThroughServer(formData);
        
    }


    const navigate = useNavigate()
    return (
        access_token? 
        <Navigate to="/" />:
        <div className=" h-cover bg-gradient-to-br from-blue-100 via-white to-blue-200 flex items-center justify-center p-6">
            <Toaster />
            <div className="backdrop-blur-xl bg-white/70 shadow-xl border border-white/30 rounded-3xl p-10 w-full max-w-md relative">
                <div className="flex justify-center mb-8">
                    <img
                        src="https://i5.walmartimages.com/dfw/63fd9f59-14e2/9d304ce6-96de-4331-b8ec-c5191226d378/v1/spark-icon.svg"
                        alt="Logo"
                        className="h-16 w-16"
                    />
                </div>
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Create an Account</h2>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <InputBox name="fullname" text="Fullname" type="text"/>
                    <InputBox name="email" text="Email" type= "text"/>
                    <InputBox name="password" text="Password" type="password"/>

                    <Button text="Sign Up" />
                </form>

                <p className="text-center text-sm text-gray-600 mt-6">
                    Already have an account?{' '}
                    <a onClick={() => {
                        navigate('/SignIn')
                    }} className="text-blue-600 font-semibold hover:underline cursor-pointer">
                        Log in
                    </a>
                </p>
            </div>
        </div>
    );
};

const InputBox = ({type ,name, onChange , text})=>{
    return (
        <div className="relative">
            <input onChange={onchange}
                name={name}
                type={type}
                required
                placeholder=" "
                className="peer w-full border border-gray-300 text-gray-900 rounded-xl px-4 pt-5 pb-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition"/>
            <label
                className="absolute text-sm text-gray-600 left-4 top-2.5 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                {text}
            </label>
        </div>
    )
}

 const Button = ({onClick , text })=>{
    return <button
    type="submit"
    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-semibold text-lg transition transform hover:-translate-y-0.5 hover:shadow-md">
    {text}
</button>
}