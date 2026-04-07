import React, { useState } from 'react'

// Get API URL from environment variable (required for backend connectivity)
const API_URL = import.meta.env.VITE_API_URL;
if (!API_URL) {
  console.error('API_URL is not defined - backend calls will fail');
}

function DebugPage() {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  const addResult = (test, status, message, details) => {
    const result = {
      id: Date.now(),
      test,
      status, // 'success', 'error', 'info'
      message,
      details,
      timestamp: new Date().toLocaleTimeString()
    }
    setResults(prev => [result, ...prev])
    console.log(`[Debug Test] ${test}:`, { status, message, details })
  }

  const testBackendRoot = async () => {
    try {
      addResult('Testing Backend Root', 'info', 'Testing GET /', `URL: ${API_URL}/`)
      const response = await fetch(`${API_URL}/`)
      addResult('Backend Root', 'success', `✅ Reachable (${response.status})`, {
        status: response.status,
        url: response.url
      })
    } catch (error) {
      const msg = error instanceof TypeError && error.message.includes('Failed to fetch')
        ? `CORS issue or backend unreachable at ${API_URL}`
        : error.message
      addResult('Backend Root', 'error', `❌ Failed: ${msg}`, {
        url: API_URL,
        error: error.message
      })
    }
  }

  const testVendorsGet = async () => {
    try {
      addResult('Testing Vendors GET', 'info', 'Fetching GET /vendors', `URL: ${API_URL}/vendors`)
      const response = await fetch(`${API_URL}/vendors`)
      const text = await response.text()
      const data = text ? JSON.parse(text) : null
      
      if (response.ok) {
        addResult('Vendors GET', 'success', `✅ Success (${response.status})`, {
          status: response.status,
          dataLength: Array.isArray(data) ? data.length : 'not an array',
          data: Array.isArray(data) ? `Array with ${data.length} items` : typeof data
        })
      } else {
        addResult('Vendors GET', 'error', `❌ Error (${response.status})`, {
          status: response.status,
          message: data?.message || data?.detail || 'Unknown error'
        })
      }
    } catch (error) {
      const msg = error instanceof TypeError && error.message.includes('Failed to fetch')
        ? `CORS issue or backend unreachable`
        : error.message
      addResult('Vendors GET', 'error', `❌ Network Error: ${msg}`, {
        error: error.message
      })
    }
  }

  const testOrdersGet = async () => {
    try {
      addResult('Testing Orders GET', 'info', 'Fetching GET /orders', `URL: ${API_URL}/orders`)
      const response = await fetch(`${API_URL}/orders`)
      const text = await response.text()
      const data = text ? JSON.parse(text) : null
      
      if (response.ok) {
        addResult('Orders GET', 'success', `✅ Success (${response.status})`, {
          status: response.status,
          dataLength: Array.isArray(data) ? data.length : 'not an array',
          data: Array.isArray(data) ? `Array with ${data.length} items` : typeof data
        })
      } else {
        addResult('Orders GET', 'error', `❌ Error (${response.status})`, {
          status: response.status,
          message: data?.message || data?.detail || 'Unknown error'
        })
      }
    } catch (error) {
      const msg = error instanceof TypeError && error.message.includes('Failed to fetch')
        ? `CORS issue or backend unreachable`
        : error.message
      addResult('Orders GET', 'error', `❌ Network Error: ${msg}`, {
        error: error.message
      })
    }
  }

  const testOrdersPost = async () => {
    try {
      addResult('Testing Orders POST', 'info', 'Creating order with vendor_id: 1', `URL: ${API_URL}/orders`)
      const payload = {
        vendor_id: 1,
        item_name: 'Test Item',
        quantity: 5
      }
      
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      const text = await response.text()
      const data = text ? JSON.parse(text) : null
      
      if (response.ok) {
        addResult('Orders POST', 'success', `✅ Created (${response.status})`, {
          status: response.status,
          orderId: data?.id,
          vendor: data?.vendor_id
        })
      } else {
        addResult('Orders POST', 'error', `❌ Error (${response.status})`, {
          status: response.status,
          message: data?.message || data?.detail || 'Unknown error'
        })
      }
    } catch (error) {
      const msg = error instanceof TypeError && error.message.includes('Failed to fetch')
        ? `CORS issue or backend unreachable`
        : error.message
      addResult('Orders POST', 'error', `❌ Network Error: ${msg}`, {
        error: error.message
      })
    }
  }

  const testInventoryGet = async () => {
    try {
      addResult('Testing Inventory GET', 'info', 'Fetching GET /inventory', `URL: ${API_URL}/inventory`)
      const response = await fetch(`${API_URL}/inventory`)
      const text = await response.text()
      const data = text ? JSON.parse(text) : null
      
      if (response.ok) {
        addResult('Inventory GET', 'success', `✅ Success (${response.status})`, {
          status: response.status,
          dataLength: Array.isArray(data) ? data.length : 'not an array',
          data: Array.isArray(data) ? `Array with ${data.length} items` : typeof data
        })
      } else {
        addResult('Inventory GET', 'error', `❌ Error (${response.status})`, {
          status: response.status,
          message: data?.message || data?.detail || 'Unknown error'
        })
      }
    } catch (error) {
      const msg = error instanceof TypeError && error.message.includes('Failed to fetch')
        ? `CORS issue or backend unreachable`
        : error.message
      addResult('Inventory GET', 'error', `❌ Network Error: ${msg}`, {
        error: error.message
      })
    }
  }

  const runAllTests = async () => {
    setResults([])
    setLoading(true)
    await testBackendRoot()
    await new Promise(resolve => setTimeout(resolve, 300))
    await testVendorsGet()
    await new Promise(resolve => setTimeout(resolve, 300))
    await testOrdersGet()
    await new Promise(resolve => setTimeout(resolve, 300))
    await testOrdersPost()
    await new Promise(resolve => setTimeout(resolve, 300))
    await testInventoryGet()
    setLoading(false)
  }

  return (
    <div className="page-content fade-in">
      <div className="page-header">
        <h1>🔧 Debug API Endpoints</h1>
        <p>Test backend connectivity and API endpoints</p>
      </div>

      <div className="form-content">
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#1f2937', borderRadius: '0.5rem' }}>
            <p style={{ color: '#e5e7eb', margin: '0 0 0.5rem 0' }}>
              <strong>API URL:</strong> <code style={{ color: '#60a5fa' }}>{API_URL}</code>
            </p>
            <p style={{ color: '#e5e7eb', margin: '0' }}>
              <strong>Environment:</strong> <code style={{ color: '#60a5fa' }}>{import.meta.env.MODE}</code>
            </p>
          </div>
          
          <button 
            onClick={runAllTests} 
            disabled={loading}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? 'Running Tests...' : '▶ Run All Tests'}
          </button>
        </div>

        <div>
          <h3 style={{ color: '#cbd5e1', marginBottom: '1rem' }}>Test Results:</h3>
          {results.length === 0 ? (
            <p style={{ color: '#9ca3af' }}>Click "Run All Tests" to start testing endpoints...</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {results.map(result => (
                <li 
                  key={result.id}
                  style={{
                    marginBottom: '1rem',
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    backgroundColor: result.status === 'success' ? '#064e3b' : 
                                    result.status === 'error' ? '#7f1d1d' : 
                                    '#1f2937',
                    borderLeft: `4px solid ${result.status === 'success' ? '#10b981' : 
                                            result.status === 'error' ? '#ef4444' : 
                                            '#60a5fa'}`
                  }}
                >
                  <div style={{ color: result.status === 'success' ? '#10b981' : 
                                       result.status === 'error' ? '#fca5a5' : 
                                       '#60a5fa', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    {result.test}
                  </div>
                  <div style={{ color: '#e5e7eb', marginBottom: '0.5rem' }}>
                    {result.message}
                  </div>
                  <div style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                    <pre style={{ backgroundColor: '#111827', padding: '0.5rem', borderRadius: '0.25rem', overflow: 'auto' }}>
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                  </div>
                  <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>
                    {result.timestamp}
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

export default DebugPage
