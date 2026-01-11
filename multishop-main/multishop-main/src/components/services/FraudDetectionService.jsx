/**
 * FraudDetectionService.js - Anti-scalping & Risk detection
 * Service Layer
 * 
 * Features:
 * - Order limit per user/device/address
 * - Pattern detection: bulk order then cancel
 * - Risk scoring
 * - Blacklist management
 */

import { base44 } from '@/api/base44Client';

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

// ========== THRESHOLDS ==========

const THRESHOLDS = {
  // Order limits
  MAX_PREORDERS_PER_LOT: 3,
  MAX_ACTIVE_PREORDERS: 10,
  MAX_ORDERS_PER_DAY: 5,
  MAX_QUANTITY_PER_ORDER: 50,
  
  // Risk triggers
  CANCEL_RATE_HIGH: 30, // %
  CANCEL_RATE_CRITICAL: 50, // %
  DISPUTES_HIGH: 3,
  REFUNDS_HIGH: 5,
  DEVICES_SUSPICIOUS: 3,
  ADDRESSES_SUSPICIOUS: 5,
  RAPID_ORDERS_MINUTES: 30,
  
  // Trust requirements
  ORDERS_FOR_BASIC: 3,
  ORDERS_FOR_TRUSTED: 10,
  ORDERS_FOR_VIP: 25
};

// ========== RISK PROFILE MANAGEMENT ==========

/**
 * Get or create customer risk profile
 */
export async function getOrCreateRiskProfile(customerEmail, customerName = '', customerPhone = '') {
  const profiles = await base44.entities.CustomerRiskProfile.filter({ customer_email: customerEmail });
  
  if (profiles.length > 0) {
    return profiles[0];
  }

  // Create new profile
  return await base44.entities.CustomerRiskProfile.create({
    customer_email: customerEmail,
    customer_name: customerName,
    customer_phone: customerPhone,
    device_fingerprints: [],
    ip_addresses: [],
    shipping_addresses: [],
    order_stats: {
      total_orders: 0,
      total_preorders: 0,
      completed_orders: 0,
      cancelled_orders: 0,
      orders_30d: 0,
      cancels_30d: 0,
      disputes_opened: 0,
      refunds_requested: 0,
      total_spent: 0,
      total_refunded: 0
    },
    preorder_stats: {
      active_preorders: 0,
      pending_deposits: 0,
      deposit_paid_orders: 0,
      fulfilled_preorders: 0,
      cancelled_preorders: 0,
      cancel_rate_preorder: 0
    },
    risk_score: 0,
    risk_level: RISK_LEVEL.LOW,
    risk_flags: [],
    risk_factors: [],
    is_blacklisted: false,
    restrictions: {},
    trust_score: 50,
    trust_tier: TRUST_TIER.NEW,
    positive_signals: []
  });
}

/**
 * Update risk profile with new order data
 */
export async function updateRiskProfileOnOrder(customerEmail, orderData, isPreorder = false) {
  const profile = await getOrCreateRiskProfile(customerEmail, orderData.customer_name, orderData.customer_phone);

  // Update order stats
  const orderStats = profile.order_stats || {};
  orderStats.total_orders = (orderStats.total_orders || 0) + 1;
  if (isPreorder) {
    orderStats.total_preorders = (orderStats.total_preorders || 0) + 1;
  }
  orderStats.orders_30d = (orderStats.orders_30d || 0) + 1;
  orderStats.total_spent = (orderStats.total_spent || 0) + (orderData.total_amount || 0);

  // Update preorder stats
  const preorderStats = profile.preorder_stats || {};
  if (isPreorder) {
    preorderStats.active_preorders = (preorderStats.active_preorders || 0) + 1;
    preorderStats.pending_deposits = (preorderStats.pending_deposits || 0) + 1;
  }

  // Update shipping addresses
  const addresses = profile.shipping_addresses || [];
  const existingAddr = addresses.find(a => a.address === orderData.shipping_address);
  if (existingAddr) {
    existingAddr.times_used = (existingAddr.times_used || 0) + 1;
  } else if (orderData.shipping_address) {
    addresses.push({
      address: orderData.shipping_address,
      times_used: 1,
      first_used: new Date().toISOString()
    });
  }

  await base44.entities.CustomerRiskProfile.update(profile.id, {
    order_stats: orderStats,
    preorder_stats: preorderStats,
    shipping_addresses: addresses,
    last_activity: new Date().toISOString()
  });

  // Recalculate risk score
  await calculateRiskScore(profile.id);

  return profile;
}

