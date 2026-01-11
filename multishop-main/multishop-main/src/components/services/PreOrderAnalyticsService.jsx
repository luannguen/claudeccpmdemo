/**
 * PreOrderAnalyticsService.js - Analytics dashboard cho preorder
 * Service Layer
 * 
 * Features:
 * - Funnel metrics: view → cart → deposit → final → fulfilled
 * - Cancellation reasons breakdown
 * - Delay metrics by product/lot
 * - NPS/CSAT tracking
 * - Demand forecasting
 */

import { base44 } from '@/api/base44Client';

// ========== FUNNEL CALCULATION ==========

/**
 * Calculate funnel metrics for a period/lot
 */
export async function calculateFunnelMetrics(filters = {}) {
  const { lotId, preorderProductId, startDate, endDate } = filters;

  // Get orders with filters
  let orderFilter = { has_preorder_items: true };
  if (lotId) orderFilter['items.lot_id'] = lotId;
  
  const orders = await base44.entities.Order.filter(orderFilter);
  
  // Filter by date if needed
  const filteredOrders = orders.filter(order => {
    if (startDate && new Date(order.created_date) < new Date(startDate)) return false;
    if (endDate && new Date(order.created_date) > new Date(endDate)) return false;
    return true;
  });

  // Calculate funnel stages
  const funnel = {
    page_views: 0, // Would need tracking data
    unique_visitors: 0,
    add_to_cart: 0,
    checkout_initiated: filteredOrders.length,
    deposit_paid: filteredOrders.filter(o => 
      ['paid', 'deposit_paid'].includes(o.payment_status) || 
      o.deposit_status === 'paid'
    ).length,
    final_payment_paid: filteredOrders.filter(o => 
      o.payment_status === 'paid' && o.deposit_status === 'completed'
    ).length,
    fulfilled: filteredOrders.filter(o => 
      o.order_status === 'delivered'
    ).length,
    cancelled: filteredOrders.filter(o => 
      o.order_status === 'cancelled'
    ).length
  };

  // Calculate conversion rates
  const conversions = {
    view_to_cart: 0,
    cart_to_checkout: 0,
    checkout_to_deposit: funnel.checkout_initiated > 0 
      ? (funnel.deposit_paid / funnel.checkout_initiated * 100).toFixed(1) 
      : 0,
    deposit_to_final: funnel.deposit_paid > 0 
      ? (funnel.final_payment_paid / funnel.deposit_paid * 100).toFixed(1) 
      : 0,
    final_to_fulfilled: funnel.final_payment_paid > 0 
      ? (funnel.fulfilled / funnel.final_payment_paid * 100).toFixed(1) 
      : 0,
    overall_conversion: funnel.checkout_initiated > 0 
      ? (funnel.fulfilled / funnel.checkout_initiated * 100).toFixed(1) 
      : 0
  };

  return { funnel, conversions };
}

/**
 * Calculate revenue metrics
 */
export async function calculateRevenueMetrics(filters = {}) {
  const { lotId, startDate, endDate } = filters;

  let orderFilter = { has_preorder_items: true };
  if (lotId) orderFilter['items.lot_id'] = lotId;

  const orders = await base44.entities.Order.filter(orderFilter);
  
  const filteredOrders = orders.filter(order => {
    if (startDate && new Date(order.created_date) < new Date(startDate)) return false;
    if (endDate && new Date(order.created_date) > new Date(endDate)) return false;
    return true;
  });

  // Get refund data
  const refunds = await base44.entities.RefundRequest.filter({ status: 'completed' });
  const filteredRefunds = refunds.filter(r => 
    filteredOrders.some(o => o.id === r.order_id)
  );

  const totalOrderValue = filteredOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const totalDeposit = filteredOrders.reduce((sum, o) => sum + (o.deposit_amount || 0), 0);
  const totalFinal = filteredOrders
    .filter(o => o.payment_status === 'paid')
    .reduce((sum, o) => sum + (o.remaining_amount || 0), 0);
  const totalRefunded = filteredRefunds.reduce((sum, r) => sum + (r.refund_amount || 0), 0);

  return {
    total_order_value: totalOrderValue,
    total_deposit_collected: totalDeposit,
    total_final_payment: totalFinal,
    total_refunded: totalRefunded,
    net_revenue: totalDeposit + totalFinal - totalRefunded,
    average_order_value: filteredOrders.length > 0 
      ? Math.round(totalOrderValue / filteredOrders.length) 
      : 0,
    average_deposit: filteredOrders.length > 0 
      ? Math.round(totalDeposit / filteredOrders.length) 
      : 0,
    order_count: filteredOrders.length
  };
}

