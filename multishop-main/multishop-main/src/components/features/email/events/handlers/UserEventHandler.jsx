
/**
 * 📧 User Event Handler - Listen to user lifecycle events
 */

import { eventBus } from '@/components/shared/events';
import { EmailServiceFacade } from '../../application/EmailServiceFacade';
import { EMAIL_EVENT_TYPES } from '../../types/EventPayloads';

/**
 * Handle USER_REGISTERED event → Send welcome email
 */
eventBus.subscribe(EMAIL_EVENT_TYPES.USER_REGISTERED, async (event) => {
  try {
    await EmailServiceFacade.sendWelcomeEmail({
      email: event.email,
      full_name: event.fullName
    });
  } catch (error) {
    console.error('❌ [UserEventHandler] Failed:', error);
  }
});
