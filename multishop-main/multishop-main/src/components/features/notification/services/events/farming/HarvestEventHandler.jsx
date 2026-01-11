/**
 * Harvest Event Handler - Farming domain
 * 
 * Handles: harvest.reminder, harvest.ready, harvest.upcoming, harvest.final_payment_reminder
 */

import { notificationEngine } from '../../../core/notificationEngine';
import { HarvestEvents } from '../../../types/EventTypes';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';

/**
 * Handle harvest reminder (3-5 days before)
 */
export const handleHarvestReminder = async (payload) => {
  const { order, lot, daysUntilHarvest } = payload;
  const orderNumber = order.order_number || order.id?.slice(-8);
  const harvestDate = new Date(lot.estimated_harvest_date).toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  console.log('🌾 [HarvestEventHandler] harvest.reminder:', orderNumber);

  // Customer notification
  if (order.customer_email) {
    await notificationEngine.create({
      actor: 'client',
      type: 'harvest_reminder',
      recipients: order.customer_email,
      payload: {
        title: '🌾 Sản Phẩm Sắp Thu Hoạch!',
        message: `Đơn hàng #${orderNumber} - ${lot.product_name} sẽ được thu hoạch vào ${harvestDate} (còn ${daysUntilHarvest} ngày). Hãy chuẩn bị nhận hàng nhé!`,
        link: createPageUrl('MyOrders'),
        priority: 'high',
        metadata: {
          order_number: orderNumber,
          order_id: order.id,
          lot_id: lot.id,
          lot_name: lot.lot_name,
          product_name: lot.product_name,
          harvest_date: lot.estimated_harvest_date,
          days_until_harvest: daysUntilHarvest
        }
      }
    });

    // Send email
    try {
      await base44.integrations.Core.SendEmail({
        to: order.customer_email,
        subject: `🌾 [${orderNumber}] Sản phẩm sắp thu hoạch - ${lot.product_name}`,
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #7CB342, #5a8f31); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
              <h1 style="color: white; margin: 0;">🌾 Sắp Thu Hoạch!</h1>
            </div>
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 12px 12px;">
              <p>Xin chào <strong>${order.customer_name}</strong>,</p>
              <p>Sản phẩm bạn đặt trước sắp được thu hoạch:</p>
              <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #7CB342;">
                <p style="margin: 5px 0;"><strong>Đơn hàng:</strong> #${orderNumber}</p>
                <p style="margin: 5px 0;"><strong>Sản phẩm:</strong> ${lot.product_name}</p>
                <p style="margin: 5px 0;"><strong>Ngày thu hoạch:</strong> ${harvestDate}</p>
                <p style="margin: 5px 0;"><strong>Còn:</strong> <span style="color: #FF9800; font-weight: bold;">${daysUntilHarvest} ngày</span></p>
              </div>
              <p>Chúng tôi sẽ liên hệ với bạn để xác nhận thời gian giao hàng cụ thể.</p>
            </div>
          </div>
        `
      });
    } catch (error) {
      console.error('Email failed (non-blocking):', error);
    }
  }
};

/**
 * Handle harvest ready
 */
export const handleHarvestReady = async (payload) => {
  const { order, lot } = payload;
  const orderNumber = order.order_number || order.id?.slice(-8);

  console.log('🎉 [HarvestEventHandler] harvest.ready:', orderNumber);

  // Customer notification
  if (order.customer_email) {
    await notificationEngine.create({
      actor: 'client',
      type: 'harvest_ready',
      recipients: order.customer_email,
      payload: {
        title: '🎉 Sản Phẩm Đã Thu Hoạch!',
        message: `Đơn hàng #${orderNumber} - ${lot.product_name} đã được thu hoạch và đang chuẩn bị giao đến bạn!`,
        link: createPageUrl('MyOrders'),
        priority: 'high',
        metadata: {
          order_number: orderNumber,
          order_id: order.id,
          lot_id: lot.id,
          product_name: lot.product_name
        }
      }
    });
  }

  // Admin notification
  await notificationEngine.create({
    actor: 'admin',
    type: 'harvest_ready',
    recipients: null,
    payload: {
      title: `🎉 Lot ${lot.lot_name} Đã Thu Hoạch`,
      message: `${lot.product_name} đã sẵn sàng giao. Có ${lot.sold_quantity || 0} đơn cần xử lý.`,
      link: createPageUrl('AdminProductLots'),
      priority: 'high',
      requiresAction: true,
      metadata: {
        lot_id: lot.id,
        lot_name: lot.lot_name,
        product_name: lot.product_name,
        orders_count: lot.sold_quantity || 0
      }
    },
    routing: {
      related_entity_type: 'ProductLot',
      related_entity_id: lot.id
    }
  });
};

