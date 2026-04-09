import React, { useState, useEffect } from 'react'
import { Package } from 'lucide-react'

// Get API URL from environment variable (required for backend connectivity)
const RAW_API_URL = import.meta.env.VITE_API_URL || '';
const API_URL = RAW_API_URL.replace(/\/api\/?$/, '').replace(/\/+$/, '');
if (!API_URL) {
  console.error('API_URL is not defined - backend calls will fail');
}

function InventoryPage() {
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)
  const [readItems, setReadItems] = useState({}) // ENHANCED: Track read status from backend
  const STORAGE_KEY = 'inventory_read_status' // ADDED: LocalStorage key for persistence

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
      setInventory(Array.isArray(data) ? data : [])
      
      // ENHANCED: Build read status map from backend is_read field
      const readStatusMap = {}
      if (Array.isArray(data)) {
        data.forEach(item => {
          const itemId = item.id
          // ENHANCED: Use backend is_read field as source of truth
          readStatusMap[itemId] = item.is_read === 1 || item.is_read === true
          console.log(`[Debug] Item ${itemId} (${item.item_name}): is_read=${item.is_read}`)
        })
      }
      setReadItems(readStatusMap)
      console.log('[Debug] Read status map loaded:', readStatusMap)
    } catch (error) {
      console.error('[Debug] loadInventory error:', error.message) // ADDED
      alert(`Unable to load inventory: ${error.message}`)
      setInventory([])
    } finally {
      setLoading(false)
    }
  }

  // ENHANCED: Persistent mark as read with backend API call and localStorage fallback
  const markAsRead = async (itemId) => {
    try {
      // ADDED: Validate itemId
      if (!itemId || itemId <= 0) {
        console.error(`[Debug] Invalid itemId: ${itemId}`)
        alert('Error: Invalid item ID')
        return
      }

      console.log(`[Debug] Marking item ${itemId} as read...`)
      const endpoint = `${API_URL}/inventory/${itemId}/mark-read`
      console.log(`[Debug] Calling endpoint: ${endpoint}`)
      
      // ENHANCED: Call backend API to persist read status
      const updatedItem = await fetchJson(endpoint, {
        method: 'PUT',
      })
      
      // ENHANCED: Update local state immediately with backend response
      setReadItems(prev => ({
        ...prev,
        [itemId]: updatedItem.is_read === 1 || updatedItem.is_read === true
      }))
      
      // ADDED: Save to localStorage as backup persistence
      const storageData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
      storageData[itemId] = updatedItem.is_read === 1 || updatedItem.is_read === true
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData))
      
      console.log(`[Debug] Item ${itemId} marked as read. Status: ${updatedItem.is_read}`)
    } catch (error) {
      console.error(`[Debug] Error marking item as read:`, error.message)
      
      // ADDED: Fallback to localStorage if backend fails
      console.log('[Debug] Falling back to localStorage only')
      setReadItems(prev => ({
        ...prev,
        [itemId]: !prev[itemId]
      }))
      
      const storageData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
      storageData[itemId] = !storageData[itemId]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData))
      
      alert(`Read status toggled (localStorage only): ${error.message}`)
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
            {(Array.isArray(inventory) ? inventory : []).map((item, index) => {
              const itemName = item?.item_name || item?.name || item?.productName || 'Unknown Item'
              const quantity = item?.quantity || 0
              // ENHANCED: Get read status from state (backend is source of truth)
              const isRead = readItems[item.id] || false
              const itemId = item.id

              return (
                <li
                  key={item.id || index}
                  className="list-item"
                  style={{
                    animationDelay: `${index * 0.05}s`,
                    // ENHANCED: Professional styling for read status with smooth transition
                    backgroundColor: isRead ? 'rgba(16, 185, 129, 0.08)' : 'transparent',
                    borderLeft: isRead ? '4px solid #10b981' : '4px solid #6b7280',
                    opacity: isRead ? 0.9 : 1,
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  <div className="item-row">
                    <div style={{display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0}}>
                      {/* ENHANCED: Show double tick for read items */}
                      {isRead && (
                        <span 
                          style={{
                            color: '#10b981',
                            fontWeight: 'bold',
                            fontSize: '1.1rem',
                            lineHeight: '1',
                            flexShrink: 0,
                            animation: 'fadeIn 0.5s ease-out'
                          }} 
                          title="Item acknowledged"
                        >
                          ✔✔
                        </span>
                      )}
                      <span className="item-title" style={{
                        wordBreak: 'break-word',
                        // ENHANCED: Professional text styling for read status
                        textDecoration: isRead ? 'line-through' : 'none',
                        color: isRead ? '#9ca3af' : '#e5e7eb',
                        opacity: isRead ? 0.9 : 1,
                        transition: 'all 0.4s ease'
                      }}>
                        {itemName}
                      </span>
                    </div>
                    <span style={{
                      color: isRead ? '#6b7280' : '#cbd5e1',
                      fontSize: '14px',
                      background: isRead ? 'rgba(16, 185, 129, 0.15)' : 'rgba(31, 41, 55, 0.8)',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      marginLeft: '16px',
                      flexShrink: 0,
                      whiteSpace: 'nowrap',
                      fontWeight: isRead ? 600 : 500,
                      transition: 'all 0.3s ease'
                    }}>
                      Qty: {quantity}
                    </span>
                    {/* ENHANCED: Status badge showing read/unread state */}
                    {isRead && (
                      <span style={{
                        marginLeft: '8px',
                        padding: '4px 10px',
                        fontSize: '0.75rem',
                        backgroundColor: '#10b981',
                        color: 'white',
                        borderRadius: '4px',
                        fontWeight: 'bold',
                        flexShrink: 0,
                        animation: 'fadeIn 0.5s ease-out'
                      }}>
                        ✔✔ Read
                      </span>
                    )}
                    {/* ENHANCED: Toggle read button with improved styling */}
                    <button
                      onClick={() => markAsRead(itemId)}
                      style={{
                        marginLeft: '12px',
                        padding: '6px 12px',
                        fontSize: '0.875rem',
                        backgroundColor: isRead ? '#10b981' : '#6b7280',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        flexShrink: 0,
                        fontWeight: '600',
                        opacity: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                      onMouseOver={(e) => {
                        if (!isRead) {
                          e.target.style.backgroundColor = '#5a6268'
                          e.target.style.transform = 'translateY(-1px)'
                        }
                      }}
                      onMouseOut={(e) => {
                        if (!isRead) {
                          e.target.style.backgroundColor = '#6b7280'
                          e.target.style.transform = 'translateY(0)'
                        }
                      }}
                      title={isRead ? 'Click to mark as unread' : 'Click to mark as read'}
                    >
                      {isRead ? '✔✔ Unread' : '◯ Mark Read'}
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
