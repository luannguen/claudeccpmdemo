/**
 * Gift State Machine
 * Defines valid status transitions and rules
 */

export const GIFT_STATUS = {
  PENDING_PAYMENT: 'pending_payment',
  PAID: 'paid',
  SENT: 'sent',
  REDEEMABLE: 'redeemable',
  REDEEMED: 'redeemed',
  FULFILLMENT_CREATED: 'fulfillment_created',
  DELIVERED: 'delivered',
  SWAPPED: 'swapped',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired'
};

export const GIFT_ORDER_STATUS = {
  DRAFT: 'draft',
  PENDING_PAYMENT: 'pending_payment',
  PAID: 'paid',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded'
};

/**
 * Valid status transitions for GiftTransaction
 */
const VALID_TRANSITIONS = {
  [GIFT_STATUS.PENDING_PAYMENT]: [GIFT_STATUS.PAID, GIFT_STATUS.CANCELLED],
  [GIFT_STATUS.PAID]: [GIFT_STATUS.SENT, GIFT_STATUS.CANCELLED],
  [GIFT_STATUS.SENT]: [GIFT_STATUS.REDEEMABLE, GIFT_STATUS.EXPIRED, GIFT_STATUS.CANCELLED],
  [GIFT_STATUS.REDEEMABLE]: [GIFT_STATUS.REDEEMED, GIFT_STATUS.SWAPPED, GIFT_STATUS.EXPIRED, GIFT_STATUS.CANCELLED],
  [GIFT_STATUS.REDEEMED]: [GIFT_STATUS.FULFILLMENT_CREATED],
  [GIFT_STATUS.FULFILLMENT_CREATED]: [GIFT_STATUS.DELIVERED],
  [GIFT_STATUS.DELIVERED]: [], // Terminal state
  [GIFT_STATUS.SWAPPED]: [], // Terminal state
  [GIFT_STATUS.CANCELLED]: [], // Terminal state
  [GIFT_STATUS.EXPIRED]: [] // Terminal state
};

/**
 * Check if transition is valid
 */
export const canTransition = (currentStatus, nextStatus) => {
  const allowed = VALID_TRANSITIONS[currentStatus] || [];
  return allowed.includes(nextStatus);
};

/**
 * Get next possible statuses
 */
export const getNextStatuses = (currentStatus) => {
  return VALID_TRANSITIONS[currentStatus] || [];
};

/**
 * Check if status is terminal
 */
export const isTerminalStatus = (status) => {
  return [
    GIFT_STATUS.DELIVERED,
    GIFT_STATUS.SWAPPED,
    GIFT_STATUS.CANCELLED,
    GIFT_STATUS.EXPIRED
  ].includes(status);
};

/**
 * Check if gift can be redeemed
 */
export const canRedeem = (gift) => {
  if (!gift) return false;
  return gift.status === GIFT_STATUS.REDEEMABLE && !isExpired(gift);
};

/**
 * Check if gift can be swapped
 */
export const canSwap = (gift) => {
  if (!gift) return false;
  return gift.status === GIFT_STATUS.REDEEMABLE && 
         gift.can_swap === true && 
         !isExpired(gift);
};

/**
 * Check if gift is expired
 */
export const isExpired = (gift) => {
  if (!gift || !gift.expires_at) return false;
  return new Date(gift.expires_at) < new Date();
};