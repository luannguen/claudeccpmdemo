
/**
 * Gift Types - Public exports
 */

export * from './GiftDTO';
export { GIFT_STATUS, GIFT_ORDER_STATUS } from '../domain/giftStateMachine';
export { DELIVERY_MODE, OCCASION, DELIVERY_MODE_CONFIG, OCCASION_CONFIG } from '../domain/deliveryPolicies';
// ECARD-F19: Gift Context
export {
  GIFT_CONTEXT,
  GIFT_CONTEXT_CONFIG,
  getContextConfig,
  getSortedContexts,
  getReceiverDisplayInfo,
  getContextColorClasses,
  mapOccasionToContext
} from '../domain/giftContextPolicies';
