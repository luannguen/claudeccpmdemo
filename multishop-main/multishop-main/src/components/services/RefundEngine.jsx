/**
 * RefundEngine.js - Auto-refund engine theo policy triggers
 * Service Layer
 * 
 * Tự động xử lý hoàn tiền theo các rule:
 * - Customer cancel theo tier
 * - Seller cancel → 100%
 * - Delay > X days → compensation
 * - Quality issue → full/partial refund
 */

import { base44 } from '@/api/base44Client';
import { escrowCore, REFUND_TYPE } from './escrowCore';
import { eventBus } from '@/components/shared/events';
import { EMAIL_EVENT_TYPES } from '@/components/features/email/types/EventPayloads';

// ========== REFUND REASON CODES ==========

export const REASON_CODE = {
  // Cancel tiers
  CANCEL_TIER_1: 'CANCEL_TIER_1',
  CANCEL_TIER_2: 'CANCEL_TIER_2',
  CANCEL_TIER_3: 'CANCEL_TIER_3',
  CANCEL_TIER_4: 'CANCEL_TIER_4',
  
  // Seller actions
  SELLER_CANCEL: 'SELLER_CANCEL',
  
  // Delays
  DELAY_OVER_7D: 'DELAY_OVER_7D',
  DELAY_OVER_14D: 'DELAY_OVER_14D',
  DELAY_OVER_30D: 'DELAY_OVER_30D',
  
  // Issues
  QUALITY_REJECT: 'QUALITY_REJECT',
  SHORTAGE_PARTIAL: 'SHORTAGE_PARTIAL',
  WRONG_ITEM: 'WRONG_ITEM',
  DAMAGE_TRANSIT: 'DAMAGE_TRANSIT',
  
  // Admin
  ADMIN_GOODWILL: 'ADMIN_GOODWILL'
};

// ========== AUTO-REFUND RULES ==========

const AUTO_REFUND_RULES = {
  // Seller cancel → 100% refund, auto-approved
  seller_cancel: {
    trigger: (order) => order.cancellation_source === 'seller',
    refund_percentage: 100,
    auto_approve: true,
    reason_code: REASON_CODE.SELLER_CANCEL,
    sla_hours: 24
  },
  
  // Delay > 30 days → full refund option
  delay_over_30_days: {
    trigger: (order, lot) => {
      if (!lot?.estimated_harvest_date) return false;
      const harvestDate = new Date(lot.estimated_harvest_date);
      const today = new Date();
      const daysDiff = Math.floor((today - harvestDate) / (1000 * 60 * 60 * 24));
      return daysDiff > 30 && order.order_status !== 'delivered';
    },
    refund_percentage: 100,
    auto_approve: true,
    reason_code: REASON_CODE.DELAY_OVER_30D,
    sla_hours: 48
  },
  
  // Quality issue with evidence → full refund
  quality_issue_verified: {
    trigger: (order, lot, dispute) => 
      dispute?.dispute_type === 'quality_issue' && 
      dispute?.evidence_photos?.length >= 2,
    refund_percentage: 100,
    auto_approve: false, // Cần review
    reason_code: REASON_CODE.QUALITY_REJECT,
    sla_hours: 72
  },
  
  // Shortage delivery → partial refund for missing
  shortage_delivery: {
    trigger: (order, lot, dispute, fulfillment) =>
      fulfillment?.total_items_remaining > 0 &&
      fulfillment?.remaining_action === 'refund_remaining',
    calculate_amount: (order, fulfillment) => {
      const unitPrice = order.items?.[0]?.unit_price || 0;
      return fulfillment.total_items_remaining * unitPrice;
    },
    auto_approve: true,
    reason_code: REASON_CODE.SHORTAGE_PARTIAL,
    sla_hours: 24
  }
};

// ========== REFUND REQUEST CREATION ==========

/**
 * Tạo refund request
 */
