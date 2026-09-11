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
    <div className="py-8">
      <h2 className="text-2xl font-bold text-center mb-6">{title}</h2>
      <div className="flex flex-wrap justify-center gap-2">
        {items.map((product) => (
          <ProductCard key={product._id ?? product.product_id} content={product} />
        ))}
      </div>
    </div>
  );
};
