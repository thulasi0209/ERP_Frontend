import React, { useState, useEffect } from 'react'
import { Building2, Edit, Trash2, Users } from 'lucide-react'

// Get API URL from environment variable (required for backend connectivity)
const API_URL = import.meta.env.VITE_API_URL;
if (!API_URL) {
  console.error('API_URL is not defined - backend calls will fail');
}

// Test backend connectivity
async function testBackendConnectivity() {
  try {
    console.log('[Debug] Testing backend connectivity...')
    const response = await fetch(`${API_URL}/vendors`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })
    console.log('[Debug] Backend response status:', response.status)
    if (response.ok) {
      console.log('[Debug] ✓ Backend is reachable and responding')
    } else {
      console.warn('[Debug] ⚠ Backend returned status:', response.status)
    }
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      console.error('[Debug] ✗ CORS or backend connectivity issue detected!')
      console.error('[Debug] Possible causes:')
      console.error('  1. Backend server is down or unreachable')
      console.error('  2. CORS headers not configured on backend')
      console.error('  3. Network connectivity issue')
      console.error('  4. Request blocked by browser security policy')
    } else {
      console.error('[Debug] Backend connectivity error:', error.message)
    }
  }
}

function VendorsPage() {
  const [vendors, setVendors] = useState([])
  const [formData, setFormData] = useState({ name: '', phone: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    console.log('[Debug] Frontend Configuration:')
    console.log('  VITE_API_URL env:', import.meta.env.VITE_API_URL)
    console.log('  Using API_URL:', API_URL)
    console.log('  Environment:', import.meta.env.MODE)
    
    if (!import.meta.env.VITE_API_URL) {
      console.error('[Debug] VITE_API_URL environment variable is not defined - backend calls will fail')
    }
    
    testBackendConnectivity()
    loadVendors()
  }, [])

  async function fetchJson(url, options = {}) {
    try {
      console.log(`[Debug] Fetching from: ${url}`)
      const response = await fetch(url, options)
      const text = await response.text()
      const data = text ? JSON.parse(text) : null

      console.log(`[Debug] Response status: ${response.status}`)

      if (!response.ok) {
        const errorMessage = data?.detail || data?.message || response.statusText
        console.error(`[Debug] API error (${response.status}):`, errorMessage)
        throw new Error(errorMessage || 'Server error')
      }

      console.log('[Debug] Request successful')
      return data
    } catch (error) {
      // Detect CORS and network errors
      if (error instanceof TypeError) {
        if (error.message.includes('Failed to fetch')) {
          const corsHint = `Could not reach ${API_URL}. Check if:\n  • Backend is running\n  • CORS is configured\n  • Network connectivity exists`
          console.error('[Debug] Network/CORS Error:', corsHint)
          throw new Error(corsHint)
        }
      }
      console.error('[Debug] Fetch error:', error.message)
      throw new Error(error.message || 'Network error')
    }
  }

  async function loadVendors() {
    setError('')
    try {
      const data = await fetchJson(`${API_URL}/vendors`)
      setVendors(data)
    } catch (error) {
      const errorMsg = `Unable to load vendors: ${error.message}`
      console.error('[Debug]', errorMsg)
      setError(errorMsg)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!formData.name || !formData.phone) {
      alert('Please provide both name and phone for the vendor.')
      return
    }

    try {
      setLoading(true)
      setError('')
      await fetchJson(`${API_URL}/vendors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      console.log('[Debug] Vendor created successfully')
      alert('Vendor created successfully.')
      setFormData({ name: '', phone: '' })
      await loadVendors()
    } catch (error) {
      console.error('[Debug] Create vendor error:', error.message)
      setError(`Failed to create vendor: ${error.message}`)
      alert(`Failed to create vendor: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  async function deleteVendor(vendorId) {
    if (!window.confirm('Are you sure you want to delete this vendor?')) return

    try {
      await fetchJson(`${API_URL}/vendors/${vendorId}`, {
        method: 'DELETE',
      })
      console.log('[Debug] Vendor deleted successfully')
      alert('Vendor deleted successfully.')
      await loadVendors()
    } catch (error) {
      console.error('[Debug] Delete vendor error:', error.message)
      setError(`Failed to delete vendor: ${error.message}`)
      alert(`Failed to delete vendor: ${error.message}`)
    }
  }

  return (
    <div className="page-content fade-in">
      <div className="page-header">
        <h1>📦 Vendors</h1>
        <p>Manage your vendors and their contact information</p>
      </div>

      <div className="form-content">
        {error && (
          <div style={{
            backgroundColor: '#fee2e2',
            border: '1px solid #fca5a5',
            color: '#991b1b',
            padding: '1rem',
            borderRadius: '0.5rem',
            marginBottom: '1rem',
            fontSize: '0.875rem'
          }}>
            <strong>Error:</strong> {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="form-grid">
          <label>
            Name
            <input
              type="text"
              placeholder="Vendor name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </label>
          <label>
            Phone
            <input
              type="text"
              placeholder="Phone number"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              required
            />
          </label>
          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? 'Creating...' : '+ Create Vendor'}
          </button>
        </form>

        <div>
          <h3 style={{fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', color: '#cbd5e1'}}>
            Vendor List
          </h3>
          {vendors.length === 0 ? (
            <div className="empty-state">
              <Users className="empty-icon" />
              <div className="empty-text">
                No vendors available yet.<br/>
                Start by creating your first vendor above.
              </div>
            </div>
          ) : (
            <ul className="list">
              {vendors.map((vendor, index) => (
                <li key={vendor.id} className="list-item" style={{animationDelay: `${index * 0.05}s`}}>
                  <div className="item-row">
                    <div className="vendor-info">
                      <Building2 className="vendor-icon" />
                      <div>
                        <span className="item-title">{vendor.name}</span>
                        <div className="item-meta">Phone: {vendor.phone}</div>
                      </div>
                    </div>
                  </div>
                  <div className="item-row">
                    <span className="item-meta">ID: {vendor.id}</span>
                    <button 
                      className="action-button"
                      onClick={() => alert('Edit functionality coming soon')}
                      title="Edit Vendor"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      className="action-button delete-button"
                      onClick={() => deleteVendor(vendor.id)}
                      title="Delete Vendor"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

export default VendorsPage
