/**
 * Custom Hook: useInventoryReadState
 * Manages persistent inventory read status using localStorage
 * Can be used in inventory components without breaking existing code
 */

import { useState, useEffect, useCallback } from 'react';
import storageManager from '../utils/storageManager';

/**
 * Hook for managing inventory item read states with localStorage persistence
 * @param {Array} inventoryItems - Initial inventory items
 * @returns {Object} { readItems, markAsRead, isLoading, error }
 */
export const useInventoryReadState = (inventoryItems = []) => {
  const [readItems, setReadItems] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize from localStorage on mount
  useEffect(() => {
    try {
      setIsLoading(true);
      const storedStatuses = storageManager.loadReadStatuses();
      setReadItems(storedStatuses);
      console.log('[Hook] Initialized read items from storage:', storedStatuses);
    } catch (err) {
      setError(err);
      console.error('[Hook] Error initializing read items:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sync localStorage when readItems change
  useEffect(() => {
    if (!isLoading && Object.keys(readItems).length > 0) {
      storageManager.saveReadStatuses(readItems);
    }
  }, [readItems, isLoading]);

  // Mark item as read (toggle or set)
  const markAsRead = useCallback((itemId, isRead = true) => {
    setReadItems(prev => {
      const updated = {
        ...prev,
        [itemId]: Boolean(isRead)
      };
      storageManager.saveReadStatuses(updated);
      console.log(`[Hook] Marked item ${itemId} as read: ${isRead}`);
      return updated;
    });
  }, []);

  // Check if specific item is read
  const isItemRead = useCallback((itemId) => {
    return Boolean(readItems[itemId]);
  }, [readItems]);

  // Restore from localStorage
  const restoreFromStorage = useCallback(() => {
    const storedStatuses = storageManager.loadReadStatuses();
    setReadItems(storedStatuses);
    console.log('[Hook] Restored from storage:', storedStatuses);
  }, []);

  // Clear all read statuses
  const clearAll = useCallback(() => {
    storageManager.clearReadStatuses();
    setReadItems({});
    console.log('[Hook] Cleared all read statuses');
  }, []);

  return {
    readItems,
    markAsRead,
    isItemRead,
    restoreFromStorage,
    clearAll,
    isLoading,
    error
  };
};

export default useInventoryReadState;
