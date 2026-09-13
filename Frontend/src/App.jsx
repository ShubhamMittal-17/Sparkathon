import { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Navbar } from './components/navbar-component'
import { HomePage } from './pages/homepage'
import { Cart } from './pages/Cart'
import { RouteMap } from './pages/Route'
import { StoreEditor } from './pages/StoreEditor'
import { ManagerGate } from './components/ManagerGate'
import { createContext } from 'react'

// No accounts: the app is opened by scanning a QR at the store entrance, so the
// cart is a per-session, per-device list kept in the browser (localStorage).
export const CartContext = createContext({});

const loadCart = () => {
  try { return JSON.parse(localStorage.getItem('cart')) || []; }
  catch { return []; }
};

function App() {
  const [userCart, setUserCart] = useState(loadCart);

  return (
    <CartContext.Provider value={{ userCart, setUserCart }}>
      <Routes>
        <Route path="/" element={<Navbar />}>
          <Route index element={<HomePage />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/route" element={<RouteMap />} />
          <Route path="/editor" element={<ManagerGate><StoreEditor /></ManagerGate>} />
        </Route>
      </Routes>
    </CartContext.Provider>
  )
}

export default App
