/**
 * Price Event Handler - Farming domain
 * 
 * Handles: price.fomo, price.increased
 */

import { notificationEngine } from '../../../core/notificationEngine';
import { PriceEvents } from '../../../types/EventTypes';
import { createPageUrl } from '@/utils';

/**
 * Handle FOMO notification (price about to increase)
 */
export const handlePriceFomo = async (payload) => {
  const { lot, hoursUntilIncrease, currentPrice, nextPrice } = payload;
  const percentIncrease = Math.round(((nextPrice - currentPrice) / currentPrice) * 100);

  console.log('🔥 [PriceEventHandler] price.fomo:', lot.lot_name);

  // Broadcast notification to interested users
  await notificationEngine.create({
    actor: 'client',
    type: 'promo',
    recipients: null, // Broadcast
    payload: {
      title: `⏰ Giá sắp tăng ${percentIncrease}%!`,
      message: `${lot.product_name} - Chỉ còn ${hoursUntilIncrease}h để mua với giá ${currentPrice.toLocaleString('vi-VN')}đ`,
      link: createPageUrl('PreOrderProductDetail') + `?id=${lot.id}`,
      priority: 'high',
      metadata: {
        notification_type: 'price_fomo',
        lot_id: lot.id,
        lot_name: lot.lot_name,
        product_name: lot.product_name,
        current_price: currentPrice,
        next_price: nextPrice,
        hours_until_increase: hoursUntilIncrease,
        percent_increase: percentIncrease
      }
    }
  });

  // Admin notification
  await notificationEngine.create({
    actor: 'admin',
    type: 'system_alert',
    recipients: null,
    payload: {
      title: `📈 FOMO: ${lot.product_name}`,
      message: `Giá sẽ tăng ${percentIncrease}% trong ${hoursUntilIncrease}h`,
      link: createPageUrl('AdminProductLots'),
      priority: 'normal',
      metadata: {
        lot_id: lot.id,
        current_price: currentPrice,
        next_price: nextPrice,
        percent_increase: percentIncrease
      }
    },
    routing: {
      related_entity_type: 'ProductLot',
      related_entity_id: lot.id
    }
  });
};

/**
 * Handle price increased notification
 */
export const handlePriceIncreased = async (payload) => {
  const { lot, oldPrice, newPrice } = payload;
  const percentIncrease = Math.round(((newPrice - oldPrice) / oldPrice) * 100);

  console.log('📈 [PriceEventHandler] price.increased:', lot.lot_name);

  await notificationEngine.create({
    actor: 'admin',
    type: 'system_alert',
    recipients: null,
    payload: {
      title: `📈 Giá đã tăng: ${lot.product_name}`,
      message: `Lot "${lot.lot_name}": ${oldPrice.toLocaleString('vi-VN')}đ → ${newPrice.toLocaleString('vi-VN')}đ (+${percentIncrease}%)`,
      link: createPageUrl('AdminProductLots'),
      priority: 'normal',
      metadata: {
        lot_id: lot.id,
        lot_name: lot.lot_name,
        old_price: oldPrice,
        new_price: newPrice,
        percent_increase: percentIncrease
      }
    },
    routing: {
      related_entity_type: 'ProductLot',
      related_entity_id: lot.id
    }
  });
};

/**
 * Register all price event handlers
 */
export const registerPriceHandlers = (registry) => {
  registry.register(PriceEvents.FOMO, handlePriceFomo, { priority: 8 });
  registry.register(PriceEvents.INCREASED, handlePriceIncreased, { priority: 5 });
  
  console.log('✅ Price event handlers registered');
};

export default {
  handlePriceFomo,
  handlePriceIncreased,
  registerPriceHandlers
};