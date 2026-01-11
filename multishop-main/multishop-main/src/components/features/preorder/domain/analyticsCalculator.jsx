/**
 * analyticsCalculator - Analytics calculations
 * Domain Layer - Pure business logic
 * 
 * Part of PreOrder Module
 */

// ========== FUNNEL CALCULATIONS ==========

/**
 * Calculate funnel conversion rates
 */
export function calculateConversionRates(funnel) {
  return {
    view_to_cart: 0, // Would need tracking data
    cart_to_checkout: 0,
    checkout_to_deposit: funnel.checkout_initiated > 0 
      ? parseFloat((funnel.deposit_paid / funnel.checkout_initiated * 100).toFixed(1))
      : 0,
    deposit_to_final: funnel.deposit_paid > 0 
      ? parseFloat((funnel.final_payment_paid / funnel.deposit_paid * 100).toFixed(1))
      : 0,
    final_to_fulfilled: funnel.final_payment_paid > 0 
      ? parseFloat((funnel.fulfilled / funnel.final_payment_paid * 100).toFixed(1))
      : 0,
    overall_conversion: funnel.checkout_initiated > 0 
      ? parseFloat((funnel.fulfilled / funnel.checkout_initiated * 100).toFixed(1))
      : 0
  };
}

/**
 * Aggregate funnel metrics from orders
 */
export function aggregateFunnelMetrics(orders) {
  return {
    page_views: 0,
    unique_visitors: 0,
    add_to_cart: 0,
    checkout_initiated: orders.length,
    deposit_paid: orders.filter(o => 
      ['paid', 'deposit_paid'].includes(o.payment_status) || 
      o.deposit_status === 'paid'
    ).length,
    final_payment_paid: orders.filter(o => 
      o.payment_status === 'paid' && o.deposit_status === 'completed'
    ).length,
    fulfilled: orders.filter(o => o.order_status === 'delivered').length,
    cancelled: orders.filter(o => o.order_status === 'cancelled').length
  };
}

// ========== REVENUE CALCULATIONS ==========

/**
 * Calculate revenue metrics from orders and refunds
 */
export function calculateRevenueMetrics(orders, refunds) {
  const totalOrderValue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const totalDeposit = orders.reduce((sum, o) => sum + (o.deposit_amount || 0), 0);
  const totalFinal = orders
    .filter(o => o.payment_status === 'paid')
    .reduce((sum, o) => sum + (o.remaining_amount || 0), 0);
  const totalRefunded = refunds.reduce((sum, r) => sum + (r.refund_amount || 0), 0);

  return {
    total_order_value: totalOrderValue,
    total_deposit_collected: totalDeposit,
    total_final_payment: totalFinal,
    total_refunded: totalRefunded,
    net_revenue: totalDeposit + totalFinal - totalRefunded,
    average_order_value: orders.length > 0 ? Math.round(totalOrderValue / orders.length) : 0,
    average_deposit: orders.length > 0 ? Math.round(totalDeposit / orders.length) : 0,
    order_count: orders.length
  };
}

// ========== CANCELLATION CALCULATIONS ==========

/**
 * Aggregate cancellation metrics
 */
export function aggregateCancellationMetrics(cancellations, totalOrders) {
  // Reasons breakdown
  const reasonsBreakdown = {};
  cancellations.forEach(c => {
    (c.cancellation_reasons || []).forEach(reason => {
      reasonsBreakdown[reason] = (reasonsBreakdown[reason] || 0) + 1;
    });
  });

  // Tier breakdown
  const tierBreakdown = {};
  cancellations.forEach(c => {
    const tier = c.policy_tier || 'unknown';
    tierBreakdown[tier] = (tierBreakdown[tier] || 0) + 1;
  });

  const totalPenalty = cancellations.reduce((sum, c) => sum + (c.penalty_amount || 0), 0);
  const totalRefund = cancellations.reduce((sum, c) => sum + (c.refund_amount || 0), 0);

  return {
    total_cancellations: cancellations.length,
    cancel_rate: totalOrders > 0 
      ? parseFloat((cancellations.length / totalOrders * 100).toFixed(1))
      : 0,
    reasons_breakdown: reasonsBreakdown,
    tier_breakdown: tierBreakdown,
    total_penalty_collected: totalPenalty,
    total_refund_paid: totalRefund
  };
}

// ========== DELIVERY CALCULATIONS ==========

/**
 * Calculate delivery metrics from orders
 */
