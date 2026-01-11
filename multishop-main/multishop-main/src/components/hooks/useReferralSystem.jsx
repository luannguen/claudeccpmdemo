/**
 * useReferralSystem - Legacy Adapter
 * 
 * ⚠️ DEPRECATED: Sử dụng @/components/features/referral thay thế
 * 
 * Adapter này tồn tại để backward compatibility
 * Tất cả logic đã được di chuyển vào module referral
 * 
 * @deprecated Use @/components/features/referral instead
 * 
 * Migration guide:
 * ```javascript
 * // ❌ OLD
 * import { useMyReferralMember } from '@/components/hooks/useReferralSystem';
 * 
 * // ✅ NEW
 * import { useMyReferralMember } from '@/components/features/referral';
 * ```
 */

import { useQuery } from '@tanstack/react-query';

// Re-export all hooks from the new module
export {
  // Member hooks
  useMyReferralMember,
  useRegisterMember,
  useCheckEligibility,
  useMyReferredCustomers,
  
  // Commission hooks
  useCurrentMonthEvents,
  useCommissionSummary,
  useProjectedCommission,
  usePendingPayoutEvents,
  
  // Admin hooks
  useReferralMembers,
  useReferralAdminEvents,
  useReferralStats,
  useApproveMember,
  useSuspendMember,
  useReactivateMember,
  useMarkFraudulent,
  useProcessPayout,
  useUpdateSettings,
  useSetCustomRate,
  useReferralFilters,
  
  // Customer hooks
  useRegisterCustomer,
  useReassignCustomer,
  useLockCustomer,
  useApplyReferralCode,
  
  // Rank hooks
  useReferralRank,
  useUpdateRank
} from '@/components/features/referral';

import {
  useMyReferralMember,
  useReferralEvents as useReferralEventsBase,
  settingRepository
} from '@/components/features/referral';

// Legacy alias: useMyReferralEvents
export function useMyReferralEvents() {
  const { data: member } = useMyReferralMember();
  return useReferralEventsBase(member?.id);
}

// Legacy alias: useRegisterReferralMember
export { useRegisterMember as useRegisterReferralMember } from '@/components/features/referral';

// Legacy alias: useReferralSettings
export function useReferralSettings() {
  return useQuery({
    queryKey: ['referral-settings'],
    queryFn: () => settingRepository.getMainSettings(),
    staleTime: 5 * 60 * 1000
  });
}

// Legacy alias: useReferralEvents (for general list)
export { useReferralEvents } from '@/components/features/referral';

// Legacy aliases for backward compatibility
import { useReferralFilters, useReferralAdminEvents, useReferralStats } from '@/components/features/referral';
export const useReferralMemberFilters = useReferralFilters;
export const useReferralEventFilters = useReferralAdminEvents;
export const useReferralAnalytics = useReferralStats;

// Legacy alias: useUpdateReferralSettings (mapped to useUpdateSettings)
export { useUpdateSettings as useUpdateReferralSettings } from '@/components/features/referral';

// Legacy alias: useReferralAuditLogs
import { auditRepository } from '@/components/features/referral';
export function useReferralAuditLogs(filters = {}) {
  return useQuery({
    queryKey: ['referral-audit-logs', filters],
    queryFn: () => auditRepository.list(filters),
    staleTime: 30 * 1000
  });
}