/**
 * Notification Service Facade
 * Unified API for creating notifications across all actors
 * Replaces scattered notification logic
 */

import { notificationRouter, notificationEngine } from '../core';
import { userNotificationRepository, adminNotificationRepository, tenantNotificationRepository } from '../data';
import { preferenceRepository } from '../data/digestRepository';
import { recipientResolver } from '../domain';
import { shouldBypassDigest, shouldReceiveDigest } from '../domain/digestRules';
import { DigestService } from './DigestService';
import { createPageUrl } from '@/utils';

export class NotificationServiceFacade {
  
  // ========== USER NOTIFICATIONS ==========
  
  /**
   * Create notification for user
   * Simplified to directly create notification without using notificationEngine.createNotification
   * because that function doesn't exist
   */
  static async notifyUser(params) {
    const {
      recipientEmail,
      type,
      title,
      message,
      actorEmail = null,
      actorName = null,
      link = null,
      priority = 'normal',
      metadata = {}
    } = params;

    // Validate required fields
    if (!recipientEmail) {
      console.error('❌ notifyUser: recipientEmail is required');
      return { success: false, message: 'Recipient email is required' };
    }

    console.log('📧 Creating user notification:', { recipientEmail, type, title });

    // Check if should bypass digest (NOTIF-F06)
    if (shouldBypassDigest(type, priority)) {
      console.log('⚡ [NOTIF-F06] Bypassing digest for critical notification');
      
      const result = await userNotificationRepository.create({
        recipient_email: recipientEmail,
        type,
        title,
        message,
        actor_email: actorEmail,
        actor_name: actorName,
        link,
        priority,
        metadata: {
          ...metadata,
          actor_email: actorEmail,
          actor_name: actorName
        }
      });
      
      if (result.success) {
        console.log('✅ User notification created (immediate):', result.data?.id);
      }
      
      return result;
    }
    
    // Check user preference (NOTIF-F06)
    const prefResult = await preferenceRepository.get(recipientEmail);
    const preference = prefResult.success ? prefResult.data : null;
    
    if (!shouldReceiveDigest(preference, type)) {
      console.log('📤 [NOTIF-F06] User prefers realtime for this type');
      
      const result = await userNotificationRepository.create({
        recipient_email: recipientEmail,
        type,
        title,
        message,
        actor_email: actorEmail,
        actor_name: actorName,
        link,
        priority,
        metadata: {
          ...metadata,
          actor_email: actorEmail,
          actor_name: actorName
        }
      });
      
      if (result.success) {
        console.log('✅ User notification created (realtime pref):', result.data?.id);
      }
      
      return result;
    }
    
    // Add to digest (NOTIF-F06)
    console.log('📬 [NOTIF-F06] Adding to digest queue');
    
    const result = await userNotificationRepository.create({
      recipient_email: recipientEmail,
      type,
      title,
      message,
      actor_email: actorEmail,
      actor_name: actorName,
      link,
      priority,
      metadata: {
        ...metadata,
        actor_email: actorEmail,
        actor_name: actorName,
        digest_queued: true
      }
    });
    
    if (result.success) {
      console.log('✅ User notification created:', result.data?.id);
      
      // Add to digest asynchronously (non-blocking)
      DigestService.addToDigest(recipientEmail, result.data, preference)
        .catch(err => console.error('Failed to add to digest:', err));
    } else {
      console.error('❌ Failed to create user notification:', result.message);
    }

    return result;
  }

  // ========== ADMIN NOTIFICATIONS ==========

  /**
   * Create notification for admins
   * @param recipientEmail - null for broadcast to all admins
   * 
   * NOTE: In frontend, we always use broadcast mode (recipient_email = null)
   * because asServiceRole doesn't work in frontend
   */
  static async notifyAdmin(params) {
    const {
      recipientEmail = null,
      type,
      title,
      message,
      link = null,
      priority = 'high',
      relatedEntityType = null,
      relatedEntityId = null,
      requiresAction = false,
      metadata = {}
    } = params;

    console.log('📤 [NotificationServiceFacade] notifyAdmin called', { type, title, recipientEmail });

    // In frontend, always use broadcast mode (recipient_email = null)
    // Admin panel will filter by role
    console.log('📤 [NotificationServiceFacade] Creating broadcast notification (recipient_email = null)');
    return adminNotificationRepository.create({
      recipient_email: null, // Broadcast to all admins
      type,
      title,
      message,
      link,
      priority,
      related_entity_type: relatedEntityType,
      related_entity_id: relatedEntityId,
      requires_action: requiresAction,
      metadata
    });
  }