/**
 * Handle admin upcoming harvest alert
 */
export const handleHarvestUpcoming = async (payload) => {
  const { lot, daysLeft, ordersCount } = payload;

  console.log('📊 [HarvestEventHandler] harvest.upcoming:', lot.lot_name);

  await notificationEngine.create({
    actor: 'admin',
    type: 'harvest_upcoming',
    recipients: null,
    payload: {
      title: `🌾 Lot "${lot.lot_name}" sắp thu hoạch`,
      message: `${lot.product_name} - còn ${daysLeft} ngày. ${ordersCount} đơn hàng đang chờ.`,
      link: createPageUrl('AdminProductLots'),
      priority: daysLeft <= 2 ? 'urgent' : 'high',
      requiresAction: true,
      metadata: {
        lot_id: lot.id,
        lot_name: lot.lot_name,
        product_name: lot.product_name,
        harvest_date: lot.estimated_harvest_date,
        days_until_harvest: daysLeft,
        orders_count: ordersCount
      }
    },
    routing: {
      related_entity_type: 'ProductLot',
      related_entity_id: lot.id
    }
  });
};

/**
 * Handle final payment reminder
 */
export const handleFinalPaymentReminder = async (payload) => {
  const { order, lot, daysUntilDelivery = 2 } = payload;
  const orderNumber = order.order_number || order.id?.slice(-8);
  const remainingAmount = order.remaining_amount || 0;

  if (remainingAmount <= 0) return;

  console.log('💰 [HarvestEventHandler] harvest.final_payment_reminder:', orderNumber);

  // Customer notification
  if (order.customer_email) {
    await notificationEngine.create({
      actor: 'client',
      type: 'final_payment_reminder',
      recipients: order.customer_email,
      payload: {
        title: '💰 Nhắc Nhở Thanh Toán',
        message: `Đơn hàng #${orderNumber} sắp giao. Số tiền còn lại: ${remainingAmount.toLocaleString('vi-VN')}đ`,
        link: createPageUrl('MyOrders'),
        priority: 'high',
        metadata: {
          order_number: orderNumber,
          order_id: order.id,
          remaining_amount: remainingAmount,
          days_until_delivery: daysUntilDelivery
        }
      }
    });
  }

  // Admin notification
  await notificationEngine.create({
    actor: 'admin',
    type: 'final_payment_pending',
    recipients: null,
    payload: {
      title: `💳 Chờ Thanh Toán #${orderNumber}`,
      message: `${order.customer_name} còn ${remainingAmount.toLocaleString('vi-VN')}đ chưa thanh toán`,
      link: createPageUrl('AdminOrders'),
      priority: 'normal',
      metadata: {
        order_number: orderNumber,
        customer_name: order.customer_name,
        remaining_amount: remainingAmount
      }
    },
    routing: {
      related_entity_type: 'Order',
      related_entity_id: order.id
    }
  });
};

/**
 * Register all harvest event handlers
 */
export const registerHarvestHandlers = (registry) => {
  registry.register(HarvestEvents.REMINDER, handleHarvestReminder, { priority: 8 });
  registry.register(HarvestEvents.READY, handleHarvestReady, { priority: 10 });
  registry.register(HarvestEvents.UPCOMING, handleHarvestUpcoming, { priority: 8 });
  registry.register(HarvestEvents.FINAL_PAYMENT_REMINDER, handleFinalPaymentReminder, { priority: 8 });
  
  console.log('✅ Harvest event handlers registered');
};

export default {
  handleHarvestReminder,
  handleHarvestReady,
  handleHarvestUpcoming,
  handleFinalPaymentReminder,
  registerHarvestHandlers
};