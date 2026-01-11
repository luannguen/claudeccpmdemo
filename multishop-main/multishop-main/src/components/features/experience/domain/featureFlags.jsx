/**
 * Feature Flags for Experience Module
 * Domain Layer - No UI imports
 * 
 * Supports:
 * - Simple flag (FLAG_INTRO_ENABLED)
 * - Canary rollout (percentage-based)
 * - User segment targeting
 */

// Simple feature flag - can be toggled for global enable/disable
export const FLAG_INTRO_ENABLED = true;

// Canary rollout percentage (0-100)
// 0 = disabled, 100 = fully rolled out
export const CANARY_ROLLOUT_PERCENTAGE = 100;

// User segments that can access intro early (for beta testing)
export const EARLY_ACCESS_SEGMENTS = ['admin', 'tester', 'beta'];

/**
 * Check if intro feature is enabled for a given user
 * @param {Object} options
 * @param {string} [options.userId] - User ID for canary hash
 * @param {string} [options.userRole] - User role for segment check
 * @param {boolean} [options.forceEnable] - Force enable for testing
 * @returns {boolean}
 */
export function isIntroEnabledForUser({ userId, userRole, forceEnable } = {}) {
  // Force enable for testing
  if (forceEnable) return true;
  
  // Global kill switch
  if (!FLAG_INTRO_ENABLED) return false;
  
  // Early access segments always get access
  if (userRole && EARLY_ACCESS_SEGMENTS.includes(userRole)) return true;
  
  // Canary rollout based on user ID hash
  if (CANARY_ROLLOUT_PERCENTAGE >= 100) return true;
  if (CANARY_ROLLOUT_PERCENTAGE <= 0) return false;
  
  // Hash user ID to get consistent rollout
  if (userId) {
    const hash = simpleHash(userId);
    const bucket = hash % 100;
    return bucket < CANARY_ROLLOUT_PERCENTAGE;
  }
  
  // Default: use canary percentage as probability
  return Math.random() * 100 < CANARY_ROLLOUT_PERCENTAGE;
}

/**
 * Simple hash function for consistent bucketing
 * @param {string} str
 * @returns {number}
 */
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Get feature flag status for debugging/observability
 * @returns {Object}
 */
export function getFeatureFlagStatus() {
  return {
    intro_enabled: FLAG_INTRO_ENABLED,
    canary_percentage: CANARY_ROLLOUT_PERCENTAGE,
    early_access_segments: EARLY_ACCESS_SEGMENTS
  };
}

export default {
  FLAG_INTRO_ENABLED,
  CANARY_ROLLOUT_PERCENTAGE,
  isIntroEnabledForUser,
  getFeatureFlagStatus
};