export async function createRefundRequest({
  orderId,
  walletId,
  refundType,
  originalAmount,
  refundAmount,
  refundPercentage,
  reasonCode,
  reasonDetail,
  disputeId = null,
  evidenceUrls = [],
  triggerSource = 'customer_request',
  policyApplied = null,
  autoApproved = false
}) {
  // Get order info
  const orders = await base44.entities.Order.filter({ id: orderId });
  const order = orders[0];
  
  if (!order) throw new Error('Order not found');

  const refundRequest = {
    wallet_id: walletId,
    order_id: orderId,
    order_number: order.order_number,
    customer_email: order.customer_email,
    customer_name: order.customer_name,
    customer_phone: order.customer_phone,
    refund_type: refundType,
    trigger_source: triggerSource,
    original_amount: originalAmount,
    refund_amount: refundAmount,
    penalty_amount: originalAmount - refundAmount,
    refund_percentage: refundPercentage,
    policy_applied: policyApplied,
    dispute_id: disputeId,
    reason_code: reasonCode,
    reason_detail: reasonDetail,
    evidence_urls: evidenceUrls,
    refund_method: 'original_payment',
    status: autoApproved ? 'approved' : 'pending_review',
    auto_approved: autoApproved,
    sla_deadline: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(), // 72h default
    timeline: [{
      status: 'created',
      timestamp: new Date().toISOString(),
      actor: 'system',
      note: `Yêu cầu hoàn tiền được tạo - ${reasonCode}`
    }]
  };

  if (autoApproved) {
    refundRequest.reviewed_date = new Date().toISOString();
    refundRequest.review_note = 'Tự động duyệt theo policy';
    refundRequest.timeline.push({
      status: 'approved',
      timestamp: new Date().toISOString(),
      actor: 'system',
      note: 'Auto-approved theo rule'
    });
  }

  const created = await base44.entities.RefundRequest.create(refundRequest);
  
  // 📧 Publish REFUND_REQUESTED event
  eventBus.publish(EMAIL_EVENT_TYPES.REFUND_REQUESTED, {
    orderId: orderId,
    order: order,
    reason: reasonDetail,
    amount: refundAmount
  });
  
  // If auto-approved, process immediately
  if (autoApproved && walletId) {
    await processApprovedRefund(created.id);
  }

  return created;
}

/**
 * Process approved refund - thực hiện hoàn tiền
 */
export async function processApprovedRefund(refundRequestId) {
  const requests = await base44.entities.RefundRequest.filter({ id: refundRequestId });
  const request = requests[0];
  
  if (!request) throw new Error('Refund request not found');
  if (request.status !== 'approved') throw new Error('Refund not approved yet');

  // Update status to processing
  await base44.entities.RefundRequest.update(refundRequestId, {
    status: 'processing',
    timeline: [
      ...request.timeline,
      {
        status: 'processing',
        timestamp: new Date().toISOString(),
        actor: 'system',
        note: 'Đang xử lý hoàn tiền'
      }
    ]
  });

  // Process via escrow
  if (request.wallet_id) {
    const result = await escrowCore.processRefund(
      request.wallet_id,
      request.refund_amount,
      request.refund_type,
      {
        refund_request_id: refundRequestId,
        reason: request.reason_detail,
        auto_rule: request.auto_approved ? request.reason_code : null
      }
    );

    if (result.success) {
      await base44.entities.RefundRequest.update(refundRequestId, {
        status: 'completed',
        processed_date: new Date().toISOString(),
        timeline: [
          ...request.timeline,
          {
            status: 'completed',
            timestamp: new Date().toISOString(),
            actor: 'system',
            note: `Đã hoàn ${request.refund_amount.toLocaleString()}đ`
          }
        ]
      });

      // 📧 Publish REFUND_SUCCEEDED event
      eventBus.publish(EMAIL_EVENT_TYPES.REFUND_SUCCEEDED, {
        orderId: request.order_id,
        order: {
          id: request.order_id,
          order_number: request.order_number,
          customer_email: request.customer_email,
          customer_name: request.customer_name
        },
        amount: request.refund_amount,
        transactionId: result.transaction_id || `REF-${refundRequestId}`,
        refundDate: new Date().toISOString()
      });

      return { success: true, refund_amount: request.refund_amount };
    }
  }

  return { success: false, error: 'Failed to process refund' };
}

/**
 * Check và trigger auto-refund rules
 */
