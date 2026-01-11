/**
 * Hook: useCustomCommissionRate
 * Feature Logic Layer - Admin set custom rate cho CTV
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/NotificationToast';
import ReferralService from '@/components/services/ReferralService';

/**
 * Set custom commission rate
 */
export function useSetCustomRate() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: async ({ memberId, rate, adminEmail, note }) => {
      const result = await ReferralService.setCustomCommissionRate(memberId, rate, adminEmail, note);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result;
    },
    onSuccess: () => {
      addToast('Đã set custom commission rate', 'success');
      queryClient.invalidateQueries({ queryKey: ['referral-members'] });
      queryClient.invalidateQueries({ queryKey: ['my-referral-member'] });
    },
    onError: (error) => {
      addToast(error.message, 'error');
    }
  });
}

/**
 * Disable custom rate
 */
export function useDisableCustomRate() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: async ({ memberId, adminEmail }) => {
      const result = await ReferralService.disableCustomRate(memberId, adminEmail);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result;
    },
    onSuccess: () => {
      addToast('Đã tắt custom rate, sử dụng tier mặc định', 'info');
      queryClient.invalidateQueries({ queryKey: ['referral-members'] });
    },
    onError: (error) => {
      addToast(error.message, 'error');
    }
  });
}