/**
 * useReferralCommission Hook
 * Hooks Layer - Commission tracking and calculations
 * 
 * @module features/referral/hooks/useReferralCommission
 */

import { useQuery } from '@tanstack/react-query';
import { eventRepository, memberRepository, settingRepository } from '../data';
import { calculateOrderCommission, calculateProjectedCommission, getCommissionTier } from '../domain';

/**
 * Get commission events for a referrer
 */
export function useReferralEvents(referrerId) {
  return useQuery({
    queryKey: ['referral-events', referrerId],
    queryFn: async () => {
      if (!referrerId) return [];
      return await eventRepository.listByReferrer(referrerId);
    },
    enabled: !!referrerId,
    initialData: [],
    staleTime: 2 * 60 * 1000
  });
}

/**
 * Get current month events for member
 */
export function useCurrentMonthEvents(referrerId) {
  return useQuery({
    queryKey: ['referral-events-current-month', referrerId],
    queryFn: async () => {
      if (!referrerId) return [];
      return await eventRepository.listCurrentMonthByReferrer(referrerId);
    },
    enabled: !!referrerId,
    initialData: [],
    staleTime: 2 * 60 * 1000
  });
}

/**
 * Get commission summary for a member
 */
export function useCommissionSummary(member) {
  const { data: events } = useReferralEvents(member?.id);
  const { data: currentMonthEvents } = useCurrentMonthEvents(member?.id);
  
  const { data: settings } = useQuery({
    queryKey: ['referral-settings'],
    queryFn: () => settingRepository.getMainSettings(),
    staleTime: 5 * 60 * 1000
  });
  
  if (!member) {
    return {
      totalCommission: 0,
      unpaidCommission: 0,
      paidCommission: 0,
      totalRevenue: 0,
      currentMonthRevenue: 0,
      currentRate: 0,
      currentTier: '',
      eventsCount: 0
    };
  }
  
  // Calculate current rate
  const tiers = settings?.commission_tiers || [];
  const currentMonthRevenue = member.current_month_revenue || 0;
  const { rate, label } = getCommissionTier(currentMonthRevenue, tiers);
  const effectiveRate = member.custom_rate_enabled 
    ? member.custom_commission_rate 
    : rate + (member.seeder_rank_bonus || 0);
  
  return {
    totalCommission: (member.total_paid_commission || 0) + (member.unpaid_commission || 0),
    unpaidCommission: member.unpaid_commission || 0,
    paidCommission: member.total_paid_commission || 0,
    totalRevenue: member.total_referral_revenue || 0,
    currentMonthRevenue,
    currentRate: effectiveRate,
    currentTier: member.custom_rate_enabled ? 'Custom Rate' : label,
    eventsCount: events?.length || 0,
    currentMonthEventsCount: currentMonthEvents?.length || 0,
    isCustomRate: member.custom_rate_enabled
  };
}

/**
 * Calculate projected commission for an order amount
 */
export function useProjectedCommission(orderAmount, member) {
  const { data: settings } = useQuery({
    queryKey: ['referral-settings'],
    queryFn: () => settingRepository.getMainSettings(),
    staleTime: 5 * 60 * 1000
  });
  
  if (!orderAmount || !member || !settings) {
    return {
      minCommission: 0,
      maxCommission: 0,
      currentRate: 0,
      estimatedCommission: 0
    };
  }
  
  const projection = calculateProjectedCommission(orderAmount, member, settings);
  const estimated = calculateOrderCommission({
    orderAmount,
    currentMonthRevenue: member.current_month_revenue || 0,
    tiers: settings.commission_tiers,
    rankBonus: member.seeder_rank_bonus || 0,
    customRate: member.custom_rate_enabled ? member.custom_commission_rate : null
  });
  
  return {
    ...projection,
    estimatedCommission: estimated.commission_amount
  };
}

/**
 * Get events pending payout
 */
export function usePendingPayoutEvents(referrerId) {
  return useQuery({
    queryKey: ['referral-events-pending-payout', referrerId],
    queryFn: async () => {
      if (!referrerId) return [];
      return await eventRepository.listCalculatedByReferrer(referrerId);
    },
    enabled: !!referrerId,
    initialData: []
  });
}

export default {
  useReferralEvents,
  useCurrentMonthEvents,
  useCommissionSummary,
  useProjectedCommission,
  usePendingPayoutEvents
};