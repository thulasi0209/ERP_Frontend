import React, { useState, useEffect } from 'react'
import { Package } from 'lucide-react'

// FIXED: Use environment variable with fallback for localhost development
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

function InventoryPage() {
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // ADDED: Log API configuration on mount
    console.log('[Debug] InventoryPage Configuration:')
    console.log('  VITE_API_URL env:', import.meta.env.VITE_API_URL)
    console.log('  Using API_URL:', API_URL)
    if (!import.meta.env.VITE_API_URL) {
      console.warn('[Debug] VITE_API_URL not set. Using fallback:', API_URL)
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

  async function loadInventory() {
    try {
      setLoading(true)
      const data = await fetchJson(`${API_URL}/inventory`) // FIXED: Use API_URL instead of API_BASE
      // FIXED: Handle empty array as valid response
      if (Array.isArray(data) && data.length === 0) {
        console.log('[Debug] No inventory items available (empty response)') // ADDED
      }
      setInventory(data || [])
    } catch (error) {
      console.error('[Debug] loadInventory error:', error.message) // ADDED
      alert(`Unable to load inventory: ${error.message}`)
    } finally {
      setLoading(false)
    }
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

              return (
                <li
                  key={item.id || index}
                  className="list-item"
                  style={{animationDelay: `${index * 0.05}s`}}
                >
                  <div className="item-row">
                    <div style={{display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0}}>
                      <Package size={20} style={{color: '#60a5fa', flexShrink: 0}} />
                      <span className="item-title" style={{wordBreak: 'break-word'}}>
                        {itemName}
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
