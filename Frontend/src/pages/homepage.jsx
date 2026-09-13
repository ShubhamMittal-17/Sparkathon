import { useEffect, useState } from "react"
import axios from 'axios';
import { ProductCard } from "../components/product-card";
import { SimilarItems } from "../components/SimilarItems";
import { MapPin } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";

const CATEGORIES = [
  { name: "Electronics", icon: "📱" },
  { name: "Food", icon: "🥫" },
  { name: "Snacks", icon: "🍿" },
  { name: "Hygiene", icon: "🧴" },
  { name: "Misc", icon: "📦" },
];

export const HomePage = () => {
  const [products, setProducts] = useState(null);
  const [activeCat, setActiveCat] = useState(CATEGORIES[0].name);
  const [params] = useSearchParams();
  const query = (params.get("q") || "").trim();

  useEffect(() => {
    axios.get(import.meta.env.VITE_SERVER_DOMAIN + "/all-products")
      .then(({ data }) => setProducts(data.products))
      .catch((err) => console.log(err));
  }, []);

  const shown = (products || []).filter(
    (p) => (p.tags || "").toLowerCase().startsWith(activeCat.toLowerCase())
  );

  // Search across all products by title or tags/category.
  const results = query
    ? (products || []).filter((p) =>
        (p.title || "").toLowerCase().includes(query.toLowerCase()) ||
        (p.tags || "").toLowerCase().includes(query.toLowerCase()))
    : [];

  if (query) {
    return (
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6">
        <h2 className="text-lg font-bold text-gray-900 mb-1">
          Results for "{query}" <span className="text-gray-400 font-normal text-sm">({results.length})</span>
        </h2>
        {products == null ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-4">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-72 rounded-lg bg-gray-100 animate-pulse" />)}
          </div>
        ) : results.length ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-4">
            {results.map((p) => <ProductCard key={p._id} content={p} />)}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500">
            <p className="text-lg font-medium">No products match "{query}"</p>
            <p className="text-sm mt-1">Try a different keyword or browse categories.</p>
            <Link to="/" className="inline-block mt-4 text-[#2874F0] font-medium">← Back to home</Link>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="pb-10">
      {/* Category strip */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 flex gap-6 sm:gap-10 overflow-x-auto py-3">
          {CATEGORIES.map((c) => (
            <button key={c.name} onClick={() => setActiveCat(c.name)}
              className="flex flex-col items-center gap-1 shrink-0 group">
              <span className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl transition ${activeCat === c.name ? "bg-blue-50 ring-2 ring-[#2874F0]" : "bg-gray-50 group-hover:bg-gray-100"}`}>{c.icon}</span>
              <span className={`text-xs font-medium ${activeCat === c.name ? "text-[#2874F0]" : "text-gray-700"}`}>{c.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        {/* Promo hero */}
        <div className="mt-4 rounded-lg overflow-hidden bg-gradient-to-r from-[#2874F0] to-[#1a5cc4] text-white px-6 py-7 sm:px-10 sm:py-9 flex items-center justify-between">
          <div>
            <span className="inline-block bg-[#ff9f00] text-white text-[11px] font-bold px-2 py-0.5 rounded mb-2">IN-STORE</span>
            <h1 className="text-2xl sm:text-3xl font-bold leading-tight">Shop smart. Skip the wandering.</h1>
            <p className="text-blue-100 mt-1 text-sm sm:text-base flex items-center gap-1.5">
              <MapPin size={16} /> Add items to your list — we route you the fastest way.
            </p>
            <Link to="/route?mode=section">
              <button className="mt-3 bg-white text-[#2874F0] font-semibold text-sm rounded-full px-4 py-2 hover:bg-blue-50 transition-colors">
                Just need directions? Find a section →
              </button>
            </Link>
          </div>
          <div className="text-6xl hidden sm:block">🛒</div>
        </div>

        {/* Product section */}
        <div className="mt-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center justify-between px-4 pt-4">
            <h2 className="text-lg font-bold text-gray-900">{activeCat}</h2>
            <span className="text-sm text-gray-400">{shown.length} items</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 p-4">
            {products == null
              ? Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-72 rounded-lg bg-gray-100 animate-pulse" />)
              : shown.length
                ? shown.map((product) => <ProductCard key={product._id} content={product} />)
                : <div className="col-span-full p-10 text-center text-gray-500">No items in {activeCat}</div>}
          </div>
        </div>

        {/* Recommendations */}
        {shown.length > 0 && (
          <div className="mt-4 bg-white rounded-lg border border-gray-200 px-4">
            <SimilarItems
              productId={shown[0]._id ?? shown[0].product_id}
              title={`Similar to ${shown[0].title}`}
            />
          </div>
        )}
      </div>
    </div>
  )
}
