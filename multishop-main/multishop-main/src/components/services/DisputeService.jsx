/**
 * DisputeService.js - Exception & Dispute handling
 * Service Layer
 * 
 * Quản lý ticket sự cố: trễ, thiếu hàng, hư hỏng, sai quy cách
 * Workflow: open → review → propose resolution → customer choose → resolve
 */

import { base44 } from '@/api/base44Client';
import { RefundEngine, REASON_CODE } from './RefundEngine';

// ========== CONSTANTS ==========

export const DISPUTE_TYPE = {
  DELIVERY_DELAY: 'delivery_delay',
  PARTIAL_DELIVERY: 'partial_delivery',
  QUALITY_ISSUE: 'quality_issue',
  WRONG_SPECIFICATION: 'wrong_specification',
  DAMAGED_GOODS: 'damaged_goods',
  MISSING_ITEMS: 'missing_items',
  NOT_AS_DESCRIBED: 'not_as_described',
  SELLER_NO_RESPONSE: 'seller_no_response',
  PAYMENT_ISSUE: 'payment_issue',
  OTHER: 'other'
};

export const DISPUTE_STATUS = {
  OPEN: 'open',
  UNDER_REVIEW: 'under_review',
  PENDING_CUSTOMER: 'pending_customer_response',
  PENDING_SELLER: 'pending_seller_response',
  RESOLUTION_PROPOSED: 'resolution_proposed',
  RESOLUTION_ACCEPTED: 'resolution_accepted',
  RESOLUTION_REJECTED: 'resolution_rejected',
  ESCALATED: 'escalated',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
  CANCELLED: 'cancelled'
};

export const RESOLUTION_TYPE = {
  FULL_REFUND: 'full_refund',
  PARTIAL_REFUND: 'partial_refund',
  SWAP_LOT: 'swap_lot',
  RESHIP: 'reship',
  VOUCHER: 'voucher',
  POINTS: 'points',
  DISCOUNT_NEXT_ORDER: 'discount_next_order',
  REPLACEMENT: 'replacement',
  NO_ACTION: 'no_action'
};

// ========== RESOLUTION TEMPLATES ==========

const RESOLUTION_TEMPLATES = {
  [DISPUTE_TYPE.DELIVERY_DELAY]: [
    { type: RESOLUTION_TYPE.VOUCHER, value_percent: 10, description: 'Voucher giảm 10% đơn tiếp theo' },
    { type: RESOLUTION_TYPE.POINTS, value: 500, description: 'Cộng 500 điểm loyalty' },
    { type: RESOLUTION_TYPE.FULL_REFUND, value_percent: 100, description: 'Hoàn tiền 100% nếu không muốn chờ' }
  ],
  [DISPUTE_TYPE.PARTIAL_DELIVERY]: [
    { type: RESOLUTION_TYPE.PARTIAL_REFUND, description: 'Hoàn tiền phần thiếu theo đơn giá' },
    { type: RESOLUTION_TYPE.RESHIP, description: 'Giao bổ sung phần thiếu trong đợt tiếp theo' },
    { type: RESOLUTION_TYPE.SWAP_LOT, description: 'Chuyển phần còn lại sang lot khác' }
  ],
  [DISPUTE_TYPE.QUALITY_ISSUE]: [
    { type: RESOLUTION_TYPE.FULL_REFUND, value_percent: 100, description: 'Hoàn tiền 100%' },
    { type: RESOLUTION_TYPE.REPLACEMENT, description: 'Đổi sản phẩm mới' },
    { type: RESOLUTION_TYPE.PARTIAL_REFUND, value_percent: 50, description: 'Hoàn 50% và giữ sản phẩm' }
  ],
  [DISPUTE_TYPE.DAMAGED_GOODS]: [
    { type: RESOLUTION_TYPE.FULL_REFUND, value_percent: 100, description: 'Hoàn tiền 100%' },
    { type: RESOLUTION_TYPE.REPLACEMENT, description: 'Giao lại sản phẩm mới' },
    { type: RESOLUTION_TYPE.PARTIAL_REFUND, value_percent: 30, description: 'Giảm 30% nếu vẫn sử dụng được' }
  ],
  [DISPUTE_TYPE.WRONG_SPECIFICATION]: [
    { type: RESOLUTION_TYPE.REPLACEMENT, description: 'Đổi đúng sản phẩm đã đặt' },
    { type: RESOLUTION_TYPE.FULL_REFUND, value_percent: 100, description: 'Hoàn tiền 100%' }
  ]
};