/**
 * Update risk profile on cancellation
 */
export async function updateRiskProfileOnCancel(customerEmail, isPreorder = false) {
  const profiles = await base44.entities.CustomerRiskProfile.filter({ customer_email: customerEmail });
  if (profiles.length === 0) return;

  const profile = profiles[0];
  const orderStats = profile.order_stats || {};
  orderStats.cancelled_orders = (orderStats.cancelled_orders || 0) + 1;
  orderStats.cancels_30d = (orderStats.cancels_30d || 0) + 1;

  const preorderStats = profile.preorder_stats || {};
  if (isPreorder) {
    preorderStats.cancelled_preorders = (preorderStats.cancelled_preorders || 0) + 1;
    preorderStats.active_preorders = Math.max(0, (preorderStats.active_preorders || 0) - 1);
    
    // Calculate cancel rate
    const totalPreorders = preorderStats.fulfilled_preorders + preorderStats.cancelled_preorders;
    if (totalPreorders > 0) {
      preorderStats.cancel_rate_preorder = Math.round(
        (preorderStats.cancelled_preorders / totalPreorders) * 100
      );
    }
  }

  await base44.entities.CustomerRiskProfile.update(profile.id, {
    order_stats: orderStats,
    preorder_stats: preorderStats
  });

  // Recalculate risk
  await calculateRiskScore(profile.id);
}

/**
 * Record device fingerprint
 */
export async function recordDeviceFingerprint(customerEmail, fingerprint, deviceInfo = '') {
  const profiles = await base44.entities.CustomerRiskProfile.filter({ customer_email: customerEmail });
  if (profiles.length === 0) return;

  const profile = profiles[0];
  const devices = profile.device_fingerprints || [];
  
  const existing = devices.find(d => d.fingerprint === fingerprint);
  if (existing) {
    existing.last_seen = new Date().toISOString();
  } else {
    devices.push({
      fingerprint,
      first_seen: new Date().toISOString(),
      last_seen: new Date().toISOString(),
      device_info: deviceInfo
    });
  }

  await base44.entities.CustomerRiskProfile.update(profile.id, {
    device_fingerprints: devices
  });

  // Check for multi-device flag
  if (devices.length >= THRESHOLDS.DEVICES_SUSPICIOUS) {
    await addRiskFlag(profile.id, RISK_FLAGS.MULTI_DEVICE, 'Nhiều thiết bị khác nhau');
  }
}

// ========== RISK CALCULATION ==========

/**
 * Calculate comprehensive risk score
 */
