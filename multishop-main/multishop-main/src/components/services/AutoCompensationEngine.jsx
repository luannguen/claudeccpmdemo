/**
 * AutoCompensationEngine.js - Tự động bồi thường theo rule
 * Service Layer
 * 
 * Triggers:
 * - Delay > X days: voucher/points
 * - Shortage delivery: auto refund phần thiếu
 * - Quality auto-detect: discount
 */

import { base44 } from '@/api/base44Client';
import { escrowCore } from './escrowCore';

// ========== COMPENSATION RULES ==========

const COMPENSATION_RULES = {
  // Delay compensation - theo số ngày trễ
  delay_7_days: {
    trigger: (delayDays) => delayDays >= 7 && delayDays < 14,
    compensation_type: 'voucher',
    compensation_value: 5, // 5% discount voucher
    compensation_unit: 'percent',
    description: 'Voucher giảm 5% do giao trễ 7+ ngày'
  },
  delay_14_days: {
    trigger: (delayDays) => delayDays >= 14 && delayDays < 21,
    compensation_type: 'voucher',
    compensation_value: 10,
    compensation_unit: 'percent',
    description: 'Voucher giảm 10% do giao trễ 14+ ngày'
  },
  delay_21_days: {
    trigger: (delayDays) => delayDays >= 21 && delayDays < 30,
    compensation_type: 'discount_current_order',
    compensation_value: 15,
    compensation_unit: 'percent',
    description: 'Giảm 15% đơn hiện tại do giao trễ 21+ ngày'
  },
  delay_30_days: {
    trigger: (delayDays) => delayDays >= 30,
    compensation_type: 'partial_refund',
    compensation_value: 20,
    compensation_unit: 'percent',
    description: 'Hoàn 20% do giao trễ 30+ ngày (hoặc full refund nếu khách yêu cầu)'
  },

  // Shortage compensation
  shortage_minor: {
    trigger: (shortagePercent) => shortagePercent > 0 && shortagePercent <= 10,
    compensation_type: 'points',
    compensation_value: 200,
    compensation_unit: 'points',
    description: 'Cộng 200 điểm do thiếu hàng nhẹ'
  },
  shortage_moderate: {
    trigger: (shortagePercent) => shortagePercent > 10 && shortagePercent <= 30,
    compensation_type: 'partial_refund',
    compensation_value: null, // Calculate based on shortage
    compensation_unit: 'vnd',
    description: 'Hoàn tiền phần thiếu'
  },
  shortage_severe: {
    trigger: (shortagePercent) => shortagePercent > 30,
    compensation_type: 'partial_refund',
    compensation_value: null,
    compensation_unit: 'vnd',
    description: 'Hoàn tiền phần thiếu + bonus 5%'
  }
};

// ========== MAIN FUNCTIONS ==========

/**
 * Check và tạo auto-compensation cho delay
 */
export async function checkDelayCompensation(orderId, lotId) {
  const orders = await base44.entities.Order.filter({ id: orderId });
  const order = orders[0];
  if (!order) return null;

  // Check if already compensated for delay
  const existingComps = await base44.entities.AutoCompensation.filter({
    order_id: orderId,
    trigger_type: 'delay_threshold'
  });
  
  // Get lot info
  const lots = await base44.entities.ProductLot.filter({ id: lotId });
  const lot = lots[0];
  if (!lot?.estimated_harvest_date) return null;

  // Calculate delay days
  const harvestDate = new Date(lot.estimated_harvest_date);
  const today = new Date();
  const delayDays = Math.floor((today - harvestDate) / (1000 * 60 * 60 * 24));

  if (delayDays <= 0) return null; // Not delayed yet

  // Find applicable rule
  let applicableRule = null;
  let ruleName = null;

  for (const [name, rule] of Object.entries(COMPENSATION_RULES)) {
    if (name.startsWith('delay_') && rule.trigger(delayDays)) {
      // Check if this tier already compensated
      const alreadyApplied = existingComps.some(c => 
        c.trigger_details?.rule_id === name
      );
      
      if (!alreadyApplied) {
        applicableRule = rule;
        ruleName = name;
      }
    }
  }

  if (!applicableRule) return null;

  // Calculate compensation value
  let compensationValue = applicableRule.compensation_value;
  if (applicableRule.compensation_unit === 'percent') {
    compensationValue = Math.round(order.total_amount * (applicableRule.compensation_value / 100));
  }

  // Create auto compensation
  const compensation = await base44.entities.AutoCompensation.create({
    order_id: orderId,
    order_number: order.order_number,
    customer_email: order.customer_email,
    customer_name: order.customer_name,
    lot_id: lotId,
    lot_name: lot.lot_name,
    trigger_type: 'delay_threshold',
    trigger_details: {
      days_delayed: delayDays,
      rule_id: ruleName,
      rule_description: applicableRule.description
    },
    compensation_type: applicableRule.compensation_type,
    compensation_value: compensationValue,
    compensation_unit: applicableRule.compensation_unit === 'percent' ? 'vnd' : applicableRule.compensation_unit,
    status: 'pending',
    auto_approved: true,
    policy_reference: {
      rule_applied: ruleName
    },
    notes: applicableRule.description
  });

  // Auto-apply compensation
  await applyCompensation(compensation.id);

  return compensation;
}

/**
 * Check và tạo auto-compensation cho shortage
 */
