/**
 * 🎯 Loyalty Core - Pure business logic
 * 
 * Chứa logic tính toán, validation KHÔNG phụ thuộc vào service khác
 * Để tránh circular dependency
 */

// ========== CONSTANTS ==========

export const TIER_CONFIG = {
  bronze: {
    label: 'Đồng',
    minPoints: 0,
    maxPoints: 999,
    pointMultiplier: 1.0,
    discountRate: 0,
    freeShipThreshold: 200000,
    color: 'bg-orange-100 text-orange-700'
  },
  silver: {
    label: 'Bạc',
    minPoints: 1000,
    maxPoints: 4999,
    pointMultiplier: 1.05,
    discountRate: 2,
    freeShipThreshold: 150000,
    color: 'bg-gray-100 text-gray-700'
  },
  gold: {
    label: 'Vàng',
    minPoints: 5000,
    maxPoints: 14999,
    pointMultiplier: 1.1,
    discountRate: 5,
    freeShipThreshold: 100000,
    color: 'bg-amber-100 text-amber-700'
  },
  platinum: {
    label: 'Bạch Kim',
    minPoints: 15000,
    maxPoints: Infinity,
    pointMultiplier: 1.2,
    discountRate: 10,
    freeShipThreshold: 0,
    color: 'bg-purple-100 text-purple-700'
  }
};

export const POINTS_CONFIG = {
  earnRate: 1, // 1 điểm / 1000đ
  redeemRate: 1000, // 1 điểm = 1000đ giảm giá
  minRedeemPoints: 100, // Tối thiểu 100 điểm mới được dùng
  maxRedeemPercent: 50, // Tối đa dùng 50% giá trị đơn hàng
  expirationMonths: 12, // Điểm hết hạn sau 12 tháng
  welcomeBonus: 100 // Điểm chào mừng khi đăng ký
};

// ========== TIER CALCULATION ==========

/**
 * Tính tier dựa trên lifetime points
 */
export function calculateTier(lifetimePoints) {
  if (lifetimePoints >= TIER_CONFIG.platinum.minPoints) return 'platinum';
  if (lifetimePoints >= TIER_CONFIG.gold.minPoints) return 'gold';
  if (lifetimePoints >= TIER_CONFIG.silver.minPoints) return 'silver';
  return 'bronze';
}

/**
 * Tính % progress đến tier tiếp theo
 */
export function calculateTierProgress(lifetimePoints) {
  const currentTier = calculateTier(lifetimePoints);
  const tiers = ['bronze', 'silver', 'gold', 'platinum'];
  const currentIndex = tiers.indexOf(currentTier);
  
  if (currentIndex === tiers.length - 1) {
    return 100; // Đã đạt tier cao nhất
  }
  
  const nextTier = tiers[currentIndex + 1];
  const currentMin = TIER_CONFIG[currentTier].minPoints;
  const nextMin = TIER_CONFIG[nextTier].minPoints;
  
  const progress = ((lifetimePoints - currentMin) / (nextMin - currentMin)) * 100;
  return Math.min(Math.round(progress), 100);
}

/**
 * Tính điểm cần để lên tier tiếp theo
 */
export function pointsToNextTier(lifetimePoints) {
  const currentTier = calculateTier(lifetimePoints);
  const tiers = ['bronze', 'silver', 'gold', 'platinum'];
  const currentIndex = tiers.indexOf(currentTier);
  
  if (currentIndex === tiers.length - 1) {
    return 0; // Đã đạt tier cao nhất
  }
  
  const nextTier = tiers[currentIndex + 1];
  return TIER_CONFIG[nextTier].minPoints - lifetimePoints;
}

/**
 * Lấy tier benefits
 */
export function getTierBenefits(tier) {
  const config = TIER_CONFIG[tier] || TIER_CONFIG.bronze;
  return {
    point_multiplier: config.pointMultiplier,
    discount_rate: config.discountRate,
    free_shipping_threshold: config.freeShipThreshold
  };
}

// ========== POINTS CALCULATION ==========

/**
 * Tính điểm được tích từ đơn hàng
 */
