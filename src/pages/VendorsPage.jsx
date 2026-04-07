import React, { useState, useEffect } from 'react'
import { Building2, Edit, Trash2, Users } from 'lucide-react'

const API_BASE = 'http://127.0.0.1:8000'

function VendorsPage() {
  const [vendors, setVendors] = useState([])
  const [formData, setFormData] = useState({ name: '', phone: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadVendors()
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

  async function loadVendors() {
    try {
      const data = await fetchJson(`${API_BASE}/vendors`)
      setVendors(data)
    } catch (error) {
      alert(`Unable to load vendors: ${error.message}`)
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
      await fetchJson(`${API_BASE}/vendors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      alert('Vendor created successfully.')
      setFormData({ name: '', phone: '' })
      await loadVendors()
    } catch (error) {
      alert(`Failed to create vendor: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  async function deleteVendor(vendorId) {
    if (!window.confirm('Are you sure you want to delete this vendor?')) return

    try {
      await fetchJson(`${API_BASE}/vendors/${vendorId}`, {
        method: 'DELETE',
      })
      alert('Vendor deleted successfully.')
      await loadVendors()
    } catch (error) {
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
