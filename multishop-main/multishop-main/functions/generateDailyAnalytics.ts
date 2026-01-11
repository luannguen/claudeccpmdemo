/**
 * generateDailyAnalytics - Scheduled function (Daily 1AM)
 * 
 * Tạo snapshot analytics hàng ngày:
 * - Funnel metrics
 * - Revenue metrics
 * - Cancellation metrics
 * - Delivery metrics
 * - Dispute metrics
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const asServiceRole = base44.asServiceRole;

    // Date range: yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const startDate = yesterday.toISOString().split('T')[0];
    const endDate = startDate;

    // Get orders in date range
    const orders = await asServiceRole.entities.Order.filter({
      has_preorder_items: true
    });

    const dailyOrders = orders.filter(o => {
      const orderDate = new Date(o.created_date).toISOString().split('T')[0];
      return orderDate === startDate;
    });

    // ==== CALCULATE FUNNEL ====
    const funnel = {
      page_views: 0,
      unique_visitors: 0,
      add_to_cart: 0,
      checkout_initiated: dailyOrders.length,
      deposit_paid: dailyOrders.filter(o => 
        ['paid', 'deposit_paid'].includes(o.payment_status) || o.deposit_status === 'paid'
      ).length,
      final_payment_paid: dailyOrders.filter(o => 
        o.payment_status === 'paid' && o.deposit_status === 'completed'
      ).length,
      fulfilled: dailyOrders.filter(o => o.order_status === 'delivered').length,
      cancelled: dailyOrders.filter(o => o.order_status === 'cancelled').length
    };

    // ==== CALCULATE CONVERSIONS ====
    const conversions = {
      checkout_to_deposit: funnel.checkout_initiated > 0 
        ? ((funnel.deposit_paid / funnel.checkout_initiated) * 100).toFixed(1) 
        : 0,
      deposit_to_final: funnel.deposit_paid > 0 
        ? ((funnel.final_payment_paid / funnel.deposit_paid) * 100).toFixed(1) 
        : 0,
      final_to_fulfilled: funnel.final_payment_paid > 0 
        ? ((funnel.fulfilled / funnel.final_payment_paid) * 100).toFixed(1) 
        : 0,
      overall_conversion: funnel.checkout_initiated > 0 
        ? ((funnel.fulfilled / funnel.checkout_initiated) * 100).toFixed(1) 
        : 0
    };

    // ==== CALCULATE REVENUE ====
    const revenue = {
      total_order_value: dailyOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0),
      total_deposit_collected: dailyOrders.reduce((sum, o) => sum + (o.deposit_amount || 0), 0),
      total_final_payment: dailyOrders
        .filter(o => o.payment_status === 'paid')
        .reduce((sum, o) => sum + (o.remaining_amount || 0), 0),
      total_refunded: 0, // Will calculate
      net_revenue: 0,
      average_order_value: dailyOrders.length > 0 
        ? Math.round(dailyOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0) / dailyOrders.length)
        : 0
    };

    // Get refunds for these orders
    const refunds = await asServiceRole.entities.RefundRequest.filter({
      status: 'completed'
    });
    revenue.total_refunded = refunds
      .filter(r => dailyOrders.some(o => o.id === r.order_id))
      .reduce((sum, r) => sum + (r.refund_amount || 0), 0);
    revenue.net_revenue = revenue.total_deposit_collected + revenue.total_final_payment - revenue.total_refunded;

    // ==== CALCULATE CANCELLATION ====
    const cancellations = await asServiceRole.entities.PreOrderCancellation.filter({});
    const dailyCancellations = cancellations.filter(c => {
      const cancelDate = new Date(c.cancellation_date).toISOString().split('T')[0];
      return cancelDate === startDate;
    });

    const reasonsBreakdown = {};
    dailyCancellations.forEach(c => {
      (c.cancellation_reasons || []).forEach(reason => {
        reasonsBreakdown[reason] = (reasonsBreakdown[reason] || 0) + 1;
      });
    });

    const tierBreakdown = {};
    dailyCancellations.forEach(c => {
      tierBreakdown[c.policy_tier || 'unknown'] = (tierBreakdown[c.policy_tier || 'unknown'] || 0) + 1;
    });

    const cancellationMetrics = {
      total_cancellations: dailyCancellations.length,
      cancel_rate: dailyOrders.length > 0 
        ? ((dailyCancellations.length / dailyOrders.length) * 100).toFixed(1) 
        : 0,
      reasons_breakdown: reasonsBreakdown,
      tier_breakdown: tierBreakdown,
      total_penalty_collected: dailyCancellations.reduce((sum, c) => sum + (c.penalty_amount || 0), 0),
      total_refund_paid: dailyCancellations.reduce((sum, c) => sum + (c.refund_amount || 0), 0)
    };

    // ==== SAVE ANALYTICS ====
    const analyticsRecord = await asServiceRole.entities.PreOrderAnalytics.create({
      period_type: 'daily',
      period_start: startDate,
      period_end: endDate,
      funnel_metrics: funnel,
      conversion_rates: conversions,
      revenue_metrics: revenue,
      cancellation_metrics: cancellationMetrics,
      computed_at: new Date().toISOString()
    });

    return Response.json({
      success: true,
      analytics_id: analyticsRecord.id,
      period: startDate,
      summary: {
        orders: dailyOrders.length,
        revenue: revenue.net_revenue,
        cancel_rate: cancellationMetrics.cancel_rate,
        conversion: conversions.overall_conversion
      }
    });

  } catch (error) {
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});