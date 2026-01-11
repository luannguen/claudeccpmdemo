/**
 * Gift Repository - Data Access Layer
 * Handles all gift transaction data operations
 */

import { base44 } from '@/api/base44Client';
import { GIFT_STATUS, GIFT_EXPIRY_DAYS } from '../types';

/**
 * List sent gifts
 */
export const listSentGifts = async (userId) => {
  return base44.entities.GiftTransaction.filter({
    sender_user_id: userId
  });
};

/**
 * List received gifts
 */
export const listReceivedGifts = async (userId) => {
  return base44.entities.GiftTransaction.filter({
    receiver_user_id: userId
  });
};

/**
 * Increment gift count
 */
const incrementGiftCount = async (userId, type) => {
  const profiles = await base44.entities.EcardProfile.filter({ user_id: userId });
  if (profiles && profiles[0]) {
    const field = type === 'sent' ? 'gifts_sent' : 'gifts_received';
    await base44.entities.EcardProfile.update(profiles[0].id, {
      [field]: (profiles[0][field] || 0) + 1
    });
  }
};

/**
 * Send gift
 */
export const sendGift = async (giftData) => {
  const sentDate = new Date();
  const expiresAt = new Date(sentDate);
  expiresAt.setDate(expiresAt.getDate() + GIFT_EXPIRY_DAYS);

  const redemptionCode = `GIFT-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

  const transaction = await base44.entities.GiftTransaction.create({
    ...giftData,
    status: GIFT_STATUS.SENT,
    redemption_code: redemptionCode,
    sent_date: sentDate.toISOString(),
    expires_at: expiresAt.toISOString()
  });

  // Tăng thống kê
  await incrementGiftCount(giftData.sender_user_id, 'sent');
  await incrementGiftCount(giftData.receiver_user_id, 'received');

  return transaction;
};

/**
 * Redeem gift by code
 */
export const redeemGift = async (code, userId) => {
  const gifts = await base44.entities.GiftTransaction.filter({
    redemption_code: code,
    receiver_user_id: userId,
    status: GIFT_STATUS.SENT
  });

  if (gifts.length === 0) {
    throw new Error('Gift not found or already redeemed');
  }

  const gift = gifts[0];
  
  // Check expiry
  if (new Date(gift.expires_at) < new Date()) {
    await base44.entities.GiftTransaction.update(gift.id, {
      status: GIFT_STATUS.EXPIRED
    });
    throw new Error('Gift has expired');
  }

  return base44.entities.GiftTransaction.update(gift.id, {
    status: GIFT_STATUS.REDEEMED,
    redeemed_date: new Date().toISOString()
  });
};