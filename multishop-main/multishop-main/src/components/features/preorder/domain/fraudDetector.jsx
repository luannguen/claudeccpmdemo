/**
 * fraudDetector - Fraud detection & risk scoring
 * Domain Layer - Pure business logic
 * 
 * Part of PreOrder Module
 */

// ========== CONSTANTS ==========

export const RISK_FLAGS = {
  HIGH_CANCEL_RATE: 'high_cancel_rate',
  MULTI_DEVICE: 'multi_device',
  MULTI_ADDRESS: 'multi_address',
  RAPID_ORDERING: 'rapid_ordering',
  BULK_THEN_CANCEL: 'bulk_then_cancel',
  DISPUTE_ABUSE: 'dispute_abuse',
  REFUND_ABUSE: 'refund_abuse',
  SUSPICIOUS_PATTERN: 'suspicious_pattern',
  ADDRESS_MISMATCH: 'address_mismatch',
  PAYMENT_FAILED_MULTIPLE: 'payment_failed_multiple'
};

export const RISK_LEVEL = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

export const TRUST_TIER = {
  NEW: 'new',
  BASIC: 'basic',
  TRUSTED: 'trusted',
  VIP: 'vip'
};

export const FRAUD_THRESHOLDS = {
  MAX_PREORDERS_PER_LOT: 3,
  MAX_ACTIVE_PREORDERS: 10,
  MAX_ORDERS_PER_DAY: 5,
  MAX_QUANTITY_PER_ORDER: 50,
  CANCEL_RATE_HIGH: 30,
  CANCEL_RATE_CRITICAL: 50,
  DISPUTES_HIGH: 3,
  REFUNDS_HIGH: 5,
  DEVICES_SUSPICIOUS: 3,
  ADDRESSES_SUSPICIOUS: 5,
  RAPID_ORDERS_MINUTES: 30,
  ORDERS_FOR_BASIC: 3,
  ORDERS_FOR_TRUSTED: 10,
  ORDERS_FOR_VIP: 25
};

// ========== RISK CALCULATION ==========

/**
 * Calculate comprehensive risk score (0-100)
 */
export function calculateRiskScore(profile) {
  const orderStats = profile.order_stats || {};
  const preorderStats = profile.preorder_stats || {};
  
  let riskScore = 0;
  const riskFactors = [];
  const riskFlags = [];

  // Factor 1: Cancel rate (max 30 points)
  const cancelRate = orderStats.total_orders > 0 
    ? (orderStats.cancelled_orders / orderStats.total_orders) * 100 
    : 0;
  
  if (cancelRate >= FRAUD_THRESHOLDS.CANCEL_RATE_CRITICAL) {
    riskScore += 30;
    riskFlags.push(RISK_FLAGS.HIGH_CANCEL_RATE);
    riskFactors.push({
      factor: 'cancel_rate',
      weight: 30,
      description: `Tỉ lệ hủy đơn: ${cancelRate.toFixed(1)}%`
    });
  } else if (cancelRate >= FRAUD_THRESHOLDS.CANCEL_RATE_HIGH) {
    riskScore += 15;
    riskFactors.push({
      factor: 'cancel_rate',
      weight: 15,
      description: `Tỉ lệ hủy đơn: ${cancelRate.toFixed(1)}%`
    });
  }

  // Factor 2: Disputes (max 20 points)
  if (orderStats.disputes_opened >= FRAUD_THRESHOLDS.DISPUTES_HIGH) {
    riskScore += 20;
    riskFlags.push(RISK_FLAGS.DISPUTE_ABUSE);
    riskFactors.push({
      factor: 'disputes',
      weight: 20,
      description: `Số disputes: ${orderStats.disputes_opened}`
    });
  }

  // Factor 3: Refunds (max 15 points)
  if (orderStats.refunds_requested >= FRAUD_THRESHOLDS.REFUNDS_HIGH) {
    riskScore += 15;
    riskFlags.push(RISK_FLAGS.REFUND_ABUSE);
    riskFactors.push({
      factor: 'refunds',
      weight: 15,
      description: `Số lần yêu cầu hoàn tiền: ${orderStats.refunds_requested}`
    });
  }

  // Factor 4: Multiple devices (max 10 points)
  const deviceCount = (profile.device_fingerprints || []).length;
  if (deviceCount >= FRAUD_THRESHOLDS.DEVICES_SUSPICIOUS) {
    riskScore += 10;
    riskFlags.push(RISK_FLAGS.MULTI_DEVICE);
    riskFactors.push({
      factor: 'multi_device',
      weight: 10,
      description: `Số thiết bị: ${deviceCount}`
    });
  }

  // Factor 5: Multiple addresses (max 10 points)
  const addressCount = (profile.shipping_addresses || []).length;
  if (addressCount >= FRAUD_THRESHOLDS.ADDRESSES_SUSPICIOUS) {
    riskScore += 10;
    riskFlags.push(RISK_FLAGS.MULTI_ADDRESS);
    riskFactors.push({
      factor: 'multi_address',
      weight: 10,
      description: `Số địa chỉ: ${addressCount}`
    });
  }

  // Factor 6: Preorder cancel rate (max 15 points)
  if (preorderStats.cancel_rate_preorder >= FRAUD_THRESHOLDS.CANCEL_RATE_HIGH) {
    riskScore += 15;
    riskFlags.push(RISK_FLAGS.BULK_THEN_CANCEL);
    riskFactors.push({
      factor: 'preorder_cancel',
      weight: 15,
      description: `Tỉ lệ hủy preorder: ${preorderStats.cancel_rate_preorder}%`
    });
  }

  return { riskScore, riskFactors, riskFlags };
}