export function calculateDeliveryMetrics(orders, fulfillments) {
  let totalDelayDays = 0;
  let delayedCount = 0;
  let onTimeCount = 0;

  for (const order of orders) {
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

  const partialCount = fulfillments.filter(f => f.fulfillment_type === 'partial').length;

  return {
    total_delivered: orders.length,
    on_time_delivery: onTimeCount,
    delayed_delivery: delayedCount,
    average_delay_days: delayedCount > 0 
      ? parseFloat((totalDelayDays / delayedCount).toFixed(1))
      : 0,
    partial_delivery: partialCount,
    delivery_success_rate: orders.length > 0 
      ? parseFloat((onTimeCount / orders.length * 100).toFixed(1))
      : 0
  };
}

// ========== DISPUTE CALCULATIONS ==========

/**
 * Calculate dispute metrics
 */
export function calculateDisputeMetrics(disputes, totalOrders) {
  // Type breakdown
  const typeBreakdown = {};
  disputes.forEach(d => {
    typeBreakdown[d.dispute_type] = (typeBreakdown[d.dispute_type] || 0) + 1;
  });

  // Resolution time
  const resolvedDisputes = disputes.filter(d => d.status === 'resolved' && d.resolved_date);
  let totalResolutionTime = 0;
  
  resolvedDisputes.forEach(d => {
    const created = new Date(d.created_date);
    const resolved = new Date(d.resolved_date);
    totalResolutionTime += (resolved - created) / (1000 * 60 * 60); // hours
  });

  // Customer satisfaction
  const withSatisfaction = disputes.filter(d => d.customer_satisfaction?.rating);
  const avgSatisfaction = withSatisfaction.length > 0
    ? withSatisfaction.reduce((sum, d) => sum + d.customer_satisfaction.rating, 0) / withSatisfaction.length
    : 0;

  return {
    total_disputes: disputes.length,
    dispute_rate: totalOrders > 0 
      ? parseFloat((disputes.length / totalOrders * 100).toFixed(1))
      : 0,
    type_breakdown: typeBreakdown,
    resolved_count: resolvedDisputes.length,
    average_resolution_time_hours: resolvedDisputes.length > 0 
      ? parseFloat((totalResolutionTime / resolvedDisputes.length).toFixed(1))
      : 0,
    customer_satisfaction_avg: parseFloat(avgSatisfaction.toFixed(1))
  };
}

// ========== DEMAND FORECAST ==========

/**
 * Calculate demand forecast for a lot
 */
export function calculateDemandForecast(lot, orders) {
  const daysActive = Math.max(1, Math.floor(
    (new Date() - new Date(lot.created_date)) / (1000 * 60 * 60 * 24)
  ));
  
  const daysUntilHarvest = Math.max(0, Math.floor(
    (new Date(lot.estimated_harvest_date) - new Date()) / (1000 * 60 * 60 * 24)
  ));

  const currentSold = lot.sold_quantity || 0;
  const dailyRate = currentSold / daysActive;
  const predictedTotal = Math.round(currentSold + (dailyRate * daysUntilHarvest));
  
  // Determine trend (last 7 days vs overall)
  const recentOrders = orders.filter(o => {
    const orderDate = new Date(o.created_date);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return orderDate > weekAgo;
  });
  
  const recentDailyRate = recentOrders.length / 7;
  let trend = 'stable';
  if (recentDailyRate > dailyRate * 1.2) trend = 'increasing';
  else if (recentDailyRate < dailyRate * 0.8) trend = 'decreasing';

  return {
    current_sold: currentSold,
    daily_rate: parseFloat(dailyRate.toFixed(2)),
    days_until_harvest: daysUntilHarvest,
    predicted_total_orders: predictedTotal,
    capacity: lot.total_yield,
    probability_min_qty_reached: parseFloat(Math.min(100, (predictedTotal / lot.total_yield * 100)).toFixed(1)),
    trend
  };
}

/**
 * Generate recommendations based on forecast
 */
export function generateRecommendations(forecast, lot) {
  const recommendations = [];
  
  if (forecast.predicted_total_orders < lot.total_yield * 0.5) {
    recommendations.push({
      action: 'reduce_price',
      reason: 'Dự kiến chỉ bán được < 50% capacity',
      impact: 'Có thể tăng 20-30% đơn hàng'
    });
  }
  
  if (forecast.trend === 'decreasing' && forecast.days_until_harvest > 7) {
    recommendations.push({
      action: 'run_promotion',
      reason: 'Trend đang giảm',
      impact: 'Kích thích nhu cầu'
    });
  }
  
  if (forecast.predicted_total_orders > lot.total_yield * 0.9) {
    recommendations.push({
      action: 'increase_capacity',
      reason: 'Dự kiến gần hết capacity',
      impact: 'Mở thêm lot mới'
    });
  }

  return recommendations;
}