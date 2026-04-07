// ===== ROUTING LOGIC =====
const routes = {
  vendors: 'vendors-page',
  orders: 'orders-page',
  inventory: 'inventory-page'
};

function showPage(route) {
  // Hide all pages
  document.querySelectorAll('.page-container').forEach(page => {
    page.classList.remove('active');
  });
  
  // Show active page
  const pageId = routes[route] || routes.vendors;
  const page = document.getElementById(pageId);
  if (page) {
    page.classList.add('active');
  }
  
  // Update active nav link
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
  });
  document.querySelector(`a[href="#${route}"]`)?.classList.add('active');
  
  // Load data for the page
  if (route === 'vendors') {
    loadVendors();
  } else if (route === 'orders') {
    loadOrders();
  } else if (route === 'inventory') {
    loadInventory();
  }
}

function initRouter() {
  // Function to handle route changes
  const handleRouteChange = () => {
    const hash = window.location.hash.slice(1) || 'vendors';
    showPage(hash);
  };
  
  // Listen for hash changes
  window.addEventListener('hashchange', handleRouteChange);
  window.addEventListener('popstate', handleRouteChange);
  
  // Initial load
  handleRouteChange();
}

// ===== END ROUTING LOGIC =====

const API_BASE = 'http://127.0.0.1:8001';

const vendorForm = document.getElementById('vendor-form');
const orderForm = document.getElementById('order-form');
const vendorList = document.getElementById('vendor-list');
const orderList = document.getElementById('order-list');
const inventoryList = document.getElementById('inventory-list');

async function fetchJson(url, options = {}) {
  try {
    const response = await fetch(url, options);
    const text = await response.text();
    const data = text ? JSON.parse(text) : null;

    if (!response.ok) {
      const errorMessage = data?.detail || data?.message || response.statusText;
      throw new Error(errorMessage || 'Server error');
    }

    return data;
  } catch (error) {
    throw new Error(error.message || 'Network error');
  }
}

async function loadVendors() {
  try {
    const vendors = await fetchJson(`${API_BASE}/vendors`);
    vendorList.innerHTML = vendors.length
      ? vendors.map(renderVendorItem).join('')
      : '<li class="list-item empty-state"><i data-lucide="users" class="empty-icon"></i><div class="empty-text">No vendors available yet.<br>Start by creating your first vendor above.</div></li>';
    lucide.createIcons();
  } catch (error) {
    alert(`Unable to load vendors: ${error.message}`);
  }
}

function renderVendorItem(vendor) {
  return `
    <li class="list-item">
      <div class="item-row">
        <div class="vendor-info">
          <i data-lucide="building-2" class="vendor-icon"></i>
          <div>
            <span class="item-title">${escapeHtml(vendor.name)}</span>
            <div class="item-meta">Phone: ${escapeHtml(vendor.phone)}</div>
          </div>
        </div>
        <div class="vendor-actions">
          <span class="item-meta vendor-id">ID: ${vendor.id}</span>
          <button class="action-button edit-button" data-vendor-id="${vendor.id}" title="Edit Vendor">
            <i data-lucide="edit" class="button-icon"></i>
          </button>
          <button class="action-button delete-button" data-vendor-id="${vendor.id}" title="Delete Vendor">
            <i data-lucide="trash-2" class="button-icon"></i>
          </button>
        </div>
      </div>
    </li>
  `;
}

async function loadOrders() {
  try {
    const orders = await fetchJson(`${API_BASE}/orders`);
    orderList.innerHTML = orders.length
      ? orders.map(renderOrderItem).join('')
      : '<li class="list-item"><div class="item-meta">No orders available.</div></li>';
    lucide.createIcons();
  } catch (error) {
    alert(`Unable to load orders: ${error.message}`);
  }
}

function renderOrderItem(order) {
  const status = order.received ? 'received' : 'pending';
  const buttonMarkup = order.received
    ? ''
    : `<button class="action-button" data-order-id="${order.id}">Mark Received</button>`;

  return `
    <li class="list-item">
      <div class="item-row">
        <div>
          <div class="item-title">${escapeHtml(order.item_name)}</div>
          <div class="item-meta">Vendor ID: ${order.vendor_id} · Quantity: ${order.quantity}</div>
        </div>
        <span class="badge ${status}">${status === 'received' ? 'Received' : 'Pending'}</span>
      </div>
      <div class="item-row">
        <div class="item-meta">Order ID: ${order.id}</div>
        ${buttonMarkup}
      </div>
    </li>
  `;
}

