/**
 * Referral Hooks Layer - Public Exports
 * 
 * @module features/referral/hooks
 */

// Member hooks
export { 
  useMyReferralMember, 
  useRegisterMember, 
  useCheckEligibility,
  useMyReferredCustomers
} from './useReferralMember';

// Commission hooks
export {
  useReferralEvents,
  useCurrentMonthEvents,
  useCommissionSummary,
  useProjectedCommission,
  usePendingPayoutEvents
} from './useReferralCommission';

// Admin hooks
export {
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
  useReferralFilters
} from './useReferralAdmin';

// Customer hooks
export {
  useRegisterCustomer,
  useReassignCustomer,
  useLockCustomer,
  useApplyReferralCode
} from './useReferralCustomer';

// Checkout hooks
export {
  default as useReferralCheckout,
  getReferralCodeFromCookie,
  clearReferralCookie,
  hasReferralCode,
  validateAndSaveReferralCode
} from './useReferralCheckout';

// Rank hooks
export {
  useReferralRank,
  useUpdateRank
} from './useReferralRank';