// ========== DISPUTE OPERATIONS ==========

/**
 * Tạo dispute ticket mới
 */
export async function createDispute({
  orderId,
  lotId,
  customerEmail,
  customerName,
  customerPhone,
  disputeType,
  description,
  evidencePhotos = [],
  evidenceVideos = [],
  affectedItems = []
}) {
  // Generate ticket number
  const ticketNumber = `DSP-${Date.now().toString(36).toUpperCase()}`;
  
  // Calculate severity
  const severity = calculateSeverity(disputeType, affectedItems);
  
  // Calculate SLA deadlines
  const slaResponseHours = severity === 'critical' ? 4 : severity === 'high' ? 12 : 24;
  const slaResolutionHours = severity === 'critical' ? 24 : severity === 'high' ? 48 : 72;
  
  // Get order info
  const orders = await base44.entities.Order.filter({ id: orderId });
  const order = orders[0];

  // Get wallet
  const wallets = await base44.entities.PaymentWallet.filter({ order_id: orderId });
  const wallet = wallets[0];

  const dispute = {
    ticket_number: ticketNumber,
    order_id: orderId,
    order_number: order?.order_number,
    lot_id: lotId,
    lot_name: order?.items?.[0]?.product_name,
    wallet_id: wallet?.id,
    customer_email: customerEmail,
    customer_name: customerName,
    customer_phone: customerPhone,
    dispute_type: disputeType,
    severity,
    priority: severity === 'critical' ? 1 : severity === 'high' ? 3 : 5,
    customer_description: description,
    evidence_photos: evidencePhotos,
    evidence_videos: evidenceVideos,
    affected_items: affectedItems,
    status: DISPUTE_STATUS.OPEN,
    resolution_options: [],
    sla_response_deadline: new Date(Date.now() + slaResponseHours * 60 * 60 * 1000).toISOString(),
    sla_resolution_deadline: new Date(Date.now() + slaResolutionHours * 60 * 60 * 1000).toISOString(),
    timeline: [{
      event: 'ticket_created',
      status: DISPUTE_STATUS.OPEN,
      timestamp: new Date().toISOString(),
      actor: customerEmail,
      note: 'Ticket được tạo bởi khách hàng'
    }],
    tags: [disputeType, severity]
  };

  // Hold wallet if exists
  if (wallet?.id) {
    await base44.entities.PaymentWallet.update(wallet.id, {
      status: 'disputed',
      hold_reason: `Dispute: ${ticketNumber}`
    });
  }

  return await base44.entities.DisputeTicket.create(dispute);
}

/**
 * Propose resolution options for a dispute
 */