/**
 * Determine risk level from score
 */
export function determineRiskLevel(riskScore) {
  if (riskScore >= 60) return RISK_LEVEL.CRITICAL;
  if (riskScore >= 40) return RISK_LEVEL.HIGH;
  if (riskScore >= 20) return RISK_LEVEL.MEDIUM;
  return RISK_LEVEL.LOW;
}

/**
 * Calculate trust score (inverse of risk)
 */
export function calculateTrustScore(riskScore, completedOrders) {
  let trustScore = Math.max(0, 100 - riskScore);
  
  // Boost trust for completed orders
  if (completedOrders >= FRAUD_THRESHOLDS.ORDERS_FOR_VIP) {
    trustScore = Math.min(100, trustScore + 20);
  } else if (completedOrders >= FRAUD_THRESHOLDS.ORDERS_FOR_TRUSTED) {
    trustScore = Math.min(100, trustScore + 10);
  }

  return trustScore;
}

/**
 * Determine trust tier
 */
export function determineTrustTier(completedOrders, trustScore) {
  if (completedOrders >= FRAUD_THRESHOLDS.ORDERS_FOR_VIP && trustScore >= 80) {
    return TRUST_TIER.VIP;
  }
  if (completedOrders >= FRAUD_THRESHOLDS.ORDERS_FOR_TRUSTED && trustScore >= 60) {
    return TRUST_TIER.TRUSTED;
  }
  if (completedOrders >= FRAUD_THRESHOLDS.ORDERS_FOR_BASIC && trustScore >= 40) {
    return TRUST_TIER.BASIC;
  }
  return TRUST_TIER.NEW;
}

/**
 * Determine restrictions based on risk level
 */
export function determineRestrictions(riskLevel) {
  const restrictions = {};
  
  if (riskLevel === RISK_LEVEL.CRITICAL) {
    restrictions.require_manual_approval = true;
    restrictions.require_full_payment = true;
    restrictions.max_preorder_quantity = 5;
    restrictions.max_active_preorders = 2;
  } else if (riskLevel === RISK_LEVEL.HIGH) {
    restrictions.require_full_payment = true;
    restrictions.max_preorder_quantity = 10;
    restrictions.max_active_preorders = 5;
  } else if (riskLevel === RISK_LEVEL.MEDIUM) {
    restrictions.max_preorder_quantity = 20;
    restrictions.max_active_preorders = 7;
  }

  return restrictions;
}

/**
 * Validate order against fraud rules
 */
