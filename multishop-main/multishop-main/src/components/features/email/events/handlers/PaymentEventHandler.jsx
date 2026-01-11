
/**
 * 📧 Payment Event Handler - Listen to payment events
 */

import { eventBus } from '@/components/shared/events';
import { EmailServiceFacade } from '../../application/EmailServiceFacade';
import { EMAIL_EVENT_TYPES } from '../../types/EventPayloads';

/**
 * Handle PAYMENT_CONFIRMED event
 */
eventBus.subscribe(EMAIL_EVENT_TYPES.PAYMENT_CONFIRMED, async (event) => {
  try {
    await EmailServiceFacade.sendPaymentConfirmation(event.order);
  } catch (error) {
    console.error('❌ [PaymentEventHandler] Failed:', error);
  }
});

/**
 * Handle PAYMENT_FAILED event
 */
eventBus.subscribe(EMAIL_EVENT_TYPES.PAYMENT_FAILED, async (event) => {
  try {
    await EmailServiceFacade.sendPaymentFailed(event.order);
  } catch (error) {
    console.error('❌ [PaymentEventHandler] Failed:', error);
  }
});
