import React, { useState, useEffect } from 'react'
import { Package } from 'lucide-react'

const API_BASE = 'http://127.0.0.1:8000'

function InventoryPage() {
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadInventory()
  }, [])

  async function fetchJson(url, options = {}) {
    try {
      const response = await fetch(url, options)
      const text = await response.text()
      const data = text ? JSON.parse(text) : null

      if (!response.ok) {
        const errorMessage = data?.detail || data?.message || response.statusText
        throw new Error(errorMessage || 'Server error')
      }

      return data
    } catch (error) {
      throw new Error(error.message || 'Network error')
    }
  }

  async function loadInventory() {
    try {
      setLoading(true)
      const data = await fetchJson(`${API_BASE}/inventory`)
      setInventory(data)
    } catch (error) {
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
