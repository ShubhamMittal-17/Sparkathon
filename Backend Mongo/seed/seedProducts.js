import mongoose from "mongoose";
import Product from "../Schema/Product.js";
import 'dotenv/config'
const dummyProducts = [
  {
    product_id: "P001",
    title: "Wireless Headphones",
    product_img: "https://images.unsplash.com/photo-1585386959984-a4155228c3f0",
    des: "Noise-cancelling over-ear headphones with 40 hours of battery life.",
    price: 149.99,
    count: { total_stock: 100, total_sold: 35 },
    tags: "Electronics",
    position: {x:0,y:1}
  },
  {
    product_id: "P002",
    title: "Gaming Keyboard",
    product_img: "https://images.unsplash.com/photo-1587202372775-e63a08c3dc1d",
    des: "Mechanical RGB gaming keyboard with blue switches.",
    price: 89.99,
    count: { total_stock: 50, total_sold: 20 },
    tags: "Electronics",
    position: {x:0,y:6}
  },
  {
    product_id: "P003",
    title: "Smart Watch",
    product_img: "https://images.unsplash.com/photo-1603791440384-56cd371ee9a7",
    des: "Fitness smart watch with heart rate monitoring and GPS.",
    price: 129.99,
    count: { total_stock: 75, total_sold: 40 },
    tags: "Electronics",
    position: {x:2,y:8}
  },
  {
    product_id: "P004",
    title: "Portable Speaker",
    product_img: "https://images.unsplash.com/photo-1616627452239-bb470a3d3f1d",
    des: "Waterproof Bluetooth speaker with 12 hours of playtime.",
    price: 59.99,
    count: { total_stock: 200, total_sold: 80 },
    tags: "Electronics",
    position: {x:2,y:10}
  },
  {
    product_id: "P005",
    title: "USB-C Charger",
    product_img: "https://images.unsplash.com/photo-1622913998172-cfdf00642d5c",
    des: "Fast-charging USB-C wall charger with 30W power output.",
    price: 24.99,
    count: { total_stock: 300, total_sold: 150 },
    tags: "Electronics",
    position: {x:4,y:1}
  },
  {
    product_id: "P006",
    title: "Wireless Mouse",
    product_img: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04",
    des: "Ergonomic wireless mouse with adjustable DPI settings.",
    price: 29.99,
    count: { total_stock: 150, total_sold: 60 },
    tags: "Electronics",
    position: {x:4,y:7}
  },
  {
    product_id: "P007",
    title: "Laptop Stand",
    product_img: "https://images.unsplash.com/photo-1611186871348-b38e2371f9e1",
    des: "Aluminum adjustable laptop stand for better ergonomics.",
    price: 39.99,
    count: { total_stock: 120, total_sold: 45 },
    tags: "Electronics",
    position: {x:6,y:9}
  },
  {
    product_id: "P008",
    title: "LED Desk Lamp",
    product_img: "https://images.unsplash.com/photo-1616627982887-3b7a145ee07d",
    des: "Dimmable LED lamp with USB charging port.",
    price: 34.99,
    count: { total_stock: 100, total_sold: 50 },
    tags: "Electronics",
    position: {x:6,y:3}
  },
  {
    product_id: "P009",
    title: "Noise Cancelling Earbuds",
    product_img: "https://images.unsplash.com/photo-1581276879432-c79e3d2d2db3",
    des: "True wireless earbuds with ANC and charging case.",
    price: 99.99,
    count: { total_stock: 180, total_sold: 90 },
    tags: "Electronics",
    position: {x:8,y:1}
  },
  {
    product_id: "P010",
    title: "Smart LED Bulb",
    product_img: "https://images.unsplash.com/photo-1616627981815-1fc75c423360",
    des: "Color-changing LED bulb controllable via app or voice.",
    price: 14.99,
    count: { total_stock: 500, total_sold: 300 },
    position: {x:8,y:2}
  },
  {
    product_id: "P011",
    title: "4K HDMI Cable",
    product_img: "https://images.unsplash.com/photo-1617957741999-fdcd43b6d1d2",
    des: "High-speed 6ft HDMI cable supporting 4K UHD.",
    price: 12.99,
    count: { total_stock: 600, total_sold: 250 },
    tags: "Electronics",
    position: {x:8,y:3}
  },
  {
    product_id: "P012",
    title: "External SSD 1TB",
    product_img: "https://images.unsplash.com/photo-1620912189860-6d2fba5e3be2",
    des: "High-speed USB 3.2 external SSD for fast file transfer.",
    price: 109.99,
    count: { total_stock: 90, total_sold: 70 },
    tags: "Electronics",
    position: {x:8,y:4}
  },
  {
    product_id: "P013",
    title: "Fitness Tracker Band",
    product_img: "https://images.unsplash.com/photo-1603395741814-30a2bb9e2d2e",
    des: "Basic fitness band with steps, calories, and sleep tracking.",
    price: 49.99,
    count: { total_stock: 140, total_sold: 75 },
    tags: "Electronics",
    position: {x:8,y:8}
  },
  {
    product_id: "P014",
    title: "Gaming Mouse Pad",
    product_img: "https://images.unsplash.com/photo-1622650828951-f50370c7aab2",
    des: "Extended RGB gaming mouse pad with non-slip base.",
    price: 19.99,
    count: { total_stock: 250, total_sold: 130 },
    tags: "Electronics",
    position: {x:8,y:9}
  },
  {
    product_id: "P015",
    title: "Bluetooth Car Adapter",
    product_img: "https://images.unsplash.com/photo-1603712725039-e6bd3d624fd9",
    des: "Bluetooth 5.0 audio receiver for car stereo systems.",
    price: 22.99,
    count: { total_stock: 160, total_sold: 90 },
    tags: "Electronics",
    position: {x:8,y:10}
  },
  {
    product_id: "P016",
    title: "Electric Toothbrush",
    product_img: "https://images.unsplash.com/photo-1595433562696-243f5b81b80a",
    des: "Rechargeable sonic toothbrush with 5 brushing modes.",
    price: 59.99,
    count: { total_stock: 80, total_sold: 40 },
    tags: "Electronics",
    position: {x:10,y:1}
  },
  {
    product_id: "P017",
    title: "Mini Projector",
    product_img: "https://images.unsplash.com/photo-1603791440384-8e8d7b5a428b",
    des: "Portable mini projector for movies and presentations.",
    price: 199.99,
    count: { total_stock: 60, total_sold: 35 },
    tags: "Electronics",
    position: {x:10,y:2}
  },
  {
    product_id: "P018",
    title: "USB Hub 4-Port",
    product_img: "https://images.unsplash.com/photo-1632900420161-3215f3c3c142",
    des: "4-port USB 3.0 hub for laptops and desktops.",
    price: 18.99,
    count: { total_stock: 300, total_sold: 180 },
    tags: "Electronics",
    position: {x:10,y:3}
  },
  {
    product_id: "P019",
    title: "Cable Organizer Box",
    product_img: "https://images.unsplash.com/photo-1616146922045-38ff8a50df87",
    des: "Box for hiding and organizing power strips and cables.",
    price: 15.99,
    count: { total_stock: 200, total_sold: 100 },
    tags: "Electronics",
    position: {x:10,y:4}
  },
  {
    product_id: "P020",
    title: "Phone Tripod Stand",
    product_img: "https://images.unsplash.com/photo-1587392990717-4c3b76c02a73",
    des: "Adjustable tripod with phone holder for video or photos.",
    price: 27.99,
    count: { total_stock: 120, total_sold: 65 },
    tags: "Electronics",
    position: {x:10,y:7}
  },
  {
  product_id: "P021",
  title: "Laptop Sleeve 15-inch",
  product_img: "https://images.unsplash.com/photo-1541807084-5c52b6b2e6c7",
  des: "Protective neoprene laptop sleeve with zipper.",
  price: 21.99,
  count: { total_stock: 180, total_sold: 95 },
  tags: "Electronics",
  position: {x:10,y:8}
  },
  {
    product_id: "P022",
    title: "Webcam 1080p",
    product_img: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45",
    des: "Full HD 1080p webcam with built-in microphone.",
    price: 49.99,
    count: { total_stock: 85, total_sold: 55 },
    tags: "Electronics",
    position: {x:10,y:9}
  },
  {
    product_id: "P023",
    title: "Smart Plug",
    product_img: "https://images.unsplash.com/photo-1600195077901-c6df733d3652",
    des: "Wi-Fi enabled smart plug with Alexa/Google Home support.",
    price: 19.99,
    count: { total_stock: 400, total_sold: 250 },
    tags: "Electronics",
    position: {x:10,y:10}
  },
  {
    product_id: "P024",
    title: "Wireless Charging Pad",
    product_img: "https://images.unsplash.com/photo-1616690710409-5a52bd0b5fa2",
    des: "10W fast wireless charging pad for smartphones.",
    price: 26.99,
    count: { total_stock: 220, total_sold: 140 },
    tags: "Electronics",
    position: {x:0,y:10}
  },
  {
    product_id: "P025",
    title: "Streaming Microphone",
    product_img: "https://images.unsplash.com/photo-1611930022088-d05f02aee23d",
    des: "USB condenser microphone for podcasting and streaming.",
    price: 79.99,
    count: { total_stock: 95, total_sold: 60 },
    tags: "Electronics",
    position: {x:2,y:1}
  }
  
];

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
