import express from 'express';
import mongoose from 'mongoose';
import 'dotenv/config'
import cors from 'cors';
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import admin from 'firebase-admin'
import serviceAccountKey from './sparkathon-2025-a7d10-firebase-adminsdk-fbsvc-e87dc30a46.json' assert {type:"json"};

import {getAuth} from "firebase-admin/auth"

import Product from './Schema/Product.js';
import User from './Schema/User.js';

const server = express();
let PORT = 5000;

server.use(express.json());
server.use(cors());

admin.initializeApp({
    credential: admin.credential.cert(serviceAccountKey)
})

mongoose.connect(process.env.DB_LOCATION, {
    autoIndex: true
});

let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
let passwordRegex = /^(?=.*[^A-Za-z0-9])(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

const formatDataToSend = (user) => {
    const access_token = jwt.sign({id: user._id},process.env.SECRET_ACCESS_KEY)

    return{
        access_token,
        fullname:user.personal_info.fullname,
        cart:user.cart
    }
}


server.post("/signup",async (req,res)=>{
    let {fullname,email,password} = req.body;

    if(fullname.length < 3){
        return res.status(400).json({"error":"Fullname must be atleast 3 characters long"});
    }

    if(!email.length){
        return res.status(400).json({"error":"Enter Email"});
    }

    if(!emailRegex.test(email)){
         return res.status(400).json({"error":"Email is invalid"});
    }

    if(!passwordRegex.test(password)){
        return res.status(400).json({"error":"Password should be 6-20 characters long with a numeric, 1 uppercase, 1 lowercase and 1 special character."});
    }

     try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            personal_info: {
                fullname,
                email,
                password: hashedPassword
            }
        });

        const savedUser = await user.save();

        return res.status(201).json(formatDataToSend(savedUser));

        } catch (err) {
            if (err.code === 11000) {
                return res.status(409).json({ error: "Email already exists." });
            }

            return res.status(500).json({ error: err.message || "Something went wrong." });
        }

})

server.post("/signin", async (req,res) => {
    let {email,password} = req.body;
    
    if(!email.length){
        return res.status(403).json({"error":"Enter Email"});
    }

    if(!emailRegex.test(email)){
        return res.status(403).json({"error":"Email is invalid."})
    }

    User.findOne({"personal_info.email" : email}).then((user)=>{
        if(!user){
            return res.status(403).json({"error":"User not found"});
        }

    bcrypt.compare(password,user.personal_info.password,(err,result)=>{
        if(err){
            return res.status.json({"error":"Error occurred while login, please try again later."})
        }
        if(!result){
            return res.status(403).json({"error":"Incorrect password."});
        }
        else{
            return res.status(200).json(formatDataToSend(user));
        }

    })

})
.catch(err=>{
        console.log(err);
        return res.status(500).json({"error":err.message});
    })
})



server.get('/all-products',(req,res)=>{
    Product.find()
    .sort({"count.total_sold":-1})
    .then(products => {
        return res.status(200).json({products});
    })
    .catch(err => {
        return res.status(500).json({"error":err.message});
    })
})

const verifyJWT = (req,res,next) => {
    
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(" ")[1];
    
    if(token == null){
        return res.status(403).json({error: "No access token."})
    }

    jwt.verify(token,process.env.SECRET_ACCESS_KEY, (err,user) => {
        if(err){
            return res.status(403).json({error: "Access token is invalid."})
        }

        req.user = user.id;
        next();

    })

}

server.post("/add-item",verifyJWT,async (req,res)=>{
    try {
        const userId = req.user;
        const { product} = req.body; 

        const user = await User.findById(userId).select("cart");
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }

        const existingItem = user.cart.find(
          item => item.product.toString() === product._id.toString()
        );

        if (existingItem) {
          existingItem.quantity += 1;
        } else {
          user.cart.push({ product: product._id, quantity:1 });
        }

        await user.save();

        return res.json({ message: "Item added to cart", cart: user.cart });
      } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
      }
})

server.post("/remove-item",verifyJWT,async (req,res)=>{
    try {
        const userId = req.user;
        const { product} = req.body; 

        const user = await User.findById(userId).select("cart");
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }

        const existingItem = user.cart.find(
          item => item.product.toString() === product._id.toString()
        );

        if (existingItem) {
          existingItem.quantity -= 1;
        } else {
          return res.status(404).json({error:"Not in cart"})
        }
        if(existingItem.quantity == 0){
            user.cart = user.cart.filter(item => item.product.toString() !== product._id.toString())
        }
        await user.save();

        return res.json({ message: "Item added to cart", cart: user.cart });
      } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
      }
})

server.get("/get-cart",verifyJWT,async (req,res) => {
    try{
        const userId = req.user;

        const user = await User.findById(userId).select("cart").populate("cart.product");

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        let cart=user.cart;
        return res.status(200).json({cart});
    } catch (err) {
        console.log(err);
        return res.status(500).json({error:"Internal server error"});
    }

})



server.listen(PORT , () => {
    console.log("Listening on 5000...")
});
