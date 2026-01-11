
/**
 * 📧 Order Event Handler - Listen to order events and send emails
 * 
 * Event-driven email automation for order lifecycle.
 * Tuân thủ: Section 19.5 - Cross-Module Communication via Events
 */

import { eventBus } from '@/components/shared/events';
import { EmailServiceFacade } from '../../application/EmailServiceFacade';
import { EMAIL_EVENT_TYPES } from '../../types/EventPayloads';

/**
 * Handle ORDER_PLACED event → Send order confirmation
 */
eventBus.subscribe(EMAIL_EVENT_TYPES.ORDER_PLACED, async (event) => {
  try {    
    await EmailServiceFacade.sendOrderConfirmation({
      id: event.orderId,
      order_number: event.orderNumber,
      customer_email: event.customerEmail,
      customer_name: event.customerName,
      customer_phone: event.customerPhone,
      total_amount: event.totalAmount,
      items: event.items,
      shipping_address: event.shippingAddress,
      payment_method: event.paymentMethod,
      created_date: event.createdDate,
      subtotal: event.subtotal,
      shipping_fee: event.shippingFee,
      discount_amount: event.discountAmount
    });
  } catch (error) {
    console.error('❌ [OrderEventHandler] Failed to send confirmation:', error);
  }
});

/**
 * Handle ORDER_SHIPPED event → Send shipping notification
 */
eventBus.subscribe(EMAIL_EVENT_TYPES.ORDER_SHIPPED, async (event) => {
  try {    
    await EmailServiceFacade.sendShippingNotification(event.order);
  } catch (error) {
    console.error('❌ [OrderEventHandler] Shipping notification failed:', error);
  }
});

/**
 * Handle ORDER_DELIVERED event → Send delivery confirmation
 */
eventBus.subscribe(EMAIL_EVENT_TYPES.ORDER_DELIVERED, async (event) => {
  try {    
    await EmailServiceFacade.sendDeliveryConfirmation(event.order);
  } catch (error) {
    console.error('❌ [OrderEventHandler] Delivery confirmation failed:', error);
  }
});
