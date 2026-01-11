/**
 * useLoyalty Hooks
 * 
 * Feature Logic Layer - Tuân thủ AI-CODING-RULES
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import loyaltyService from '@/components/services/LoyaltyService';
import { useToast } from '@/components/NotificationToast';

// ========== QUERY KEYS ==========
const KEYS = {
  myAccount: (email) => ['loyalty-account', email],
  stats: ['loyalty-stats'],
  allAccounts: ['loyalty-accounts']
};

// ========== MY ACCOUNT ==========

export function useMyLoyaltyAccount() {
  const { data: user } = useQuery({
    queryKey: ['current-user-loyalty'],
    queryFn: () => base44.auth.me()
  });
  
  return useQuery({
    queryKey: KEYS.myAccount(user?.email),
    queryFn: async () => {
      if (!user?.email) return null;
      const result = await loyaltyService.getOrCreateAccount(user.email, user.full_name);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    enabled: !!user?.email,
    staleTime: 10000
  });
}

// ========== REDEEM POINTS ==========

export function useRedeemPoints() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  
  return useMutation({
    mutationFn: async ({ customerEmail, points, orderAmount }) => {
      const result = await loyaltyService.redeemPoints(customerEmail, points, orderAmount);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    onSuccess: () => {
      addToast('Áp dụng điểm thành công', 'success');
    },
    onError: (error) => {
      addToast(error.message, 'error');
    }
  });
}

// ========== ADMIN HOOKS ==========

export function useLoyaltyAccounts() {
  return useQuery({
    queryKey: KEYS.allAccounts,
    queryFn: async () => {
      const accounts = await base44.entities.LoyaltyAccount.list('-updated_date', 500);
      return accounts;
    },
    staleTime: 30000
  });
}

export function useLoyaltyStats() {
  return useQuery({
    queryKey: KEYS.stats,
    queryFn: async () => {
      const result = await loyaltyService.getLoyaltyStats();
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    staleTime: 30000
  });
}

export function useAdjustPoints() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  
  return useMutation({
    mutationFn: async ({ accountId, points, reason, adminEmail }) => {
      const result = await loyaltyService.adjustPoints(accountId, points, reason, adminEmail);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.allAccounts });
      queryClient.invalidateQueries({ queryKey: KEYS.stats });
      addToast('Đã điều chỉnh điểm', 'success');
    },
    onError: (error) => {
      addToast(error.message, 'error');
    }
  });
}

export default {
  useMyLoyaltyAccount,
  useRedeemPoints,
  useLoyaltyAccounts,
  useLoyaltyStats,
  useAdjustPoints
};