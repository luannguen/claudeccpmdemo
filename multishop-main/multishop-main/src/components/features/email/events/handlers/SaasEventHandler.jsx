
/**
 * 📧 SaaS Event Handler - Listen to SaaS/tenant events
 * 
 * Handles:
 * - MEMBER_INVITED
 * - SUBSCRIPTION_PAYMENT_FAILED
 * - SUBSCRIPTION_EXPIRY_WARNING
 * - INVOICE_GENERATED
 */

import { eventBus } from '@/components/shared/events';
import { EmailServiceFacade } from '../../application/EmailServiceFacade';
import { EMAIL_EVENT_TYPES } from '../../types/EventPayloads';

/**
 * Handle MEMBER_INVITED event
 */
eventBus.subscribe(EMAIL_EVENT_TYPES.MEMBER_INVITED, async (event) => {
  try {
    await EmailServiceFacade.sendMemberInvitedEmail({
      invitee_email: event.inviteeEmail,
      invitee_name: event.inviteeName,
      inviter_name: event.inviterName,
      shop_name: event.shopName || event.tenantName,
      invite_link: event.inviteLink,
      role: event.role
    });
  } catch (error) {
    console.error('❌ [SaasEventHandler] MEMBER_INVITED failed:', error);
  }
});

/**
 * Handle SUBSCRIPTION_PAYMENT_FAILED event
 */
eventBus.subscribe(EMAIL_EVENT_TYPES.SUBSCRIPTION_PAYMENT_FAILED, async (event) => {
  try {
    await EmailServiceFacade.sendSubscriptionPaymentFailedEmail({
      email: event.tenantEmail,
      shop_name: event.shopName || event.tenantName,
      amount: event.amount,
      retry_link: event.retryLink
    });
  } catch (error) {
    console.error('❌ [SaasEventHandler] SUBSCRIPTION_PAYMENT_FAILED failed:', error);
  }
});

/**
 * Handle SUBSCRIPTION_EXPIRY_WARNING event
 */
eventBus.subscribe(EMAIL_EVENT_TYPES.SUBSCRIPTION_EXPIRY_WARNING, async (event) => {
  try {
    await EmailServiceFacade.sendSubscriptionExpiryWarningEmail({
      email: event.tenantEmail,
      shop_name: event.shopName || event.tenantName,
      expiry_date: event.expiryDate,
      renew_link: event.renewLink
    });
  } catch (error) {
    console.error('❌ [SaasEventHandler] SUBSCRIPTION_EXPIRY_WARNING failed:', error);
  }
});

/**
 * Handle INVOICE_GENERATED event
 */
eventBus.subscribe(EMAIL_EVENT_TYPES.INVOICE_GENERATED, async (event) => {
  try {
    await EmailServiceFacade.sendInvoiceEmail({
      email: event.tenantEmail,
      shop_name: event.shopName || event.tenantName,
      invoice_number: event.invoiceNumber,
      amount: event.amount,
      due_date: event.dueDate,
      invoice_link: event.invoiceLink
    });
  } catch (error) {
    console.error('❌ [SaasEventHandler] INVOICE_GENERATED failed:', error);
  }
});