export async function proposeResolutions(disputeId, adminEmail) {
  const disputes = await base44.entities.DisputeTicket.filter({ id: disputeId });
  const dispute = disputes[0];
  
  if (!dispute) throw new Error('Dispute not found');

  // Get template resolutions based on type
  const templates = RESOLUTION_TEMPLATES[dispute.dispute_type] || [];
  
  // Get order for value calculation
  const orders = await base44.entities.Order.filter({ id: dispute.order_id });
  const order = orders[0];
  const orderValue = order?.total_amount || 0;

  // Build resolution options
  const resolutionOptions = templates.map((template, index) => ({
    option_id: `opt_${index + 1}`,
    type: template.type,
    value: template.value || Math.round(orderValue * (template.value_percent || 0) / 100),
    description: template.description,
    is_recommended: index === 0 // First option is recommended
  }));

  // Add custom partial refund if applicable
  if (dispute.affected_items?.length > 0) {
    const affectedValue = dispute.affected_items.reduce((sum, item) => {
      return sum + ((item.ordered_quantity - (item.received_quantity || 0)) * (item.unit_price || 0));
    }, 0);

    if (affectedValue > 0) {
      resolutionOptions.push({
        option_id: `opt_partial_calc`,
        type: RESOLUTION_TYPE.PARTIAL_REFUND,
        value: affectedValue,
        description: `Hoàn tiền ${affectedValue.toLocaleString()}đ cho phần bị ảnh hưởng`,
        is_recommended: false
      });
    }
  }

  // Update dispute
  await base44.entities.DisputeTicket.update(disputeId, {
    status: DISPUTE_STATUS.RESOLUTION_PROPOSED,
    resolution_options: resolutionOptions,
    assigned_to: adminEmail,
    timeline: [
      ...dispute.timeline,
      {
        event: 'resolution_proposed',
        status: DISPUTE_STATUS.RESOLUTION_PROPOSED,
        timestamp: new Date().toISOString(),
        actor: adminEmail,
        note: `Đề xuất ${resolutionOptions.length} phương án giải quyết`
      }
    ]
  });

  return resolutionOptions;
}

/**
 * Customer chooses a resolution
 */
export async function selectResolution(disputeId, optionId, customerNote = '') {
  const disputes = await base44.entities.DisputeTicket.filter({ id: disputeId });
  const dispute = disputes[0];
  
  if (!dispute) throw new Error('Dispute not found');
  if (dispute.status !== DISPUTE_STATUS.RESOLUTION_PROPOSED) {
    throw new Error('Dispute not in resolution proposed status');
  }

  const selectedOption = dispute.resolution_options.find(o => o.option_id === optionId);
  if (!selectedOption) throw new Error('Invalid option');

  await base44.entities.DisputeTicket.update(disputeId, {
    status: DISPUTE_STATUS.RESOLUTION_ACCEPTED,
    customer_choice: {
      option_id: optionId,
      chosen_at: new Date().toISOString(),
      customer_note: customerNote
    },
    timeline: [
      ...dispute.timeline,
      {
        event: 'resolution_accepted',
        status: DISPUTE_STATUS.RESOLUTION_ACCEPTED,
        timestamp: new Date().toISOString(),
        actor: dispute.customer_email,
        note: `Khách chọn: ${selectedOption.description}`
      }
    ]
  });

  // Apply the resolution
  return await applyResolution(disputeId, selectedOption);
}

/**
 * Apply selected resolution
 */