export async function checkShortageCompensation(orderId, fulfillmentId) {
  const orders = await base44.entities.Order.filter({ id: orderId });
  const order = orders[0];
  if (!order) return null;

  const fulfillments = await base44.entities.FulfillmentRecord.filter({ id: fulfillmentId });
  const fulfillment = fulfillments[0];
  if (!fulfillment) return null;

  // Calculate shortage
  const totalOrdered = fulfillment.items.reduce((sum, item) => sum + item.ordered_quantity, 0);
  const totalReceived = fulfillment.items.reduce((sum, item) => sum + (item.received_quantity || item.shipped_quantity), 0);
  const shortage = totalOrdered - totalReceived;
  const shortagePercent = (shortage / totalOrdered) * 100;

  if (shortage <= 0) return null; // No shortage

  // Find applicable rule
  let applicableRule = null;
  let ruleName = null;

  for (const [name, rule] of Object.entries(COMPENSATION_RULES)) {
    if (name.startsWith('shortage_') && rule.trigger(shortagePercent)) {
      applicableRule = rule;
      ruleName = name;
      break;
    }
  }

  if (!applicableRule) return null;

  // Calculate shortage value
  const shortageValue = fulfillment.items.reduce((sum, item) => {
    const itemShortage = item.ordered_quantity - (item.received_quantity || item.shipped_quantity);
    return sum + (itemShortage * (item.unit_price || 0));
  }, 0);

  let compensationValue = applicableRule.compensation_value || shortageValue;
  
  // Add bonus for severe shortage
  if (ruleName === 'shortage_severe') {
    compensationValue = Math.round(shortageValue * 1.05); // +5% bonus
  }

  // Create auto compensation
  const compensation = await base44.entities.AutoCompensation.create({
    order_id: orderId,
    order_number: order.order_number,
    customer_email: order.customer_email,
    customer_name: order.customer_name,
    lot_id: fulfillment.lot_id,
    trigger_type: 'shortage_delivery',
    trigger_details: {
      shortage_quantity: shortage,
      shortage_percent: shortagePercent,
      shortage_value: shortageValue,
      rule_id: ruleName,
      rule_description: applicableRule.description,
      fulfillment_id: fulfillmentId
    },
    compensation_type: applicableRule.compensation_type,
    compensation_value: compensationValue,
    compensation_unit: applicableRule.compensation_unit === 'points' ? 'points' : 'vnd',
    status: 'pending',
    auto_approved: applicableRule.compensation_type === 'partial_refund',
    policy_reference: {
      rule_applied: ruleName
    },
    notes: applicableRule.description
  });

  // Auto-apply if auto_approved
  if (compensation.auto_approved) {
    await applyCompensation(compensation.id);
  }

  return compensation;
}

/**
 * Apply compensation - thực hiện bồi thường
 */
export async function applyCompensation(compensationId) {
  const comps = await base44.entities.AutoCompensation.filter({ id: compensationId });
  const compensation = comps[0];
  if (!compensation) throw new Error('Compensation not found');

  const result = {
    success: true,
    compensation_type: compensation.compensation_type,
    value: compensation.compensation_value
  };

  switch (compensation.compensation_type) {
    case 'voucher':
      // Generate voucher code
      const voucherCode = `COMP${compensation.order_id.slice(-4).toUpperCase()}${Date.now().toString(36).toUpperCase()}`;
      result.voucher_code = voucherCode;
      result.voucher_expiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days
      
      await base44.entities.AutoCompensation.update(compensationId, {
        voucher_code: voucherCode,
        voucher_expiry: result.voucher_expiry,
        status: 'applied',
        applied_at: new Date().toISOString()
      });
      break;

    case 'points':
      result.points_awarded = compensation.compensation_value;
      // Would integrate with LoyaltyAccount here
      await base44.entities.AutoCompensation.update(compensationId, {
        points_awarded: compensation.compensation_value,
        status: 'applied',
        applied_at: new Date().toISOString()
      });
      break;

    case 'partial_refund':
    case 'discount_current_order':
      // Get wallet and process refund
      const wallet = await escrowCore.getWalletByOrderId(compensation.order_id);
      if (wallet) {
        await escrowCore.processRefund(
          wallet.id,
          compensation.compensation_value,
          'compensation',
          {
            reason: compensation.notes,
            auto_rule: compensation.trigger_details?.rule_id
          }
        );
      }
      
      await base44.entities.AutoCompensation.update(compensationId, {
        status: 'applied',
        applied_at: new Date().toISOString()
      });
      break;

    default:
      result.success = false;
      result.error = 'Unknown compensation type';
  }

  // Send notification to customer
  if (result.success) {
    await base44.entities.AutoCompensation.update(compensationId, {
      notification_sent: true,
      notification_date: new Date().toISOString()
    });
  }

  return result;
}

/**
 * Get pending compensations for admin review
 */
export async function getPendingCompensations() {
  return await base44.entities.AutoCompensation.filter(
    { status: 'pending', auto_approved: false },
    '-created_date'
  );
}

/**
 * Approve pending compensation
 */
export async function approveCompensation(compensationId, approverEmail) {
  await base44.entities.AutoCompensation.update(compensationId, {
    status: 'approved',
    approved_by: approverEmail
  });

  return await applyCompensation(compensationId);
}

/**
 * Reject pending compensation
 */
export async function rejectCompensation(compensationId, approverEmail, reason) {
  await base44.entities.AutoCompensation.update(compensationId, {
    status: 'rejected',
    approved_by: approverEmail,
    notes: `Rejected: ${reason}`
  });

  return { success: true };
}

// ========== EXPORTS ==========

export const AutoCompensationEngine = {
  COMPENSATION_RULES,
  checkDelayCompensation,
  checkShortageCompensation,
  applyCompensation,
  getPendingCompensations,
  approveCompensation,
  rejectCompensation
};

export default AutoCompensationEngine;