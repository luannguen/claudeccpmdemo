/**
 * proofPackGenerator - Proof pack data assembly
 * Domain Layer - Pure business logic
 * 
 * Part of PreOrder Module
 */

// ========== TIMELINE BUILDER ==========

/**
 * Build comprehensive timeline from all order events
 */
export function buildTimelineEvents(order, transactions, fulfillments, disputes, refunds, cancellations) {
  const events = [];

  // Order created
  events.push({
    event_type: 'order_created',
    status: 'pending',
    timestamp: order.created_date,
    actor: order.customer_email,
    description: 'Đơn hàng được tạo',
    metadata: { total: order.total_amount }
  });

  // Payment events
  transactions.forEach(t => {
    events.push({
      event_type: `payment_${t.transaction_type}`,
      status: t.status,
      timestamp: t.created_date,
      actor: t.initiated_by,
      description: t.reason,
      metadata: { amount: t.amount }
    });
  });

  // Fulfillment events
  fulfillments.forEach(f => {
    if (f.shipped_date) {
      events.push({
        event_type: 'shipped',
        status: 'shipped',
        timestamp: f.shipped_date,
        actor: 'system',
        description: `Đợt giao ${f.sequence}: ${f.total_items_shipped} sản phẩm`,
        metadata: { tracking: f.tracking_number }
      });
    }
    if (f.delivered_date) {
      events.push({
        event_type: 'delivered',
        status: 'delivered',
        timestamp: f.delivered_date,
        actor: 'system',
        description: `Đã giao đợt ${f.sequence}`,
        metadata: {}
      });
    }
  });

  // Dispute events
  disputes.forEach(d => {
    events.push({
      event_type: 'dispute_opened',
      status: d.status,
      timestamp: d.created_date,
      actor: d.customer_email,
      description: `Dispute: ${d.dispute_type}`,
      metadata: { ticket: d.ticket_number }
    });
    if (d.resolved_date) {
      events.push({
        event_type: 'dispute_resolved',
        status: 'resolved',
        timestamp: d.resolved_date,
        actor: d.assigned_to || 'system',
        description: `Đã giải quyết: ${d.resolution_applied?.type}`,
        metadata: {}
      });
    }
  });

  // Refund events
  refunds.forEach(r => {
    events.push({
      event_type: 'refund_requested',
      status: r.status,
      timestamp: r.created_date,
      actor: r.trigger_source,
      description: `Yêu cầu hoàn ${r.refund_amount.toLocaleString()}đ`,
      metadata: { reason: r.reason_code }
    });
    if (r.processed_date) {
      events.push({
        event_type: 'refund_completed',
        status: 'completed',
        timestamp: r.processed_date,
        actor: 'system',
        description: `Đã hoàn ${r.refund_amount.toLocaleString()}đ`,
        metadata: {}
      });
    }
  });

  // Cancellation events
  cancellations.forEach(c => {
    events.push({
      event_type: 'order_cancelled',
      status: 'cancelled',
      timestamp: c.cancellation_date,
      actor: c.customer_email,
      description: `Hủy đơn - ${c.cancellation_reasons?.join(', ')}`,
      metadata: { tier: c.policy_tier, refund: c.refund_amount }
    });
  });

  // Sort by timestamp
  events.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  return events;
}

// ========== POLICY SNAPSHOT ==========

/**
 * Create policy snapshot for proof pack
 */
export function createPolicySnapshot(policy) {
  if (!policy) return null;
  
  return {
    policy_id: policy.id,
    policy_name: policy.name,
    policy_version: policy.version,
    effective_date: policy.effective_date,
    deposit_rules: policy.deposit_rules,
    cancellation_rules: policy.cancellation_rules,
    refund_rules: policy.refund_rules,
    delay_compensation: policy.delay_compensation,
    quality_guarantee: policy.quality_guarantee,
    risk_disclosure: policy.risk_disclosure,
    full_content_markdown: policy.full_content
  };
}

// ========== QC RECORDS ==========

/**
 * Extract QC records from fulfillments
 */
export function extractQCRecords(fulfillments) {
  return fulfillments
    .filter(f => f.qc_inspection?.inspected)
    .map(f => ({
      inspection_date: f.qc_inspection.inspected_at,
      inspector: f.qc_inspection.inspector,
      stage: 'pre_ship',
      passed: f.qc_inspection.passed,
      photos: f.qc_inspection.photos || [],
      notes: f.qc_inspection.notes
    }));
}

// ========== FULFILLMENT RECORDS ==========

/**
 * Summarize fulfillment records
 */
export function summarizeFulfillments(fulfillments) {
  return fulfillments.map(f => ({
    fulfillment_id: f.id,
    sequence: f.sequence,
    shipped_date: f.shipped_date,
    delivered_date: f.delivered_date,
    items_shipped: f.total_items_shipped,
    tracking_number: f.tracking_number
  }));
}

// ========== DISPUTE & REFUND RECORDS ==========

/**
 * Summarize dispute records
 */
export function summarizeDisputes(disputes) {
  return disputes.map(d => ({
    dispute_id: d.id,
    type: d.dispute_type,
    status: d.status,
    resolution: d.resolution_applied?.type,
    resolved_date: d.resolved_date
  }));
}

/**
 * Summarize refund records
 */
export function summarizeRefunds(refunds) {
  return refunds.map(r => ({
    refund_id: r.id,
    type: r.refund_type,
    amount: r.refund_amount,
    status: r.status,
    processed_date: r.processed_date
  }));
}

