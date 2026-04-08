/**
 * Production Configuration
 * Persistent Inventory State & SPA Routing
 */

export const PRODUCTION_CONFIG = {
  // localStorage Configuration
  storage: {
    enabled: true,
    keys: {
      inventory_read_status: 'inventory_read_status'
    },
    schema: {
      inventory_read_status: {
        type: 'Object',
        description: 'Maps itemId to boolean (read status)',
        example: '{"1": true, "2": false, "3": true}',
        retention: 'Persistent (until manual clear)',
        fallback: 'Empty object on load failure'
      }
    }
  },

  // API Configuration
  api: {
    timeout: 30000, // milliseconds
    retries: 3,
    fallbackToLocal: true, // Use localStorage if API fails
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  },

  // UI Configuration (Professional ERP Style)
  ui: {
    readStatusIndicator: '✔✔', // Double check mark
    readColor: '#10b981', // Emerald green
    unreadColor: '#6b7280', // Gray
    successColor: '#10b981',
    warningColor: '#ef4444',
    animationDuration: '0.4s',
    transitionEasing: 'cubic-bezier(0.4, 0, 0.2, 1)'
  },

  // Logging Configuration (Development & Production)
  logging: {
    enabled: true,
    prefix: '[Storage]',
    levels: ['log', 'warn', 'error'],
    verbose: process.env.NODE_ENV === 'development'
  },

  // SPA Routing Configuration
  routing: {
    mode: 'history',
    routes: [
      '/',
      '/inventory',
      '/orders',
      '/vendors',
      '/debug'
    ],
    // Vercel automatically handles these with routes in vercel.json
    // All non-asset URLs redirect to index.html
    fallback: '/index.html'
  },

  // Feature Flags (for gradual rollout)
  features: {
    persistentInventoryRead: true,
    spaRouting: true,
    offlineMode: true
  }
};

/**
 * Get current configuration based on environment
 * @returns {Object} Configuration object
 */
export const getConfig = () => {
  const isDev = process.env.NODE_ENV === 'development';
  
  return {
    ...PRODUCTION_CONFIG,
    logging: {
      ...PRODUCTION_CONFIG.logging,
      verbose: isDev
    }
  };
};

export default PRODUCTION_CONFIG;
