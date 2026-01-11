/**
 * ReferralLinkHandler - Auto-capture referral links
 * 
 * ⚠️ DEPRECATED: Logic đã được di chuyển vào @/components/features/referral
 * File này giữ lại cho backward compatibility
 * 
 * @deprecated Import từ @/components/features/referral thay thế
 */

import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/NotificationToast';
import { validateAndSaveReferralCode } from '@/components/features/referral';

// ========== MAIN COMPONENT ==========

export default function ReferralLinkHandler() {
  const [searchParams] = useSearchParams();
  const { addToast } = useToast();
  
  useEffect(() => {
    const refCode = searchParams.get('ref');
    
    if (refCode) {
      // Validate và save ref code
      validateAndSaveReferralCode(refCode).then(result => {
        if (result.valid) {
          addToast(
            `🎁 Bạn được giới thiệu bởi ${result.referrer.name}. Mã ưu đãi đã được lưu!`,
            'success'
          );
          
          // Track referral link click
          base44.entities.UserActivity.create({
            event_type: 'referral_share',
            target_type: 'User',
            target_id: result.referrer.email,
            target_name: result.referrer.name,
            metadata: {
              referral_code: refCode,
              action: 'link_clicked'
            }
          }).catch(console.error);
        } else {
          addToast(`❌ ${result.error}`, 'warning');
          deleteCookie(REFERRAL_COOKIE_KEY);
        }
      });
    }
  }, [searchParams, addToast]);
  
  return null; // Component không render gì
}

// ========== EXPORT HELPERS (Re-export from module) ==========

export { 
  getReferralCodeFromCookie,
  clearReferralCookie,
  hasReferralCode
} from '@/components/features/referral';