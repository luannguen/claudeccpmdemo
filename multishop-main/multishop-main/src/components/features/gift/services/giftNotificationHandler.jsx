/**
 * Gift Notification Handler
 * Handles sending notifications for gift events
 * Uses NotificationServiceFacade from notification module
 */

import { NotificationServiceFacade } from '@/components/features/notification';

/**
 * Notify receiver about new gift
 */
export const notifyGiftReceived = async (gift) => {
  await NotificationServiceFacade.notifyUser({
    recipient_email: gift.receiver_email || gift.receiver_user_id,
    type: 'gift',
    title: '🎁 Bạn nhận được quà!',
    message: `${gift.sender_name} đã gửi cho bạn món quà "${gift.item_name}"`,
    link: '/MyEcard?tab=gifts',
    metadata: {
      gift_id: gift.id,
      sender_name: gift.sender_name,
      item_name: gift.item_name,
      item_value: gift.item_value
    }
  });
};

/**
 * Notify sender when gift is redeemed
 */
export const notifyGiftRedeemed = async (gift) => {
  await NotificationServiceFacade.notifyUser({
    recipient_email: gift.sender_email || gift.sender_user_id,
    type: 'gift',
    title: '✅ Quà của bạn đã được đổi!',
    message: `${gift.receiver_name} đã đổi quà "${gift.item_name}" và sẽ nhận hàng sớm`,
    link: '/MyEcard?tab=gifts',
    metadata: {
      gift_id: gift.id,
      receiver_name: gift.receiver_name,
      item_name: gift.item_name
    }
  });
};

/**
 * Notify sender when gift is delivered
 */
export const notifyGiftDelivered = async (gift) => {
  await NotificationServiceFacade.notifyUser({
    recipient_email: gift.sender_email || gift.sender_user_id,
    type: 'gift',
    title: '📦 Quà đã được giao!',
    message: `Quà "${gift.item_name}" đã được giao đến ${gift.receiver_name}`,
    link: '/MyEcard?tab=gifts',
    metadata: {
      gift_id: gift.id,
      receiver_name: gift.receiver_name
    }
  });
};

/**
 * Notify receiver when gift is about to expire (7 days before)
 */
export const notifyGiftExpiringSoon = async (gift) => {
  await NotificationServiceFacade.notifyUser({
    recipient_email: gift.receiver_email || gift.receiver_user_id,
    type: 'gift',
    title: '⏰ Quà sắp hết hạn!',
    message: `Quà "${gift.item_name}" từ ${gift.sender_name} sẽ hết hạn trong 7 ngày. Hãy đổi ngay!`,
    link: '/MyEcard?tab=gifts',
    priority: 'high',
    metadata: {
      gift_id: gift.id,
      expires_at: gift.expires_at
    }
  });
};

/**
 * Notify sender when gift expires without redemption
 */
export const notifyGiftExpired = async (gift) => {
  await NotificationServiceFacade.notifyUser({
    recipient_email: gift.sender_email || gift.sender_user_id,
    type: 'gift',
    title: '⌛ Quà đã hết hạn',
    message: `Quà "${gift.item_name}" gửi cho ${gift.receiver_name} đã hết hạn mà chưa được đổi`,
    link: '/MyEcard?tab=gifts',
    metadata: {
      gift_id: gift.id,
      receiver_name: gift.receiver_name
    }
  });
};

/**
 * Notify sender when receiver swaps gift
 */
export const notifyGiftSwapped = async (gift, newProduct) => {
  await NotificationServiceFacade.notifyUser({
    recipient_email: gift.sender_email || gift.sender_user_id,
    type: 'gift',
    title: '🔄 Quà đã được đổi sang món khác',
    message: `${gift.receiver_name} đã đổi "${gift.item_name}" sang "${newProduct.name}"`,
    link: '/MyEcard?tab=gifts',
    metadata: {
      gift_id: gift.id,
      original_item: gift.item_name,
      new_item: newProduct.name
    }
  });
};