  // ========== TENANT NOTIFICATIONS ==========

  /**
   * Create notification for tenant users
   */
  static async notifyTenant(params) {
    const {
      tenantId,
      recipientEmail = null, // null for broadcast to all tenant users
      type,
      title,
      message,
      link = null,
      priority = 'normal',
      relatedEntityType = null,
      relatedEntityId = null,
      requiresAction = false,
      metadata = {}
    } = params;

    if (!tenantId) {
      return { success: false, message: 'Tenant ID is required' };
    }

    return tenantNotificationRepository.create({
      tenant_id: tenantId,
      recipient_email: recipientEmail,
      type,
      title,
      message,
      link,
      priority,
      related_entity_type: relatedEntityType,
      related_entity_id: relatedEntityId,
      requires_action: requiresAction,
      metadata
    });
  }

  // ========== ORDER NOTIFICATIONS ==========

  /**
   * Notify about new order
   */
  static async notifyNewOrder(order, customer) {
    console.log('📤 [NotificationServiceFacade] notifyNewOrder called', {
      orderId: order?.id,
      orderNumber: order?.order_number,
      customerName: customer?.full_name || customer?.name || order?.customer_name
    });

    const orderNumber = order.order_number || order.id?.slice(-8);
    const amount = order.total_amount?.toLocaleString('vi-VN');
    const customerName = customer?.full_name || customer?.name || order.customer_name || 'Khách hàng';

    // Admin notification
    console.log('📤 [NotificationServiceFacade] Creating admin notification...');
    const adminResult = await this.notifyAdmin({
      type: 'new_order',
      title: `🛍️ Đơn Hàng Mới #${orderNumber}`,
      message: `${customerName} đã đặt đơn hàng ${amount}đ`,
      link: createPageUrl('AdminOrders'),
      priority: 'high',
      relatedEntityType: 'Order',
      relatedEntityId: order.id,
      requiresAction: true,
      metadata: {
        order_number: orderNumber,
        order_id: order.id,
        amount: order.total_amount,
        customer_name: customerName,
        customer_email: order.customer_email
      }
    });
    console.log('📤 [NotificationServiceFacade] Admin notification result:', adminResult);

    // Customer notification
    console.log('📤 [NotificationServiceFacade] Creating user notification...');
    const userResult = await this.notifyUser({
      recipientEmail: order.customer_email,
      type: 'order_confirmed',
      title: '✅ Đơn Hàng Đã Được Xác Nhận',
      message: `Đơn hàng #${orderNumber} đang được xử lý`,
      link: createPageUrl('MyOrders'),
      priority: 'high',
      metadata: { order_number: orderNumber, order_id: order.id }
    });
    console.log('📤 [NotificationServiceFacade] User notification result:', userResult);

    return { adminResult, userResult };
  }

  /**
   * Notify order status change
   */
  static async notifyOrderStatusChange(order, newStatus) {
    const orderNumber = order.order_number || order.id?.slice(-8);
    
    const statusConfig = {
      confirmed: { title: '✅ Đơn Hàng Đã Xác Nhận', message: 'đã được xác nhận', type: 'order_confirmed' },
      processing: { title: '📦 Đơn Hàng Đang Chuẩn Bị', message: 'đang được đóng gói', type: 'order_confirmed' },
      shipping: { title: '🚚 Đơn Hàng Đang Giao', message: 'đang giao đến bạn', type: 'order_shipping' },
      delivered: { title: '🎉 Đơn Hàng Đã Giao', message: 'đã giao thành công', type: 'order_delivered' },
      cancelled: { title: '❌ Đơn Hàng Đã Hủy', message: 'đã bị hủy', type: 'order_cancelled' }
    };

    const config = statusConfig[newStatus];
    if (!config) return { success: false, message: 'Unknown status' };

    return this.notifyUser({
      recipientEmail: order.customer_email,
      type: config.type,
      title: config.title,
      message: `Đơn hàng #${orderNumber} ${config.message}`,
      link: createPageUrl('MyOrders'),
      priority: 'high',
      metadata: { order_number: orderNumber, order_id: order.id, status: newStatus }
    });
  }

  /**
   * Alias for orderStatusChanged (backward compatible with legacy NotificationService)
   */
  static async orderStatusChanged(order, oldStatus, newStatus) {
    return this.notifyOrderStatusChange(order, newStatus);
  }

  // ========== PAYMENT NOTIFICATIONS ==========

