import React, { useState, useEffect } from 'react'
import { Package } from 'lucide-react'

// Get API URL from environment variable (required for backend connectivity)
const API_URL = import.meta.env.VITE_API_URL;
if (!API_URL) {
  console.error('API_URL is not defined - backend calls will fail');
}

function InventoryPage() {
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)
  const [readItems, setReadItems] = useState({}) // ADDED: Track read status for each item

  useEffect(() => {
    // ADDED: Log API configuration on mount
    console.log('[Debug] InventoryPage Configuration:')
    console.log('  VITE_API_URL env:', import.meta.env.VITE_API_URL)
    console.log('  Using API_URL:', API_URL)
    if (!import.meta.env.VITE_API_URL) {
      console.error('[Debug] VITE_API_URL is not defined - backend calls will fail')
    }
    
    // TEST: Verify backend connectivity
    testBackendConnection()
    loadInventory()
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

  async function loadInventory() {
    try {
      setLoading(true)
      const data = await fetchJson(`${API_URL}/inventory`) // FIXED: Use API_URL instead of API_BASE
      // FIXED: Handle empty array as valid response
      if (Array.isArray(data) && data.length === 0) {
        console.log('[Debug] No inventory items available (empty response)') // ADDED
      }
      setInventory(data || [])
      setReadItems({}) // ADDED: Reset read status when inventory loads
    } catch (error) {
      console.error('[Debug] loadInventory error:', error.message) // ADDED
      alert(`Unable to load inventory: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // ADDED: Toggle read status for an item
  const toggleReadStatus = (itemId) => {
    setReadItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }))
  }

  return (
    <div className="page-content fade-in">
      <div className="page-header">
        <h1>📦 Inventory</h1>
        <p>View your current inventory stock</p>
      </div>

      <div className="form-content">
        <h3 style={{fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', color: '#cbd5e1'}}>
          Inventory Items
        </h3>
        
        {loading ? (
          <div className="empty-state">
            <div style={{color: '#cbd5e1'}}>Loading inventory...</div>
          </div>
        ) : inventory.length === 0 ? (
          <div className="empty-state">
            <Package className="empty-icon" />
            <div className="empty-text">
              No inventory items found yet.<br/>
              Receive some orders to populate inventory.
            </div>
          </div>
        ) : (
          <ul className="list">
            {inventory.map((item, index) => {
              const itemName = item?.item_name || item?.name || item?.productName || 'Unknown Item'
              const quantity = item?.quantity || 0
              const isRead = readItems[item.id] || false // ADDED: Get read status

              return (
                <li
                  key={item.id || index}
                  className="list-item"
                  style={{
                    animationDelay: `${index * 0.05}s`,
                    // ADDED: Visual styling for read status
                    backgroundColor: isRead ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                    opacity: isRead ? 0.85 : 1,
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div className="item-row">
                    <div style={{display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0}}>
                      <Package size={20} style={{
                        color: isRead ? '#10b981' : '#60a5fa', // ADDED: Color change for read status
                        flexShrink: 0,
                        transition: 'color 0.3s ease'
                      }} />
                      <span className="item-title" style={{
                        wordBreak: 'break-word',
                        // ADDED: Text styling for read status
                        textDecoration: isRead ? 'underline' : 'none',
                        color: isRead ? '#cbd5e1' : '#e5e7eb',
                        transition: 'all 0.3s ease'
                      }}>
                        {itemName}
                        {/* ADDED: Read status badge */}
                        {isRead && <span style={{marginLeft: '8px', fontSize: '0.75rem', color: '#10b981', fontWeight: 'bold'}}>✓ Read</span>}
                      </span>
                    </div>
                    <span style={{
                      color: '#cbd5e1',
                      fontSize: '14px',
                      background: 'rgba(31, 41, 55, 0.8)',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      marginLeft: '16px',
                      flexShrink: 0,
                      whiteSpace: 'nowrap'
                    }}>
                      Qty: {quantity}
                    </span>
                    {/* ADDED: Toggle read button */}
                    <button
                      onClick={() => toggleReadStatus(item.id)}
                      style={{
                        marginLeft: '12px',
                        padding: '6px 12px',
                        fontSize: '0.875rem',
                        backgroundColor: isRead ? '#10b981' : '#6b7280',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        flexShrink: 0,
                        fontWeight: '500'
                      }}
                      onMouseOver={(e) => e.target.style.opacity = '0.8'}
                      onMouseOut={(e) => e.target.style.opacity = '1'}
                    >
                      {isRead ? '✓ Mark Unread' : '◯ Mark Read'}
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}

export default InventoryPage