// ========== FINANCIAL SUMMARY ==========

/**
 * Calculate financial summary
 */
export function calculateFinancialSummary(order, refunds, transactions) {
  const totalPaid = (order.deposit_amount || 0) + 
    (order.payment_status === 'paid' ? (order.remaining_amount || 0) : 0);
  
  const totalRefunded = refunds
    .filter(r => r.status === 'completed')
    .reduce((sum, r) => sum + r.refund_amount, 0);

  return {
    total_paid: totalPaid,
    deposit_paid: order.deposit_amount || 0,
    final_paid: order.payment_status === 'paid' ? (order.remaining_amount || 0) : 0,
    total_refunded: totalRefunded,
    net_amount: totalPaid - totalRefunded,
    payment_transactions: transactions.map(t => ({
      type: t.transaction_type,
      amount: t.amount,
      date: t.created_date,
      status: t.status
    }))
  };
}

// ========== PROOF PACK ASSEMBLY ==========

/**
 * Assemble complete proof pack data
 */
export function assembleProofPackData(order, lot, policy, wallet, transactions, fulfillments, disputes, refunds, cancellations) {
  return {
    order_id: order.id,
    order_number: order.order_number,
    customer_email: order.customer_email,
    customer_name: order.customer_name,
    lot_id: lot?.id,
    lot_name: lot?.lot_name,
    pack_type: order.has_preorder_items ? 'preorder' : 'regular',
    
    policy_snapshot: createPolicySnapshot(policy),

    customer_acknowledgement: order.policy_acknowledgement || {
      acknowledged_at: order.created_date,
      checkbox_states: {
        understood_risks: true,
        agreed_cancellation: true,
        agreed_deposit: true
      }
    },

    order_snapshot: {
      order_date: order.created_date,
      items: order.items,
      total_amount: order.total_amount,
      deposit_amount: order.deposit_amount,
      payment_method: order.payment_method,
      shipping_address: order.shipping_address
    },

    timeline_events: buildTimelineEvents(order, transactions, fulfillments, disputes, refunds, cancellations),
    notifications_sent: [],
    chat_log: { has_chat: false, messages_count: 0, export_url: null },
    qc_records: extractQCRecords(fulfillments),
    fulfillment_records: summarizeFulfillments(fulfillments),
    dispute_records: summarizeDisputes(disputes),
    refund_records: summarizeRefunds(refunds),
    financial_summary: calculateFinancialSummary(order, refunds, transactions),

    generated_at: new Date().toISOString(),
    generated_by: 'system',
    is_finalized: ['delivered', 'cancelled', 'returned_refunded'].includes(order.order_status)
  };
}

// ========== CSV EXPORT ==========

/**
 * Build reconciliation export data
 */
export function buildReconciliationData(orders, refunds) {
  const exportData = orders.map(order => {
    const orderRefunds = refunds.filter(r => r.order_id === order.id);
    const totalRefunded = orderRefunds
      .filter(r => r.status === 'completed')
      .reduce((sum, r) => sum + r.refund_amount, 0);

    return {
      order_number: order.order_number,
      order_date: order.created_date,
      customer_name: order.customer_name,
      customer_email: order.customer_email,
      customer_phone: order.customer_phone,
      product_name: order.items?.[0]?.product_name || '',
      lot_id: order.items?.[0]?.lot_id || '',
      quantity: order.items?.reduce((sum, i) => sum + i.quantity, 0) || 0,
      total_amount: order.total_amount,
      deposit_amount: order.deposit_amount || 0,
      deposit_status: order.deposit_status,
      remaining_amount: order.remaining_amount || 0,
      payment_status: order.payment_status,
      order_status: order.order_status,
      refunded_amount: totalRefunded,
      net_amount: (order.deposit_amount || 0) + 
        (order.payment_status === 'paid' ? (order.remaining_amount || 0) : 0) - 
        totalRefunded,
      delivery_date: order.delivery_date || '',
      estimated_harvest: order.items?.[0]?.estimated_harvest_date || ''
    };
  });

  return {
    data: exportData,
    summary: {
      total_orders: exportData.length,
      total_order_value: exportData.reduce((sum, d) => sum + d.total_amount, 0),
      total_deposit_collected: exportData.reduce((sum, d) => sum + d.deposit_amount, 0),
      total_refunded: exportData.reduce((sum, d) => sum + d.refunded_amount, 0),
      total_net: exportData.reduce((sum, d) => sum + d.net_amount, 0)
    },
    generated_at: new Date().toISOString()
  };
}

/**
 * Convert export data to CSV string
 */
export function convertToCSV(exportData) {
  const headers = [
    'Mã đơn', 'Ngày đặt', 'Tên KH', 'Email', 'SĐT',
    'Sản phẩm', 'Lot ID', 'SL', 'Tổng tiền', 'Tiền cọc',
    'TT cọc', 'Còn lại', 'TT thanh toán', 'TT đơn',
    'Đã hoàn', 'Ròng', 'Ngày giao', 'Dự kiến thu hoạch'
  ];

  const rows = exportData.data.map(d => [
    d.order_number, d.order_date, d.customer_name, d.customer_email, d.customer_phone,
    d.product_name, d.lot_id, d.quantity, d.total_amount, d.deposit_amount,
    d.deposit_status, d.remaining_amount, d.payment_status, d.order_status,
    d.refunded_amount, d.net_amount, d.delivery_date, d.estimated_harvest
  ]);

  const csv = [
    headers.join(','),
    ...rows.map(r => r.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  return csv;
}