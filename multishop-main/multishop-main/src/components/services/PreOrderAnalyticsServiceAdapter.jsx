/**
 * PreOrderAnalyticsService - Legacy Adapter
 * 
 * ⚠️ DEPRECATED: Sử dụng @/components/features/preorder thay thế
 * 
 * @deprecated Use @/components/features/preorder instead
 */

import {
  calculateFunnelMetricsData as calculateFunnelMetrics,
  calculateRevenueMetricsData as calculateRevenueMetrics,
  calculateCancellationMetricsData as calculateCancellationMetrics,
  calculateDeliveryMetricsData as calculateDeliveryMetrics,
  calculateDisputeMetricsData as calculateDisputeMetrics,
  calculateDemandForecastData as calculateDemandForecast,
  saveAnalyticsSnapshot,
  getDashboardSummary
} from '@/components/features/preorder';

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