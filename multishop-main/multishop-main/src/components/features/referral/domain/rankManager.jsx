/**
 * Seeder Rank Manager
 * Domain Layer - Business logic for rank progression
 * 
 * @module features/referral/domain/rankManager
 */

import { RANK_ORDER, DEFAULT_RANK_CONFIG, RANK_CONFIG } from '../types';

/**
 * Get rank index in progression order
 * @param {string} rank
 * @returns {number}
 */
export function getRankIndex(rank) {
  return RANK_ORDER.indexOf(rank);
}

/**
 * Check if rank A is higher than rank B
 * @param {string} rankA
 * @param {string} rankB
 * @returns {boolean}
 */
export function isHigherRank(rankA, rankB) {
  return getRankIndex(rankA) > getRankIndex(rankB);
}

/**
 * Get next rank in progression
 * @param {string} currentRank
 * @returns {string|null}
 */
export function getNextRank(currentRank) {
  const currentIndex = getRankIndex(currentRank);
  if (currentIndex < 0 || currentIndex >= RANK_ORDER.length - 1) {
    return null;
  }
  return RANK_ORDER[currentIndex + 1];
}

/**
 * Check if member meets requirements for a specific rank
 * @param {Object} f1Stats - Stats about F1 customers
 * @param {Object} rankRequirements - Requirements for the rank
 * @returns {boolean}
 */
export function meetsRankRequirements(f1Stats, rankRequirements) {
  if (!rankRequirements || !rankRequirements.f1_required || rankRequirements.f1_required <= 0) {
    return true;
  }
  
  // If specific rank required for F1
  if (rankRequirements.f1_rank_required) {
    const requiredRankIndex = getRankIndex(rankRequirements.f1_rank_required);
    
    // Count F1s at or above required rank
    const qualifiedF1Count = countF1AtOrAboveRank(f1Stats, requiredRankIndex);
    return qualifiedF1Count >= rankRequirements.f1_required;
  }
  
  // Just need F1 with purchases
  return (f1Stats.f1_with_purchases || 0) >= rankRequirements.f1_required;
}

/**
 * Count F1 members at or above a specific rank
 * @param {Object} f1Stats
 * @param {number} minRankIndex
 * @returns {number}
 */
function countF1AtOrAboveRank(f1Stats, minRankIndex) {
  let count = 0;
  
  for (let i = minRankIndex; i < RANK_ORDER.length; i++) {
    const rank = RANK_ORDER[i];
    const statKey = `f1_at_${rank}`;
    count += f1Stats[statKey] || 0;
  }
  
  return count;
}

/**
 * Calculate which rank member can achieve
 * @param {string} currentRank
 * @param {Object} f1Stats - Stats about F1 customers
 * @param {Object} rankConfig - Rank configuration
 * @returns {{ canUpgrade: boolean, newRank?: string, config?: Object }}
 */
export function calculateAchievableRank(currentRank, f1Stats, rankConfig = DEFAULT_RANK_CONFIG) {
  const currentIndex = getRankIndex(currentRank);
  
  // Check from highest rank down
  for (let i = RANK_ORDER.length - 1; i > currentIndex; i--) {
    const rank = RANK_ORDER[i];
    const config = rankConfig[rank];
    
    if (!config) continue;
    
    if (meetsRankRequirements(f1Stats, config)) {
      return { canUpgrade: true, newRank: rank, config };
    }
  }
  
  return { canUpgrade: false };
}

/**
 * Get rank display info
 * @param {string} rank
 * @returns {{ label: string, color: string, icon: string }}
 */
export function getRankDisplay(rank) {
  return RANK_CONFIG[rank] || RANK_CONFIG.nguoi_gieo_hat;
}

/**
 * Calculate progress to next rank
 * @param {string} currentRank
 * @param {Object} f1Stats
 * @param {Object} rankConfig
 * @returns {{ nextRank: string|null, required: number, current: number, progress: number }}
 */
export function calculateRankProgress(currentRank, f1Stats, rankConfig = DEFAULT_RANK_CONFIG) {
  const nextRank = getNextRank(currentRank);
  
  if (!nextRank) {
    return { nextRank: null, required: 0, current: 0, progress: 100 };
  }
  
  const config = rankConfig[nextRank];
  if (!config || !config.f1_required) {
    return { nextRank, required: 0, current: 0, progress: 100 };
  }
  
  let current = 0;
  
  if (config.f1_rank_required) {
    const requiredRankIndex = getRankIndex(config.f1_rank_required);
    current = countF1AtOrAboveRank(f1Stats, requiredRankIndex);
  } else {
    current = f1Stats.f1_with_purchases || 0;
  }
  
  const required = config.f1_required;
  const progress = Math.min(100, Math.round((current / required) * 100));
  
  return { nextRank, required, current, progress };
}

/**
 * Build F1 stats from customer and member data
 * @param {Array} f1Customers - Customers referred by this member
 * @param {Array} f1Members - ReferralMembers who are F1
 * @param {number} minOrdersForRank - Min orders to count as "with purchases"
 * @returns {Object}
 */
export function buildF1Stats(f1Customers, f1Members = [], minOrdersForRank = 1) {
  const stats = {
    f1_with_purchases: f1Customers.filter(c => (c.total_orders || 0) >= minOrdersForRank).length
  };
  
  // Count F1 at each rank
  for (const rank of RANK_ORDER) {
    stats[`f1_at_${rank}`] = f1Members.filter(m => m.seeder_rank === rank).length;
  }
  
  return stats;
}

export default {
  getRankIndex,
  isHigherRank,
  getNextRank,
  meetsRankRequirements,
  calculateAchievableRank,
  getRankDisplay,
  calculateRankProgress,
  buildF1Stats
};