/**
 * Calculate cancellation metrics
 */
export async function calculateCancellationMetrics(filters = {}) {
  const { lotId, startDate, endDate } = filters;

  let cancelFilter = {};
  if (lotId) cancelFilter.lot_id = lotId;

  const cancellations = await base44.entities.PreOrderCancellation.filter(cancelFilter);
  
  const filtered = cancellations.filter(c => {
    if (startDate && new Date(c.cancellation_date) < new Date(startDate)) return false;
    if (endDate && new Date(c.cancellation_date) > new Date(endDate)) return false;
    return true;
  });

  // Reasons breakdown
  const reasonsBreakdown = {};
  filtered.forEach(c => {
    (c.cancellation_reasons || []).forEach(reason => {
      reasonsBreakdown[reason] = (reasonsBreakdown[reason] || 0) + 1;
    });
  });

  // Tier breakdown
  const tierBreakdown = {};
  filtered.forEach(c => {
    const tier = c.policy_tier || 'unknown';
    tierBreakdown[tier] = (tierBreakdown[tier] || 0) + 1;
  });

  const totalPenalty = filtered.reduce((sum, c) => sum + (c.penalty_amount || 0), 0);
  const totalRefund = filtered.reduce((sum, c) => sum + (c.refund_amount || 0), 0);

  // Calculate cancel rate
  let orderFilter = { has_preorder_items: true };
  if (lotId) orderFilter['items.lot_id'] = lotId;
  const totalOrders = await base44.entities.Order.filter(orderFilter);

  return {
    total_cancellations: filtered.length,
    cancel_rate: totalOrders.length > 0 
      ? (filtered.length / totalOrders.length * 100).toFixed(1) 
      : 0,
    reasons_breakdown: reasonsBreakdown,
    tier_breakdown: tierBreakdown,
    total_penalty_collected: totalPenalty,
    total_refund_paid: totalRefund
  };
}

/**
 * Calculate delivery metrics
 */
export async function calculateDeliveryMetrics(filters = {}) {
  const { lotId, startDate, endDate } = filters;

  let orderFilter = { has_preorder_items: true, order_status: 'delivered' };
  if (lotId) orderFilter['items.lot_id'] = lotId;

  const deliveredOrders = await base44.entities.Order.filter(orderFilter);
  
  const filtered = deliveredOrders.filter(o => {
    if (startDate && new Date(o.created_date) < new Date(startDate)) return false;
    if (endDate && new Date(o.created_date) > new Date(endDate)) return false;
    return true;
  });

  // Calculate delays
  let totalDelayDays = 0;
  let delayedCount = 0;
  let onTimeCount = 0;

  for (const order of filtered) {
    const estimatedDate = order.items?.[0]?.estimated_harvest_date;
    const deliveryDate = order.delivery_date;
    
    if (estimatedDate && deliveryDate) {
      const estimated = new Date(estimatedDate);
      const actual = new Date(deliveryDate);
      const delayDays = Math.floor((actual - estimated) / (1000 * 60 * 60 * 24));
      
      if (delayDays > 0) {
        delayedCount++;
        totalDelayDays += delayDays;
      } else {
        onTimeCount++;
      }
    }
  }

  // Get partial deliveries
  const fulfillments = await base44.entities.FulfillmentRecord.filter({
    fulfillment_type: 'partial'
  });
  const partialCount = fulfillments.filter(f => 
    filtered.some(o => o.id === f.order_id)
  ).length;

  return {
    total_delivered: filtered.length,
    on_time_delivery: onTimeCount,
    delayed_delivery: delayedCount,
    average_delay_days: delayedCount > 0 
      ? (totalDelayDays / delayedCount).toFixed(1) 
      : 0,
    partial_delivery: partialCount,
    delivery_success_rate: filtered.length > 0 
      ? (onTimeCount / filtered.length * 100).toFixed(1) 
      : 0
  };
}

