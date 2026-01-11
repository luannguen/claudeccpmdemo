/**
 * Notification Service Adapter
 * Backward compatibility with legacy NotificationService
 * 
 * USAGE: Replace imports of old NotificationService with this adapter
 * import NotificationService from '@/components/notifications/NotificationService';
 * → 
 * import { NotificationServiceAdapter as NotificationService } from '@/components/features/notification';
 */

import { NotificationServiceFacade } from '../services';

/**
 * Adapter that wraps new NotificationServiceFacade
 * with legacy NotificationService API
 */
export class NotificationServiceAdapter {
  
  // ========== LEGACY API MAPPINGS ==========

  /**
   * @deprecated Use NotificationServiceFacade.notifyUser instead
   */
  static async createUserNotification(params) {
    console.warn('[Deprecated] createUserNotification → use NotificationServiceFacade.notifyUser');
    return NotificationServiceFacade.notifyUser(params);
  }

  /**
   * @deprecated Use NotificationServiceFacade.notifyAdmin instead
   */
  static async createAdminNotification(params) {
    console.warn('[Deprecated] createAdminNotification → use NotificationServiceFacade.notifyAdmin');
    return NotificationServiceFacade.notifyAdmin(params);
  }

  // ========== ORDER NOTIFICATIONS ==========

  static async notifyNewOrder(order, customer) {
    return NotificationServiceFacade.notifyNewOrder(order, customer);
  }

  static async notifyOrderStatusChange(order, newStatus) {
    return NotificationServiceFacade.notifyOrderStatusChange(order, newStatus);
  }

  /**
   * @deprecated Use notifyOrderStatusChange instead
   */
  static async orderStatusChanged(order, oldStatus, newStatus) {
    return NotificationServiceFacade.notifyOrderStatusChange(order, newStatus);
  }

  // ========== PAYMENT NOTIFICATIONS ==========

  static async notifyPaymentVerificationNeeded(order) {
    return NotificationServiceFacade.notifyPaymentVerificationNeeded(order);
  }

  static async notifyPaymentConfirmed(order) {
    return NotificationServiceFacade.notifyPaymentConfirmed(order);
  }

  static async notifyPaymentFailed(order) {
    const orderNumber = order.order_number || order.id?.slice(-8);
    return NotificationServiceFacade.notifyUser({
      recipientEmail: order.customer_email,
      type: 'payment_failed',
      title: '⚠️ Thanh Toán Thất Bại',
      message: `Thanh toán cho đơn #${orderNumber} không thành công`,
      priority: 'high',
      metadata: { order_number: orderNumber, order_id: order.id }
    });
  }

  // ========== REVIEW NOTIFICATIONS ==========

  static async notifyNewReview(review, product) {
    return NotificationServiceFacade.notifyAdmin({
      type: 'new_review',
      title: `⭐ Đánh Giá Mới: ${product?.name}`,
      message: `${review.customer_name} đã đánh giá ${review.rating} sao`,
      priority: 'normal',
      relatedEntityType: 'Review',
      relatedEntityId: review.id,
      metadata: { product_name: product?.name, rating: review.rating }
    });
  }

  // ========== STOCK NOTIFICATIONS ==========

  static async notifyLowStock(product) {
    return NotificationServiceFacade.notifyAdmin({
      type: 'low_stock',
      title: `⚠️ Sắp Hết Hàng: ${product.name}`,
      message: `Còn ${product.stock_quantity} ${product.unit}`,
      priority: 'high',
      relatedEntityType: 'Product',
      relatedEntityId: product.id,
      requiresAction: true,
      metadata: { product_name: product.name, stock_quantity: product.stock_quantity }
    });
  }

  // ========== CUSTOMER NOTIFICATIONS ==========

  static async notifyNewCustomer(customer) {
    return NotificationServiceFacade.notifyAdmin({
      type: 'new_customer',
      title: `👤 Khách Hàng Mới: ${customer.full_name}`,
      message: `${customer.email} vừa đăng ký`,
      priority: 'low',
      relatedEntityType: 'Customer',
      relatedEntityId: customer.id,
      metadata: { customer_name: customer.full_name, customer_email: customer.email }
    });
  }

  // ========== HARVEST NOTIFICATIONS (Pre-order) ==========