export async function checkAutoRefundTriggers(orderId, lotId = null, disputeId = null) {
  const triggeredRules = [];

  // Get order
  const orders = await base44.entities.Order.filter({ id: orderId });
  const order = orders[0];
  if (!order) return triggeredRules;

  // Get lot if preorder
  let lot = null;
  if (lotId) {
    const lots = await base44.entities.ProductLot.filter({ id: lotId });
    lot = lots[0];
  }

  // Get dispute if any
  let dispute = null;
  if (disputeId) {
    const disputes = await base44.entities.DisputeTicket.filter({ id: disputeId });
    dispute = disputes[0];
  }

  // Get latest fulfillment
  const fulfillments = await base44.entities.FulfillmentRecord.filter(
    { order_id: orderId },
    '-created_date',
    1
  );
  const fulfillment = fulfillments[0];

  // Check each rule
  for (const [ruleName, rule] of Object.entries(AUTO_REFUND_RULES)) {
    if (rule.trigger(order, lot, dispute, fulfillment)) {
      triggeredRules.push({
        rule_name: ruleName,
        reason_code: rule.reason_code,
        refund_percentage: rule.refund_percentage,
        auto_approve: rule.auto_approve,
        sla_hours: rule.sla_hours,
        calculate_amount: rule.calculate_amount 
          ? rule.calculate_amount(order, fulfillment)
          : null
      });
    }
  }

  return triggeredRules;
}

/**
 * Process customer cancellation với policy
 */
export async function processCustomerCancellation(orderId, policy, daysBeforeHarvest, reasons = []) {
  const orders = await base44.entities.Order.filter({ id: orderId });
  const order = orders[0];
  if (!order) throw new Error('Order not found');

  const depositAmount = order.deposit_amount || order.total_amount;
  
  // Calculate refund theo policy
  const refundCalc = escrowCore.calculateRefundAmount(
    depositAmount,
    policy,
    daysBeforeHarvest,
    'customer_cancel'
  );

  // Get wallet
  const wallet = await escrowCore.getWalletByOrderId(orderId);

  // Create refund request
  const refundRequest = await createRefundRequest({
    orderId,
    walletId: wallet?.id,
    refundType: REFUND_TYPE.CUSTOMER_CANCEL,
    originalAmount: depositAmount,
    refundAmount: refundCalc.refund_amount,
    refundPercentage: refundCalc.refund_percentage,
    reasonCode: `CANCEL_${refundCalc.tier.toUpperCase()}`,
    reasonDetail: `Khách hủy đơn - ${reasons.join(', ')}`,
    triggerSource: 'customer_request',
    policyApplied: {
      policy_id: policy?.id,
      policy_version: policy?.version,
      tier: refundCalc.tier,
      rule_description: `Hoàn ${refundCalc.refund_percentage}% - ${refundCalc.tier}`
    },
    autoApproved: refundCalc.tier === 'tier_1' // Tier 1 auto approve
  });

  // Create PreOrderCancellation record
  await base44.entities.PreOrderCancellation.create({
    order_id: orderId,
    order_number: order.order_number,
    customer_email: order.customer_email,
    customer_name: order.customer_name,
    customer_phone: order.customer_phone,
    lot_id: order.items?.[0]?.lot_id,
    lot_name: order.items?.[0]?.product_name,
    cancellation_date: new Date().toISOString(),
    days_before_harvest: daysBeforeHarvest,
    policy_tier: refundCalc.tier,
    original_deposit: depositAmount,
    refund_percentage: refundCalc.refund_percentage,
    refund_amount: refundCalc.refund_amount,
    penalty_amount: refundCalc.penalty_amount,
    cancellation_reasons: reasons,
    refund_status: refundRequest.auto_approved ? 'processing' : 'pending'
  });

  return {
    success: true,
    refund_request_id: refundRequest.id,
    refund_amount: refundCalc.refund_amount,
    penalty_amount: refundCalc.penalty_amount,
    tier: refundCalc.tier,
    auto_approved: refundRequest.auto_approved
  };
}

// ========== EXPORTS ==========

export const RefundEngine = {
  REASON_CODE,
  AUTO_REFUND_RULES,
  createRefundRequest,
  processApprovedRefund,
  checkAutoRefundTriggers,
  processCustomerCancellation
};

export default RefundEngine;