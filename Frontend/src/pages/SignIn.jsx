import React from 'react';
import { useNavigate } from 'react-router';



export const SignIn = () => {
    const navigate = useNavigate()
    return (
        <div className="h-cover bg-gradient-to-br from-blue-100 via-white to-blue-200 flex items-center justify-center p-6">
            <div className="backdrop-blur-xl bg-white/70 shadow-xl border border-white/30 rounded-3xl p-10 w-full max-w-md relative">

                <div className="flex justify-center mb-8">
                    <img
                        src="https://i5.walmartimages.com/dfw/63fd9f59-14e2/9d304ce6-96de-4331-b8ec-c5191226d378/v1/spark-icon.svg"
                        alt="Logo"
                        className="h-16 w-16"
                    />
                </div>
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Sign In</h2>

                <form className="space-y-6">
                    <InputBox type="email" text="Email" className=""/>
                    <InputBox type="password" text="Password"/>

                    <Button text="Sign In" />
                </form>

                <p className="text-center text-sm text-gray-600 mt-6">
                    Don't have an account?{' '}
                    <a onClick={() => {
                        navigate('/SignUp')
                    }} className="text-blue-600 font-semibold hover:underline cursor-pointer">
                        Sign up
                    </a>
                </p>
            </div>
        </div>
    );
};


const InputBox = ({type , onChange , text})=>{
    return (
        <div className="relative">
            <input onChange={onchange}
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
    onClick={onClick}
    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-semibold text-lg transition transform hover:-translate-y-0.5 hover:shadow-md">
    {text}
</button>
}