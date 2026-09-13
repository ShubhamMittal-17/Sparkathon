import express from 'express';
import mongoose from 'mongoose';
import 'dotenv/config'
import cors from 'cors';
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import Product from './Schema/Product.js';
import User from './Schema/User.js';
import { getSimilar } from './recommend.js';
import Layout from './Schema/Layout.js';

const server = express();
let PORT = process.env.PORT || 5000; // cloud hosts inject PORT

server.use(express.json());
server.use(cors());

// Single-gateway mode: serve the built frontend so the whole app lives behind
// one origin (one URL / one tunnel — no CORS, no mixed content).
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, "..", "Frontend", "dist");
const hasFrontend = fs.existsSync(distPath);
if (hasFrontend) server.use(express.static(distPath));

// The navigation microservice stays internal; the gateway proxies to it.
const NAV_URL = process.env.NAV_URL || "http://localhost:5001";

// Firebase admin is optional: only initialize it if the service-account key
// file is present. Auth works via JWT + bcrypt regardless, so the server boots
// fine without it.
const firebaseKeyPath = "./sparkathon-2025-a7d10-firebase-adminsdk-fbsvc-e87dc30a46.json";
if (fs.existsSync(firebaseKeyPath)) {
    const admin = (await import("firebase-admin")).default;
    const serviceAccountKey = JSON.parse(fs.readFileSync(firebaseKeyPath, "utf-8"));
    admin.initializeApp({ credential: admin.credential.cert(serviceAccountKey) });
    console.log("Firebase admin initialized.");
} else {
    console.log("Firebase key not found — skipping Firebase init (JWT auth still works).");
}

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

// Save a store layout authored in the in-browser editor, and fill the products
// DB so each placed product sits at its shelf cell. Replaces the catalog so the
// database reflects exactly what's in the layout.
server.post("/save-layout", async (req,res) => {
    // Lock down this destructive endpoint in production: if ADMIN_KEY is set,
    // the caller must send a matching x-admin-key header (the store editor sends
    // the manager passcode). Without ADMIN_KEY set (local dev) it's open.
    if (process.env.ADMIN_KEY && req.headers["x-admin-key"] !== process.env.ADMIN_KEY) {
        return res.status(403).json({ error: "Not authorized." });
    }
    try {
        const { name, width, height, entrance, grid, products } = req.body;
        if (!grid || !width || !height) {
            return res.status(400).json({ error: "Missing layout grid or dimensions." });
        }

        // Only one layout is active at a time.
        await Layout.updateMany({}, { isActive: false });
        const layout = await Layout.create({ name, width, height, entrance, grid, isActive: true });

        let productCount = 0;
        if (Array.isArray(products)) {
            await Product.deleteMany();
            const suffix = layout._id.toString().slice(-4);
            const docs = products.map((p, i) => ({
                product_id: p.product_id || `L${suffix}-${i + 1}`,
                title: p.title || `Item ${i + 1}`,
                product_img: p.product_img || "",
                des: p.des || "",
                price: p.price ?? 0,
                tags: p.tags || "",
                count: { total_stock: p.total_stock ?? 100, total_sold: p.total_sold ?? 0 },
                position: { x: p.position.x, y: p.position.y },
                rating: p.rating || "0",
            }));
            if (docs.length) await Product.insertMany(docs);
            productCount = docs.length;
        }

        return res.status(201).json({ layout, productCount });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
})

// Return the currently active store layout (for the editor and the route page).
server.get("/layout", async (req,res) => {
    try {
        const layout = await Layout.findOne({ isActive: true }).sort({ createdAt: -1 });
        if (!layout) return res.status(404).json({ error: "No layout found." });
        return res.status(200).json({ layout });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
})

// Content-based "similar items" recommendations.
// GET /similar/:productId?limit=4
//
// Primary ranking is served by the standalone Python recommender microservice
// (TF-IDF + cosine similarity) so ranking logic evolves independently of this
// Node layer. If that service is unreachable we degrade gracefully to a
// lightweight in-process content scorer (see recommend.js) so the storefront
// never loses recommendations.
// Defaults to the local TF-IDF service in dev; set RECOMMENDER_URL="" in
// production to skip it and use the in-process Jaccard scorer (no separate
// service to host). `??` keeps an explicit empty string as "disabled".
const RECOMMENDER_URL = process.env.RECOMMENDER_URL ?? "http://localhost:5002";

server.get("/similar/:productId", async (req,res) => {
    const { productId } = req.params;
    const limit = Math.min(parseInt(req.query.limit) || 4, 20);

    // 1) Try the TF-IDF recommender service, if one is configured.
    if (RECOMMENDER_URL) {
        try {
            const upstream = await fetch(
                `${RECOMMENDER_URL}/similar/${productId}?limit=${limit}`,
                { signal: AbortSignal.timeout(3000) }
            );
            if (upstream.ok) {
                return res.status(200).json(await upstream.json());
            }
        } catch (err) {
            console.warn("Recommender service unavailable, falling back:", err.message);
        }
    }

    // 2) Fallback: lightweight in-process scorer over the catalog.
    try {
        const allProducts = await Product.find().lean();
        const results = getSimilar(productId, allProducts, limit);
        if (!results.length) {
            return res.status(404).json({ error: "Product not found or no similar items." });
        }
        return res.status(200).json({
            similar: results.map(({ product, score, reasons }) => ({
                ...product,
                similarity: Number(score.toFixed(3)),
                reasons,
            })),
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
    }
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



// Proxy the route render to the internal nav service (keeps it one origin).
server.post("/api/route", async (req, res) => {
    try {
        const r = await fetch(NAV_URL + "/api/route", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(req.body),
            signal: AbortSignal.timeout(15000),
        });
        const data = await r.json();
        return res.status(r.status).json(data);
    } catch (err) {
        console.warn("Nav service proxy failed:", err.message);
        return res.status(502).json({ error: "Navigation service unavailable" });
    }
})

// SPA fallback: any non-API GET returns index.html so client-side routes work.
if (hasFrontend) {
    server.use((req, res, next) => {
        if (req.method !== "GET") return next();
        res.sendFile(path.join(distPath, "index.html"));
    });
}

server.listen(PORT , () => {
    console.log("Listening on 5000...")
});
