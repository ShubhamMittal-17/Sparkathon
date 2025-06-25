import express from 'express';
import mongoose from 'mongoose';
import 'dotenv/config'
import Product from './Schema/Product.js';
import cors from 'cors';
const server = express();
let PORT = 5000;

server.use(express.json());
server.use(cors());

mongoose.connect(process.env.DB_LOCATION, {
    autoIndex: true
});

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

server.listen(PORT , () => {
    console.log("Listening on 5000...")
});
