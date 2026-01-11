/**
 * Hook: useWithdrawal
 * Feature Logic Layer
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/NotificationToast';
import { base44 } from '@/api/base44Client';
import WithdrawalService from '@/components/services/WithdrawalService';

/**
 * List withdrawals (for CTV)
 */
export function useMyWithdrawals(referrerId) {
  return useQuery({
    queryKey: ['my-withdrawals', referrerId],
    queryFn: () => base44.entities.ReferralWithdrawal.filter({ referrer_id: referrerId }),
    enabled: !!referrerId
  });
}

/**
 * List all withdrawals (for admin)
 */
export function useAllWithdrawals() {
  return useQuery({
    queryKey: ['all-withdrawals'],
    queryFn: () => base44.entities.ReferralWithdrawal.list('-created_date', 500)
  });
}

/**
 * Request withdrawal
 */
export function useRequestWithdrawal(referrerId) {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: async ({ amount, bankInfo }) => {
      const result = await WithdrawalService.requestWithdrawal(referrerId, amount, bankInfo);
      
      if (!result.success) {
        throw new Error(result.message);
      }
      
      return result.data;
    },
    onSuccess: () => {
      addToast('Yêu cầu rút tiền đã gửi, chờ admin duyệt', 'success');
      queryClient.invalidateQueries({ queryKey: ['my-withdrawals'] });
      queryClient.invalidateQueries({ queryKey: ['my-referral-member'] });
    },
    onError: (error) => {
      addToast(error.message, 'error');
    }
  });
}

/**
 * Admin approve
 */
export function useApproveWithdrawal() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: async ({ withdrawalId, adminEmail, note }) => {
      const result = await WithdrawalService.approveWithdrawal(withdrawalId, adminEmail, note);
      
      if (!result.success) {
        throw new Error(result.message);
      }
      
      return result.data;
    },
    onSuccess: () => {
      addToast('Đã duyệt yêu cầu rút tiền', 'success');
      queryClient.invalidateQueries({ queryKey: ['all-withdrawals'] });
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
    },
    onError: (error) => {
      addToast(error.message, 'error');
    }
  });
}

/**
 * Admin reject
 */
export function useRejectWithdrawal() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: async ({ withdrawalId, adminEmail, reason }) => {
      const result = await WithdrawalService.rejectWithdrawal(withdrawalId, adminEmail, reason);
      
      if (!result.success) {
        throw new Error(result.message);
      }
      
      return result.data;
    },
    onSuccess: () => {
      addToast('Đã từ chối yêu cầu rút tiền', 'info');
      queryClient.invalidateQueries({ queryKey: ['all-withdrawals'] });
    },
    onError: (error) => {
      addToast(error.message, 'error');
    }
  });
}

/**
 * Admin mark paid
 */
export function useMarkWithdrawalPaid() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: async ({ withdrawalId, adminEmail, paymentData }) => {
      const result = await WithdrawalService.markWithdrawalPaid(withdrawalId, adminEmail, paymentData);
      
      if (!result.success) {
        throw new Error(result.message);
      }
      
      return result.data;
    },
    onSuccess: () => {
      addToast('Đã đánh dấu thanh toán thành công', 'success');
      queryClient.invalidateQueries({ queryKey: ['all-withdrawals'] });
      queryClient.invalidateQueries({ queryKey: ['referral-members'] });
    },
    onError: (error) => {
      addToast(error.message, 'error');
    }
  });
}