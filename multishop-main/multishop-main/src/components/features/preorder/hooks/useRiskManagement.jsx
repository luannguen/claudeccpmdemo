/**
 * useRiskManagement - Customer risk management hooks
 * 
 * Part of PreOrder Module
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getOrCreateRiskProfile,
  getRiskProfileByEmail,
  updateProfileOnOrder,
  updateProfileOnCancel,
  recordDevice,
  recalculateRisk,
  blacklistCustomer,
  removeBlacklist,
  getLotOrderCount
} from '../data/riskRepository';
import { validateOrderAgainstRules } from '../domain/fraudDetector';

/**
 * Get customer risk profile
 */
export function useCustomerRiskProfile(customerEmail) {
  return useQuery({
    queryKey: ['risk-profile', customerEmail],
    queryFn: () => getOrCreateRiskProfile(customerEmail),
    enabled: !!customerEmail,
    staleTime: 60 * 1000
  });
}

/**
 * Validate order against fraud rules
 */
export function useValidateOrder(customerEmail, orderData, lotId) {
  return useQuery({
    queryKey: ['validate-order', customerEmail, lotId],
    queryFn: async () => {
      const profile = await getOrCreateRiskProfile(customerEmail);
      const lotCount = lotId ? await getLotOrderCount(customerEmail, lotId) : 0;
      return validateOrderAgainstRules(profile, orderData, lotCount);
    },
    enabled: !!customerEmail && !!orderData,
    staleTime: 0
  });
}

/**
 * Risk management mutations
 */
export function useRiskMutations() {
  const queryClient = useQueryClient();

  const updateOnOrderMutation = useMutation({
    mutationFn: ({ customerEmail, orderData, isPreorder }) => 
      updateProfileOnOrder(customerEmail, orderData, isPreorder),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['risk-profile', variables.customerEmail] });
    }
  });

  const updateOnCancelMutation = useMutation({
    mutationFn: ({ customerEmail, isPreorder }) => 
      updateProfileOnCancel(customerEmail, isPreorder),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['risk-profile', variables.customerEmail] });
    }
  });

  const recordDeviceMutation = useMutation({
    mutationFn: ({ customerEmail, fingerprint, deviceInfo }) => 
      recordDevice(customerEmail, fingerprint, deviceInfo),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['risk-profile', variables.customerEmail] });
    }
  });

  const blacklistMutation = useMutation({
    mutationFn: ({ customerEmail, reason, adminEmail }) => 
      blacklistCustomer(customerEmail, reason, adminEmail),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['risk-profile', variables.customerEmail] });
    }
  });

  const unblacklistMutation = useMutation({
    mutationFn: ({ customerEmail, adminEmail, reason }) => 
      removeBlacklist(customerEmail, adminEmail, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['risk-profile', variables.customerEmail] });
    }
  });

  return {
    updateOnOrder: updateOnOrderMutation.mutateAsync,
    updateOnCancel: updateOnCancelMutation.mutateAsync,
    recordDevice: recordDeviceMutation.mutateAsync,
    blacklist: blacklistMutation.mutateAsync,
    unblacklist: unblacklistMutation.mutateAsync,
    isUpdating: updateOnOrderMutation.isPending || updateOnCancelMutation.isPending
  };
}