/**
 * Calculate dispute metrics
 */
export async function calculateDisputeMetrics(filters = {}) {
  const { lotId, startDate, endDate } = filters;

  let disputeFilter = {};
  if (lotId) disputeFilter.lot_id = lotId;

  const disputes = await base44.entities.DisputeTicket.filter(disputeFilter);
  
  const filtered = disputes.filter(d => {
    if (startDate && new Date(d.created_date) < new Date(startDate)) return false;
    if (endDate && new Date(d.created_date) > new Date(endDate)) return false;
    return true;
  });

  // Type breakdown
  const typeBreakdown = {};
  filtered.forEach(d => {
    typeBreakdown[d.dispute_type] = (typeBreakdown[d.dispute_type] || 0) + 1;
  });

  // Resolution time
  const resolvedDisputes = filtered.filter(d => d.status === 'resolved' && d.resolved_date);
  let totalResolutionTime = 0;
  
  resolvedDisputes.forEach(d => {
    const created = new Date(d.created_date);
    const resolved = new Date(d.resolved_date);
    totalResolutionTime += (resolved - created) / (1000 * 60 * 60); // hours
  });

  // Customer satisfaction
  const withSatisfaction = filtered.filter(d => d.customer_satisfaction?.rating);
  const avgSatisfaction = withSatisfaction.length > 0
    ? withSatisfaction.reduce((sum, d) => sum + d.customer_satisfaction.rating, 0) / withSatisfaction.length
    : 0;

  // Calculate dispute rate
  let orderFilter = { has_preorder_items: true };
  if (lotId) orderFilter['items.lot_id'] = lotId;
  const totalOrders = await base44.entities.Order.filter(orderFilter);

  return {
    total_disputes: filtered.length,
    dispute_rate: totalOrders.length > 0 
      ? (filtered.length / totalOrders.length * 100).toFixed(1) 
      : 0,
    type_breakdown: typeBreakdown,
    resolved_count: resolvedDisputes.length,
    average_resolution_time_hours: resolvedDisputes.length > 0 
      ? (totalResolutionTime / resolvedDisputes.length).toFixed(1) 
      : 0,
    customer_satisfaction_avg: avgSatisfaction.toFixed(1)
  };
}

/**
 * Calculate demand forecast for a lot
 */
