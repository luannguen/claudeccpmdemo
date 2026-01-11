/**
 * AutoCompensationEngine - Legacy Adapter
 * 
 * ⚠️ DEPRECATED: Sử dụng @/components/features/preorder thay thế
 * 
 * @deprecated Use @/components/features/preorder instead
 */

import { base44 } from '@/api/base44Client';
import {
  COMPENSATION_RULES,
  calculateDelayDays,
  findDelayCompensationRule,
  calculateShortage,
  findShortageCompensationRule,
  calculateCompensationValue,
  generateVoucherCode,
  getVoucherExpiry
} from '@/components/features/preorder';
import {
  compensationRepository,
  walletRepository
} from '@/components/features/preorder/data';
import { walletRepository as escrowWalletRepo } from '@/components/features/preorder/data';

export async function checkDelayCompensation(orderId, lotId) {
  const orders = await base44.entities.Order.filter({ id: orderId });
  const order = orders[0];
  if (!order) return null;

  const existingComps = await compensationRepository.getCompensationsByTrigger(
    orderId,
    'delay_threshold'
  );

  const lots = await base44.entities.ProductLot.filter({ id: lotId });
  const lot = lots[0];
  if (!lot?.estimated_harvest_date) return null;

  const delayDays = calculateDelayDays(lot.estimated_harvest_date);
  if (delayDays <= 0) return null;

  const ruleResult = findDelayCompensationRule(delayDays, existingComps);
  if (!ruleResult) return null;

  const { name, rule } = ruleResult;
  const compensationValue = calculateCompensationValue(rule, order.total_amount);

  const compensation = await compensationRepository.createCompensation({
    order_id: orderId,
    order_number: order.order_number,
    customer_email: order.customer_email,
    customer_name: order.customer_name,
    lot_id: lotId,
    lot_name: lot.lot_name,
    trigger_type: 'delay_threshold',
    trigger_details: {
      days_delayed: delayDays,
      rule_id: name,
      rule_description: rule.description
    },
    compensation_type: rule.compensation_type,
    compensation_value: compensationValue,
    compensation_unit: rule.compensation_unit === 'percent' ? 'vnd' : rule.compensation_unit,
    status: 'pending',
    auto_approved: true,
    policy_reference: { rule_applied: name },
    notes: rule.description
  });

  await applyCompensation(compensation.id);
  return compensation;
}

export async function checkShortageCompensation(orderId, fulfillmentId) {
  const orders = await base44.entities.Order.filter({ id: orderId });
  const order = orders[0];
  if (!order) return null;

  const fulfillments = await base44.entities.FulfillmentRecord.filter({ id: fulfillmentId });
  const fulfillment = fulfillments[0];
  if (!fulfillment) return null;

  const totalOrdered = fulfillment.items.reduce((sum, item) => sum + item.ordered_quantity, 0);
  const totalReceived = fulfillment.items.reduce((sum, item) => sum + (item.received_quantity || item.shipped_quantity), 0);
  const shortagePercent = calculateShortage(totalOrdered, totalReceived);

  if (shortagePercent <= 0) return null;

  const ruleResult = findShortageCompensationRule(shortagePercent);
  if (!ruleResult) return null;

  const { name, rule } = ruleResult;
  const shortageValue = fulfillment.items.reduce((sum, item) => {
    const itemShortage = item.ordered_quantity - (item.received_quantity || item.shipped_quantity);
    return sum + (itemShortage * (item.unit_price || 0));
  }, 0);

  let compensationValue = rule.compensation_value || shortageValue;
  if (name === 'shortage_severe') {
    compensationValue = Math.round(shortageValue * 1.05);
  }

  const compensation = await compensationRepository.createCompensation({
    order_id: orderId,
    order_number: order.order_number,
    customer_email: order.customer_email,
    customer_name: order.customer_name,
    lot_id: fulfillment.lot_id,
    trigger_type: 'shortage_delivery',
    trigger_details: {
      shortage_quantity: totalOrdered - totalReceived,
      shortage_percent: shortagePercent,
      shortage_value: shortageValue,
      rule_id: name,
      rule_description: rule.description,
      fulfillment_id: fulfillmentId
    },
    compensation_type: rule.compensation_type,
    compensation_value: compensationValue,
    compensation_unit: rule.compensation_unit === 'points' ? 'points' : 'vnd',
    status: 'pending',
    auto_approved: rule.compensation_type === 'partial_refund',
    policy_reference: { rule_applied: name },
    notes: rule.description
  });

  if (compensation.auto_approved) {
    await applyCompensation(compensation.id);
  }

  return compensation;
}

export async function applyCompensation(compensationId) {
  const compensation = await compensationRepository.getCompensationById(compensationId);
  if (!compensation) throw new Error('Compensation not found');

  const result = {
    success: true,
    compensation_type: compensation.compensation_type,
    value: compensation.compensation_value
  };

  switch (compensation.compensation_type) {
    case 'voucher':
      const voucherCode = generateVoucherCode(compensation.order_id);
      const voucherExpiry = getVoucherExpiry();
      
      result.voucher_code = voucherCode;
      result.voucher_expiry = voucherExpiry;
      
      await compensationRepository.markCompensationApplied(compensationId, {
        voucher_code: voucherCode,
        voucher_expiry: voucherExpiry
      });
      break;

    case 'points':
      result.points_awarded = compensation.compensation_value;
      await compensationRepository.markCompensationApplied(compensationId, {
        points_awarded: compensation.compensation_value
      });
      break;

    case 'partial_refund':
    case 'discount_current_order':
      await compensationRepository.markCompensationApplied(compensationId);
      break;

    default:
      result.success = false;
      result.error = 'Unknown compensation type';
  }

  return result;
}

export async function getPendingCompensations() {
  return await compensationRepository.getPendingCompensations();
}

export async function approveCompensation(compensationId, approverEmail) {
  await compensationRepository.approveCompensation(compensationId, approverEmail);
  return await applyCompensation(compensationId);
}

export async function rejectCompensation(compensationId, approverEmail, reason) {
  return await compensationRepository.rejectCompensation(compensationId, approverEmail, reason);
}

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