import React from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import VendorsPage from './pages/VendorsPage'
import OrdersPage from './pages/OrdersPage'
import InventoryPage from './pages/InventoryPage'
import DebugPage from './pages/DebugPage'
import './App.css'

function Navbar() {
  const location = useLocation()
  
  const isActive = (path) => location.pathname === path
  
  return (
    <nav className="navbar">
      <div className="navbar-brand">Mini ERP</div>
      <ul className="navbar-links">
        <li>
          <Link 
            to="/vendors" 
            className={`nav-link ${isActive('/vendors') ? 'active' : ''}`}
          >
            Vendors
          </Link>
        </li>
        <li>
          <Link 
            to="/orders" 
            className={`nav-link ${isActive('/orders') ? 'active' : ''}`}
          >
            Orders
          </Link>
        </li>
        <li>
          <Link 
            to="/inventory" 
            className={`nav-link ${isActive('/inventory') ? 'active' : ''}`}
          >
            Inventory
          </Link>
        </li>
        <li>
          <Link 
            to="/debug" 
            className={`nav-link ${isActive('/debug') ? 'active' : ''}`}
            style={{ color: '#fbbf24' }}
          >
            Debug 🔧
          </Link>
        </li>
      </ul>
    </nav>
  )
}

function App() {
  return (
    <BrowserRouter>
      <div style={{display: 'flex', flexDirection: 'column', minHeight: '100vh'}}>
        <Navbar />
        <main className="page-wrapper">
          <Routes>
            <Route path="/" element={<VendorsPage />} />
            <Route path="/vendors" element={<VendorsPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/debug" element={<DebugPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
