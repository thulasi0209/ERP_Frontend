import React, { useState } from 'react';

// Get API URL from environment variable (required for backend connectivity)
const RAW_API_URL = import.meta.env.VITE_API_URL || '';
const API_URL = RAW_API_URL.replace(/\/api\/?$/, '').replace(/\/+$/, '');
if (!API_URL) {
  console.error('API_URL is not defined - backend calls will fail');
}

const CreateVendor = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Vendor name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setMessage('');
    try {
      const url = `${API_URL}/vendors`;
      console.log('[Debug] POST Request to:', url);
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      console.log('[Debug] Response Status:', response.status);
      
      const text = await response.text();
      const data = text ? JSON.parse(text) : null;
      
      if (response.ok) {
        console.log('[Debug] Vendor created successfully');
        setFormData({ name: '', email: '', phone: '', address: '' });
        setMessage('Vendor created successfully');
      } else {
        const errorMsg = data?.message || data?.detail || 'Failed to create vendor';
        console.error('[Debug] API Error:', response.status, errorMsg);
        setMessage(errorMsg);
      }
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.error('[Debug] Possible CORS issue or backend unreachable:', error.message);
        setMessage('Unable to reach backend - check CORS or network connectivity');
      } else {
        console.error('[Debug] Request Error:', error.message);
        setMessage('An error occurred while creating the vendor');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Create Vendor</h2>
        {message && <p className={`mb-4 text-center ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>{message}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Vendor Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Phone *</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded"
              rows="3"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? 'Creating...' : 'Create Vendor'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateVendor;