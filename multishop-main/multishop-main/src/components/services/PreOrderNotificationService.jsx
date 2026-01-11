/**
 * 📢 PreOrder Notification Service
 * 
 * Gửi thông báo tự động cho khách hàng về:
 * - Harvest ready (sẵn sàng thu hoạch)
 * - Price changes (giá tăng)
 * - Lot sold out (hết hàng)
 * 
 * ✅ MIGRATED v2.4: Event-driven email + Push notifications
 */

import { base44 } from '@/api/base44Client';
// ✅ MIGRATED: Using features/notification module (v2.1)
import { NotificationServiceFacade } from '@/components/features/notification';
// ✅ MIGRATED v2.4: Event-driven email
import { eventBus } from '@/components/shared/events';
import { EMAIL_EVENT_TYPES } from '@/components/features/email/types/EventPayloads';
import { createPageUrl } from '@/utils';

class PreOrderNotificationService {

  /**
   * 🌾 Notify customers when lot is ready for harvest
   * ✅ MIGRATED v2.4: Event-driven email + Push notifications
   */
  static async notifyHarvestReady(lot) {
    console.log('🌾 Sending harvest ready notifications for lot:', lot.lot_name);

    // Find all orders with this lot
    const orders = await base44.entities.Order.list('-created_date', 1000);
    const lotOrders = orders.filter(order => 
      order.items?.some(item => item.lot_id === lot.id) &&
      ['confirmed', 'awaiting_harvest', 'processing'].includes(order.order_status)
    );

    // 1. Push notifications (in-app)
    for (const order of lotOrders) {
      await NotificationServiceFacade.notifyUser({
        recipientEmail: order.customer_email,
        type: 'order_update',
        title: '🌾 Sản Phẩm Sẵn Sàng Thu Hoạch!',
        message: `${lot.lot_name} đã sẵn sàng thu hoạch. Đơn hàng #${order.order_number} sẽ được giao sớm.`,
        link: createPageUrl('MyOrders'),
        priority: 'high',
        metadata: {
          order_id: order.id,
          lot_id: lot.id,
          lot_name: lot.lot_name
        }
      });
    }

    // 2. Publish event → Email Pipeline handles email
    eventBus.publish(EMAIL_EVENT_TYPES.HARVEST_READY, {
      lotId: lot.id,
      lotName: lot.lot_name,
      productName: lot.product_name,
      affectedOrders: lotOrders.map(order => ({
        order,
        orderId: order.id,
        customerEmail: order.customer_email
      }))
    });
    console.log(`✅ HARVEST_READY event published → Email Pipeline (${lotOrders.length} orders)`);

    // Update lot status
    await base44.entities.ProductLot.update(lot.id, {
      status: 'harvest_ready'
    });

    console.log(`✅ Sent harvest notifications to ${lotOrders.length} customers`);
  }

  /**
   * 💰 Notify customers when price increases
   */
  static async notifyPriceChange(lot, oldPrice, newPrice) {
    const increasePercent = Math.round(((newPrice - oldPrice) / oldPrice) * 100);
    
    if (increasePercent <= 0) return; // Only notify on price increase

    console.log(`💰 Price increased ${increasePercent}% for lot:`, lot.lot_name);

    // Find customers who viewed this lot (from wishlist)
    const wishlists = await base44.entities.Cart.list('-created_date', 500);
    const interestedCustomers = wishlists
      .filter(w => w.items?.some(item => item.lot_id === lot.id))
      .map(w => w.user_email || w.created_by)
      .filter(Boolean);

    const uniqueCustomers = [...new Set(interestedCustomers)];

    for (const customerEmail of uniqueCustomers) {
      await NotificationServiceFacade.notifyUser({
        recipientEmail: customerEmail,
        type: 'product_notification',
        title: '💰 Giá Sản Phẩm Đã Tăng!',
        message: `${lot.lot_name} tăng ${increasePercent}% lên ${newPrice.toLocaleString('vi-VN')}đ. Đặt ngay để có giá tốt!`,
        link: createPageUrl('PreOrderProductDetail') + `?lotId=${lot.id}`,
        priority: 'normal',
        metadata: {
          lot_id: lot.id,
          old_price: oldPrice,
          new_price: newPrice,
          increase_percent: increasePercent
        }
      });
    }

    console.log(`✅ Sent price change notifications to ${uniqueCustomers.length} customers`);
  }

  /**
   * 🚨 Notify when lot is almost sold out
   */
  static async notifyLowStock(lot) {
    const availablePercent = (lot.available_quantity / lot.total_yield) * 100;
    
    if (availablePercent > 20) return; // Only notify when < 20% left

    console.log(`🚨 Low stock alert for lot: ${lot.lot_name} (${availablePercent.toFixed(1)}%)`);

    // Find interested customers
    const wishlists = await base44.entities.Cart.list('-created_date', 500);
    const interestedCustomers = wishlists
      .filter(w => w.items?.some(item => item.lot_id === lot.id))
      .map(w => w.user_email || w.created_by)
      .filter(Boolean);

    const uniqueCustomers = [...new Set(interestedCustomers)];

    for (const customerEmail of uniqueCustomers) {
      await NotificationServiceFacade.notifyUser({
        recipientEmail: customerEmail,
        type: 'product_notification',
        title: '🚨 Sắp Hết Hàng!',
        message: `${lot.lot_name} chỉ còn ${lot.available_quantity} sản phẩm. Đặt ngay kẻo lỡ!`,
        link: createPageUrl('PreOrderProductDetail') + `?lotId=${lot.id}`,
        priority: 'high',
        metadata: {
          lot_id: lot.id,
          available_quantity: lot.available_quantity,
          available_percent: availablePercent
        }
      });
    }

    console.log(`✅ Sent low stock alerts to ${uniqueCustomers.length} customers`);
  }

  /**
   * ✅ Notify when lot is sold out
   */
  static async notifySoldOut(lot) {
    console.log(`✅ Lot sold out: ${lot.lot_name}`);

    // Admin notification
    await NotificationServiceFacade.notifyAdmin({
      type: 'inventory_alert',
      title: '🎉 Lot Đã Bán Hết',
      message: `${lot.lot_name} đã bán hết ${lot.sold_quantity} sản phẩm!`,
      link: createPageUrl('AdminProductLots'),
      priority: 'normal',
      metadata: {
        lot_id: lot.id,
        lot_name: lot.lot_name,
        total_revenue: lot.total_revenue
      }
    });

    // Update lot status
    await base44.entities.ProductLot.update(lot.id, {
      status: 'sold_out'
    });
  }

  /**
   * ⏰ Notify customers about upcoming deposit deadline
   * ✅ MIGRATED v2.4: Event-driven email + Push notifications
   */
  static async notifyDepositDeadline(order, daysLeft) {
    if (order.deposit_status !== 'pending') return;

    // 1. Push notification (in-app)
    await NotificationServiceFacade.notifyUser({
      recipientEmail: order.customer_email,
      type: 'payment_reminder',
      title: `⏰ Còn ${daysLeft} Ngày Để Thanh Toán Cọc`,
      message: `Đơn hàng #${order.order_number} cần thanh toán cọc ${order.deposit_amount.toLocaleString('vi-VN')}đ.`,
      link: createPageUrl('MyOrders'),
      priority: daysLeft <= 1 ? 'high' : 'normal',
      metadata: {
        order_id: order.id,
        deposit_amount: order.deposit_amount,
        days_left: daysLeft
      }
    });

    // 2. Publish event → Email Pipeline handles email
    eventBus.publish(EMAIL_EVENT_TYPES.DEPOSIT_RECEIVED, {
      orderId: order.id,
      order,
      daysLeft
    });
    console.log(`✅ DEPOSIT_RECEIVED event published → Email Pipeline`);
  }

  /**
   * 💵 Notify about remaining payment due
   */
  static async notifyRemainingPaymentDue(order) {
    if (order.deposit_status !== 'paid' || order.remaining_amount <= 0) return;

    await NotificationServiceFacade.notifyUser({
      recipientEmail: order.customer_email,
      type: 'payment_reminder',
      title: '💵 Thanh Toán Phần Còn Lại',
      message: `Đơn hàng #${order.order_number} cần thanh toán ${order.remaining_amount.toLocaleString('vi-VN')}đ khi nhận hàng.`,
      link: createPageUrl('MyOrders'),
      priority: 'high',
      metadata: {
        order_id: order.id,
        remaining_amount: order.remaining_amount
      }
    });
  }
}

export default PreOrderNotificationService;