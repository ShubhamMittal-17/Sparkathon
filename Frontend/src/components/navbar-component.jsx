import { Link, Outlet, useLocation, useNavigate, useSearchParams } from "react-router-dom"
import wallmart_logo from "../imgs/logo.png"
import { useContext, useState } from "react"
import { Map, ShoppingCart, Search } from "lucide-react"
import { CartContext } from "../App"

export const Navbar = () => {
    const { userCart } = useContext(CartContext);
    const count = (userCart || []).reduce((n, it) => n + it.quantity, 0);
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const [q, setQ] = useState(params.get("q") || "");

    const runSearch = (value) => {
        setQ(value);
        navigate(value.trim() ? `/?q=${encodeURIComponent(value.trim())}` : "/", { replace: true });
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#f1f3f6] text-gray-900">
            <nav className="sticky top-0 z-40 bg-[#2874F0] shadow-sm">
                <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 flex items-center gap-3 sm:gap-5">
                    <Link to="/" className="flex items-center gap-2 shrink-0">
                        <img className="w-7 h-7 rounded-full object-contain bg-white p-0.5" src={wallmart_logo} />
                        <div className="leading-none hidden sm:block">
                            <span className="text-white font-bold italic text-lg">Walmart</span>
                            <span className="block text-[11px] text-blue-100 italic -mt-0.5">In-store</span>
                        </div>
                    </Link>

                    <form onSubmit={(e) => { e.preventDefault(); runSearch(q); }} className="relative flex-1 min-w-0 max-w-2xl">
                        <input
                            type="text"
                            value={q}
                            onChange={(e) => runSearch(e.target.value)}
                            placeholder="Search for products, brands and more"
                            className="w-full bg-white rounded-sm pl-3 pr-10 py-2 text-sm outline-none placeholder:text-gray-400"
                        />
                        <button type="submit" className="absolute right-0 top-0 h-full px-3 flex items-center" aria-label="Search">
                            <Search size={18} className="text-[#2874F0]" />
                        </button>
                    </form>

                    <Link to="/route">
                        <button className={`flex items-center gap-1.5 rounded px-3 py-2 text-sm font-semibold transition ${pathname === "/route" ? "bg-white/20 text-white" : "text-white hover:bg-white/10"}`}>
                            <Map size={18} />
                            <span className="hidden md:block">Route</span>
                        </button>
                    </Link>

                    <Link to="/cart" className="relative">
                        <button className="flex items-center gap-1.5 rounded px-3 py-2 text-sm font-semibold text-white hover:bg-white/10 transition">
                            <ShoppingCart size={18} />
                            <span className="hidden md:block">List</span>
                        </button>
                        {count > 0 && (
                            <span className="absolute top-0 right-1 bg-[#ff9f00] text-white text-[11px] font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center border-2 border-[#2874F0]">{count}</span>
                        )}
                    </Link>
                </div>
            </nav>

            <main className="flex-1">
                <Outlet />
            </main>

            <footer className="bg-[#172337] text-gray-400 py-6 text-center text-sm mt-8">
                © 2025 Walmart · in-store shopping assistant
            </footer>
        </div>
    )
}
