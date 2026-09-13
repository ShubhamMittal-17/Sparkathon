import { useState } from "react";
import { Link } from "react-router-dom";
import { Lock } from "lucide-react";

// Simple manager-only gate for the store editor. Shoppers use the app with no
// login; the editor is staff-only, so it's protected by a shared passcode.
// (Demo-level: the PIN lives client-side. In production this should be verified
//  server-side against a real staff account.)
const PIN = import.meta.env.VITE_MANAGER_PIN || "1234";

export const ManagerGate = ({ children }) => {
  const [ok, setOk] = useState(() => {
    try { return sessionStorage.getItem("isManager") === "1"; } catch { return false; }
  });
  const [pin, setPin] = useState("");
  const [err, setErr] = useState(false);

  if (ok) return children;

  const submit = (e) => {
    e.preventDefault();
    if (pin === PIN) {
      try { sessionStorage.setItem("isManager", "1"); } catch { /* ignore */ }
      setOk(true);
    } else {
      setErr(true);
    }
  };

  return (
    <div className="max-w-sm mx-auto px-4 py-20">
      <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <Lock size={24} className="text-gray-500" />
        </div>
        <h1 className="text-xl font-semibold mb-1">Manager access</h1>
        <p className="text-gray-500 text-sm mb-6">This area is for store staff only.</p>
        <form onSubmit={submit} className="space-y-3">
          <input
            type="password"
            value={pin}
            onChange={(e) => { setPin(e.target.value); setErr(false); }}
            placeholder="Enter passcode"
            className="w-full border border-gray-200 rounded-full px-4 py-2.5 text-center outline-none focus:border-[#2874F0] transition"
            autoFocus
          />
          {err && <p className="text-red-500 text-sm">Incorrect passcode</p>}
          <button type="submit" className="w-full bg-[#2874F0] hover:bg-[#1c5fd0] text-white font-medium py-2.5 rounded-full transition-colors">
            Unlock
          </button>
        </form>
        <Link to="/" className="inline-block mt-5 text-sm text-gray-400 hover:text-gray-700">← Back to shopping</Link>
      </div>
    </div>
  );
};
