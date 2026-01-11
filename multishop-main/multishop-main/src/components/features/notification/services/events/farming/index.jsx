
/**
 * Farming Event Handlers - Public API
 * 
 * Domain: PreOrder, Harvest, Price
 */

export { registerHarvestHandlers, handleHarvestReminder, handleHarvestReady, handleHarvestUpcoming, handleFinalPaymentReminder } from './HarvestEventHandler';
export { registerPriceHandlers, handlePriceFomo, handlePriceIncreased } from './PriceEventHandler';

/**
 * Register all farming handlers (uses static imports from above)
 */
export const registerFarmingHandlers = (registry) => {
  registerHarvestHandlers(registry);
  registerPriceHandlers(registry);
  
  // Farming domain handlers registered
};