async function applyResolution(disputeId, selectedOption) {
  const disputes = await base44.entities.DisputeTicket.filter({ id: disputeId });
  const dispute = disputes[0];
  
  const result = {
    success: true,
    resolution_type: selectedOption.type,
    value: selectedOption.value
  };

  switch (selectedOption.type) {
    case RESOLUTION_TYPE.FULL_REFUND:
    case RESOLUTION_TYPE.PARTIAL_REFUND:
      // Create refund request
      const refundRequest = await RefundEngine.createRefundRequest({
        orderId: dispute.order_id,
        walletId: dispute.wallet_id,
        refundType: selectedOption.type === RESOLUTION_TYPE.FULL_REFUND 
          ? 'quality_issue' 
          : 'shortage',
        originalAmount: dispute.order_value || selectedOption.value,
        refundAmount: selectedOption.value,
        refundPercentage: selectedOption.value_percent || 100,
        reasonCode: REASON_CODE.QUALITY_REJECT,
        reasonDetail: `Dispute resolution: ${selectedOption.description}`,
        disputeId,
        autoApproved: true
      });
      result.refund_request_id = refundRequest.id;
      break;

    case RESOLUTION_TYPE.VOUCHER:
      // Create voucher (simplified - would need Coupon entity integration)
      result.voucher_code = `DISPUTE${disputeId.slice(-6).toUpperCase()}`;
      result.voucher_value = selectedOption.value;
      break;

    case RESOLUTION_TYPE.POINTS:
      // Add loyalty points (would need LoyaltyAccount integration)
      result.points_added = selectedOption.value;
      break;

    case RESOLUTION_TYPE.SWAP_LOT:
      result.action_required = 'Admin needs to assign new lot';
      break;

    case RESOLUTION_TYPE.RESHIP:
      result.action_required = 'Schedule reshipment';
      break;
  }

  // Update dispute as resolved
  await base44.entities.DisputeTicket.update(disputeId, {
    status: DISPUTE_STATUS.RESOLVED,
    resolved_date: new Date().toISOString(),
    resolution_applied: {
      type: selectedOption.type,
      value: selectedOption.value,
      applied_at: new Date().toISOString(),
      refund_request_id: result.refund_request_id,
      voucher_code: result.voucher_code
    },
    timeline: [
      ...dispute.timeline,
      {
        event: 'resolved',
        status: DISPUTE_STATUS.RESOLVED,
        timestamp: new Date().toISOString(),
        actor: 'system',
        note: `Áp dụng: ${selectedOption.description}`
      }
    ]
  });

  // Release wallet hold
  if (dispute.wallet_id) {
    await base44.entities.PaymentWallet.update(dispute.wallet_id, {
      release_conditions: {
        ...dispute.release_conditions,
        dispute_resolved: true
      },
      hold_reason: null
    });
  }

  return result;
}

/**
 * Escalate dispute
 */
export async function escalateDispute(disputeId, escalatedTo, reason) {
  const disputes = await base44.entities.DisputeTicket.filter({ id: disputeId });
  const dispute = disputes[0];
  
  if (!dispute) throw new Error('Dispute not found');

  await base44.entities.DisputeTicket.update(disputeId, {
    status: DISPUTE_STATUS.ESCALATED,
    escalated_to: escalatedTo,
    escalation_reason: reason,
    priority: 1, // Highest priority
    timeline: [
      ...dispute.timeline,
      {
        event: 'escalated',
        status: DISPUTE_STATUS.ESCALATED,
        timestamp: new Date().toISOString(),
        actor: dispute.assigned_to,
        note: `Escalate to ${escalatedTo}: ${reason}`
      }
    ]
  });

  return { success: true };
}

/**
 * Add internal note to dispute
 */
export async function addInternalNote(disputeId, note, author) {
  const disputes = await base44.entities.DisputeTicket.filter({ id: disputeId });
  const dispute = disputes[0];
  
  if (!dispute) throw new Error('Dispute not found');

  const notes = dispute.internal_notes || [];
  notes.push({
    note,
    author,
    timestamp: new Date().toISOString()
  });

  await base44.entities.DisputeTicket.update(disputeId, {
    internal_notes: notes
  });

  return { success: true };
}

// ========== HELPERS ==========

function calculateSeverity(disputeType, affectedItems) {
  // Critical: damaged goods, payment issues
  if ([DISPUTE_TYPE.DAMAGED_GOODS, DISPUTE_TYPE.PAYMENT_ISSUE].includes(disputeType)) {
    return 'critical';
  }
  
  // High: quality issues, wrong items
  if ([DISPUTE_TYPE.QUALITY_ISSUE, DISPUTE_TYPE.WRONG_SPECIFICATION].includes(disputeType)) {
    return 'high';
  }
  
  // Medium: partial delivery, missing items
  if ([DISPUTE_TYPE.PARTIAL_DELIVERY, DISPUTE_TYPE.MISSING_ITEMS].includes(disputeType)) {
    return 'medium';
  }
  
  // Low: delays, not as described
  return 'low';
}

// ========== EXPORTS ==========

export const DisputeService = {
  DISPUTE_TYPE,
  DISPUTE_STATUS,
  RESOLUTION_TYPE,
  createDispute,
  proposeResolutions,
  selectResolution,
  escalateDispute,
  addInternalNote
};

export default DisputeService;