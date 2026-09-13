import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

// Cell types
const AISLE = 0; // walkable
const SHELF = 1; // obstacle where products live

const TOOLS = [
  { id: "shelf", label: "Shelf", hint: "Paint shelves (obstacles)" },
  { id: "aisle", label: "Aisle", hint: "Paint walkable floor" },
  { id: "entrance", label: "Entrance", hint: "Set the start cell (on an aisle)" },
  { id: "product", label: "Place product", hint: "Click a shelf to add an item" },
];

function makeGrid(h, w, fill = AISLE) {
  return Array.from({ length: h }, () => Array.from({ length: w }, () => fill));
}

// A ready-made sample store so the editor isn't blank on first open (for testing).
// Shelf blocks separated by aisles, entrance at the bottom. Each product sits on
// a shelf cell with an aisle directly below (the pickup spot).
const DEFAULT_GRID = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

const DEFAULT_ENTRANCE = { x: 11, y: 5 };

const DEFAULT_PRODUCTS = [
  { title: "Milk", price: 2.5, tags: "Dairy", position: { x: 2, y: 1 } },
  { title: "Bread", price: 1.8, tags: "Bakery", position: { x: 2, y: 4 } },
  { title: "Eggs", price: 3.2, tags: "Dairy", position: { x: 2, y: 7 } },
  { title: "Cereal", price: 4.5, tags: "Breakfast", position: { x: 2, y: 10 } },
  { title: "Juice", price: 2.9, tags: "Beverage", position: { x: 4, y: 2 } },
  { title: "Chips", price: 1.99, tags: "Snacks", position: { x: 4, y: 8 } },
  { title: "Cookies", price: 2.2, tags: "Snacks", position: { x: 6, y: 3 } },
  { title: "Soda", price: 1.5, tags: "Beverage", position: { x: 6, y: 9 } },
  { title: "Rice", price: 5.0, tags: "Grains", position: { x: 8, y: 1 } },
  { title: "Pasta", price: 1.7, tags: "Grains", position: { x: 8, y: 10 } },
  { title: "Shampoo", price: 3.8, tags: "Hygiene", position: { x: 10, y: 4 } },
  { title: "Soap", price: 1.2, tags: "Hygiene", position: { x: 10, y: 8 } },
];

