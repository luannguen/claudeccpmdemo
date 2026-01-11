/**
 * useReferralGamification - Gamification hooks
 * Feature Logic Layer
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import ReferralGamificationService from '../services/ReferralGamificationService';
import { useToast } from '../NotificationToast';

// ========== LEADERBOARD ==========

export function useLeaderboard(period = 'all') {
  return useQuery({
    queryKey: ['referral-leaderboard', period],
    queryFn: async () => {
      const result = await ReferralGamificationService.getRealtimeLeaderboard(period);
      return result.success ? result.data : [];
    },
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000 // Refresh every minute
  });
}

// ========== MILESTONES ==========

export function useMyAchievements(userEmail) {
  return useQuery({
    queryKey: ['my-achievements', userEmail],
    queryFn: async () => {
      if (!userEmail) return [];
      const achievements = await base44.entities.ReferralAchievement.filter({ user_email: userEmail });
      return achievements;
    },
    enabled: !!userEmail,
    staleTime: 2 * 60 * 1000
  });
}

export function useCheckMilestones() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  
  return useMutation({
    mutationFn: async (memberId) => {
      return await ReferralGamificationService.checkAndAwardMilestones(memberId);
    },
    onSuccess: (result) => {
      if (result.success && result.data.length > 0) {
        result.data.forEach(achievement => {
          addToast(`🏆 ${achievement.achievement_name} - +${achievement.points.toLocaleString('vi-VN')}đ`, 'success');
        });
        queryClient.invalidateQueries({ queryKey: ['my-achievements'] });
      }
    }
  });
}

// ========== PERFORMANCE INSIGHTS ==========

export function usePerformanceInsights(memberId) {
  return useQuery({
    queryKey: ['performance-insights', memberId],
    queryFn: async () => {
      if (!memberId) return null;
      const result = await ReferralGamificationService.getPerformanceInsights(memberId);
      return result.success ? result.data : null;
    },
    enabled: !!memberId,
    staleTime: 5 * 60 * 1000
  });
}

// ========== CUSTOMER JOURNEY ==========

export function useCustomerJourney(customerId) {
  return useQuery({
    queryKey: ['customer-journey', customerId],
    queryFn: async () => {
      if (!customerId) return null;
      const result = await ReferralGamificationService.getCustomerJourney(customerId);
      return result.success ? result.data : null;
    },
    enabled: !!customerId,
    staleTime: 2 * 60 * 1000
  });
}