  /**
   * Notify payment verification needed
   */
  static async notifyPaymentVerificationNeeded(order) {
    const orderNumber = order.order_number || order.id?.slice(-8);
    const amount = order.total_amount?.toLocaleString('vi-VN');

    return this.notifyAdmin({
      type: 'payment_verification_needed',
      title: `💳 Cần Xác Minh Thanh Toán #${orderNumber}`,
      message: `${order.customer_name} đã chuyển khoản ${amount}đ`,
      link: createPageUrl('AdminPaymentVerification'),
      priority: 'urgent',
      relatedEntityType: 'Order',
      relatedEntityId: order.id,
      requiresAction: true,
      metadata: { order_number: orderNumber, amount: order.total_amount }
    });
  }

  /**
   * Notify payment confirmed
   */
  static async notifyPaymentConfirmed(order) {
    const orderNumber = order.order_number || order.id?.slice(-8);

    return this.notifyUser({
      recipientEmail: order.customer_email,
      type: 'payment_success',
      title: '✅ Thanh Toán Thành Công',
      message: `Đơn hàng #${orderNumber} đã thanh toán xong`,
      link: createPageUrl('MyOrders'),
      priority: 'high',
      metadata: { order_number: orderNumber, order_id: order.id }
    });
  }

  // ========== TENANT-SPECIFIC NOTIFICATIONS ==========

  /**
   * Notify tenant about new shop order
   */
  static async notifyTenantNewOrder(tenantId, order) {
    const orderNumber = order.order_number || order.id?.slice(-8);

    return this.notifyTenant({
      tenantId,
      type: 'new_order',
      title: `🛍️ Đơn Hàng Mới #${orderNumber}`,
      message: `${order.customer_name} đã đặt hàng`,
      link: createPageUrl('ShopOrders'),
      priority: 'high',
      relatedEntityType: 'Order',
      relatedEntityId: order.id,
      requiresAction: true,
      metadata: { order_number: orderNumber, order_id: order.id }
    });
  }

  /**
   * Notify tenant about low stock
   */
  static async notifyTenantLowStock(tenantId, product) {
    return this.notifyTenant({
      tenantId,
      type: 'low_stock',
      title: `⚠️ Sắp Hết Hàng: ${product.name}`,
      message: `Còn ${product.stock_quantity} ${product.unit}`,
      link: createPageUrl('ShopMyProducts'),
      priority: 'high',
      relatedEntityType: 'Product',
      relatedEntityId: product.id,
      requiresAction: true,
      metadata: { product_name: product.name, stock_quantity: product.stock_quantity }
    });
  }

  // ========== E-CARD / CONNECTION NOTIFICATIONS ==========

  /**
   * Notify about new connection
   */
  static async notifyNewConnection({ recipientEmail, actorName, actorEmail, connectionId, targetUserId }) {
    return this.notifyUser({
      recipientEmail,
      type: 'new_connection',
      title: '🤝 Kết Nối Mới',
      message: `${actorName} đã kết nối với bạn`,
      link: createPageUrl('MyEcard?tab=connections'),
      actorEmail,
      actorName,
      priority: 'normal',
      metadata: { 
        connection_id: connectionId,
        sender_user_id: targetUserId,
        actor_name: actorName
      }
    });
  }

  /**
   * Notify about new message from connection
   */
  static async notifyNewMessage({ recipientEmail, senderName, senderEmail, connectionId, senderUserId, messagePreview }) {
    return this.notifyUser({
      recipientEmail,
      type: 'new_message',
      title: `💬 Tin Nhắn Từ ${senderName}`,
      message: messagePreview?.substring(0, 100) || 'Bạn có tin nhắn mới',
      link: createPageUrl('MyEcard?tab=connections'),
      actorEmail: senderEmail,
      actorName: senderName,
      priority: 'normal',
      metadata: { 
        connection_id: connectionId,
        sender_user_id: senderUserId,
        message_preview: messagePreview?.substring(0, 100)
      }
    });
  }

  /**
   * Notify about gift received
   */
  static async notifyGiftReceived({ recipientEmail, senderName, senderEmail, giftId, giftMessage, connectionId }) {
    return this.notifyUser({
      recipientEmail,
      type: 'gift',
      title: `🎁 Quà Tặng Từ ${senderName}`,
      message: giftMessage || `${senderName} đã gửi bạn một món quà`,
      link: createPageUrl('MyEcard?tab=gifts'),
      actorEmail: senderEmail,
      actorName: senderName,
      priority: 'high',
      metadata: { 
        gift_id: giftId,
        connection_id: connectionId,
        sender_name: senderName
      }
    });
  }
}

export default NotificationServiceFacade;