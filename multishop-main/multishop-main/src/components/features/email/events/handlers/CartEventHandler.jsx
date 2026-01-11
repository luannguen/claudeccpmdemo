
/**
 * 📧 Cart Event Handler - Listen to cart events
 */

import { eventBus } from '@/components/shared/events';
import { EmailServiceFacade } from '../../application/EmailServiceFacade';
import { EMAIL_EVENT_TYPES } from '../../types/EventPayloads';

/**
 * Handle CART_ABANDONED event → Send recovery email
 */
eventBus.subscribe(EMAIL_EVENT_TYPES.CART_ABANDONED, async (event) => {
  try {
    const cart = {
      id: event.cartId,
      user_email: event.userEmail,
      items: event.items,
      subtotal: event.subtotal
    };
    
    await EmailServiceFacade.sendCartRecovery(cart, event.discountCode);
  } catch (error) {
    console.error('❌ [CartEventHandler] Failed:', error);
  }
});
