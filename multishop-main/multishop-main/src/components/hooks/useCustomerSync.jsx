/**
 * useCustomerSync Hook
 * Feature Logic Layer
 * 
 * Single Goal: Auto-sync Customer data to User profile
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import customerSyncService from '@/components/services/customerSyncService';
import { useToast } from '@/components/NotificationToast';

// ========== AUTO SYNC ON LOGIN ==========

export function useAutoSyncOnLogin(userEmail) {
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey: ['customer-sync-check', userEmail],
    queryFn: async () => {
      if (!userEmail) return null;
      
      const checkResult = await customerSyncService.checkSyncNeeded(userEmail);
      
      if (checkResult.success && checkResult.data.needed && checkResult.data.auto_sync_enabled) {
        // Auto sync
        const syncResult = await customerSyncService.syncCustomerToUserProfile(userEmail);
        
        if (syncResult.success && syncResult.data.synced) {
          queryClient.invalidateQueries({ queryKey: ['current-user'] });
          return { synced: true, timestamp: syncResult.data.timestamp };
        }
      }
      
      return { synced: false };
    },
    enabled: !!userEmail,
    staleTime: 10 * 60 * 1000, // 10 min
    retry: false
  });
}

// ========== GET MERGED PROFILE ==========

export function useProfileWithCustomer(userEmail) {
  return useQuery({
    queryKey: ['profile-with-customer', userEmail],
    queryFn: async () => {
      if (!userEmail) return null;
      
      const result = await customerSyncService.getUserProfileWithCustomerData(userEmail);
      return result.success ? result.data : null;
    },
    enabled: !!userEmail,
    staleTime: 2 * 60 * 1000
  });
}

// ========== MANUAL SYNC ==========

export function useManualSync() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  
  return useMutation({
    mutationFn: async (userEmail) => {
      return await customerSyncService.syncCustomerToUserProfile(userEmail);
    },
    onSuccess: (result) => {
      if (result.success && result.data.synced) {
        queryClient.invalidateQueries({ queryKey: ['current-user'] });
        queryClient.invalidateQueries({ queryKey: ['profile-with-customer'] });
        addToast('Đã đồng bộ thông tin từ hệ thống', 'success');
      }
    },
    onError: () => {
      addToast('Không thể đồng bộ', 'error');
    }
  });
}

// ========== UPDATE SHIPPING PREFERENCES ==========

export function useUpdateShippingPreferences() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  
  return useMutation({
    mutationFn: async (shippingData) => {
      return await customerSyncService.updateUserShippingPreferences(shippingData);
    },
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['current-user'] });
        queryClient.invalidateQueries({ queryKey: ['profile-with-customer'] });
        addToast('Đã lưu thông tin giao hàng', 'success');
      }
    },
    onError: () => {
      addToast('Không thể lưu', 'error');
    }
  });
}

// ========== TOGGLE AUTO SYNC ==========

export function useToggleAutoSync() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  
  return useMutation({
    mutationFn: async (enabled) => {
      return await customerSyncService.toggleAutoSync(enabled);
    },
    onSuccess: (result, enabled) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['current-user'] });
        addToast(
          enabled ? 'Đã bật tự động đồng bộ' : 'Đã tắt tự động đồng bộ',
          'success'
        );
      }
    }
  });
}