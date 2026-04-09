import React, { useState, useEffect } from 'react'
import { Package, Check } from 'lucide-react'

// Get API URL from environment variable (required for backend connectivity)
const RAW_API_URL = import.meta.env.VITE_API_URL || '';
const API_URL = RAW_API_URL.replace(/\/api\/?$/, '').replace(/\/+$/, '');
if (!API_URL) {
  console.error('API_URL is not defined - backend calls will fail');
}

function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [formData, setFormData] = useState({ vendor_id: '', item_name: '', quantity: '', unit: 'kg' }) // ADDED: unit field with default 'kg'
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // ADDED: Log API configuration on mount
    console.log('[Debug] OrdersPage Configuration:')
    console.log('  VITE_API_URL env:', import.meta.env.VITE_API_URL)
    console.log('  Using API_URL:', API_URL)
    if (!import.meta.env.VITE_API_URL) {
      console.error('[Debug] VITE_API_URL is not defined - backend calls will fail')
    }
    
    // TEST: Verify backend connectivity
    testBackendConnection()
    loadOrders()
  }, [])

  // NEW: Test backend connectivity
  async function testBackendConnection() {
    console.log('[Debug] Testing backend connectivity...')
    try {
      const response = await fetch(`${API_URL}/`)
      console.log('[Debug] ✅ Backend is reachable! Status:', response.status)
    } catch (error) {
      console.error('[Debug] ❌ Backend unreachable at:', API_URL)
      console.error('[Debug] Error:', error.message)
    }
  }

  async function fetchJson(url, options = {}) {
    try {
      const method = options.method || 'GET'
      console.log(`[Debug] Request: ${method} ${url}`)
      
      const response = await fetch(url, options)
      const text = await response.text()
      
      console.log(`[Debug] Response Status: ${response.status}`)
      console.log('[Debug] Response Text:', text.substring(0, 300))
      
      let data = null
      if (text && text.trim()) {
        try {
          data = JSON.parse(text)
        } catch (jsonErr) {
          console.error('[Debug] JSON Parse Error:', jsonErr.message)
          throw new Error('Invalid response from server')
        }
      }

      if (!response.ok) {
        const msg = data?.detail || data?.message || data?.error || `HTTP ${response.status}`
        throw new Error(msg)
      }

      return data
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        const corsMsg = `Possible CORS issue or backend unreachable at ${API_URL}`
        console.error('[Debug]', corsMsg, error.message)
        throw new Error(corsMsg)
      }
      const errorMsg = error instanceof Error ? error.message : String(error)
      console.error(`[Debug] Fetch Error: ${errorMsg}`)
      throw new Error(errorMsg)
    }
  }

  async function loadOrders() {
    try {
      const data = await fetchJson(`${API_URL}/orders`) // FIXED: Use API_URL instead of API_BASE
      // FIXED: Handle empty array as valid response
      if (Array.isArray(data) && data.length === 0) {
        console.log('[Debug] No orders available (empty response)') // ADDED
      }
      setOrders(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('[Debug] loadOrders error:', error.message) // ADDED
      alert(`Unable to load orders: ${error.message}`)
      setOrders([])
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()

    const vendorId = parseInt(formData.vendor_id, 10)
    const quantity = parseInt(formData.quantity, 10)

    if (!vendorId || !formData.item_name || quantity <= 0 || !formData.unit) { // ADDED: validate unit
      alert('Please provide vendor ID, item name, quantity, and unit.')
      return
    }

    try {
      setLoading(true)
      await fetchJson(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendor_id: vendorId,
          item_name: formData.item_name,
          quantity: quantity,
          unit: formData.unit // ADDED: include unit in payload
        }),
      })

      alert('Order created successfully.')
      setFormData({ vendor_id: '', item_name: '', quantity: '', unit: 'kg' }) // ADDED: reset unit to default
      await loadOrders()
    } catch (error) {
      alert(`Failed to create order: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  async function markReceived(orderId) {
    try {
      const updatedOrder = await fetchJson(`${API_URL}/orders/${orderId}/receive`, {
        method: 'POST',
      })
      // ENHANCED: Update state immediately without full page reload
      setOrders(orders.map(o => o.id === orderId ? updatedOrder : o))
      console.log('[Debug] Order marked as received successfully')
    } catch (error) {
      // ENHANCED: More granular error handling
      if (error.message.includes('already received') || error.message.includes('Already')) {
        console.log('[Debug] Order already received, reloading...')
        await loadOrders()
      } else if (error.message.includes('not found')) {
        alert(`Order not found: ${error.message}`)
        await loadOrders()
      } else {
        alert(`Failed to mark order received: ${error.message}`)
      }
    }
  }

  return (
    <div className="page-content fade-in">
      <div className="page-header">
        <h1>📋 Orders</h1>
        <p>Track and manage your purchase orders</p>
      </div>

      <div className="form-content">
        <form onSubmit={handleSubmit} className="form-grid">
          <label>
            Vendor ID
            <input
              type="number"
              placeholder="Vendor ID"
              min="1"
              value={formData.vendor_id}
              onChange={(e) => setFormData({...formData, vendor_id: e.target.value})}
              required
            />
          </label>
          <label>
            Item Name
            <input
              type="text"
              placeholder="Item name"
              value={formData.item_name}
              onChange={(e) => setFormData({...formData, item_name: e.target.value})}
              required
            />
          </label>
          <label>
            Quantity
            <input
              type="number"
              placeholder="Quantity"
              min="1"
              value={formData.quantity}
              onChange={(e) => setFormData({...formData, quantity: e.target.value})}
              required
            />
          </label>
          {/* ADDED: Unit selection dropdown */}
          <label>
            Unit
            <select
              value={formData.unit}
              onChange={(e) => setFormData({...formData, unit: e.target.value})}
              required
            >
              <option value="kg">kg</option>
              <option value="liter">liter</option>
              <option value="pieces">pieces</option>
            </select>
          </label>
          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? 'Creating...' : '+ Create Order'}
          </button>
        </form>

        <div>
          <h3 style={{fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', color: '#cbd5e1'}}>
            Order List
          </h3>
          {orders.length === 0 ? (
            <div className="empty-state">
              <Package className="empty-icon" />
              <div className="empty-text">
                No orders available yet.<br/>
                Start by creating your first order above.
              </div>
            </div>
          ) : (
            <ul className="list">
              {(Array.isArray(orders) ? orders : []).map((order, index) => {
                // ENHANCED: Use status field from backend (case-insensitive)
                const isReceived = order.status && order.status.toLowerCase() === "received"
                const statusDisplay = isReceived ? 'Received' : 'Pending'
                
                return (
                  <li 
                    key={order.id} 
                    className="list-item" 
                    style={{
                      animationDelay: `${index * 0.05}s`,
                      // ENHANCED: Smooth status-based styling with transition
                      backgroundColor: isReceived ? 'rgba(16, 185, 129, 0.08)' : 'transparent',
                      borderLeft: isReceived ? '4px solid #10b981' : '4px solid #6b7280',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  >
                    <div className="item-row">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                        {/* ENHANCED: Show professional double tick for received status */}
                        {isReceived && (
                          <span 
                            style={{
                              color: '#10b981',
                              fontWeight: 'bold',
                              fontSize: '1.1rem',
                              lineHeight: '1',
                              animation: 'fadeIn 0.5s ease-out'
                            }} 
                            title="Order received - all quantities added to inventory"
                          >
                            ✔✔
                          </span>
                        )}
                        <div>
                          <div className="item-title" style={{
                            color: isReceived ? '#9ca3af' : '#e5e7eb',
                            textDecoration: isReceived ? 'line-through' : 'none',
                            opacity: isReceived ? 0.85 : 1,
                            transition: 'all 0.4s ease'
                          }}>
                            {order.item_name}
                          </div>
                          <div className="item-meta" style={{
                            color: isReceived ? '#6b7280' : '#6b7280'
                          }}>
                            Vendor ID: {order.vendor_id} · Quantity: {order.quantity} {order.unit && ` ${order.unit}`}
                          </div>
                        </div>
                      </div>
                      {/* ENHANCED: Status badge with color coding */}
                      <span 
                        className={`badge ${statusDisplay.toLowerCase()}`}
                        style={{
                          backgroundColor: isReceived ? '#10b981' : '#ef4444',
                          color: 'white',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          transition: 'all 0.4s ease',
                          letterSpacing: '0.5px'
                        }}
                      >
                        {isReceived ? '✔✔' : '⏳'} {statusDisplay}
                      </span>
                    </div>
                    <div className="item-row" style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span className="item-meta">Order ID: {order.id}</span>
                      {/* ENHANCED: Conditional rendering of button vs double tick icon */}
                      {!isReceived ? (
                        <button
                          className="action-button"
                          onClick={() => markReceived(order.id)}
                          style={{
                            transition: 'all 0.3s ease',
                            cursor: 'pointer'
                          }}
                          title="Mark this order as received and update inventory"
                        >
                          <Check size={16} />
                          Mark Received
                        </button>
                      ) : (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 12px',
                            backgroundColor: '#10b981',
                            color: 'white',
                            borderRadius: '6px',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            opacity: 0.9,
                            animation: 'fadeIn 0.5s ease-out',
                            pointerEvents: 'none'
                          }}
                          title="Received - inventory has been updated"
                        >
                          ✔✔ Received
                        </div>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

export default OrdersPage
