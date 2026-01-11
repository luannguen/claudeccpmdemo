
/**
 * 📧 PreOrder Event Handler - Listen to preorder/harvest events
 */

import { eventBus } from '@/components/shared/events';
import { EmailServiceFacade } from '../../application/EmailServiceFacade';
import { EMAIL_EVENT_TYPES } from '../../types/EventPayloads';

/**
 * Handle HARVEST_READY event
 */
eventBus.subscribe(EMAIL_EVENT_TYPES.HARVEST_READY, async (event) => {
  try {
    const { lotId, lotName, productName, affectedOrders } = event;
    
    // Send email to all customers with orders for this lot
    for (const orderInfo of affectedOrders || []) {
      await EmailServiceFacade.sendHarvestReady(
        orderInfo.order,
        { lot_name: lotName, product_name: productName, id: lotId }
      );
    }
  } catch (error) {
    console.error('❌ [PreOrderEventHandler] HARVEST_READY failed:', error);
  }
});

/**
 * Handle HARVEST_REMINDER event
 */
eventBus.subscribe(EMAIL_EVENT_TYPES.HARVEST_REMINDER, async (event) => {
  try {
    await EmailServiceFacade.sendHarvestReminder(
      event.order,
      event.lot,
      event.daysUntilHarvest
    );
  } catch (error) {
    console.error('❌ [PreOrderEventHandler] HARVEST_REMINDER failed:', error);
  }
});

/**
 * Handle DEPOSIT_RECEIVED event
 */
eventBus.subscribe(EMAIL_EVENT_TYPES.DEPOSIT_RECEIVED, async (event) => {
  try {
    await EmailServiceFacade.sendDepositReminder(event.order, event.daysLeft);
  } catch (error) {
    console.error('❌ [PreOrderEventHandler] DEPOSIT_RECEIVED failed:', error);
  }
});

// Handler registered