export function calculateEarnedPoints(orderAmount, tier, referralBonus = 0) {
  const tierConfig = TIER_CONFIG[tier] || TIER_CONFIG.bronze;
  const basePoints = Math.floor(orderAmount / 1000) * POINTS_CONFIG.earnRate;
  const tierBonus = basePoints * (tierConfig.pointMultiplier - 1);
  
  return Math.floor(basePoints + tierBonus + referralBonus);
}

/**
 * Tính số tiền giảm từ điểm
 */
export function calculateRedemptionValue(points) {
  if (points < POINTS_CONFIG.minRedeemPoints) {
    return { valid: false, error: `Cần tối thiểu ${POINTS_CONFIG.minRedeemPoints} điểm` };
  }
  
  const discountAmount = points * POINTS_CONFIG.redeemRate;
  return { valid: true, discountAmount };
}

/**
 * Validate redeem points với order
 */
export function validateRedemption(points, orderAmount, availablePoints) {
  if (points > availablePoints) {
    return { valid: false, error: 'Không đủ điểm' };
  }
  
  if (points < POINTS_CONFIG.minRedeemPoints) {
    return { valid: false, error: `Cần tối thiểu ${POINTS_CONFIG.minRedeemPoints} điểm` };
  }
  
  const maxRedeemAmount = orderAmount * (POINTS_CONFIG.maxRedeemPercent / 100);
  const redemptionValue = points * POINTS_CONFIG.redeemRate;
  
  if (redemptionValue > maxRedeemAmount) {
    const maxPoints = Math.floor(maxRedeemAmount / POINTS_CONFIG.redeemRate);
    return { 
      valid: false, 
      error: `Tối đa dùng ${POINTS_CONFIG.maxRedeemPercent}% giá trị đơn hàng (${maxPoints} điểm)` 
    };
  }
  
  return { valid: true, discountAmount: redemptionValue };
}

// ========== EXPIRATION ==========

/**
 * Tính điểm sắp hết hạn
 */
export function calculateExpiringPoints(pointsHistory) {
  const now = new Date();
  const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  
  let expiringPoints = 0;
  let nextExpirationDate = null;
  
  pointsHistory.forEach(entry => {
    if (entry.type === 'earned' && entry.expiration_date) {
      const expDate = new Date(entry.expiration_date);
      if (expDate > now && expDate <= thirtyDaysLater) {
        expiringPoints += entry.points;
        if (!nextExpirationDate || expDate < new Date(nextExpirationDate)) {
          nextExpirationDate = entry.expiration_date;
        }
      }
    }
  });
  
  return { expiringPoints, nextExpirationDate };
}

/**
 * Tạo expiration date cho điểm mới
 */
export function createExpirationDate() {
  const date = new Date();
  date.setMonth(date.getMonth() + POINTS_CONFIG.expirationMonths);
  return date.toISOString().split('T')[0];
}

// ========== CROSS-SYSTEM BONUS ==========

/**
 * Tính loyalty bonus từ referral rank
 */
export function getReferralRankBonus(seederRank) {
  const bonusMap = {
    nguoi_gieo_hat: 0,
    hat_giong_khoe: 50,
    mam_khoe: 100,
    choi_khoe: 200,
    canh_khoe: 300,
    cay_khoe: 500,
    danh_hieu: 1000
  };
  return bonusMap[seederRank] || 0;
}

/**
 * Tính referral commission bonus từ loyalty tier
 */
export function getLoyaltyTierReferralBonus(loyaltyTier) {
  const bonusMap = {
    bronze: 0,
    silver: 0.1, // +0.1%
    gold: 0.2,   // +0.2%
    platinum: 0.5 // +0.5%
  };
  return bonusMap[loyaltyTier] || 0;
}

export default {
  TIER_CONFIG,
  POINTS_CONFIG,
  calculateTier,
  calculateTierProgress,
  pointsToNextTier,
  getTierBenefits,
  calculateEarnedPoints,
  calculateRedemptionValue,
  validateRedemption,
  calculateExpiringPoints,
  createExpirationDate,
  getReferralRankBonus,
  getLoyaltyTierReferralBonus
};