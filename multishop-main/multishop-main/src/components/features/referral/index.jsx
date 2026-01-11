/**
 * Referral Module - Public API
 * 
 * @module features/referral
 */

// ========== TYPES ==========
export * from './types';

// ========== DOMAIN ==========
export * from './domain';

// ========== DATA ==========
export { 
  memberRepository, 
  eventRepository, 
  settingRepository, 
  customerRepository,
  auditRepository 
} from './data';

// ========== HOOKS ==========
export {
  // Member
  useMyReferralMember,
  useRegisterMember,
  useCheckEligibility,
  useMyReferredCustomers,
  
  // Commission
  useReferralEvents,
  useCurrentMonthEvents,
  useCommissionSummary,
  useProjectedCommission,
  usePendingPayoutEvents,
  
  // Admin
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
  
  // Customer
  useRegisterCustomer,
  useReassignCustomer,
  useLockCustomer,
  useApplyReferralCode,
  
  // Checkout
  useReferralCheckout,
  getReferralCodeFromCookie,
  clearReferralCookie,
  hasReferralCode,
  validateAndSaveReferralCode,
  
  // Rank
  useReferralRank,
  useUpdateRank
} from './hooks';

// ========== UI ==========
export {
  SeederRankProgress,
  CommissionTracker,
  RegisterCustomerModal,
  ReferralQRCode
} from './ui';