async function loadInventory() {
  try {
    const inventory = await fetchJson(`${API_BASE}/inventory`);
    if (inventory.length === 0) {
      console.log("No inventory items found");
      inventoryList.innerHTML = '<li style=\"background: linear-gradient(to right, #1f2937, #111827); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 32px; text-align: center; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);\"><div style=\"color: #cbd5e1; font-size: 16px;\">No inventory items found yet.<br>Receive some orders to populate inventory.</div></li>';
    } else {
      console.log("Rendering", inventory.length, "inventory items");
      inventoryList.innerHTML = inventory.map((item, index) => renderInventoryItem(item, index)).join('');
      lucide.createIcons();
    }
  } catch (error) {
    alert(`Unable to load inventory: ${error.message}`);
  }
}

function renderInventoryItem(item, index = 0) {
  const delay = index * 0.05;
  const itemName = item?.item_name || item?.name || item?.productName || "Unknown Item";
  const quantity = item?.quantity || 0;
  
  console.log("Rendering inventory item:", {itemName, quantity, item});
  
  return `
    <li style="
      background: linear-gradient(to right, #1f2937, #111827);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 16px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: all 0.3s ease;
      animation: fadeIn 0.6s ease forwards;
      animation-delay: ${delay}s;
      opacity: 0;
      transform: translateY(8px);
    " onmouseover="this.style.transform='scale(1.03) translateY(0)'; this.style.boxShadow='0 20px 40px rgba(96, 165, 250, 0.2)'; this.style.borderColor='rgba(96, 165, 250, 0.5)'; this.style.background='linear-gradient(to right, #374151, #1f2937)';" onmouseout="this.style.transform='scale(1) translateY(0)'; this.style.boxShadow='0 10px 25px rgba(0, 0, 0, 0.3)'; this.style.borderColor='rgba(255, 255, 255, 0.1)'; this.style.background='linear-gradient(to right, #1f2937, #111827)';">
      <div style="display: flex; align-items: center; gap: 12px; flex: 1; min-width: 0;">
        <svg style="width: 20px; height: 20px; color: #60a5fa; flex-shrink: 0;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m0 0v10l8 4" /></svg>
        <span style="color: #ffffff; font-weight: 600; font-size: 18px; letter-spacing: 0.5px; word-break: break-word;">${escapeHtml(itemName)}</span>
      </div>
      <span style="color: #cbd5e1; font-size: 14px; background: rgba(31, 41, 55, 0.8); padding: 6px 12px; border-radius: 8px; margin-left: 16px; flex-shrink: 0; white-space: nowrap;">Qty: ${quantity}</span>
    </li>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

vendorForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const name = document.getElementById('vendor-name').value.trim();
  const phone = document.getElementById('vendor-phone').value.trim();

  if (!name || !phone) {
    alert('Please provide both name and phone for the vendor.');
    return;
  }

  try {
    await fetchJson(`${API_BASE}/vendors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone }),
    });

    alert('Vendor created successfully.');
    vendorForm.reset();
    loadVendors();
  } catch (error) {
    alert(`Failed to create vendor: ${error.message}`);
  }
});

orderForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const vendorId = parseInt(document.getElementById('order-vendor-id').value, 10);
  const itemName = document.getElementById('order-item').value.trim();
  const quantity = parseInt(document.getElementById('order-quantity').value, 10);

  if (!vendorId || !itemName || quantity <= 0) {
    alert('Please provide vendor ID, item name, and quantity.');
    return;
  }

  try {
    await fetchJson(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vendor_id: vendorId, item_name: itemName, quantity }),
    });

    alert('Order created successfully.');
    orderForm.reset();
    loadOrders();
  } catch (error) {
    alert(`Failed to create order: ${error.message}`);
  }
});

orderList.addEventListener('click', async (event) => {
  const button = event.target.closest('button[data-order-id]');
  if (!button) return;

  const orderId = button.getAttribute('data-order-id');
  if (!orderId) return;

  try {
    await fetchJson(`${API_BASE}/orders/${orderId}/receive`, {
      method: 'POST',
    });

    alert('Order marked as received.');
    loadOrders();
    loadInventory();
  } catch (error) {
    alert(`Failed to mark order received: ${error.message}`);
  }
});

// Initialize when script loads (DOM is ready since script is at end of body)
initRouter();
lucide.createIcons();
