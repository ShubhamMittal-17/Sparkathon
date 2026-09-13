import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { CartContext } from "../App";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCartActions } from "../common/useCartActions";
import { Plus, Check, ListChecks, MapPin } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const NAV_SERVICE = (import.meta.env.VITE_NAV_DOMAIN || "http://127.0.0.1:5001") + "/api/route";
const API = import.meta.env.VITE_SERVER_DOMAIN;
const CATEGORIES = ["Electronics", "Food", "Snacks", "Hygiene", "Misc"];

export const RouteMap = () => {
  const [params] = useSearchParams();
  const [mode, setMode] = useState(params.get("mode") === "section" || params.get("section") ? "section" : "list");
  const [section, setSection] = useState(params.get("section") || "");
  const [image, setImage] = useState(null);
  const [msg, setMsg] = useState("");
  const [source, setSource] = useState("");
  const [recs, setRecs] = useState([]);
  const { userCart } = useContext(CartContext);
  const { handleAddItem, clearCart } = useCartActions();
  const navigate = useNavigate();

  const finishShopping = () => {
    clearCart();
    toast.success("Thanks for shopping!");
    navigate("/");
  };

  const build = async () => {
    setImage(null);
    setRecs([]);

    if (mode === "section" && !section) { setMsg(""); return; }
    setMsg("Building your route…");
    try {
      const [{ data: { layout } }, { data: { products } }] = await Promise.all([
        axios.get(API + "/layout"),
        axios.get(API + "/all-products"),
      ]);
      const byId = {};
      (products || []).forEach((p) => { byId[p._id] = p; });

      let items = [];
      let recCandidates = [];

      if (mode === "section") {
        // Route straight to a whole section (e.g. Dairy) — no cart needed.
        items = (products || [])
          .filter((p) => (p.tags || "").toLowerCase().startsWith(section.toLowerCase()))
          .map((p) => p.position).filter((p) => p && p.x >= 0).map((p) => [p.x, p.y]);
        setSource(`the ${section} section`);
      } else {
        // Route through the items in the shopper's list.
        const cartIds = (userCart || []).map((it) => it.product?._id).filter(Boolean);
        items = (userCart || []).map((it) => it.product?.position).filter((p) => p && p.x >= 0).map((p) => [p.x, p.y]);
        if (items.length) setSource("your list");
        if (!items.length) {
          items = (products || []).map((p) => p.position).filter((p) => p && p.x >= 0).map((p) => [p.x, p.y]);
          setSource("all products");
        }
        // "Grab on the way" recommendations, cart-based.
        if (cartIds.length) {
          const seen = new Set(cartIds);
          for (const id of cartIds) {
            try {
              const { data } = await axios.get(`${API}/similar/${id}?limit=3`);
              for (const s of data.similar || []) {
                const full = byId[s._id];
                if (full && !seen.has(full._id) && full.position?.x >= 0) { seen.add(full._id); recCandidates.push(full); }
              }
            } catch { /* ignore */ }
          }
        }
      }

      if (!items.length) {
        setMsg(mode === "section" ? "No items in that section yet." : "No items to route. Add products from the home page first.");
        return;
      }

      const { data } = await axios.post(NAV_SERVICE, {
        grid: layout.grid,
        entrance: [layout.entrance.x, layout.entrance.y],
        items,
        recommended: recCandidates.map((p) => [p.position.x, p.position.y]),
      });
      setImage(data.image);
      setRecs((data.on_route_indices || []).map((i) => recCandidates[i]).filter(Boolean));
    } catch (err) {
      console.log(err);
      setMsg("Could not build a route. Is the nav service on 5001 and a layout saved?");
    }
  };

  useEffect(() => { build(); }, [mode, section, userCart]);

  const Tab = ({ id, icon, label }) => (
    <button onClick={() => setMode(id)}
      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition ${mode === id ? "bg-[#2874F0] text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"}`}>
      {icon} {label}
    </button>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <Toaster />
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <h1 className="text-2xl font-semibold tracking-tight">Store Navigation</h1>
        {mode === "list" && userCart?.length > 0 && (
          <button onClick={finishShopping}
            className="flex items-center gap-2 text-sm font-medium text-white bg-[#2874F0] hover:bg-[#1c5fd0] rounded-full px-4 py-2 transition-colors">
            <Check size={16} /> Finish shopping
          </button>
        )}
      </div>

      {/* Mode switch */}
      <div className="flex gap-2 mb-5 flex-wrap">
        <Tab id="list" icon={<ListChecks size={16} />} label="My List" />
        <Tab id="section" icon={<MapPin size={16} />} label="Find a Section" />
      </div>

      {/* Section picker */}
      {mode === "section" && (
        <div className="flex gap-2 mb-6 flex-wrap">
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => setSection(c)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${section === c ? "bg-blue-50 text-[#2874F0] ring-1 ring-[#2874F0]" : "bg-white text-gray-700 border border-gray-200 hover:border-gray-300"}`}>
              {c}
            </button>
          ))}
        </div>
      )}

      {image ? (
        <div className="flex flex-wrap gap-8 items-start">
          <div className="flex-1 min-w-[280px]">
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 mb-3">
              <span>Routing to {source}</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" /> entrance</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" /> destination</span>
              {mode === "list" && <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-yellow-400 inline-block" /> on the way</span>}
            </div>
            <img src={image} alt="Navigation route" className="border border-gray-200 rounded-2xl w-full h-auto" />
          </div>

          {recs.length > 0 && (
            <div className="w-full sm:w-72">
              <h3 className="font-semibold text-lg mb-1">Grab on the way</h3>
              <p className="text-gray-500 text-sm mb-4">Already on your route — no detour.</p>
              <div className="space-y-2">
                {recs.map((p) => (
                  <div key={p._id} className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl p-2">
                    <img src={p.product_img} alt={p.title} className="w-11 h-11 object-cover rounded-lg bg-gray-50" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{p.title}</p>
                      <p className="text-gray-500 text-sm">${p.price}</p>
                    </div>
                    <button onClick={() => handleAddItem(p)} className="bg-[#2874F0] hover:bg-[#1c5fd0] text-white rounded-full p-2 transition-colors" title="Add to list">
                      <Plus size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="text-gray-500">{mode === "section" && !section ? "Pick a section above to get directions." : msg}</p>
      )}
    </div>
  );
};
