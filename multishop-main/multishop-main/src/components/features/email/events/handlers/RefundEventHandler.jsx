
/**
 * 📧 Refund Event Handler - Listen to refund events
 * 
 * Handles:
 * - REFUND_REQUESTED
 * - REFUND_APPROVED
 * - REFUND_SUCCEEDED
 */

import { eventBus } from '@/components/shared/events';
import { EmailServiceFacade } from '../../application/EmailServiceFacade';
import { EMAIL_EVENT_TYPES } from '../../types/EventPayloads';

/**
 * Handle REFUND_REQUESTED event
 */
eventBus.subscribe(EMAIL_EVENT_TYPES.REFUND_REQUESTED, async (event) => {
  try {
    await EmailServiceFacade.sendRefundRequestedEmail({
      order: event.order,
      reason: event.reason,
      amount: event.amount
    });
  } catch (error) {
    console.error('❌ [RefundEventHandler] REFUND_REQUESTED failed:', error);
  }
});

/**
 * Handle REFUND_APPROVED event
 */
eventBus.subscribe(EMAIL_EVENT_TYPES.REFUND_APPROVED, async (event) => {
  try {
    await EmailServiceFacade.sendRefundApprovedEmail({
      order: event.order,
      amount: event.amount,
      refund_method: event.refundMethod || 'Chuyển khoản'
    });
  } catch (error) {
    console.error('❌ [RefundEventHandler] REFUND_APPROVED failed:', error);
  }
});

/**
 * Handle REFUND_SUCCEEDED event
 */
eventBus.subscribe(EMAIL_EVENT_TYPES.REFUND_SUCCEEDED, async (event) => {
  try {
    await EmailServiceFacade.sendRefundSucceededEmail({
      order: event.order,
      amount: event.amount,
      txn_id: event.transactionId,
      refund_date: event.refundDate || new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [RefundEventHandler] REFUND_SUCCEEDED failed:', error);
  }
});

// Handler registered
