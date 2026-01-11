/**
 * referralCore - Logic nghiệp vụ chung cho referral domain
 * Core Module - Không import service khác
 * 
 * Mục đích: Tách logic chung để các service khác import (tránh circular)
 */

import { base44 } from '@/api/base44Client';

// ========== CONSTANTS ==========

export const DEFAULT_COMMISSION_TIERS = [
  { min_revenue: 0, max_revenue: 10000000, rate: 1, label: '0 - 10 triệu' },
  { min_revenue: 10000000, max_revenue: 50000000, rate: 2, label: '10 - 50 triệu' },
  { min_revenue: 50000000, max_revenue: null, rate: 3, label: '> 50 triệu' }
];

// ========== CODE GENERATION ==========

export function generateReferralCode(name) {
  const prefix = name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 3) || 'REF';
  
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${random}`;
}

// ========== VALIDATION ==========

export async function validateReferralCode(code) {
  if (!code || code.length < 4) {
    return { valid: false, error: 'Mã giới thiệu không hợp lệ' };
  }
  
  const members = await base44.entities.ReferralMember.filter({ 
    referral_code: code.toUpperCase(),
    status: 'active'
  });
  
  if (members.length === 0) {
    return { valid: false, error: 'Mã giới thiệu không tồn tại hoặc đã bị vô hiệu' };
  }
  
  return { valid: true, referrer: members[0] };
}

// ========== COMMISSION CALCULATION ==========

export function getCommissionRate(monthlyRevenue, tiers = DEFAULT_COMMISSION_TIERS) {
  for (const tier of tiers) {
    const maxRevenue = tier.max_revenue || Infinity;
    if (monthlyRevenue >= tier.min_revenue && monthlyRevenue < maxRevenue) {
      return { rate: tier.rate, label: tier.label };
    }
  }
  const lastTier = tiers[tiers.length - 1];
  return { rate: lastTier.rate, label: lastTier.label };
}

export async function calculateOrderCommission(order, referrer, settings) {
  if (!referrer || referrer.status !== 'active') {
    return null;
  }
  
  // Priority 1: Custom rate
  if (referrer.custom_rate_enabled && referrer.custom_commission_rate != null) {
    const commissionAmount = Math.round(order.total_amount * referrer.custom_commission_rate / 100);
    
    return {
      commission_rate: referrer.custom_commission_rate,
      commission_tier: 'Custom Rate',
      commission_amount: commissionAmount,
      order_amount: order.total_amount,
      current_month_revenue: 0,
      is_custom_rate: true
    };
  }
  
  // Priority 2: Tier + Rank bonus
  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthlyEvents = await base44.entities.ReferralEvent.filter({
    referrer_id: referrer.id,
    period_month: currentMonth,
    status: 'calculated'
  });
  
  const currentMonthRevenue = monthlyEvents.reduce((sum, e) => sum + (e.order_amount || 0), 0);
  const newTotalRevenue = currentMonthRevenue + order.total_amount;
  
  const tiers = settings.commission_tiers || DEFAULT_COMMISSION_TIERS;
  const { rate, label } = getCommissionRate(newTotalRevenue, tiers);
  
  const bonusRate = referrer.seeder_rank_bonus || 0;
  const totalRate = rate + bonusRate;
  const commissionAmount = Math.round(order.total_amount * totalRate / 100);
  
  return {
    commission_rate: totalRate,
    commission_tier: label,
    commission_amount: commissionAmount,
    order_amount: order.total_amount,
    current_month_revenue: newTotalRevenue,
    is_custom_rate: false
  };
}

// ========== FRAUD DETECTION ==========

export async function checkFraudRules(order, referrer, rules = {}) {
  const flags = [];
  
  if (rules.same_address_threshold) {
    const sameAddressCustomers = await base44.entities.Customer.filter({
      referrer_id: referrer.id,
      address: order.shipping_address
    });
    if (sameAddressCustomers.length >= rules.same_address_threshold) {
      flags.push(`Trùng địa chỉ với ${sameAddressCustomers.length} khách hàng khác`);
    }
  }
  
  if (rules.same_phone_threshold) {
    const samePhoneOrders = await base44.entities.Order.filter({
      referrer_id: referrer.id,
      customer_phone: order.customer_phone
    });
    if (samePhoneOrders.length >= rules.same_phone_threshold) {
      flags.push(`SĐT đã đặt ${samePhoneOrders.length} đơn từ cùng người giới thiệu`);
    }
  }
  
  if (rules.cod_non_delivery_limit && order.payment_method === 'cod') {
    const cancelledCOD = await base44.entities.Order.filter({
      referrer_id: referrer.id,
      customer_email: order.customer_email,
      payment_method: 'cod',
      order_status: 'cancelled'
    });
    if (cancelledCOD.length >= rules.cod_non_delivery_limit) {
      flags.push(`Khách hàng đã hủy ${cancelledCOD.length} đơn COD`);
    }
  }
  
  if (flags.length > 0) {
    const currentScore = referrer.fraud_score || 0;
    const newScore = Math.min(100, currentScore + flags.length * 15);
    
    await base44.entities.ReferralMember.update(referrer.id, {
      fraud_score: newScore,
      fraud_flags: [...(referrer.fraud_flags || []), ...flags]
    });
    
    return { suspect: true, reason: flags.join('; ') };
  }
  
  return { suspect: false, reason: null };
}

// ========== AUDIT LOG ==========

export async function createAuditLog(data) {
  try {
    const user = await base44.auth.me().catch(() => null);
    
    return await base44.entities.ReferralAuditLog.create({
      ...data,
      actor_email: data.actor_email || user?.email || 'system',
      actor_role: data.actor_role || (user?.role === 'admin' ? 'admin' : 'user')
    });
  } catch (error) {
    console.error('Error creating audit log:', error);
    return null;
  }
}

export default {
  DEFAULT_COMMISSION_TIERS,
  generateReferralCode,
  validateReferralCode,
  getCommissionRate,
  calculateOrderCommission,
  checkFraudRules,
  createAuditLog
};