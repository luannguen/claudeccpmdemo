/**
 * Hook: useBulkReferralActions
 * Feature Logic Layer
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/NotificationToast';
import BulkActionsService from '@/components/services/BulkReferralActionsService';

/**
 * Bulk approve
 */
export function useBulkApprove() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: async ({ memberIds, adminEmail }) => {
      const result = await BulkActionsService.bulkApproveMembers(memberIds, adminEmail);
      
      if (!result.success) {
        throw new Error(result.message);
      }
      
      return result.data;
    },
    onSuccess: (data) => {
      addToast(`Đã duyệt ${data.successCount}/${data.totalCount} thành viên`, 'success');
      queryClient.invalidateQueries({ queryKey: ['referral-members'] });
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
    },
    onError: (error) => {
      addToast(error.message, 'error');
    }
  });
}

/**
 * Bulk suspend
 */
export function useBulkSuspend() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: async ({ memberIds, adminEmail, reason }) => {
      const result = await BulkActionsService.bulkSuspendMembers(memberIds, adminEmail, reason);
      
      if (!result.success) {
        throw new Error(result.message);
      }
      
      return result.data;
    },
    onSuccess: (data) => {
      addToast(`Đã đình chỉ ${data.successCount}/${data.totalCount} thành viên`, 'success');
      queryClient.invalidateQueries({ queryKey: ['referral-members'] });
    },
    onError: (error) => {
      addToast(error.message, 'error');
    }
  });
}

/**
 * Bulk payout
 */
export function useBulkPayout() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: async ({ memberIds, adminEmail }) => {
      const result = await BulkActionsService.bulkPayoutMembers(memberIds, adminEmail);
      
      if (!result.success) {
        throw new Error(result.message);
      }
      
      return result.data;
    },
    onSuccess: (data) => {
      addToast(
        `Đã thanh toán ${data.successCount}/${data.totalCount} CTV. Tổng: ${data.totalAmount.toLocaleString('vi-VN')}đ`,
        'success'
      );
      queryClient.invalidateQueries({ queryKey: ['referral-members'] });
      queryClient.invalidateQueries({ queryKey: ['referral-events'] });
    },
    onError: (error) => {
      addToast(error.message, 'error');
    }
  });
}