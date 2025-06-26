import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { Route, Routes } from 'react-router-dom'
import { Navbar } from './components/navbar-component'
import { HomePage } from './pages/homepage'
import { SignUp } from './pages/SignUp'
import { SignIn } from './pages/SignIn'
import {Cart} from './pages/Cart'
import { RouteMap } from './pages/Route'

function App() {

  return (
    <Routes>
      <Route path="/" element={<Navbar/>}>
        <Route index element={<HomePage/>}/>
        <Route path="/signin" element={<SignIn/>}/>
        <Route path="/signup" element={<SignUp/>}/>
        <Route path="/cart" element={<Cart/>}/>
        <Route path="/route" element={<RouteMap/>}/>
      </Route>
    </Routes>
  )
}

export default App
