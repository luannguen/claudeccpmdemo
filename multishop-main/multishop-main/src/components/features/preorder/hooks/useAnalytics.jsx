/**
 * useAnalytics - PreOrder analytics hooks
 * 
 * Part of PreOrder Module
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  calculateFunnelMetricsData,
  calculateRevenueMetricsData,
  calculateCancellationMetricsData,
  calculateDeliveryMetricsData,
  calculateDisputeMetricsData,
  calculateDemandForecastData,
  saveAnalyticsSnapshot,
  getDashboardSummary
} from '../data/analyticsRepository';

/**
 * Get funnel metrics
 */
export function useFunnelMetrics(filters = {}) {
  return useQuery({
    queryKey: ['preorder-funnel', filters],
    queryFn: () => calculateFunnelMetricsData(filters),
    staleTime: 5 * 60 * 1000
  });
}

/**
 * Get revenue metrics
 */
export function useRevenueMetrics(filters = {}) {
  return useQuery({
    queryKey: ['preorder-revenue', filters],
    queryFn: () => calculateRevenueMetricsData(filters),
    staleTime: 5 * 60 * 1000
  });
}

/**
 * Get cancellation metrics
 */
export function useCancellationMetrics(filters = {}) {
  return useQuery({
    queryKey: ['preorder-cancellation-metrics', filters],
    queryFn: () => calculateCancellationMetricsData(filters),
    staleTime: 5 * 60 * 1000
  });
}

/**
 * Get delivery metrics
 */
export function useDeliveryMetrics(filters = {}) {
  return useQuery({
    queryKey: ['preorder-delivery', filters],
    queryFn: () => calculateDeliveryMetricsData(filters),
    staleTime: 5 * 60 * 1000
  });
}

/**
 * Get dispute metrics
 */
export function useDisputeMetrics(filters = {}) {
  return useQuery({
    queryKey: ['preorder-dispute-metrics', filters],
    queryFn: () => calculateDisputeMetricsData(filters),
    staleTime: 5 * 60 * 1000
  });
}

/**
 * Get demand forecast for a lot
 */
export function useDemandForecast(lotId) {
  return useQuery({
    queryKey: ['demand-forecast', lotId],
    queryFn: () => calculateDemandForecastData(lotId),
    enabled: !!lotId,
    staleTime: 10 * 60 * 1000
  });
}

/**
 * Get comprehensive dashboard summary
 */
export function useDashboardSummary(filters = {}) {
  return useQuery({
    queryKey: ['preorder-dashboard', filters],
    queryFn: () => getDashboardSummary(filters),
    staleTime: 5 * 60 * 1000
  });
}

/**
 * Save analytics snapshot mutation
 */
export function useSaveAnalyticsSnapshot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ periodType, filters }) => saveAnalyticsSnapshot(periodType, filters),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['preorder-analytics'] });
    }
  });
}