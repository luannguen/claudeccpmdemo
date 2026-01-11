/**
 * EcardCache Repository - Data Access Layer
 * Handles all EcardCache data operations
 */

import { base44 } from '@/api/base44Client';
import { EMPTY_CACHE } from '../types/EcardCacheDTO';

/**
 * Get cache for current user
 * @returns {Promise<Object|null>}
 */
export const getMyCache = async () => {
  const me = await base44.auth.me();
  if (!me) return null;

  const caches = await base44.entities.EcardCache.filter({ user_email: me.email });
  return caches.length > 0 ? caches[0] : null;
};

/**
 * Get or create cache for current user
 * @returns {Promise<Object>}
 */
export const getOrCreateCache = async () => {
  const me = await base44.auth.me();
  if (!me) throw new Error('User not authenticated');

  const existing = await getMyCache();
  if (existing) return existing;

  // Create new cache with defaults
  const newCache = await base44.entities.EcardCache.create({
    user_id: me.id,
    user_email: me.email,
    profile_snapshot: {
      display_name: me.full_name || me.email.split('@')[0],
      avatar_url: null,
      slug: null
    },
    stats: EMPTY_CACHE.stats,
    connections_preview: [],
    gifts_summary: EMPTY_CACHE.gifts_summary,
    last_synced_at: null,
    sync_version: 1
  });

  return newCache;
};

/**
 * Update cache stats (optimistic update)
 * @param {string} cacheId
 * @param {Partial<Object>} statsUpdate
 * @returns {Promise<Object>}
 */
export const updateCacheStats = async (cacheId, statsUpdate) => {
  const cache = await base44.entities.EcardCache.filter({ id: cacheId });
  if (!cache.length) throw new Error('Cache not found');

  const currentStats = cache[0].stats || EMPTY_CACHE.stats;
  const newStats = { ...currentStats, ...statsUpdate };

  return base44.entities.EcardCache.update(cacheId, { stats: newStats });
};

/**
 * Increment a stat counter (for optimistic updates)
 * @param {string} cacheId
 * @param {string} statKey - e.g., 'post_count', 'connection_count'
 * @param {number} delta - Amount to add (default 1)
 */
export const incrementStat = async (cacheId, statKey, delta = 1) => {
  const cache = await base44.entities.EcardCache.filter({ id: cacheId });
  if (!cache.length) return null;

  const currentStats = cache[0].stats || EMPTY_CACHE.stats;
  const newValue = (currentStats[statKey] || 0) + delta;

  return updateCacheStats(cacheId, { [statKey]: newValue });
};

/**
 * Add connection to preview (prepend, keep max 20)
 * @param {string} cacheId
 * @param {Object} connectionPreview
 */
export const addConnectionPreview = async (cacheId, connectionPreview) => {
  const cache = await base44.entities.EcardCache.filter({ id: cacheId });
  if (!cache.length) return null;

  const currentPreview = cache[0].connections_preview || [];
  // Prepend new, remove duplicates, limit to 20
  const filtered = currentPreview.filter(c => c.id !== connectionPreview.id);
  const newPreview = [connectionPreview, ...filtered].slice(0, 20);

  return base44.entities.EcardCache.update(cacheId, { 
    connections_preview: newPreview,
    stats: {
      ...cache[0].stats,
      connection_count: (cache[0].stats?.connection_count || 0) + 1
    }
  });
};

/**
 * Add gift to summary (prepend, keep max 5 each)
 * @param {string} cacheId
 * @param {'received'|'sent'} type
 * @param {Object} giftPreview
 */
export const addGiftToSummary = async (cacheId, type, giftPreview) => {
  const cache = await base44.entities.EcardCache.filter({ id: cacheId });
  if (!cache.length) return null;

  const currentSummary = cache[0].gifts_summary || EMPTY_CACHE.gifts_summary;
  const key = type === 'received' ? 'recent_received' : 'recent_sent';
  const statKey = type === 'received' ? 'gifts_received_count' : 'gifts_sent_count';
  
  const currentList = currentSummary[key] || [];
  const newList = [giftPreview, ...currentList].slice(0, 5);

  return base44.entities.EcardCache.update(cacheId, { 
    gifts_summary: {
      ...currentSummary,
      [key]: newList
    },
    stats: {
      ...cache[0].stats,
      [statKey]: (cache[0].stats?.[statKey] || 0) + 1
    }
  });
};

/**
 * Full sync - replace entire cache data
 * Called by backend scheduled task
 * @param {string} cacheId
 * @param {Object} fullData
 */
export const fullSync = async (cacheId, fullData) => {
  return base44.entities.EcardCache.update(cacheId, {
    ...fullData,
    last_synced_at: new Date().toISOString(),
    sync_version: (fullData.sync_version || 0) + 1
  });
};

/**
 * Update profile snapshot
 * @param {string} cacheId
 * @param {Object} profileData
 */
export const updateProfileSnapshot = async (cacheId, profileData) => {
  return base44.entities.EcardCache.update(cacheId, {
    profile_snapshot: profileData
  });
};

export const ecardCacheRepository = {
  getMyCache,
  getOrCreateCache,
  updateCacheStats,
  incrementStat,
  addConnectionPreview,
  addGiftToSummary,
  fullSync,
  updateProfileSnapshot
};

export default ecardCacheRepository;