
/**
 * 📧 Referral Event Handler - Listen to referral events
 */

import { eventBus } from '@/components/shared/events';
import { EmailServiceFacade } from '../../application/EmailServiceFacade';
import { EMAIL_EVENT_TYPES } from '../../types/EventPayloads';

/**
 * Handle REFERRAL_COMMISSION_EARNED event
 */
eventBus.subscribe(EMAIL_EVENT_TYPES.REFERRAL_COMMISSION_EARNED, async (event) => {
  try {
    await EmailServiceFacade.sendReferralCommission(
      { email: event.memberEmail, name: event.memberName },
      event.commissionAmount,
      event.referredCustomer
    );
  } catch (error) {
    console.error('❌ [ReferralEventHandler] Failed:', error);
  }
});

/**
 * Handle REFERRAL_RANK_UP event
 */
eventBus.subscribe(EMAIL_EVENT_TYPES.REFERRAL_RANK_UP, async (event) => {
  try {
    await EmailServiceFacade.sendReferralWelcome({
      email: event.memberEmail,
      name: event.memberName,
      referral_code: event.referralCode
    });
  } catch (error) {
    console.error('❌ [ReferralEventHandler] Failed:', error);
  }
});