export const StoreEditor = () => {
  const navigate = useNavigate();
  const [width, setWidth] = useState(14);
  const [height, setHeight] = useState(12);
  const [name, setName] = useState("My Store");
  const [grid, setGrid] = useState(() => DEFAULT_GRID.map((r) => r.slice()));
  const [entrance, setEntrance] = useState({ ...DEFAULT_ENTRANCE }); // {x: row, y: col}
  const [tool, setTool] = useState("shelf");
  const [products, setProducts] = useState(() => DEFAULT_PRODUCTS.map((p) => ({ ...p, position: { ...p.position } }))); // {title, price, tags, position:{x,y}}
  const [selectedCell, setSelectedCell] = useState(null); // {x,y} for product form
  const [form, setForm] = useState({ title: "", price: "", tags: "" });
  const painting = useRef(false);

  // Load the active layout + the real catalog so the editor mirrors the DB.
  useEffect(() => {
    const API = import.meta.env.VITE_SERVER_DOMAIN;
    (async () => {
      try {
        const { data } = await axios.get(API + "/layout");
        const L = data.layout;
        if (L) {
          setName(L.name || "My Store");
          setWidth(L.width);
          setHeight(L.height);
          setGrid(L.grid);
          setEntrance(L.entrance || { x: L.height - 1, y: 0 });
        }
      } catch { /* no layout yet is fine */ }
      try {
        const { data } = await axios.get(API + "/all-products");
        const placed = (data.products || [])
          .filter((p) => p.position && p.position.x >= 0)
          .map((p) => ({
            product_id: p.product_id,
            title: p.title,
            price: p.price,
            tags: p.tags || "",
            product_img: p.product_img || "",
            des: p.des || "",
            position: { x: p.position.x, y: p.position.y },
          }));
        if (placed.length) {
          setProducts(placed);
          toast.success(`Loaded layout + ${placed.length} products`);
        }
      } catch { /* keep defaults */ }
    })();
  }, []);

  // Rebuild grid when dimensions change, preserving overlap.
  const applyDims = (h, w) => {
    setGrid((prev) => {
      const next = makeGrid(h, w);
      for (let r = 0; r < Math.min(h, prev.length); r++)
        for (let c = 0; c < Math.min(w, prev[0].length); c++) next[r][c] = prev[r][c];
      return next;
    });
    // drop products / entrance that fall outside the new bounds
    setProducts((ps) => ps.filter((p) => p.position.x < h && p.position.y < w));
    setEntrance((e) => (e.x < h && e.y < w ? e : { x: h - 1, y: 0 }));
  };

  const productAt = (r, c) => products.find((p) => p.position.x === r && p.position.y === c);

  const paintCell = (r, c) => {
    if (tool === "aisle" || tool === "shelf") {
      const val = tool === "aisle" ? AISLE : SHELF;
      setGrid((prev) => {
        if (prev[r][c] === val) return prev;
        const next = prev.map((row) => row.slice());
        next[r][c] = val;
        return next;
      });
      // painting a shelf into an aisle removes any product there
      if (val === AISLE) setProducts((ps) => ps.filter((p) => !(p.position.x === r && p.position.y === c)));
    }
  };

  const handleCellDown = (r, c) => {
    if (tool === "entrance") {
      if (grid[r][c] !== AISLE) return toast.error("Entrance must be on an aisle cell");
      setEntrance({ x: r, y: c });
      return;
    }
    if (tool === "product") {
      if (grid[r][c] !== SHELF) return toast.error("Products go on shelf cells");
      const existing = productAt(r, c);
      setSelectedCell({ x: r, y: c });
      setForm(existing ? { title: existing.title, price: existing.price, tags: existing.tags || "" } : { title: "", price: "", tags: "" });
      return;
    }
    painting.current = true;
    paintCell(r, c);
  };

  const handleCellEnter = (r, c) => {
    if (painting.current) paintCell(r, c);
  };

  const saveProduct = () => {
    if (!selectedCell) return;
    if (!form.title.trim()) return toast.error("Enter a product name");
    setProducts((ps) => {
      const existing = ps.find((p) => p.position.x === selectedCell.x && p.position.y === selectedCell.y);
      const rest = ps.filter((p) => !(p.position.x === selectedCell.x && p.position.y === selectedCell.y));
      // Preserve image/id/description when editing an existing product.
      const entry = {
        ...(existing || {}),
        title: form.title.trim(),
        price: parseFloat(form.price) || 0,
        tags: form.tags.trim(),
        position: { x: selectedCell.x, y: selectedCell.y },
      };
      return [...rest, entry];
    });
    setSelectedCell(null);
    toast.success("Product placed");
  };

  const removeProduct = (r, c) => {
    setProducts((ps) => ps.filter((p) => !(p.position.x === r && p.position.y === c)));
    setSelectedCell(null);
  };

  const saveLayout = async () => {
    if (!products.length) return toast.error("Place at least one product");
    try {
      const { data } = await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + "/save-layout",
        { name, width, height, entrance, grid, products },
        { headers: { "x-admin-key": import.meta.env.VITE_MANAGER_PIN || "" } }
      );
      toast.success(`Saved layout + ${data.productCount} products`);
    } catch (err) {
      toast.error(err.response?.data?.error || "Save failed");
    }
  };

  const cellClass = (r, c) => {
    if (entrance.x === r && entrance.y === c) return "bg-green-500";
    if (productAt(r, c)) return "bg-blue-500";
    return grid[r][c] === SHELF ? "bg-amber-700" : "bg-gray-100";
  };

  return (
    <div className="p-6 select-none" onMouseUp={() => (painting.current = false)} onMouseLeave={() => (painting.current = false)}>
      <Toaster />
      <h1 className="text-2xl font-bold mb-1">Store Layout Editor</h1>
      <p className="text-gray-600 mb-4">Paint the store, set the entrance, and drop products on shelves. Saving fills the product database to match.</p>

      <div className="flex flex-wrap gap-6">
        {/* Controls */}
        <div className="w-full sm:w-72 sm:shrink-0 space-y-4">
          <div>
            <label className="text-sm font-semibold">Store name</label>
            <input className="w-full border rounded px-2 py-1" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <div>
              <label className="text-sm font-semibold">Width</label>
              <input type="number" min="2" max="30" className="w-full border rounded px-2 py-1" value={width}
                onChange={(e) => { const w = Math.max(2, Math.min(30, +e.target.value || 2)); setWidth(w); applyDims(height, w); }} />
            </div>
            <div>
              <label className="text-sm font-semibold">Height</label>
              <input type="number" min="2" max="30" className="w-full border rounded px-2 py-1" value={height}
                onChange={(e) => { const h = Math.max(2, Math.min(30, +e.target.value || 2)); setHeight(h); applyDims(h, width); }} />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold block mb-1">Tool</label>
            <div className="grid grid-cols-2 gap-2">
              {TOOLS.map((t) => (
                <button key={t.id} title={t.hint} onClick={() => setTool(t.id)}
                  className={`px-2 py-2 rounded text-sm font-medium border ${tool === t.id ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700"}`}>
                  {t.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">{TOOLS.find((t) => t.id === tool)?.hint}</p>
          </div>

          {/* Product form */}
          {selectedCell && (
            <div className="border rounded p-3 bg-blue-50 space-y-2">
              <p className="text-sm font-semibold">Shelf ({selectedCell.x},{selectedCell.y})</p>
              <input className="w-full border rounded px-2 py-1" placeholder="Product name" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <input className="w-full border rounded px-2 py-1" placeholder="Price" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              <input className="w-full border rounded px-2 py-1" placeholder="Tags (e.g. Dairy Milk)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
              <div className="flex gap-2">
                <button onClick={saveProduct} className="flex-1 bg-blue-600 text-white rounded py-1 text-sm font-medium">Save</button>
                <button onClick={() => removeProduct(selectedCell.x, selectedCell.y)} className="px-3 bg-red-100 text-red-700 rounded py-1 text-sm">Remove</button>
              </div>
            </div>
          )}

          <div className="text-sm text-gray-700">
            <span className="inline-block w-3 h-3 bg-gray-100 border align-middle mr-1"></span> Aisle&nbsp;
            <span className="inline-block w-3 h-3 bg-amber-700 align-middle mr-1"></span> Shelf&nbsp;
            <span className="inline-block w-3 h-3 bg-blue-500 align-middle mr-1"></span> Product&nbsp;
            <span className="inline-block w-3 h-3 bg-green-500 align-middle mr-1"></span> Entrance
          </div>

          <div className="flex gap-2">
            <button onClick={saveLayout} className="flex-1 bg-green-600 text-white rounded py-2 font-semibold">Save layout + fill DB</button>
            <button onClick={() => navigate("/route")} className="px-3 bg-gray-800 text-white rounded py-2 text-sm">Route →</button>
          </div>
          <p className="text-xs text-gray-500">{products.length} products placed. Saving replaces the catalog.</p>
        </div>

        {/* Grid */}
        <div className="overflow-auto">
          <div className="inline-grid gap-[2px] bg-gray-300 p-[2px]" style={{ gridTemplateColumns: `repeat(${width}, 32px)` }}>
            {grid.map((row, r) =>
              row.map((_, c) => {
                const p = productAt(r, c);
                return (
                  <div
                    key={`${r}-${c}`}
                    onMouseDown={() => handleCellDown(r, c)}
                    onMouseEnter={() => handleCellEnter(r, c)}
                    title={p ? `${p.title} ($${p.price})` : `(${r},${c})`}
                    className={`w-8 h-8 cursor-pointer flex items-center justify-center text-[9px] text-white ${cellClass(r, c)}`}
                  >
                    {entrance.x === r && entrance.y === c ? "IN" : p ? p.title.slice(0, 3) : ""}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