export function validateOrderAgainstRules(profile, orderData, lotOrderCount = 0) {
  const violations = [];

  // Check 1: Blacklist
  if (profile.is_blacklisted) {
    return {
      allowed: false,
      reason: 'Tài khoản bị hạn chế',
      violations: ['blacklisted']
    };
  }

  // Check 2: Manual approval
  if (profile.restrictions?.require_manual_approval) {
    violations.push('require_approval');
  }

  // Check 3: Active preorders limit
  const preorderStats = profile.preorder_stats || {};
  const maxActive = profile.restrictions?.max_active_preorders || FRAUD_THRESHOLDS.MAX_ACTIVE_PREORDERS;
  if (preorderStats.active_preorders >= maxActive) {
    violations.push('max_active_preorders');
  }

  // Check 4: Quantity limit
  const maxQty = profile.restrictions?.max_preorder_quantity || FRAUD_THRESHOLDS.MAX_QUANTITY_PER_ORDER;
  const orderQty = orderData.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
  if (orderQty > maxQty) {
    violations.push('max_quantity');
  }

  // Check 5: Same lot limit
  if (lotOrderCount >= FRAUD_THRESHOLDS.MAX_PREORDERS_PER_LOT) {
    violations.push('max_per_lot');
  }

  // Check 6: Daily order limit
  const orderStats = profile.order_stats || {};
  if (orderStats.orders_30d / 30 > FRAUD_THRESHOLDS.MAX_ORDERS_PER_DAY) {
    violations.push('rapid_ordering');
  }

  return {
    allowed: violations.length === 0,
    violations,
    restrictions: profile.restrictions,
    risk_level: profile.risk_level,
    require_full_payment: profile.restrictions?.require_full_payment || false
  };
}

/**
 * Update order stats for profile (pure calculation)
 */
export function updateOrderStats(currentStats, isPreorder, orderAmount) {
  const stats = { ...currentStats };
  
  stats.total_orders = (stats.total_orders || 0) + 1;
  if (isPreorder) stats.total_preorders = (stats.total_preorders || 0) + 1;
  stats.orders_30d = (stats.orders_30d || 0) + 1;
  stats.total_spent = (stats.total_spent || 0) + orderAmount;

  return stats;
}

/**
 * Update preorder stats (pure calculation)
 */
export function updatePreOrderStats(currentStats, isPreorder) {
  if (!isPreorder) return currentStats;
  
  const stats = { ...currentStats };
  stats.active_preorders = (stats.active_preorders || 0) + 1;
  stats.pending_deposits = (stats.pending_deposits || 0) + 1;

  return stats;
}

/**
 * Update stats on cancel (pure calculation)
 */
export function updateStatsOnCancel(orderStats, preorderStats, isPreorder) {
  const newOrderStats = { ...orderStats };
  newOrderStats.cancelled_orders = (newOrderStats.cancelled_orders || 0) + 1;
  newOrderStats.cancels_30d = (newOrderStats.cancels_30d || 0) + 1;

  const newPreorderStats = { ...preorderStats };
  if (isPreorder) {
    newPreorderStats.cancelled_preorders = (newPreorderStats.cancelled_preorders || 0) + 1;
    newPreorderStats.active_preorders = Math.max(0, (newPreorderStats.active_preorders || 0) - 1);
    
    const totalPreorders = newPreorderStats.fulfilled_preorders + newPreorderStats.cancelled_preorders;
    if (totalPreorders > 0) {
      newPreorderStats.cancel_rate_preorder = Math.round(
        (newPreorderStats.cancelled_preorders / totalPreorders) * 100
      );
    }
  }

  return { orderStats: newOrderStats, preorderStats: newPreorderStats };
}

/**
 * Merge shipping address into list
 */
export function mergeShippingAddress(addresses, newAddress) {
  const list = [...addresses];
  const existing = list.find(a => a.address === newAddress);
  
  if (existing) {
    existing.times_used = (existing.times_used || 0) + 1;
  } else if (newAddress) {
    list.push({
      address: newAddress,
      times_used: 1,
      first_used: new Date().toISOString()
    });
  }

  return list;
}

/**
 * Merge device fingerprint into list
 */
export function mergeDeviceFingerprint(devices, fingerprint, deviceInfo) {
  const list = [...devices];
  const existing = list.find(d => d.fingerprint === fingerprint);
  
  if (existing) {
    existing.last_seen = new Date().toISOString();
  } else {
    list.push({
      fingerprint,
      first_seen: new Date().toISOString(),
      last_seen: new Date().toISOString(),
      device_info: deviceInfo
    });
  }

  return list;
}