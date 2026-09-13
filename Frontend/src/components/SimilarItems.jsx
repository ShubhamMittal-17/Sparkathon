import { useEffect, useState } from "react";
import axios from "axios";
import { ProductCard } from "./product-card";

// Fetches content-based "similar items" for a given product from the
// /similar/:productId endpoint and renders them with the normal product card.
export const SimilarItems = ({ productId, title = "Similar items" }) => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!productId) return;
    axios
      .get(`${import.meta.env.VITE_SERVER_DOMAIN}/similar/${productId}?limit=4`)
      .then(({ data }) => setItems(data.similar || []))
      .catch((err) => console.log("Failed to load similar items:", err));
  }, [productId]);

  if (!items.length) return null;

  return (
    <div className="py-10">
      <h2 className="text-xl font-semibold tracking-tight mb-5">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((product) => (
          <ProductCard key={product._id ?? product.product_id} content={product} />
        ))}
      </div>
    </div>
  );
};
