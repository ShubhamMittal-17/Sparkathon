import mongoose from "mongoose";
import Product from "../Schema/Product.js";
import { dummyProducts } from "./products.data.js";
import 'dotenv/config'

async function seedDB() {
  try {
    await mongoose.connect(process.env.DB_LOCATION, {
        autoIndex: true
    });

    // Optional: clear existing products first
    await Product.deleteMany();

    await Product.insertMany(dummyProducts);
    console.log("✅ Dummy data inserted!");
    mongoose.connection.close();
  } catch (err) {
    console.error("❌ Seeding failed:", err);
  }
}

seedDB();