export async function calculateRiskScore(profileId) {
  const profiles = await base44.entities.CustomerRiskProfile.filter({ id: profileId });
  if (profiles.length === 0) return;

  const profile = profiles[0];
  const orderStats = profile.order_stats || {};
  const preorderStats = profile.preorder_stats || {};
  
  let riskScore = 0;
  const riskFactors = [];
  const riskFlags = [];

  // Factor 1: Cancel rate (max 30 points)
  const cancelRate = orderStats.total_orders > 0 
    ? (orderStats.cancelled_orders / orderStats.total_orders) * 100 
    : 0;
  
  if (cancelRate >= THRESHOLDS.CANCEL_RATE_CRITICAL) {
    riskScore += 30;
    riskFlags.push(RISK_FLAGS.HIGH_CANCEL_RATE);
    riskFactors.push({
      factor: 'cancel_rate',
      weight: 30,
      description: `Tỉ lệ hủy đơn: ${cancelRate.toFixed(1)}%`
    });
  } else if (cancelRate >= THRESHOLDS.CANCEL_RATE_HIGH) {
    riskScore += 15;
    riskFactors.push({
      factor: 'cancel_rate',
      weight: 15,
      description: `Tỉ lệ hủy đơn: ${cancelRate.toFixed(1)}%`
    });
  }

  // Factor 2: Disputes (max 20 points)
  if (orderStats.disputes_opened >= THRESHOLDS.DISPUTES_HIGH) {
    riskScore += 20;
    riskFlags.push(RISK_FLAGS.DISPUTE_ABUSE);
    riskFactors.push({
      factor: 'disputes',
      weight: 20,
      description: `Số disputes: ${orderStats.disputes_opened}`
    });
  }

  // Factor 3: Refunds (max 15 points)
  if (orderStats.refunds_requested >= THRESHOLDS.REFUNDS_HIGH) {
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
  if (deviceCount >= THRESHOLDS.DEVICES_SUSPICIOUS) {
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
  if (addressCount >= THRESHOLDS.ADDRESSES_SUSPICIOUS) {
    riskScore += 10;
    riskFlags.push(RISK_FLAGS.MULTI_ADDRESS);
    riskFactors.push({
      factor: 'multi_address',
      weight: 10,
      description: `Số địa chỉ: ${addressCount}`
    });
  }

  // Factor 6: Preorder cancel rate (max 15 points)
  if (preorderStats.cancel_rate_preorder >= THRESHOLDS.CANCEL_RATE_HIGH) {
    riskScore += 15;
    riskFlags.push(RISK_FLAGS.BULK_THEN_CANCEL);
    riskFactors.push({
      factor: 'preorder_cancel',
      weight: 15,
      description: `Tỉ lệ hủy preorder: ${preorderStats.cancel_rate_preorder}%`
    });
  }

  // Determine risk level
  let riskLevel = RISK_LEVEL.LOW;
  if (riskScore >= 60) {
    riskLevel = RISK_LEVEL.CRITICAL;
  } else if (riskScore >= 40) {
    riskLevel = RISK_LEVEL.HIGH;
  } else if (riskScore >= 20) {
    riskLevel = RISK_LEVEL.MEDIUM;
  }

  // Calculate trust score (inverse of risk)
  let trustScore = Math.max(0, 100 - riskScore);
  
  // Boost trust for completed orders
  if (orderStats.completed_orders >= THRESHOLDS.ORDERS_FOR_VIP) {
    trustScore = Math.min(100, trustScore + 20);
  } else if (orderStats.completed_orders >= THRESHOLDS.ORDERS_FOR_TRUSTED) {
    trustScore = Math.min(100, trustScore + 10);
  }

  // Determine trust tier
  let trustTier = TRUST_TIER.NEW;
  if (orderStats.completed_orders >= THRESHOLDS.ORDERS_FOR_VIP && trustScore >= 80) {
    trustTier = TRUST_TIER.VIP;
  } else if (orderStats.completed_orders >= THRESHOLDS.ORDERS_FOR_TRUSTED && trustScore >= 60) {
    trustTier = TRUST_TIER.TRUSTED;
  } else if (orderStats.completed_orders >= THRESHOLDS.ORDERS_FOR_BASIC && trustScore >= 40) {
    trustTier = TRUST_TIER.BASIC;
  }

  // Determine restrictions
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

  // Update profile
  await base44.entities.CustomerRiskProfile.update(profileId, {
    risk_score: riskScore,
    risk_level: riskLevel,
    risk_flags: riskFlags,
    risk_factors: riskFactors,
    trust_score: trustScore,
    trust_tier: trustTier,
    restrictions,
    risk_updated_at: new Date().toISOString()
  });

  return {
    risk_score: riskScore,
    risk_level: riskLevel,
    trust_score: trustScore,
    trust_tier: trustTier,
    restrictions
  };
}

// ========== ORDER VALIDATION ==========

/**
 * Validate order against fraud rules
 */
export async function validateOrder(customerEmail, orderData, lotId = null) {
  const profile = await getOrCreateRiskProfile(customerEmail);
  const violations = [];

  // Check 1: Blacklist
  if (profile.is_blacklisted) {
    return {
      allowed: false,
      reason: 'Tài khoản bị hạn chế',
      violations: ['blacklisted']
    };
  }

  // Check 2: Manual approval required
  if (profile.restrictions?.require_manual_approval) {
    violations.push('require_approval');
  }

  // Check 3: Active preorders limit
  const preorderStats = profile.preorder_stats || {};
  const maxActive = profile.restrictions?.max_active_preorders || THRESHOLDS.MAX_ACTIVE_PREORDERS;
  if (preorderStats.active_preorders >= maxActive) {
    violations.push('max_active_preorders');
  }

  // Check 4: Quantity limit
  const maxQty = profile.restrictions?.max_preorder_quantity || THRESHOLDS.MAX_QUANTITY_PER_ORDER;
  const orderQty = orderData.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
  if (orderQty > maxQty) {
    violations.push('max_quantity');
  }

  // Check 5: Same lot limit (anti-scalping)
  if (lotId) {
    const recentOrders = await base44.entities.Order.filter({
      customer_email: customerEmail,
      'items.lot_id': lotId
    });
    if (recentOrders.length >= THRESHOLDS.MAX_PREORDERS_PER_LOT) {
      violations.push('max_per_lot');
    }
  }

  // Check 6: Daily order limit
  const orderStats = profile.order_stats || {};
  if (orderStats.orders_30d / 30 > THRESHOLDS.MAX_ORDERS_PER_DAY) {
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
 * Add risk flag to profile
 */
async function addRiskFlag(profileId, flag, description) {
  const profiles = await base44.entities.CustomerRiskProfile.filter({ id: profileId });
  if (profiles.length === 0) return;

  const profile = profiles[0];
  const flags = profile.risk_flags || [];
  
  if (!flags.includes(flag)) {
    flags.push(flag);
    
    const factors = profile.risk_factors || [];
    factors.push({
      factor: flag,
      weight: 5,
      description,
      detected_at: new Date().toISOString()
    });

    await base44.entities.CustomerRiskProfile.update(profileId, {
      risk_flags: flags,
      risk_factors: factors
    });
  }
}

/**
 * Blacklist customer
 */
export async function blacklistCustomer(customerEmail, reason, adminEmail) {
  const profiles = await base44.entities.CustomerRiskProfile.filter({ customer_email: customerEmail });
  if (profiles.length === 0) return;

  await base44.entities.CustomerRiskProfile.update(profiles[0].id, {
    is_blacklisted: true,
    blacklist_reason: reason,
    blacklisted_at: new Date().toISOString(),
    blacklisted_by: adminEmail,
    notes: [
      ...(profiles[0].notes || []),
      {
        note: `Blacklisted: ${reason}`,
        author: adminEmail,
        timestamp: new Date().toISOString()
      }
    ]
  });

  return { success: true };
}

/**
 * Remove from blacklist
 */
export async function removeBlacklist(customerEmail, adminEmail, reason) {
  const profiles = await base44.entities.CustomerRiskProfile.filter({ customer_email: customerEmail });
  if (profiles.length === 0) return;

  await base44.entities.CustomerRiskProfile.update(profiles[0].id, {
    is_blacklisted: false,
    blacklist_reason: null,
    notes: [
      ...(profiles[0].notes || []),
      {
        note: `Removed from blacklist: ${reason}`,
        author: adminEmail,
        timestamp: new Date().toISOString()
      }
    ]
  });

  return { success: true };
}

// ========== EXPORTS ==========

export const FraudDetectionService = {
  RISK_FLAGS,
  RISK_LEVEL,
  TRUST_TIER,
  THRESHOLDS,
  getOrCreateRiskProfile,
  updateRiskProfileOnOrder,
  updateRiskProfileOnCancel,
  recordDeviceFingerprint,
  calculateRiskScore,
  validateOrder,
  blacklistCustomer,
  removeBlacklist
};

export default FraudDetectionService;