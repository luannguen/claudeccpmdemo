/**
 * useEcardAnalytics - Hook for analytics data
 * Feature logic layer - orchestrates analytics data
 * 
 * UPDATED: Now combines multiple data sources for accurate stats:
 * - EcardProfile (view_count, share_count)
 * - UserConnection (connections)
 * - GiftTransaction (gifts received)
 * - EcardAnalytics (daily breakdown for charts)
 * 
 * @module features/ecard/hooks
 */

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/components/AuthProvider';
import { base44 } from '@/api/base44Client';
import { analyticsRepository } from '../data/analyticsRepository';

/**
 * Hook to fetch and manage E-Card analytics
 * @param {number} days - Number of days to fetch (default 30)
 */
export function useEcardAnalytics(days = 30) {
  const { user } = useAuth();

  // Aggregated stats - combine multiple sources for accuracy
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['ecard-analytics-real-stats', user?.id, days],
    queryFn: async () => {
      // Fetch from multiple sources in parallel
      const [profile, connections, giftsReceived, analyticsData] = await Promise.all([
        // Profile for view_count, share_count
        base44.entities.EcardProfile.filter({ user_id: user.id }).then(r => r?.[0]),
        // Connections count
        base44.entities.UserConnection.filter({ 
          initiator_user_id: user.id, 
          status: 'accepted' 
        }),
        // Gifts received
        base44.entities.GiftTransaction.filter({ 
          receiver_user_id: user.id 
        }),
        // Analytics for additional data
        analyticsRepository.getAggregatedStats(user.id, days)
      ]);

      // Calculate stats from real data
      const views = profile?.view_count || analyticsData?.views || 0;
      const connectionsCount = connections?.length || analyticsData?.connections || 0;
      const giftsCount = giftsReceived?.length || analyticsData?.gifts || 0;
      const sharesCount = profile?.share_count || analyticsData?.shares || 0;
      const qrScans = profile?.qr_scan_count || analyticsData?.qr_scans || 0;

      return {
        views,
        unique_views: analyticsData?.unique_views || 0,
        connections: connectionsCount,
        gifts: giftsCount,
        shares: sharesCount,
        qr_scans: qrScans
      };
    },
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    initialData: { views: 0, unique_views: 0, connections: 0, gifts: 0, shares: 0, qr_scans: 0 }
  });

  // Daily breakdown for charts (from EcardAnalytics entity)
  const { data: dailyData, isLoading: isLoadingDaily } = useQuery({
    queryKey: ['ecard-analytics-daily', user?.id, days],
    queryFn: async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      return analyticsRepository.getByDateRange(
        user.id,
        startDate.toISOString().split('T')[0],
        new Date().toISOString().split('T')[0]
      );
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000
  });

  // Compute conversion rate (connections / views)
  const conversionRate = stats?.views > 0
    ? ((stats.connections / stats.views) * 100).toFixed(1)
    : 0;

  // Compute trend (compare first half vs second half of period)
  const computeTrend = () => {
    if (!dailyData || dailyData.length < 2) return 'stable';
    
    const midpoint = Math.floor(dailyData.length / 2);
    const firstHalf = dailyData.slice(0, midpoint);
    const secondHalf = dailyData.slice(midpoint);
    
    const firstSum = firstHalf.reduce((sum, d) => sum + (d.views || 0), 0);
    const secondSum = secondHalf.reduce((sum, d) => sum + (d.views || 0), 0);
    
    if (secondSum > firstSum * 1.1) return 'up';
    if (secondSum < firstSum * 0.9) return 'down';
    return 'stable';
  };

  return {
    stats: stats || { views: 0, unique_views: 0, connections: 0, gifts: 0, shares: 0, qr_scans: 0 },
    dailyData: dailyData || [],
    conversionRate: Number(conversionRate),
    trend: computeTrend(),
    isLoading: isLoadingStats || isLoadingDaily
  };
}