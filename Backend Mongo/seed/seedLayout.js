import mongoose from "mongoose";
import "dotenv/config";
import Product from "../Schema/Product.js";
import Layout from "../Schema/Layout.js";

// Full categorized store: each shelf ROW is a category "aisle", so browsing a
// category on the storefront corresponds to a physical zone in the store. The
// grid below matches the editor's default layout (14 wide x 12 tall).
//   0 = aisle (walkable), 1 = shelf.
const grid = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0], // row 2  -> Electronics
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1], // row 4  -> Food
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1], // row 6  -> Snacks
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1], // row 8  -> Hygiene
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0], // row 10 -> Misc
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

const entrance = { x: 11, y: 5 };

// The 8 shelf columns available in each category row, in walk order.
const COLS = [1, 2, 3, 4, 7, 8, 9, 10];

// Each category is one shelf row. `tags` starts with the category (used by the
// storefront's category tabs) followed by a sub-category (used by the TF-IDF
// recommender to rank within a category).
const catalog = {
  2: { category: "Electronics", items: [
    ["Wireless Headphones", "Audio", 149.99], ["Noise Cancelling Earbuds", "Audio", 99.99],
    ["Bluetooth Speaker", "Audio", 59.99], ["Gaming Keyboard", "Gaming", 89.99],
    ["Wireless Mouse", "Gaming", 29.99], ["1080p Webcam", "Video", 49.99],
    ["USB-C Charger", "Charging", 24.99], ["External SSD 1TB", "Storage", 109.99],
  ]},
  4: { category: "Food", items: [
    ["Milk", "Dairy", 2.5], ["Cheese", "Dairy", 4.2], ["Eggs", "Dairy", 3.2], ["Butter", "Dairy", 2.8],
    ["Bread", "Bakery", 1.8], ["Rice", "Grains", 5.0], ["Pasta", "Grains", 1.7], ["Cereal", "Breakfast", 4.5],
  ]},
  6: { category: "Snacks", items: [
    ["Potato Chips", "Chips", 1.99], ["Cookies", "Sweet", 2.2], ["Chocolate Bar", "Sweet", 1.5],
    ["Popcorn", "Chips", 2.0], ["Gummy Candy", "Sweet", 1.2], ["Pretzels", "Chips", 1.8],
    ["Crackers", "Savory", 2.4], ["Mixed Nuts", "Savory", 3.5],
  ]},
  8: { category: "Hygiene", items: [
    ["Shampoo", "Hair", 3.8], ["Soap Bar", "Body", 1.2], ["Toothpaste", "Oral", 2.1],
    ["Deodorant", "Body", 3.0], ["Body Lotion", "Body", 4.0], ["Razor", "Shave", 5.5],
    ["Hand Sanitizer", "Body", 2.3], ["Facial Tissues", "Paper", 1.9],
  ]},
  10: { category: "Misc", items: [
    ["AA Batteries", "Electrical", 4.5], ["Notebook", "Stationery", 2.0], ["Pen Pack", "Stationery", 1.5],
    ["Umbrella", "Household", 8.0], ["Scented Candle", "Household", 6.0], ["Duct Tape", "Household", 3.2],
    ["Scissors", "Stationery", 2.7], ["LED Lightbulb", "Electrical", 3.9],
  ]},
};

function buildProducts() {
  const products = [];
  let n = 0;
  for (const [rowStr, { category, items }] of Object.entries(catalog)) {
    const row = parseInt(rowStr);
    items.forEach(([title, sub, price], i) => {
      n++;
      const col = COLS[i];
      products.push({
        product_id: `P${String(n).padStart(3, "0")}`,
        title,
        product_img: `https://picsum.photos/seed/${category}-${i}/300`,
        des: `${title} — ${category} (${sub}).`,
        price,
        count: { total_stock: 100, total_sold: 200 - n * 3 }, // varied for best-seller sort
        tags: `${category} ${sub}`,
        position: { x: row, y: col },
        rating: (3 + (n % 3) * 0.5 + 1).toFixed(1),
      });
    });
  }
  return products;
}

async function seed() {
  try {
    await mongoose.connect(process.env.DB_LOCATION, { autoIndex: true });
    const products = buildProducts();

    await Product.deleteMany();
    await Product.insertMany(products);

    await Layout.updateMany({}, { isActive: false });
    await Layout.create({
      name: "Sample Supermarket",
      width: 14,
      height: 12,
      entrance,
      grid,
      isActive: true,
    });

    console.log(`✅ Seeded ${products.length} products across ${Object.keys(catalog).length} category zones + layout.`);
    await mongoose.connection.close();
  } catch (err) {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  }
}

seed();
