/**
 * riskRepository - Customer risk profile data access
 * Data Layer
 * 
 * Part of PreOrder Module
 */

import { base44 } from '@/api/base44Client';
import {
  calculateRiskScore,
  determineRiskLevel,
  calculateTrustScore,
  determineTrustTier,
  determineRestrictions,
  updateOrderStats,
  updatePreOrderStats,
  updateStatsOnCancel,
  mergeShippingAddress,
  mergeDeviceFingerprint,
  RISK_LEVEL,
  TRUST_TIER
} from '../domain/fraudDetector';

// ========== CRUD ==========

/**
 * Get risk profile by email
 */
export async function getRiskProfileByEmail(customerEmail) {
  const profiles = await base44.entities.CustomerRiskProfile.filter({ customer_email: customerEmail });
  return profiles[0] || null;
}

/**
 * Create new risk profile
 */
export async function createRiskProfile(customerEmail, customerName = '', customerPhone = '') {
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
 * Get or create profile
 */
export async function getOrCreateRiskProfile(customerEmail, customerName = '', customerPhone = '') {
  let profile = await getRiskProfileByEmail(customerEmail);
  if (!profile) {
    profile = await createRiskProfile(customerEmail, customerName, customerPhone);
  }
  return profile;
}

/**
 * Update risk profile
 */
export async function updateRiskProfile(profileId, data) {
  return await base44.entities.CustomerRiskProfile.update(profileId, data);
}

// ========== PROFILE UPDATES ==========

/**
 * Update profile on new order
 */
export async function updateProfileOnOrder(customerEmail, orderData, isPreorder = false) {
  const profile = await getOrCreateRiskProfile(customerEmail, orderData.customer_name, orderData.customer_phone);

  // Calculate new stats
  const newOrderStats = updateOrderStats(profile.order_stats, isPreorder, orderData.total_amount);
  const newPreorderStats = updatePreOrderStats(profile.preorder_stats, isPreorder);
  const newAddresses = mergeShippingAddress(profile.shipping_addresses || [], orderData.shipping_address);

  await updateRiskProfile(profile.id, {
    order_stats: newOrderStats,
    preorder_stats: newPreorderStats,
    shipping_addresses: newAddresses,
    last_activity: new Date().toISOString()
  });

  // Recalculate risk
  return await recalculateRisk(profile.id);
}

/**
 * Update profile on cancellation
 */
export async function updateProfileOnCancel(customerEmail, isPreorder = false) {
  const profile = await getRiskProfileByEmail(customerEmail);
  if (!profile) return null;

  const { orderStats, preorderStats } = updateStatsOnCancel(
    profile.order_stats,
    profile.preorder_stats,
    isPreorder
  );

  await updateRiskProfile(profile.id, {
    order_stats: orderStats,
    preorder_stats: preorderStats
  });

  return await recalculateRisk(profile.id);
}

/**
 * Record device fingerprint
 */
export async function recordDevice(customerEmail, fingerprint, deviceInfo = '') {
  const profile = await getRiskProfileByEmail(customerEmail);
  if (!profile) return null;

  const newDevices = mergeDeviceFingerprint(profile.device_fingerprints || [], fingerprint, deviceInfo);

  await updateRiskProfile(profile.id, {
    device_fingerprints: newDevices
  });

  return profile;
}

// ========== RISK RECALCULATION ==========

/**
 * Recalculate risk score and update profile
 */
export async function recalculateRisk(profileId) {
  const profiles = await base44.entities.CustomerRiskProfile.filter({ id: profileId });
  const profile = profiles[0];
  if (!profile) return null;

  // Calculate using domain logic
  const { riskScore, riskFactors, riskFlags } = calculateRiskScore(profile);
  const riskLevel = determineRiskLevel(riskScore);
  const trustScore = calculateTrustScore(riskScore, profile.order_stats?.completed_orders || 0);
  const trustTier = determineTrustTier(profile.order_stats?.completed_orders || 0, trustScore);
  const restrictions = determineRestrictions(riskLevel);

  // Update profile
  await updateRiskProfile(profileId, {
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

// ========== BLACKLIST ==========

/**
 * Blacklist customer
 */
export async function blacklistCustomer(customerEmail, reason, adminEmail) {
  const profile = await getRiskProfileByEmail(customerEmail);
  if (!profile) return null;

  await updateRiskProfile(profile.id, {
    is_blacklisted: true,
    blacklist_reason: reason,
    blacklisted_at: new Date().toISOString(),
    blacklisted_by: adminEmail,
    notes: [
      ...(profile.notes || []),
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
  const profile = await getRiskProfileByEmail(customerEmail);
  if (!profile) return null;

  await updateRiskProfile(profile.id, {
    is_blacklisted: false,
    blacklist_reason: null,
    notes: [
      ...(profile.notes || []),
      {
        note: `Removed from blacklist: ${reason}`,
        author: adminEmail,
        timestamp: new Date().toISOString()
      }
    ]
  });

  return { success: true };
}

// ========== ORDER VALIDATION ==========

/**
 * Get lot order count for customer
 */
export async function getLotOrderCount(customerEmail, lotId) {
  const orders = await base44.entities.Order.filter({
    customer_email: customerEmail,
    'items.lot_id': lotId
  });
  return orders.length;
}