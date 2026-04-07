import React, { useState, useEffect } from 'react'
import { Package, Check } from 'lucide-react'

const API_BASE = 'http://127.0.0.1:8000'

function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [formData, setFormData] = useState({ vendor_id: '', item_name: '', quantity: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadOrders()
  }, [])

  async function fetchJson(url, options = {}) {
    try {
      const response = await fetch(url, options)
      console.log(`[Debug] ${options.method || 'GET'} ${url} - Status: ${response.status}`) // ADDED
      const text = await response.text()
      const data = text ? JSON.parse(text) : null
      console.log('[Debug] Response data:', data) // ADDED

      if (!response.ok) {
        const errorMessage = data?.detail || data?.message || response.statusText
        throw new Error(errorMessage || 'Server error')
      }

      return data
    } catch (error) {
      console.error('[Debug] Fetch error:', error.message) // ADDED
      throw new Error(error.message || 'Network error')
    }
  }

  async function loadOrders() {
    try {
      const data = await fetchJson(`${API_BASE}/orders`)
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
      await fetchJson(`${API_BASE}/orders`, {
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
      await fetchJson(`${API_BASE}/orders/${orderId}/receive`, {
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
