/**
 * Offline Storage - IndexedDB wrapper for E-Card offline support
 * Domain Layer - Business logic
 * 
 * @module features/ecard/domain
 */

const DB_NAME = 'ecard_offline_db';
const DB_VERSION = 1;
const STORES = {
  PROFILES: 'profiles',
  CONNECTIONS: 'connections',
  MY_PROFILE: 'my_profile',
  PENDING_ACTIONS: 'pending_actions'
};

/**
 * Check if IndexedDB is supported
 */
export const isIndexedDBSupported = () => {
  return typeof window !== 'undefined' && 'indexedDB' in window;
};

/**
 * Open database connection
 */
const openDB = () => {
  return new Promise((resolve, reject) => {
    if (!isIndexedDBSupported()) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Create object stores
      if (!db.objectStoreNames.contains(STORES.PROFILES)) {
        db.createObjectStore(STORES.PROFILES, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.CONNECTIONS)) {
        db.createObjectStore(STORES.CONNECTIONS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.MY_PROFILE)) {
        db.createObjectStore(STORES.MY_PROFILE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.PENDING_ACTIONS)) {
        const store = db.createObjectStore(STORES.PENDING_ACTIONS, { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        store.createIndex('type', 'type', { unique: false });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
};

/**
 * Offline Storage API
 */
export const offlineStorage = {
  /**
   * Save profile for offline viewing
   */
  saveProfile: async (profile) => {
    const db = await openDB();
    const tx = db.transaction(STORES.PROFILES, 'readwrite');
    const store = tx.objectStore(STORES.PROFILES);
    
    await new Promise((resolve, reject) => {
      const request = store.put({
        ...profile,
        _savedAt: Date.now()
      });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
    
    db.close();
    return true;
  },

  /**
   * Get saved profile
   */
  getProfile: async (id) => {
    const db = await openDB();
    const tx = db.transaction(STORES.PROFILES, 'readonly');
    const store = tx.objectStore(STORES.PROFILES);
    
    const result = await new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    
    db.close();
    return result;
  },

  /**
   * Get all saved profiles
   */
  getAllProfiles: async () => {
    const db = await openDB();
    const tx = db.transaction(STORES.PROFILES, 'readonly');
    const store = tx.objectStore(STORES.PROFILES);
    
    const result = await new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    
    db.close();
    return result;
  },

  /**
   * Delete saved profile
   */
  deleteProfile: async (id) => {
    const db = await openDB();
    const tx = db.transaction(STORES.PROFILES, 'readwrite');
    const store = tx.objectStore(STORES.PROFILES);
    
    await new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
    
    db.close();
    return true;
  },

  /**
   * Save my profile data
   */
  saveMyProfile: async (profile) => {
    const db = await openDB();
    const tx = db.transaction(STORES.MY_PROFILE, 'readwrite');
    const store = tx.objectStore(STORES.MY_PROFILE);
    
    await new Promise((resolve, reject) => {
      const request = store.put({
        id: 'current',
        data: profile,
        _savedAt: Date.now()
      });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
    
    db.close();
    return true;
  },

  /**
   * Get my profile data
   */
  getMyProfile: async () => {
    const db = await openDB();
    const tx = db.transaction(STORES.MY_PROFILE, 'readonly');
    const store = tx.objectStore(STORES.MY_PROFILE);
    
    const result = await new Promise((resolve, reject) => {
      const request = store.get('current');
      request.onsuccess = () => resolve(request.result?.data);
      request.onerror = () => reject(request.error);
    });
    
    db.close();
    return result;
  },

  /**
   * Save connections for offline
   */
  saveConnections: async (connections) => {
    const db = await openDB();
    const tx = db.transaction(STORES.CONNECTIONS, 'readwrite');
    const store = tx.objectStore(STORES.CONNECTIONS);
    
    // Clear existing
    await new Promise((resolve) => {
      const req = store.clear();
      req.onsuccess = resolve;
    });
    
    // Add all
    for (const conn of connections) {
      await new Promise((resolve, reject) => {
        const request = store.put({
          ...conn,
          _savedAt: Date.now()
        });
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }
    
    db.close();
    return true;
  },

  /**
   * Get saved connections
   */
  getConnections: async () => {
    const db = await openDB();
    const tx = db.transaction(STORES.CONNECTIONS, 'readonly');
    const store = tx.objectStore(STORES.CONNECTIONS);
    
    const result = await new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    
    db.close();
    return result;
  },

  /**
   * Queue pending action for sync when online
   */
  queueAction: async (action) => {
    const db = await openDB();
    const tx = db.transaction(STORES.PENDING_ACTIONS, 'readwrite');
    const store = tx.objectStore(STORES.PENDING_ACTIONS);
    
    await new Promise((resolve, reject) => {
      const request = store.add({
        ...action,
        timestamp: Date.now(),
        status: 'pending'
      });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
    
    db.close();
    return true;
  },

  /**
   * Get pending actions
   */
  getPendingActions: async () => {
    const db = await openDB();
    const tx = db.transaction(STORES.PENDING_ACTIONS, 'readonly');
    const store = tx.objectStore(STORES.PENDING_ACTIONS);
    
    const result = await new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    
    db.close();
    return result.filter(a => a.status === 'pending');
  },

  /**
   * Mark action as synced
   */
  markActionSynced: async (id) => {
    const db = await openDB();
    const tx = db.transaction(STORES.PENDING_ACTIONS, 'readwrite');
    const store = tx.objectStore(STORES.PENDING_ACTIONS);
    
    await new Promise((resolve, reject) => {
      const getReq = store.get(id);
      getReq.onsuccess = () => {
        const data = getReq.result;
        if (data) {
          data.status = 'synced';
          const putReq = store.put(data);
          putReq.onsuccess = () => resolve();
          putReq.onerror = () => reject(putReq.error);
        } else {
          resolve();
        }
      };
      getReq.onerror = () => reject(getReq.error);
    });
    
    db.close();
    return true;
  },

  /**
   * Clear all synced actions
   */
  clearSyncedActions: async () => {
    const db = await openDB();
    const tx = db.transaction(STORES.PENDING_ACTIONS, 'readwrite');
    const store = tx.objectStore(STORES.PENDING_ACTIONS);
    
    const all = await new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    for (const item of all) {
      if (item.status === 'synced') {
        await new Promise((resolve) => {
          const req = store.delete(item.id);
          req.onsuccess = resolve;
        });
      }
    }
    
    db.close();
    return true;
  },

  /**
   * Get storage stats
   */
  getStats: async () => {
    if (!isIndexedDBSupported()) {
      return { supported: false };
    }

    try {
      const profiles = await offlineStorage.getAllProfiles();
      const connections = await offlineStorage.getConnections();
      const pendingActions = await offlineStorage.getPendingActions();
      const myProfile = await offlineStorage.getMyProfile();

      return {
        supported: true,
        savedProfiles: profiles.length,
        savedConnections: connections.length,
        pendingActions: pendingActions.length,
        hasMyProfile: !!myProfile,
        lastSaved: myProfile?._savedAt || profiles[0]?._savedAt
      };
    } catch (err) {
      return { supported: true, error: err.message };
    }
  },

  /**
   * Clear all offline data
   */
  clearAll: async () => {
    const db = await openDB();
    
    for (const storeName of Object.values(STORES)) {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      await new Promise((resolve) => {
        const req = store.clear();
        req.onsuccess = resolve;
      });
    }
    
    db.close();
    return true;
  }
};

/**
 * Action types for offline queue
 */
export const OFFLINE_ACTIONS = {
  CONNECT: 'connect',
  UPDATE_PROFILE: 'update_profile',
  SEND_MESSAGE: 'send_message',
  UPDATE_CONNECTION: 'update_connection'
};

export default offlineStorage;