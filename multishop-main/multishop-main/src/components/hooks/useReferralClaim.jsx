/**
 * Hook: useReferralClaim
 * Feature Logic Layer - Xử lý claim KH cũ
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/NotificationToast';
import ReferralClaimService from '@/components/services/ReferralClaimService';

/**
 * CTV request claim existing customer
 */
export function useRequestClaim(referrerId) {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: async (customerEmail) => {
      const result = await ReferralClaimService.requestClaimCustomer(referrerId, customerEmail);
      
      if (!result.success) {
        throw new Error(result.message);
      }
      
      return result.data;
    },
    onSuccess: (data) => {
      addToast(`Yêu cầu claim ${data.customer.full_name} đã gửi đến admin`, 'success');
      queryClient.invalidateQueries({ queryKey: ['my-referral-member'] });
    },
    onError: (error) => {
      addToast(error.message, 'error');
    }
  });
}

/**
 * Admin approve claim
 */
export function useApproveClaim() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: async ({ claimRequestId, adminEmail }) => {
      const result = await ReferralClaimService.approveCustomerClaim(claimRequestId, adminEmail);
      
      if (!result.success) {
        throw new Error(result.message);
      }
      
      return result.data;
    },
    onSuccess: (data) => {
      addToast(`Đã duyệt claim ${data.customer.full_name} → ${data.referrer.full_name}`, 'success');
      queryClient.invalidateQueries({ queryKey: ['admin-customers'] });
      queryClient.invalidateQueries({ queryKey: ['referral-members'] });
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
    },
    onError: (error) => {
      addToast(error.message, 'error');
    }
  });
}

/**
 * Admin reject claim
 */
export function useRejectClaim() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: async ({ claimRequestId, adminEmail, reason }) => {
      const result = await ReferralClaimService.rejectCustomerClaim(claimRequestId, adminEmail, reason);
      
      if (!result.success) {
        throw new Error(result.message);
      }
      
      return result.data;
    },
    onSuccess: () => {
      addToast('Đã từ chối yêu cầu claim', 'info');
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
    },
    onError: (error) => {
      addToast(error.message, 'error');
    }
  });
}