
/**
 * useReferralCheckout - Legacy Adapter
 * 
 * ⚠️ DEPRECATED: Sử dụng @/components/features/referral thay thế
 * 
 * @deprecated Use @/components/features/referral instead
 */

import {
  useReferralCheckout,
  getReferralCodeFromCookie,
  clearReferralCookie,
  hasReferralCode,
  validateAndSaveReferralCode
} from '@/components/features/referral';

export {
  useReferralCheckout,
  getReferralCodeFromCookie,
  clearReferralCookie,
  hasReferralCode,
  validateAndSaveReferralCode
};

export default useReferralCheckout;
