/**
 * useTesterDashboardEnhanced - Hook layer cho Tester Dashboard
 * Architecture: Feature Logic Layer (theo AI-CODING-RULES)
 */

import { useQuery } from '@tanstack/react-query';
import testerDashboardService from '@/components/services/testerDashboardService';
import { toast } from 'sonner';

export function useTesterComparison(testerEmail) {
  return useQuery({
    queryKey: ['tester-comparison', testerEmail],
    queryFn: async () => {
      const result = await testerDashboardService.getTestComparison(testerEmail);
      if (!result.success) {
        toast.error(result.message);
        return null;
      }
      return result.data;
    },
    enabled: !!testerEmail,
    staleTime: 5 * 60 * 1000
  });
}

export function useTesterTimeStats(testerEmail) {
  return useQuery({
    queryKey: ['tester-time-stats', testerEmail],
    queryFn: async () => {
      const result = await testerDashboardService.getTestTimeStats(testerEmail);
      if (!result.success) return null;
      return result.data;
    },
    enabled: !!testerEmail,
    staleTime: 5 * 60 * 1000
  });
}

export function useSuggestedTests(testerEmail) {
  return useQuery({
    queryKey: ['suggested-tests', testerEmail],
    queryFn: async () => {
      const result = await testerDashboardService.getSuggestedTests(testerEmail);
      if (!result.success) return [];
      return result.data;
    },
    enabled: !!testerEmail,
    staleTime: 2 * 60 * 1000,
    refetchInterval: 2 * 60 * 1000
  });
}