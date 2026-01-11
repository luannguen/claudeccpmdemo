/**
 * EcardCache DTO Types
 * UI Layer - Type definitions only
 */

/**
 * @typedef {Object} ProfileSnapshot
 * @property {string} [display_name]
 * @property {string} [avatar_url]
 * @property {string} [slug]
 * @property {string} [title]
 * @property {string} [company]
 */

/**
 * @typedef {Object} CacheStats
 * @property {number} post_count
 * @property {number} product_count
 * @property {number} connection_count
 * @property {number} gifts_received_count
 * @property {number} gifts_sent_count
 * @property {number} view_count
 */

/**
 * @typedef {Object} ConnectionPreview
 * @property {string} id
 * @property {string} target_user_email
 * @property {string} [display_name]
 * @property {string} [avatar_url]
 * @property {string} [slug]
 * @property {string} [care_level]
 * @property {string} [connected_at]
 */

/**
 * @typedef {Object} GiftPreview
 * @property {string} id
 * @property {string} product_name
 * @property {string} [product_image]
 * @property {string} from_email
 * @property {string} to_email
 * @property {string} status
 * @property {string} [created_date]
 */

/**
 * @typedef {Object} GiftsSummary
 * @property {GiftPreview[]} recent_received
 * @property {GiftPreview[]} recent_sent
 */

/**
 * @typedef {Object} EcardCacheDTO
 * @property {string} id
 * @property {string} user_id
 * @property {string} user_email
 * @property {ProfileSnapshot} [profile_snapshot]
 * @property {CacheStats} stats
 * @property {ConnectionPreview[]} connections_preview
 * @property {GiftsSummary} gifts_summary
 * @property {string} [last_synced_at]
 * @property {number} sync_version
 * @property {string} [created_date]
 * @property {string} [updated_date]
 */

/**
 * Default empty cache
 * @type {Partial<EcardCacheDTO>}
 */
export const EMPTY_CACHE = {
  stats: {
    post_count: 0,
    product_count: 0,
    connection_count: 0,
    gifts_received_count: 0,
    gifts_sent_count: 0,
    view_count: 0
  },
  connections_preview: [],
  gifts_summary: {
    recent_received: [],
    recent_sent: []
  },
  sync_version: 1
};

/**
 * Cache stale time (1 hour in ms)
 */
export const CACHE_STALE_TIME_MS = 60 * 60 * 1000;

/**
 * Check if cache is stale
 * @param {string} lastSyncedAt - ISO date string
 * @returns {boolean}
 */
export const isCacheStale = (lastSyncedAt) => {
  if (!lastSyncedAt) return true;
  const lastSync = new Date(lastSyncedAt).getTime();
  const now = Date.now();
  return (now - lastSync) > CACHE_STALE_TIME_MS;
};