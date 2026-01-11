/**
 * Gift Transaction Repository - Data Access Layer
 * Handles GiftTransaction CRUD operations
 */

import { base44 } from '@/api/base44Client';

const GIFT_EXPIRY_DAYS = 90;

/**
 * Generate unique redemption code
 */
const generateRedemptionCode = () => {
  return `GIFT-${Date.now()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
};

/**
 * Create gift transaction from paid order
 */
export const createFromOrder = async (giftOrder, giftConfig) => {
  const {
    receiver_user_id,
    receiver_name,
    receiver_email,
    connection_id,
    delivery_mode,
    scheduled_delivery_date,
    occasion,
    message,
    can_swap
  } = giftConfig;

  const item = giftOrder.items[0]; // Gift order chỉ có 1 item
  const sentDate = new Date();
  const expiresAt = new Date(sentDate);
  expiresAt.setDate(expiresAt.getDate() + GIFT_EXPIRY_DAYS);

  const gift = await base44.entities.GiftTransaction.create({
    gift_order_id: giftOrder.id,
    sender_user_id: giftOrder.buyer_user_id,
    sender_name: giftOrder.buyer_name,
    sender_email: giftOrder.buyer_email,
    receiver_user_id,
    receiver_name,
    receiver_email,
    connection_id,
    item_id: item.product_id,
    item_type: 'product',
    item_name: item.product_name,
    item_image: item.product_image,
    item_value: item.price,
    message,
    occasion,
    status: 'paid',
    delivery_mode,
    scheduled_delivery_date,
    redemption_code: generateRedemptionCode(),
    can_swap,
    sent_date: sentDate.toISOString(),
    expires_at: expiresAt.toISOString()
  });

  // Update GiftOrder with transaction ID
  await base44.entities.GiftOrder.update(giftOrder.id, {
    gift_transaction_ids: [...(giftOrder.gift_transaction_ids || []), gift.id]
  });

  return gift;
};

/**
 * Mark gift as sent (notify receiver)
 */
export const markSent = async (giftId) => {
  return base44.entities.GiftTransaction.update(giftId, {
    status: 'sent'
  });
};

/**
 * Mark gift as redeemable
 */
export const markRedeemable = async (giftId) => {
  return base44.entities.GiftTransaction.update(giftId, {
    status: 'redeemable'
  });
};

/**
 * Redeem gift with shipping info
 */
export const redeemGift = async (giftId, shippingInfo) => {
  return base44.entities.GiftTransaction.update(giftId, {
    status: 'redeemed',
    redeemed_at: new Date().toISOString(),
    receiver_phone: shippingInfo.phone,
    receiver_shipping_address: shippingInfo.address
  });
};

/**
 * Mark fulfillment order created
 */
export const markFulfillmentCreated = async (giftId, orderId) => {
  return base44.entities.GiftTransaction.update(giftId, {
    status: 'fulfillment_created',
    fulfillment_order_id: orderId
  });
};

/**
 * Mark delivered
 */
export const markDelivered = async (giftId) => {
  return base44.entities.GiftTransaction.update(giftId, {
    status: 'delivered'
  });
};

/**
 * Swap gift to new product
 */
export const swapGift = async (originalGiftId, newProductId, newProductData) => {
  // Mark original as swapped
  await base44.entities.GiftTransaction.update(originalGiftId, {
    status: 'swapped'
  });

  // Get original gift
  const originalGifts = await base44.entities.GiftTransaction.filter({ id: originalGiftId });
  const original = originalGifts[0];

  // Create new gift
  const sentDate = new Date();
  const expiresAt = new Date(sentDate);
  expiresAt.setDate(expiresAt.getDate() + GIFT_EXPIRY_DAYS);

  return base44.entities.GiftTransaction.create({
    gift_order_id: original.gift_order_id,
    sender_user_id: original.sender_user_id,
    sender_name: original.sender_name,
    sender_email: original.sender_email,
    receiver_user_id: original.receiver_user_id,
    receiver_name: original.receiver_name,
    receiver_email: original.receiver_email,
    connection_id: original.connection_id,
    item_id: newProductId,
    item_type: 'product',
    item_name: newProductData.name,
    item_image: newProductData.image_url,
    item_value: newProductData.price,
    message: original.message,
    occasion: original.occasion,
    status: 'redeemable',
    delivery_mode: original.delivery_mode,
    can_swap: true,
    swapped_from_gift_id: originalGiftId,
    redemption_code: generateRedemptionCode(),
    sent_date: sentDate.toISOString(),
    expires_at: expiresAt.toISOString()
  });
};

/**
 * List gifts by receiver (inbox)
 */
export const listInbox = async (userId) => {
  return base44.entities.GiftTransaction.filter({
    receiver_user_id: userId
  });
};

/**
 * List gifts by sender
 */
export const listSent = async (userId) => {
  return base44.entities.GiftTransaction.filter({
    sender_user_id: userId
  });
};

/**
 * Get gift by redemption code
 */
export const getByRedemptionCode = async (code) => {
  const gifts = await base44.entities.GiftTransaction.filter({
    redemption_code: code
  });
  return gifts[0] || null;
};

/**
 * Check if gift is expired
 */
export const isExpired = (gift) => {
  if (!gift || !gift.expires_at) return false;
  return new Date(gift.expires_at) < new Date();
};

/**
 * Mark expired
 */
export const markExpired = async (giftId) => {
  return base44.entities.GiftTransaction.update(giftId, {
    status: 'expired'
  });
};