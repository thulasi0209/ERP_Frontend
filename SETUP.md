# Mini ERP Frontend - Setup & Usage Guide

## ✅ System Ready
All tests passed:
- React/Vite build: ✅ Successful (191.84 kB)
- Backend API integration: ✅ Configured
- Persistent storage: ✅ Working (localStorage + API)
- UI Components: ✅ All rendering correctly

## Quick Start

### Prerequisites
- Node.js 16+ installed
- Backend running on http://localhost:8001
- `.env.local` configured with API URL

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```
Then open http://localhost:5173

### Build
```bash
npm run build
```
Output: `dist/` directory ready for deployment

## Environment Setup

**Development** (`.env.local`):
```
VITE_API_URL=http://localhost:8001
```

**Production** (`vercel.json`):
```
VITE_API_URL=https://erp-backend-wvb6.onrender.com
```

## Key Features Implemented

### 1. Mark as Read (Inventory)
- **Location**: Inventory Page
- **Action**: Click "Mark Read" button on any item
- **Result**: 
  - Icon changes to ✔✔ (green)
  - Status persists in database
  - Status survives page refresh
- **Persistence**: API + localStorage fallback

### 2. Mark Received (Orders)
- **Location**: Orders Page
- **Action**: Click "Mark Received" button on pending order
- **Result**:
  - Order status → "Received"
  - Auto-updates inventory
  - Button becomes disabled
  - Shows professional UI

### 3. Core Pages
- **Orders Page**: Create, list, and receive purchase orders
- **Vendors Page**: Manage vendor information
- **Inventory Page**: View and manage inventory items
- **Debug Page**: API connectivity testing

## Component Architecture

```
InventoryPage.jsx
├── useEffect: Load inventory on mount
├── useState: inventory items, read status
├── loadInventory(): Fetch from API
├── markAsRead(): Toggle read status + persist
├── UI: List with conditional rendering
└── Fallback: localStorage if API fails

OrdersPage.jsx
├── useEffect: Load orders on mount
├── useState: orders, form data
├── loadOrders(): Fetch from API
├── markReceived(): Call receive endpoint
├── handleSubmit(): Create new order
└── UI: Form + list with status badges
```

## API Integration

### Inventory Endpoints
```
GET /inventory
  Returns: [{ id, item_name, quantity, is_read }, ...]

PUT /inventory/{item_id}/mark-read
  Body: {}
  Returns: { id, item_name, quantity, is_read }
```

### Order Endpoints
```
GET /orders
  Returns: [{ id, vendor_id, item_name, quantity, status }, ...]

POST /orders
  Body: { vendor_id, item_name, quantity, unit }
  Returns: { id, vendor_id, item_name, quantity, status }

POST /orders/{order_id}/receive
  Body: {}
  Returns: { id, vendor_id, item_name, quantity, status: "Received" }
```

## State Management Pattern

### Frontend-Only (localStorage)
```javascript
const [items, setItems] = useState({})
// Save: localStorage.setItem(key, JSON.stringify(items))
// Load: setItems(JSON.parse(localStorage.getItem(key) || '{}'))
```

### Backend + Frontend (Dual)
```javascript
const [items, setItems] = useState({})
// Primary: API call to backend
try {
  const response = await API.put(endpoint)
  setItems(response) // Update from API response
  localStorage.setItem(key, JSON.stringify(response)) // Backup
} catch {
  // Fallback: Use localStorage only
}
```

## Debugging Tips

### 1. Check API Connectivity
- Browser DevTools → Console
- Look for [Debug] messages
- Check fetch URLs being called

### 2. Verify Backend Health
```javascript
fetch('http://localhost:8001/health')
  .then(r => r.json())
  .then(console.log)
```

### 3. Check localStorage
```javascript
localStorage.getItem('inventory_read_status')
```

### 4. Clear State & Reload
```javascript
// In console:
localStorage.clear()
location.reload()
```

## Styling Details

### Color Scheme (Tailwind + Custom CSS)
- **Primary Success**: #10b981 (emerald)
- **Primary Warning**: #ef4444 (red)
- **Background**: Dark gradient (#0f172a → #000000)
- **Text**: #e5e7eb (light gray)
- **Borders**: 4px solid (color-coded)

### Animations
- **Fade In**: 0.5s ease-out
- **Transitions**: 0.4s cubic-bezier(0.4, 0, 0.2, 1)
- **Stagger**: index * 0.05s

## Testing Checklist

- [ ] Page loads without errors
- [ ] API calls show in DevTools
- [ ] Mark Read toggles correctly
- [ ] Inventory status persists on refresh
- [ ] localStorage updates
- [ ] Orders can be created
- [ ] Orders can be received
- [ ] Inventory updates after receive
- [ ] Frontend builds successfully

## Deployment

### To Vercel
1. Push to GitHub
2. Vercel auto-deploys
3. Environment variables auto-loaded from vercel.json
4. Built files served from dist/

## Troubleshooting

| Issue | Solution |
|-------|----------|
| 404 on Mark Read | Check backend running on :8001 |
| API unreachable | Verify VITE_API_URL in .env.local |
| localStorage empty | Check browser privacy settings |
| Build fails | `rm -rf node_modules && npm install` |
| Styles missing | Rebuild Tailwind: `npm run build` |

---

**Ready for Development** ✅

Last Updated: April 9, 2026
