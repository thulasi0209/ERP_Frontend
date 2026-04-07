import React, { useState, useEffect } from 'react'
import { Package, Check } from 'lucide-react'

// FIXED: Use environment variable with fallback for localhost development
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [formData, setFormData] = useState({ vendor_id: '', item_name: '', quantity: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // ADDED: Log API configuration on mount
    console.log('[Debug] OrdersPage Configuration:')
    console.log('  VITE_API_URL env:', import.meta.env.VITE_API_URL)
    console.log('  Using API_URL:', API_URL)
    if (!import.meta.env.VITE_API_URL) {
      console.warn('[Debug] VITE_API_URL not set. Using fallback:', API_URL)
    }
    loadOrders()
  }, [])

  async function fetchJson(url, options = {}) {
    try {
      const method = options.method || 'GET'
      console.log(`[Debug] Fetching: ${method} ${url}`)
      console.log('[Debug] Headers:', options.headers)
      console.log('[Debug] Body:', options.body)
      
      const response = await fetch(url, options)
      console.log(`[Debug] Response Status: ${response.status} ${response.statusText}`)
      console.log('[Debug] Response Headers:', {
        'content-type': response.headers.get('content-type'),
        'content-length': response.headers.get('content-length')
      })
      
      const text = await response.text()
      console.log('[Debug] Raw Response Text:', text)
      
      let data = null
      if (text) {
        try {
          data = JSON.parse(text)
        } catch (jsonError) {
          console.error('[Debug] JSON parse error:', jsonError.message)
          console.error('[Debug] Text was:', text)
          data = text
        }
      }
      console.log('[Debug] Parsed Response data:', data)

      if (!response.ok) {
        const errorMessage = data?.detail || data?.message || data?.error || response.statusText || 'Server error'
        console.error('[Debug] API Error Response:', { status: response.status, message: errorMessage })
        throw new Error(errorMessage)
      }

      return data
    } catch (error) {
      console.error('[Debug] Catch block error:', error)
      
      if (error instanceof TypeError) {
        console.error('[Debug] TypeError - Network/CORS Issue Detected!')
        console.error('[Debug] Troubleshooting:')
        console.error('  ❌ 1. Is backend running at:', API_URL)
        console.error('  ❌ 2. Check backend CORS settings')
        console.error('  ❌ 3. Verify VITE_API_URL environment variable')
        console.error('[Debug] Error message:', error.message)
      }
      
      throw error
    }
  }

  async function loadOrders() {
    try {
      const data = await fetchJson(`${API_URL}/orders`) // FIXED: Use API_URL instead of API_BASE
      // FIXED: Handle empty array as valid response
      if (Array.isArray(data) && data.length === 0) {
        console.log('[Debug] No orders available (empty response)') // ADDED
      }
      setOrders(data || [])
    } catch (error) {
      console.error('[Debug] loadOrders error:', error.message) // ADDED
      alert(`Unable to load orders: ${error.message}`)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()

    const vendorId = parseInt(formData.vendor_id, 10)
    const quantity = parseInt(formData.quantity, 10)

    if (!vendorId || !formData.item_name || quantity <= 0) {
      alert('Please provide vendor ID, item name, and quantity.')
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
          quantity: quantity
        }),
      })

      alert('Order created successfully.')
      setFormData({ vendor_id: '', item_name: '', quantity: '' })
      await loadOrders()
    } catch (error) {
      alert(`Failed to create order: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  async function markReceived(orderId) {
    try {
      await fetchJson(`${API_URL}/orders/${orderId}/receive`, {
        method: 'POST',
      })
      alert('Order marked as received.')
      await loadOrders()
    } catch (error) {
      alert(`Failed to mark order received: ${error.message}`)
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
              {orders.map((order, index) => {
                const status = order.received ? 'received' : 'pending'
                return (
                  <li key={order.id} className="list-item" style={{animationDelay: `${index * 0.05}s`}}>
                    <div className="item-row">
                      <div>
                        <div className="item-title">{order.item_name}</div>
                        <div className="item-meta">
                          Vendor ID: {order.vendor_id} · Quantity: {order.quantity}
                        </div>
                      </div>
                      <span className={`badge ${status}`}>
                        {status === 'received' ? 'Received' : 'Pending'}
                      </span>
                    </div>
                    <div className="item-row">
                      <span className="item-meta">Order ID: {order.id}</span>
                      {!order.received && (
                        <button
                          className="action-button"
                          onClick={() => markReceived(order.id)}
                        >
                          <Check size={16} />
                          Mark Received
                        </button>
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
