/**
 * Referral Domain Layer - Public Exports
 * Pure business logic, no side effects
 * 
 * @module features/referral/domain
 */

// Code Generation
export { 
  generateCode, 
  validateCodeFormat, 
  normalizeCode 
} from './codeGenerator';

// Validation
export {
  validateEmail,
  validatePhone,
  validateMemberForCommission,
  validateNotSelfReferral,
  validateCustomerReferralAssignment,
  validatePayoutEligibility,
  validateReferralValidity
} from './validators';

// Commission Calculation
export {
  getCommissionTier,
  calculateCommissionAmount,
  calculateTotalRate,
  calculateOrderCommission,
  calculateProjectedCommission
} from './commissionCalculator';

// Rank Management
export {
  getRankIndex,
  isHigherRank,
  getNextRank,
  meetsRankRequirements,
  calculateAchievableRank,
  getRankDisplay,
  calculateRankProgress,
  buildF1Stats
} from './rankManager';

// Fraud Detection
export {
  DEFAULT_FRAUD_RULES,
  runFraudChecks,
  shouldFlagMember,
  calculateNewFraudScore
} from './fraudDetector';

// Member Rules
export {
  checkEligibility,
  getInitialMemberStatus,
  canReceiveCommission,
  canWithdrawCommission,
  canSuspendMember,
  canReactivateMember,
  buildReferralLink,
  canRegisterCustomer
} from './memberRules';

// Default exports as namespaced objects
import codeGenerator from './codeGenerator';
import validators from './validators';
import commissionCalculator from './commissionCalculator';
import rankManager from './rankManager';
import fraudDetector from './fraudDetector';
import memberRules from './memberRules';

export {
  codeGenerator,
  validators,
  commissionCalculator,
  rankManager,
  fraudDetector,
  memberRules
};