  static async notifyHarvestReminder(order, lot, daysUntilHarvest) {
    const orderNumber = order.order_number || order.id?.slice(-8);
    return NotificationServiceFacade.notifyUser({
      recipientEmail: order.customer_email,
      type: 'harvest_reminder',
      title: '🌾 Sản Phẩm Sắp Thu Hoạch!',
      message: `Đơn #${orderNumber} - ${lot.product_name} sẽ thu hoạch trong ${daysUntilHarvest} ngày`,
      priority: 'high',
      metadata: { order_number: orderNumber, lot_name: lot.lot_name, days_until_harvest: daysUntilHarvest }
    });
  }

  static async notifyHarvestReady(order, lot) {
    const orderNumber = order.order_number || order.id?.slice(-8);
    return NotificationServiceFacade.notifyUser({
      recipientEmail: order.customer_email,
      type: 'harvest_ready',
      title: '🎉 Sản Phẩm Đã Thu Hoạch!',
      message: `Đơn #${orderNumber} - ${lot.product_name} đã thu hoạch xong`,
      priority: 'high',
      metadata: { order_number: orderNumber, lot_name: lot.lot_name }
    });
  }

  static async notifyFinalPaymentReminder(order, lot, daysUntilDelivery) {
    const orderNumber = order.order_number || order.id?.slice(-8);
    const remainingAmount = order.remaining_amount || 0;
    
    if (remainingAmount <= 0) return { success: true, data: null };

    return NotificationServiceFacade.notifyUser({
      recipientEmail: order.customer_email,
      type: 'final_payment_reminder',
      title: '💰 Nhắc Nhở Thanh Toán',
      message: `Đơn #${orderNumber} còn ${remainingAmount.toLocaleString('vi-VN')}đ`,
      priority: 'high',
      metadata: { order_number: orderNumber, remaining_amount: remainingAmount }
    });
  }

  static async notifyDepositReceived(order) {
    const orderNumber = order.order_number || order.id?.slice(-8);
    const depositAmount = order.deposit_amount || 0;

    return NotificationServiceFacade.notifyUser({
      recipientEmail: order.customer_email,
      type: 'payment_success',
      title: '✅ Đã Nhận Tiền Cọc',
      message: `Đơn #${orderNumber} đã nhận cọc ${depositAmount.toLocaleString('vi-VN')}đ`,
      priority: 'high',
      metadata: { order_number: orderNumber, deposit_amount: depositAmount }
    });
  }

  static async notifyAdminUpcomingHarvest(lot, daysUntilHarvest, ordersCount) {
    return NotificationServiceFacade.notifyAdmin({
      type: 'harvest_upcoming',
      title: `🌾 Lot "${lot.lot_name}" sắp thu hoạch`,
      message: `${lot.product_name} - còn ${daysUntilHarvest} ngày. ${ordersCount} đơn chờ.`,
      priority: daysUntilHarvest <= 2 ? 'urgent' : 'high',
      relatedEntityType: 'ProductLot',
      relatedEntityId: lot.id,
      requiresAction: true,
      metadata: { lot_id: lot.id, days_until_harvest: daysUntilHarvest, orders_count: ordersCount }
    });
  }

  // ========== PRICE FOMO NOTIFICATIONS ==========

  static async notifyPriceIncrease(lot, hoursUntilIncrease, currentPrice, nextPrice) {
    const percentIncrease = Math.round(((nextPrice - currentPrice) / currentPrice) * 100);

    return NotificationServiceFacade.notifyAdmin({
      type: 'system_alert',
      title: `📈 FOMO: ${lot.product_name}`,
      message: `Giá tăng ${percentIncrease}% trong ${hoursUntilIncrease}h`,
      priority: 'normal',
      relatedEntityType: 'ProductLot',
      relatedEntityId: lot.id,
      metadata: { current_price: currentPrice, next_price: nextPrice }
    });
  }

  static async notifyPriceIncreased(lot, oldPrice, newPrice) {
    const percentIncrease = Math.round(((newPrice - oldPrice) / oldPrice) * 100);

    return NotificationServiceFacade.notifyAdmin({
      type: 'system_alert',
      title: `📈 Giá đã tăng: ${lot.product_name}`,
      message: `${oldPrice.toLocaleString('vi-VN')}đ → ${newPrice.toLocaleString('vi-VN')}đ (+${percentIncrease}%)`,
      priority: 'normal',
      relatedEntityType: 'ProductLot',
      relatedEntityId: lot.id,
      metadata: { old_price: oldPrice, new_price: newPrice }
    });
  }
}

export default NotificationServiceAdapter;