/**
 * useOfflineMode - Hook for E-Card offline support
 * Feature Logic Layer - State and orchestration
 * 
 * @module features/ecard/hooks
 */

import { useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { offlineStorage, isIndexedDBSupported, OFFLINE_ACTIONS } from '../domain/offlineStorage';

/**
 * Hook to manage online/offline status
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, isOffline: !isOnline };
}

/**
 * Hook for offline profile saving
 */
export function useOfflineProfile() {
  const [isSaving, setIsSaving] = useState(false);
  const [savedProfiles, setSavedProfiles] = useState([]);
  const { isOnline } = useNetworkStatus();

  const loadSavedProfiles = useCallback(async () => {
    if (!isIndexedDBSupported()) return;
    
    try {
      const profiles = await offlineStorage.getAllProfiles();
      setSavedProfiles(profiles);
    } catch (err) {
      console.error('Failed to load saved profiles:', err);
    }
  }, []);

  useEffect(() => {
    loadSavedProfiles();
  }, [loadSavedProfiles]);

  const saveForOffline = useCallback(async (profile) => {
    if (!isIndexedDBSupported()) return false;
    
    setIsSaving(true);
    try {
      await offlineStorage.saveProfile(profile);
      await loadSavedProfiles();
      return true;
    } catch (err) {
      console.error('Failed to save profile:', err);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [loadSavedProfiles]);

  const removeOfflineProfile = useCallback(async (id) => {
    if (!isIndexedDBSupported()) return false;
    
    try {
      await offlineStorage.deleteProfile(id);
      await loadSavedProfiles();
      return true;
    } catch (err) {
      console.error('Failed to remove profile:', err);
      return false;
    }
  }, [loadSavedProfiles]);

  const getOfflineProfile = useCallback(async (id) => {
    if (!isIndexedDBSupported()) return null;
    
    try {
      return await offlineStorage.getProfile(id);
    } catch (err) {
      console.error('Failed to get profile:', err);
      return null;
    }
  }, []);

  const isProfileSaved = useCallback((id) => {
    return savedProfiles.some(p => p.id === id);
  }, [savedProfiles]);

  return {
    savedProfiles,
    isSaving,
    isOnline,
    isSupported: isIndexedDBSupported(),
    saveForOffline,
    removeOfflineProfile,
    getOfflineProfile,
    isProfileSaved,
    refresh: loadSavedProfiles
  };
}

/**
 * Hook for syncing my profile offline
 */
export function useOfflineMyProfile() {
  const [cachedProfile, setCachedProfile] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);
  const { isOnline } = useNetworkStatus();

  const loadCached = useCallback(async () => {
    if (!isIndexedDBSupported()) return;
    
    try {
      const data = await offlineStorage.getMyProfile();
      setCachedProfile(data);
      if (data?._savedAt) {
        setLastSaved(new Date(data._savedAt));
      }
    } catch (err) {
      console.error('Failed to load cached profile:', err);
    }
  }, []);

  useEffect(() => {
    loadCached();
  }, [loadCached]);

  const syncProfile = useCallback(async (profile) => {
    if (!isIndexedDBSupported()) return false;
    
    try {
      await offlineStorage.saveMyProfile(profile);
      await loadCached();
      return true;
    } catch (err) {
      console.error('Failed to sync profile:', err);
      return false;
    }
  }, [loadCached]);

  return {
    cachedProfile,
    lastSaved,
    isOnline,
    isSupported: isIndexedDBSupported(),
    syncProfile
  };
}

/**
 * Hook for offline connections
 */
export function useOfflineConnections() {
  const [cachedConnections, setCachedConnections] = useState([]);
  const { isOnline } = useNetworkStatus();

  const loadCached = useCallback(async () => {
    if (!isIndexedDBSupported()) return;
    
    try {
      const data = await offlineStorage.getConnections();
      setCachedConnections(data);
    } catch (err) {
      console.error('Failed to load cached connections:', err);
    }
  }, []);

  useEffect(() => {
    loadCached();
  }, [loadCached]);

  const syncConnections = useCallback(async (connections) => {
    if (!isIndexedDBSupported()) return false;
    
    try {
      await offlineStorage.saveConnections(connections);
      await loadCached();
      return true;
    } catch (err) {
      console.error('Failed to sync connections:', err);
      return false;
    }
  }, [loadCached]);

  return {
    cachedConnections,
    isOnline,
    isSupported: isIndexedDBSupported(),
    syncConnections
  };
}

/**
 * Hook for pending actions queue
 */
export function useOfflineQueue() {
  const [pendingActions, setPendingActions] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const { isOnline } = useNetworkStatus();
  const queryClient = useQueryClient();

  const loadPending = useCallback(async () => {
    if (!isIndexedDBSupported()) return;
    
    try {
      const actions = await offlineStorage.getPendingActions();
      setPendingActions(actions);
    } catch (err) {
      console.error('Failed to load pending actions:', err);
    }
  }, []);

  useEffect(() => {
    loadPending();
  }, [loadPending]);

  // Auto-sync when coming online
  useEffect(() => {
    if (isOnline && pendingActions.length > 0) {
      syncPendingActions();
    }
  }, [isOnline]);

  const queueAction = useCallback(async (type, payload) => {
    if (!isIndexedDBSupported()) return false;
    
    try {
      await offlineStorage.queueAction({ type, payload });
      await loadPending();
      return true;
    } catch (err) {
      console.error('Failed to queue action:', err);
      return false;
    }
  }, [loadPending]);

  const syncPendingActions = useCallback(async () => {
    if (!isOnline || isSyncing || pendingActions.length === 0) return;
    
    setIsSyncing(true);
    try {
      for (const action of pendingActions) {
        try {
          // Process action based on type
          await processAction(action);
          await offlineStorage.markActionSynced(action.id);
        } catch (err) {
          console.error(`Failed to sync action ${action.id}:`, err);
        }
      }
      
      // Cleanup synced actions
      await offlineStorage.clearSyncedActions();
      await loadPending();
      
      // Invalidate queries
      queryClient.invalidateQueries();
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing, pendingActions, loadPending, queryClient]);

  return {
    pendingActions,
    pendingCount: pendingActions.length,
    isSyncing,
    isOnline,
    isSupported: isIndexedDBSupported(),
    queueAction,
    syncNow: syncPendingActions
  };
}

/**
 * Process queued action
 */
async function processAction(action) {
  const { base44 } = await import('@/api/base44Client');
  
  switch (action.type) {
    case OFFLINE_ACTIONS.UPDATE_PROFILE:
      await base44.entities.EcardProfile.update(action.payload.id, action.payload.data);
      break;
    
    case OFFLINE_ACTIONS.SEND_MESSAGE:
      await base44.entities.ConnectionMessage.create(action.payload);
      break;
    
    case OFFLINE_ACTIONS.UPDATE_CONNECTION:
      await base44.entities.UserConnection.update(action.payload.id, action.payload.data);
      break;
    
    default:
      console.warn('Unknown action type:', action.type);
  }
}

/**
 * Hook for offline storage stats
 */
export function useOfflineStats() {
  const [stats, setStats] = useState(null);
  const { isOnline } = useNetworkStatus();

  const loadStats = useCallback(async () => {
    try {
      const data = await offlineStorage.getStats();
      setStats(data);
    } catch (err) {
      setStats({ supported: false, error: err.message });
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const clearAll = useCallback(async () => {
    try {
      await offlineStorage.clearAll();
      await loadStats();
      return true;
    } catch (err) {
      console.error('Failed to clear offline data:', err);
      return false;
    }
  }, [loadStats]);

  return {
    stats,
    isOnline,
    clearAll,
    refresh: loadStats
  };
}