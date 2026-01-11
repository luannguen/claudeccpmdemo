/**
 * Hook: Manual Customer Registration
 * 
 * Single Goal: CTV chủ động đăng ký KH mới
 * 
 * Architecture: Feature Logic Layer
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import ReferralService from '@/components/services/ReferralService';
import customerSyncService from '@/components/services/customerSyncService';
import { toast } from 'sonner';

export function useRegisterCustomer(referrerId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ phone, name, email }) => {
      const result = await ReferralService.registerCustomerForReferrer(
        referrerId,
        phone,
        name,
        email
      );

      if (!result.success) {
        throw new Error(result.error);
      }

      return result;
    },
    onSuccess: async (data) => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['my-referred-customers'] });
      queryClient.invalidateQueries({ queryKey: ['my-referral-member'] });
      
      // Auto-sync Customer → User if customer has email
      if (data.customer?.email) {
        const syncResult = await customerSyncService.syncCustomerToUserProfile(data.customer.email);
        
        if (syncResult.success && syncResult.data.synced) {
          queryClient.invalidateQueries({ queryKey: ['current-user'] });
          queryClient.invalidateQueries({ queryKey: ['profile-with-customer', data.customer.email] });
        }
      }
      
      // Success toast
      if (data.isNew) {
        toast.success(`✅ Đã đăng ký khách hàng mới: ${data.customer.full_name}`);
      } else {
        toast.success(`✅ Đã thêm khách hàng: ${data.customer.full_name}`);
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Có lỗi xảy ra');
    }
  });
}

/**
 * Hook: Admin Reassign Customer
 */
export function useReassignCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ customerId, newReferrerId, adminEmail, reason }) => {
      const result = await ReferralService.reassignCustomer(
        customerId,
        newReferrerId,
        adminEmail,
        reason
      );

      if (!result.success) {
        throw new Error(result.error);
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-customers'] });
      queryClient.invalidateQueries({ queryKey: ['admin-referral-members'] });
      queryClient.invalidateQueries({ queryKey: ['admin-referral-audit'] });
      
      toast.success('✅ Đã chuyển khách hàng sang CTV mới');
    },
    onError: (error) => {
      toast.error(error.message || 'Có lỗi xảy ra');
    }
  });
}