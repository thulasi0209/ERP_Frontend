/**
 * Storage Manager Utility
 * Handles localStorage operations for inventory read state
 * Key: inventory_read_status
 * Format: { "itemId": boolean }
 */

const STORAGE_KEY = 'inventory_read_status';

/**
 * Load all read statuses from localStorage
 * @returns {Object} Dictionary of itemId -> boolean
 */
export const loadReadStatuses = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      console.log('[Storage] No read statuses found in localStorage');
      return {};
    }
    const parsed = JSON.parse(stored);
    console.log('[Storage] Loaded read statuses:', parsed);
    return parsed;
  } catch (error) {
    console.error('[Storage] Failed to load read statuses:', error);
    return {};
  }
};

/**
 * Save read statuses to localStorage
 * @param {Object} statuses - Dictionary of itemId -> boolean
 */
export const saveReadStatuses = (statuses) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(statuses));
    console.log('[Storage] Saved read statuses:', statuses);
  } catch (error) {
    console.error('[Storage] Failed to save read statuses:', error);
  }
};

/**
 * Toggle read status for a single item
 * @param {number|string} itemId - The item ID
 * @returns {Object} Updated statuses dictionary
 */
export const toggleItemReadStatus = (itemId) => {
  const statuses = loadReadStatuses();
  const newStatus = !statuses[itemId];
  statuses[itemId] = newStatus;
  saveReadStatuses(statuses);
  console.log(`[Storage] Item ${itemId} toggled: ${newStatus}`);
  return statuses;
};

/**
 * Set read status for a single item
 * @param {number|string} itemId - The item ID
 * @param {boolean} isRead - The read status
 * @returns {Object} Updated statuses dictionary
 */
export const setItemReadStatus = (itemId, isRead) => {
  const statuses = loadReadStatuses();
  statuses[itemId] = Boolean(isRead);
  saveReadStatuses(statuses);
  console.log(`[Storage] Item ${itemId} set to: ${isRead}`);
  return statuses;
};

/**
 * Get read status for a specific item
 * @param {number|string} itemId - The item ID
 * @returns {boolean} Whether the item is read
 */
export const getItemReadStatus = (itemId) => {
  const statuses = loadReadStatuses();
  return Boolean(statuses[itemId]);
};

/**
 * Merge API data with localStorage read statuses
 * @param {Array} inventoryItems - Items from API
 * @returns {Array} Items with is_read field populated from localStorage
 */
export const mergeInventoryWithStoredStatuses = (inventoryItems) => {
  const storedStatuses = loadReadStatuses();
  return inventoryItems.map(item => ({
    ...item,
    is_read: storedStatuses[item.id] !== undefined 
      ? storedStatuses[item.id] 
      : (item.is_read || false)
  }));
};

/**
 * Clear all read statuses from localStorage
 */
export const clearReadStatuses = () => {
  localStorage.removeItem(STORAGE_KEY);
  console.log('[Storage] Cleared all read statuses');
};

/**
 * Initialize storage (for debugging)
 */
export const initializeStorage = () => {
  console.log('[Storage] Initializing storage manager');
  const statuses = loadReadStatuses();
  console.log('[Storage] Current statuses:', statuses);
  return statuses;
};

export default {
  STORAGE_KEY,
  loadReadStatuses,
  saveReadStatuses,
  toggleItemReadStatus,
  setItemReadStatus,
  getItemReadStatus,
  mergeInventoryWithStoredStatuses,
  clearReadStatuses,
  initializeStorage,
};
