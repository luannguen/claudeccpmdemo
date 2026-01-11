
/**
 * Commerce Event Handlers - Public API
 * 
 * Domain: Order, Payment, Inventory
 */

export { registerOrderHandlers, handleOrderCreated, handleOrderStatusChange } from './OrderEventHandler';
export { registerPaymentHandlers, handlePaymentVerificationNeeded, handlePaymentConfirmed, handlePaymentFailed, handleDepositReceived } from './PaymentEventHandler';
export { registerInventoryHandlers, handleLowStock, handleOutOfStock, handleRestocked } from './InventoryEventHandler';

/**
 * Register all commerce handlers (uses static imports from above)
 */
export const registerCommerceHandlers = (registry) => {
  registerOrderHandlers(registry);
  registerPaymentHandlers(registry);
  registerInventoryHandlers(registry);
  
  // Commerce domain handlers registered
};
