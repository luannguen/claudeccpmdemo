
/**
 * Gift Module - Public API
 * 
 * This is the ONLY file that should be imported from outside the module.
 * All internal implementation details are hidden.
 */

// Hooks (main interface)
export { useGiftOrder, useGiftSend, useGiftInbox, useSentGifts, useGiftRedeem, useGiftAdmin } from './hooks';

// UI Components
export { SendGiftModal, RedeemGiftModal, SwapGiftModal, GiftCard } from './ui';

// ECARD-F19: Gift Context UI Components
export { default as GiftContextSelector, GiftContextChips, GiftContextCards, GiftContextBadge, GiftContextPreview } from './ui/GiftContextSelector';
export { GiftContextBanner, GiftContextCard, GiftContextInline, GiftContextTag } from './ui/GiftContextDisplay';

// Admin UI Components
export { GiftAnalyticsWidget, GiftTransactionTable } from './ui/admin';

// Types & Constants
export { 
  GIFT_STATUS, 
  GIFT_ORDER_STATUS, 
  DELIVERY_MODE, 
  OCCASION,
  DELIVERY_MODE_CONFIG,
  OCCASION_CONFIG,
  // ECARD-F19: Gift Context
  GIFT_CONTEXT,
  GIFT_CONTEXT_CONFIG,
  getContextConfig,
  getSortedContexts,
  getReceiverDisplayInfo,
  getContextColorClasses
} from './types';

// Domain rules (for external validation if needed)
export { canRedeem, canSwap, isExpired, canTransition } from './domain/giftStateMachine';

// Notification handlers (for scheduled tasks or external triggers)
export { 
  notifyGiftReceived, 
  notifyGiftRedeemed, 
  notifyGiftDelivered,
  notifyGiftExpiringSoon,
  notifyGiftExpired,
  notifyGiftSwapped
} from './services/giftNotificationHandler';