export async function calculateDemandForecast(lotId) {
  // Get lot info
  const lots = await base44.entities.ProductLot.filter({ id: lotId });
  const lot = lots[0];
  if (!lot) return null;

  // Get orders for this lot
  const orders = await base44.entities.Order.filter({
    'items.lot_id': lotId,
    order_status: { $ne: 'cancelled' }
  });

  // Calculate metrics
  const daysActive = Math.max(1, Math.floor(
    (new Date() - new Date(lot.created_date)) / (1000 * 60 * 60 * 24)
  ));
  
  const daysUntilHarvest = Math.max(0, Math.floor(
    (new Date(lot.estimated_harvest_date) - new Date()) / (1000 * 60 * 60 * 24)
  ));

  const currentSold = lot.sold_quantity || 0;
  const dailyRate = currentSold / daysActive;
  const predictedTotal = Math.round(currentSold + (dailyRate * daysUntilHarvest));
  
  // Determine trend
  const recentOrders = orders.filter(o => {
    const orderDate = new Date(o.created_date);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return orderDate > weekAgo;
  });
  
  const recentDailyRate = recentOrders.length / 7;
  let trend = 'stable';
  if (recentDailyRate > dailyRate * 1.2) trend = 'increasing';
  else if (recentDailyRate < dailyRate * 0.8) trend = 'decreasing';

  // Generate recommendations
  const recommendations = [];
  
  if (predictedTotal < lot.total_yield * 0.5) {
    recommendations.push({
      action: 'reduce_price',
      reason: 'Dự kiến chỉ bán được < 50% capacity',
      impact: 'Có thể tăng 20-30% đơn hàng'
    });
  }
  
  if (trend === 'decreasing' && daysUntilHarvest > 7) {
    recommendations.push({
      action: 'run_promotion',
      reason: 'Trend đang giảm',
      impact: 'Kích thích nhu cầu'
    });
  }
  
  if (predictedTotal > lot.total_yield * 0.9) {
    recommendations.push({
      action: 'increase_capacity',
      reason: 'Dự kiến gần hết capacity',
      impact: 'Mở thêm lot mới'
    });
  }

  return {
    current_sold: currentSold,
    daily_rate: dailyRate.toFixed(2),
    days_until_harvest: daysUntilHarvest,
    predicted_total_orders: predictedTotal,
    capacity: lot.total_yield,
    probability_min_qty_reached: Math.min(100, (predictedTotal / lot.total_yield * 100)).toFixed(1),
    trend,
    recommendations
  };
}

/**
 * Save analytics snapshot
 */
export async function saveAnalyticsSnapshot(periodType, filters = {}) {
  const [funnel, revenue, cancellation, delivery, dispute] = await Promise.all([
    calculateFunnelMetrics(filters),
    calculateRevenueMetrics(filters),
    calculateCancellationMetrics(filters),
    calculateDeliveryMetrics(filters),
    calculateDisputeMetrics(filters)
  ]);

  const demandForecast = filters.lotId 
    ? await calculateDemandForecast(filters.lotId) 
    : null;

  const analyticsRecord = {
    period_type: periodType,
    period_start: filters.startDate || new Date().toISOString().split('T')[0],
    period_end: filters.endDate || new Date().toISOString().split('T')[0],
    lot_id: filters.lotId,
    preorder_product_id: filters.preorderProductId,
    funnel_metrics: funnel.funnel,
    conversion_rates: funnel.conversions,
    revenue_metrics: revenue,
    cancellation_metrics: cancellation,
    delivery_metrics: delivery,
    dispute_metrics: dispute,
    demand_forecast: demandForecast,
    computed_at: new Date().toISOString()
  };

  return await base44.entities.PreOrderAnalytics.create(analyticsRecord);
}

/**
 * Get dashboard summary
 */
export async function getDashboardSummary(filters = {}) {
  const [funnel, revenue, cancellation, delivery, dispute] = await Promise.all([
    calculateFunnelMetrics(filters),
    calculateRevenueMetrics(filters),
    calculateCancellationMetrics(filters),
    calculateDeliveryMetrics(filters),
    calculateDisputeMetrics(filters)
  ]);

  return {
    funnel: funnel.funnel,
    conversions: funnel.conversions,
    revenue: revenue,
    cancellation: cancellation,
    delivery: delivery,
    dispute: dispute,
    computed_at: new Date().toISOString()
  };
}

// ========== EXPORTS ==========

export const PreOrderAnalyticsService = {
  calculateFunnelMetrics,
  calculateRevenueMetrics,
  calculateCancellationMetrics,
  calculateDeliveryMetrics,
  calculateDisputeMetrics,
  calculateDemandForecast,
  saveAnalyticsSnapshot,
  getDashboardSummary
};

export default PreOrderAnalyticsService;