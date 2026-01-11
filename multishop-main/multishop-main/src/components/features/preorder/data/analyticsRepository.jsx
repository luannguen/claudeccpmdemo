/**
 * analyticsRepository - Analytics data access
 * Data Layer
 * 
 * Part of PreOrder Module
 */

import { base44 } from '@/api/base44Client';
import {
  aggregateFunnelMetrics,
  calculateConversionRates,
  calculateRevenueMetrics,
  aggregateCancellationMetrics,
  calculateDeliveryMetrics,
  calculateDisputeMetrics,
  calculateDemandForecast,
  generateRecommendations
} from '../domain/analyticsCalculator';

// ========== DATA FETCHING ==========

/**
 * Fetch orders with filters
 */
export async function fetchOrdersForAnalytics(filters = {}) {
  const { lotId, startDate, endDate } = filters;

  let orderFilter = { has_preorder_items: true };
  if (lotId) orderFilter['items.lot_id'] = lotId;

  const orders = await base44.entities.Order.filter(orderFilter);
  
  return orders.filter(order => {
    if (startDate && new Date(order.created_date) < new Date(startDate)) return false;
    if (endDate && new Date(order.created_date) > new Date(endDate)) return false;
    return true;
  });
}

/**
 * Fetch refunds for orders
 */
export async function fetchRefundsForOrders(orderIds) {
  const refunds = await base44.entities.RefundRequest.filter({ status: 'completed' });
  return refunds.filter(r => orderIds.includes(r.order_id));
}

/**
 * Fetch cancellations with filters
 */
export async function fetchCancellationsForAnalytics(filters = {}) {
  const { lotId, startDate, endDate } = filters;

  let cancelFilter = {};
  if (lotId) cancelFilter.lot_id = lotId;

  const cancellations = await base44.entities.PreOrderCancellation.filter(cancelFilter);
  
  return cancellations.filter(c => {
    if (startDate && new Date(c.cancellation_date) < new Date(startDate)) return false;
    if (endDate && new Date(c.cancellation_date) > new Date(endDate)) return false;
    return true;
  });
}

/**
 * Fetch fulfillments for orders
 */
export async function fetchFulfillmentsForOrders(orderIds) {
  const allFulfillments = await base44.entities.FulfillmentRecord.filter({});
  return allFulfillments.filter(f => orderIds.includes(f.order_id));
}

/**
 * Fetch disputes with filters
 */
export async function fetchDisputesForAnalytics(filters = {}) {
  const { lotId, startDate, endDate } = filters;

  let disputeFilter = {};
  if (lotId) disputeFilter.lot_id = lotId;

  const disputes = await base44.entities.DisputeTicket.filter(disputeFilter);
  
  return disputes.filter(d => {
    if (startDate && new Date(d.created_date) < new Date(startDate)) return false;
    if (endDate && new Date(d.created_date) > new Date(endDate)) return false;
    return true;
  });
}

// ========== METRIC CALCULATION ==========

/**
 * Calculate funnel metrics
 */
export async function calculateFunnelMetricsData(filters = {}) {
  const orders = await fetchOrdersForAnalytics(filters);
  const funnel = aggregateFunnelMetrics(orders);
  const conversions = calculateConversionRates(funnel);
  return { funnel, conversions };
}

/**
 * Calculate revenue metrics
 */
export async function calculateRevenueMetricsData(filters = {}) {
  const orders = await fetchOrdersForAnalytics(filters);
  const orderIds = orders.map(o => o.id);
  const refunds = await fetchRefundsForOrders(orderIds);
  return calculateRevenueMetrics(orders, refunds);
}

/**
 * Calculate cancellation metrics
 */
export async function calculateCancellationMetricsData(filters = {}) {
  const cancellations = await fetchCancellationsForAnalytics(filters);
  const orders = await fetchOrdersForAnalytics(filters);
  return aggregateCancellationMetrics(cancellations, orders.length);
}

/**
 * Calculate delivery metrics
 */
export async function calculateDeliveryMetricsData(filters = {}) {
  const orders = await fetchOrdersForAnalytics(filters);
  const deliveredOrders = orders.filter(o => o.order_status === 'delivered');
  const orderIds = deliveredOrders.map(o => o.id);
  const fulfillments = await fetchFulfillmentsForOrders(orderIds);
  return calculateDeliveryMetrics(deliveredOrders, fulfillments);
}

/**
 * Calculate dispute metrics
 */
export async function calculateDisputeMetricsData(filters = {}) {
  const disputes = await fetchDisputesForAnalytics(filters);
  const orders = await fetchOrdersForAnalytics(filters);
  return calculateDisputeMetrics(disputes, orders.length);
}

/**
 * Calculate demand forecast
 */
export async function calculateDemandForecastData(lotId) {
  const lots = await base44.entities.ProductLot.filter({ id: lotId });
  const lot = lots[0];
  if (!lot) return null;

  const orders = await base44.entities.Order.filter({
    'items.lot_id': lotId,
    order_status: { $ne: 'cancelled' }
  });

  const forecast = calculateDemandForecast(lot, orders);
  const recommendations = generateRecommendations(forecast, lot);

  return { ...forecast, recommendations };
}

// ========== ANALYTICS PERSISTENCE ==========

/**
 * Save analytics snapshot
 */
export async function saveAnalyticsSnapshot(periodType, filters = {}) {
  const [funnel, revenue, cancellation, delivery, dispute] = await Promise.all([
    calculateFunnelMetricsData(filters),
    calculateRevenueMetricsData(filters),
    calculateCancellationMetricsData(filters),
    calculateDeliveryMetricsData(filters),
    calculateDisputeMetricsData(filters)
  ]);

  const demandForecast = filters.lotId 
    ? await calculateDemandForecastData(filters.lotId) 
    : null;

  return await base44.entities.PreOrderAnalytics.create({
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
  });
}

/**
 * Get dashboard summary (aggregated metrics)
 */
export async function getDashboardSummary(filters = {}) {
  const [funnel, revenue, cancellation, delivery, dispute] = await Promise.all([
    calculateFunnelMetricsData(filters),
    calculateRevenueMetricsData(filters),
    calculateCancellationMetricsData(filters),
    calculateDeliveryMetricsData(filters),
    calculateDisputeMetricsData(filters)
  ]);

  return {
    funnel: funnel.funnel,
    conversions: funnel.conversions,
    revenue,
    cancellation,
    delivery,
    dispute,
    computed_at: new Date().toISOString()
  };
}