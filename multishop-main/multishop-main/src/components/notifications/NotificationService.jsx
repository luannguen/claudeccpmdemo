/**
 * @deprecated since v2.5.0
 * 
 * ⚠️ DEPRECATED: This file is deprecated and will be removed in future versions.
 * 
 * Migration Guide:
 * ```
 * // OLD (deprecated):
 * import NotificationService from '@/components/notifications/NotificationService';
 * await NotificationService.notifyNewOrder(order, customer);
 * 
 * // NEW - For push notifications (in-app):
 * import { NotificationServiceFacade } from '@/components/features/notification';
 * await NotificationServiceFacade.notifyNewOrder(order, customer);
 * 
 * // NEW - For email notifications:
 * import { eventBus } from '@/components/shared/events';
 * import { EMAIL_EVENT_TYPES } from '@/components/features/email/types/EventPayloads';
 * eventBus.publish(EMAIL_EVENT_TYPES.ORDER_PLACED, { order, orderId: order.id });
 * ```
 * 
 * See: components/features/notification/README.md
 * See: components/features/email/README.md
 * 
 * 🔔 Notification Service - Centralized notification creation
 * 
 * Module hóa để dễ maintain và nâng cấp
 */

// @deprecated - Use NotificationServiceFacade from @/components/features/notification instead

import { base44 } from '@/api/base44Client';
import CommunicationService from '@/components/services/CommunicationService';
import { createPageUrl } from '@/utils';

export class NotificationService {
  /**
   * 📧 Create User Notification
   */
  static async createUserNotification({
    recipientEmail,
    type,
    title,
    message,
    actorEmail = null,
    actorName = null,
    link = null,
    priority = 'normal',
    metadata = {}
  }) {
    try {
      console.log('📧 Creating user notification:', { recipientEmail, type, title });

      // ✅ Try service role first, fallback to regular
      let notification;
      try {
        notification = await base44.asServiceRole.entities.Notification.create({
          recipient_email: recipientEmail,
          type,
          title,
          message,
          actor_email: actorEmail,
          actor_name: actorName,
          link,
          priority,
          metadata,
          is_read: false
        });
      } catch (serviceRoleError) {
        console.warn('Service role failed, trying regular:', serviceRoleError.message);
        notification = await base44.entities.Notification.create({
          recipient_email: recipientEmail,
          type,
          title,
          message,
          actor_email: actorEmail,
          actor_name: actorName,
          link,
          priority,
          metadata,
          is_read: false
        });
      }
      
      console.log('✅ User notification created:', notification.id);
      return notification;
    } catch (error) {
      console.error('❌ Failed to create user notification:', error);
      console.error('Error details:', error.message);
      return null;
    }
  }

  /**
   * 👨‍💼 Create Admin Notification
   */
  static async createAdminNotification({
    recipientEmail = null, // null = all admins
    type,
    title,
    message,
    link = null,
    priority = 'normal',
    relatedEntityType = null,
    relatedEntityId = null,
    metadata = {},
    requiresAction = false
  }) {
    try {
      console.log('🔔 Creating admin notification:', { type, title, recipientEmail });

      // Get all admins if no specific recipient
      let recipients = recipientEmail ? [recipientEmail] : [];
      
      if (!recipientEmail) {
        console.log('🔍 Fetching ALL admin users...');
        
        try {
          const users = await base44.asServiceRole.entities.User.list('-created_date', 200);
          console.log('📊 Service role - Total users:', users.length);
          console.log('📊 All user roles:', users.map(u => ({ email: u.email, role: u.role })));
          
          recipients = users
            .filter(u => u.role && ['admin', 'super_admin', 'manager', 'staff'].includes(u.role))
            .map(u => u.email);
          
          console.log('👨‍💼 Service role - Admin recipients:', recipients);
        } catch (error) {
          console.error('❌ Service role failed:', error.message);
          
          try {
            const users = await base44.entities.User.list('-created_date', 200);
            console.log('📊 Fallback - Total users:', users.length);
            
            recipients = users
              .filter(u => u.role && ['admin', 'super_admin', 'manager', 'staff'].includes(u.role))
              .map(u => u.email);
            
            console.log('👨‍💼 Fallback - Admin recipients:', recipients);
          } catch (fallbackError) {
            console.error('❌ Fallback failed:', fallbackError.message);
          }
        }
      }

      if (recipients.length === 0) {
        console.warn('⚠️ No admin users found - Creating BROADCAST notification (recipient_email = null)');
        
        // ✅ FALLBACK: Create ONE broadcast notification for all admins
        try {
          const notification = await base44.asServiceRole.entities.AdminNotification.create({
            recipient_email: null, // ✅ NULL = broadcast to ALL admins
            type,
            title,
            message,
            link,
            priority,
            related_entity_type: relatedEntityType,
            related_entity_id: relatedEntityId,
            metadata,
            requires_action: requiresAction,
            is_read: false
          });
          console.log('✅ Created broadcast notification:', notification.id);
          return [notification];
        } catch (serviceError) {
          console.error('❌ Service role broadcast failed:', serviceError.message);
          
          // ✅ Last resort: try without service role
          try {
            const notification = await base44.entities.AdminNotification.create({
              recipient_email: null,
              type,
              title,
              message,
              link,
              priority,
              related_entity_type: relatedEntityType,
              related_entity_id: relatedEntityId,
              metadata,
              requires_action: requiresAction,
              is_read: false
            });
            console.log('✅ Created broadcast notification (fallback):', notification.id);
            return [notification];
          } catch (fallbackError) {
            console.error('❌❌ FAILED to create notification:', fallbackError.message);
            return [];
          }
        }
      }

      console.log(`🔔 Creating notifications for ${recipients.length} admins...`);

      // Create notification for each admin
      const notifications = [];
      for (const email of recipients) {
        console.log(`📧 Creating notification for: ${email}`);
        
        try {
          const notification = await base44.asServiceRole.entities.AdminNotification.create({
            recipient_email: email,
            type,
            title,
            message,
            link,
            priority,
            related_entity_type: relatedEntityType,
            related_entity_id: relatedEntityId,
            metadata,
            requires_action: requiresAction,
            is_read: false
          });
          notifications.push(notification);
          console.log(`✅✅ SUCCESS: Created notification ${notification.id} for ${email}`);
        } catch (serviceError) {
          console.error(`❌ Service role failed for ${email}:`, serviceError.message);
          
          // ✅ Fallback to regular create
          try {
            const notification = await base44.entities.AdminNotification.create({
              recipient_email: email,
              type,
              title,
              message,
              link,
              priority,
              related_entity_type: relatedEntityType,
              related_entity_id: relatedEntityId,
              metadata,
              requires_action: requiresAction,
              is_read: false
            });
            notifications.push(notification);
            console.log(`✅ Fallback: Created notification ${notification.id} for ${email}`);
          } catch (fallbackError) {
            console.error(`❌❌ BOTH FAILED for ${email}:`, fallbackError.message);
          }
        }
      }

      console.log(`✅✅ SUCCESS: ${notifications.length} admin notifications created`);
      console.log('📋 Notification IDs:', notifications.map(n => n.id));

      // ⚡ AGGRESSIVE INVALIDATION - Force immediate refetch
      if (typeof window !== 'undefined' && window.queryClient) {
        console.log('⚡⚡ Invalidating ALL admin notification queries...');
        await window.queryClient.invalidateQueries({ queryKey: ['admin-notifications-realtime'] });
        await window.queryClient.refetchQueries({ queryKey: ['admin-notifications-realtime'], type: 'active' });
        console.log('✅ Queries refetched');
      }
      
      return notifications;
    } catch (error) {
      console.error('❌ Failed to create admin notification:', error);
      console.error('Error details:', error.message, error.stack);
      return [];
    }
  }

  /**
   * 🛒 Order Notifications
   */
  static async notifyNewOrder(order, customer) {
    const orderNumber = order.order_number || order.id?.slice(-8);
    const amount = order.total_amount?.toLocaleString('vi-VN');
    const customerName = customer?.full_name || customer?.name || order.customer_name || 'Khách hàng';

    console.log('📧 Creating new order notifications for:', orderNumber);

    // Admin notification - CRITICAL: Send to ALL admins
    const adminNotifs = await this.createAdminNotification({
      recipientEmail: null, // ✅ null = send to ALL admins
      type: 'new_order',
      title: `🛍️ Đơn Hàng Mới #${orderNumber}`,
      message: `${customerName} đã đặt đơn hàng ${amount}đ`,
      link: createPageUrl(`AdminOrders`),
      priority: 'high',
      relatedEntityType: 'Order',
      relatedEntityId: order.id,
      requiresAction: true,
      metadata: {
        order_number: orderNumber,
        order_id: order.id,
        amount: order.total_amount,
        customer_name: customerName,
        customer_email: order.customer_email,
        items_count: order.items?.length || 0
      }
    });

    console.log(`✅ Created ${adminNotifs.length} admin notifications`);

    // Customer notification
    const userNotif = await this.createUserNotification({
      recipientEmail: order.customer_email,
      type: 'order_confirmed',
      title: '✅ Đơn Hàng Đã Được Xác Nhận',
      message: `Đơn hàng #${orderNumber} của bạn đã được tiếp nhận và đang được xử lý`,
      link: createPageUrl('MyOrders'),
      priority: 'high',
      metadata: {
        order_number: orderNumber,
        order_id: order.id,
        amount: order.total_amount
      }
    });

    console.log('✅ Created user notification:', userNotif?.id);

    return { adminNotifs, userNotif };
  }

  /**
   * 💳 Payment Notifications
   */
  static async notifyPaymentVerificationNeeded(order) {
    const orderNumber = order.order_number || order.id?.slice(-8);
    const amount = order.total_amount?.toLocaleString('vi-VN');

    await this.createAdminNotification({
      type: 'payment_verification_needed',
      title: `💳 Cần Xác Minh Thanh Toán #${orderNumber}`,
      message: `Khách hàng ${order.customer_name} đã chuyển khoản ${amount}đ. Vui lòng xác minh!`,
      link: createPageUrl('AdminPaymentVerification'),
      priority: 'urgent',
      relatedEntityType: 'Order',
      relatedEntityId: order.id,
      requiresAction: true,
      metadata: {
        order_number: orderNumber,
        amount: order.total_amount,
        customer_name: order.customer_name,
        payment_method: order.payment_method
      }
    });
  }

  static async notifyPaymentConfirmed(order) {
    const orderNumber = order.order_number || order.id?.slice(-8);

    // Send payment confirmation email
    CommunicationService.sendPaymentConfirmation(order).catch(err => 
      console.error('Payment confirmation email failed (non-blocking):', err)
    );

    // Customer notification
    await this.createUserNotification({
      recipientEmail: order.customer_email,
      type: 'payment_success',
      title: '✅ Thanh Toán Thành Công',
      message: `Thanh toán cho đơn hàng #${orderNumber} đã được xác nhận. Đơn hàng đang được chuẩn bị!`,
      link: createPageUrl('MyOrders'),
      priority: 'high',
      metadata: {
        order_number: orderNumber,
        order_id: order.id
      }
    });

    // Admin notification
    await this.createAdminNotification({
      type: 'payment_received',
      title: `✅ Thanh Toán Đã Xác Nhận #${orderNumber}`,
      message: `Đơn hàng #${orderNumber} đã thanh toán thành công`,
      link: createPageUrl('AdminOrders'),
      priority: 'normal',
      relatedEntityType: 'Order',
      relatedEntityId: order.id,
      metadata: {
        order_number: orderNumber,
        amount: order.total_amount
      }
    });
  }

  static async notifyPaymentFailed(order) {
    const orderNumber = order.order_number || order.id?.slice(-8);

    // Send payment failed email
    CommunicationService.sendPaymentFailed(order).catch(err => 
      console.error('Payment failed email failed (non-blocking):', err)
    );

    // Customer notification
    await this.createUserNotification({
      recipientEmail: order.customer_email,
      type: 'payment_failed',
      title: '⚠️ Thanh Toán Thất Bại',
      message: `Thanh toán cho đơn hàng #${orderNumber} không thành công. Vui lòng thử lại.`,
      link: createPageUrl('MyOrders'),
      priority: 'high',
      metadata: {
        order_number: orderNumber,
        order_id: order.id
      }
    });
  }

  /**
   * 📦 Order Status Change Notifications
   */
  static async orderStatusChanged(order, oldStatus, newStatus) {
    return this.notifyOrderStatusChange(order, newStatus);
  }

  static async notifyOrderStatusChange(order, newStatus) {
    const orderNumber = order.order_number || order.id?.slice(-8);
    
    // Send email notifications (non-blocking to avoid delays)
    if (newStatus === 'confirmed') {
      CommunicationService.sendOrderConfirmation(order).catch(err => 
        console.error('Email send failed (non-blocking):', err)
      );
    } else if (newStatus === 'shipping') {
      CommunicationService.sendShippingNotification(order).catch(err => 
        console.error('Email send failed (non-blocking):', err)
      );
    } else if (newStatus === 'delivered') {
      CommunicationService.sendDeliveryConfirmation(order).catch(err => 
        console.error('Email send failed (non-blocking):', err)
      );
    } else if (newStatus === 'cancelled') {
      const cancellationReason = order.cancellation_reason || order.internal_note || 'Đơn hàng đã bị hủy';
      CommunicationService.sendOrderCancellation(order, cancellationReason).catch(err => 
        console.error('Email send failed (non-blocking):', err)
      );
    }
    
    // Send push notification
    CommunicationService.sendPushNotification(
      `Đơn hàng #${orderNumber}`,
      `Trạng thái mới: ${newStatus}`,
      `order-${order.id}`
    ).catch(err => console.error('Push notification failed:', err));
    
    const statusMessages = {
      confirmed: { title: '✅ Đơn Hàng Đã Xác Nhận', message: 'đã được xác nhận và đang chuẩn bị', type: 'order_confirmed' },
      processing: { title: '📦 Đơn Hàng Đang Chuẩn Bị', message: 'đang được đóng gói', type: 'order_confirmed' },
      shipping: { title: '🚚 Đơn Hàng Đang Giao', message: 'đang trên đường giao đến bạn', type: 'order_shipping' },
      delivered: { title: '🎉 Đơn Hàng Đã Giao', message: 'đã được giao thành công', type: 'order_delivered' },
      cancelled: { title: '❌ Đơn Hàng Đã Hủy', message: 'đã bị hủy', type: 'order_cancelled' }
    };

    const statusInfo = statusMessages[newStatus];
    if (!statusInfo) return;

    // Customer notification
    await this.createUserNotification({
      recipientEmail: order.customer_email,
      type: statusInfo.type,
      title: statusInfo.title,
      message: `Đơn hàng #${orderNumber} ${statusInfo.message}`,
      link: createPageUrl('MyOrders'),
      priority: 'high',
      metadata: {
        order_number: orderNumber,
        order_id: order.id,
        status: newStatus
      }
    });

    // Admin notification (for important statuses)
    if (['delivered', 'cancelled'].includes(newStatus)) {
      await this.createAdminNotification({
        type: 'order_status_change',
        title: `${statusInfo.title} #${orderNumber}`,
        message: `Đơn hàng #${orderNumber} ${statusInfo.message}`,
        link: createPageUrl('AdminOrders'),
        priority: 'normal',
        relatedEntityType: 'Order',
        relatedEntityId: order.id,
        metadata: {
          order_number: orderNumber,
          status: newStatus,
          customer_name: order.customer_name
        }
      });
    }
  }

  /**
   * ⭐ Review Notifications
   */
  static async notifyNewReview(review, product) {
    await this.createAdminNotification({
      type: 'new_review',
      title: `⭐ Đánh Giá Mới Cho ${product?.name}`,
      message: `${review.customer_name} đã đánh giá ${review.rating} sao`,
      link: createPageUrl('AdminReviews'),
      priority: 'normal',
      relatedEntityType: 'Review',
      relatedEntityId: review.id,
      metadata: {
        product_name: product?.name,
        rating: review.rating,
        customer_name: review.customer_name,
        has_images: (review.images?.length || 0) > 0,
        has_videos: (review.videos?.length || 0) > 0
      }
    });
  }

  /**
   * 📊 Low Stock Notifications
   */
  static async notifyLowStock(product) {
    await this.createAdminNotification({
      type: 'low_stock',
      title: `⚠️ Sắp Hết Hàng: ${product.name}`,
      message: `Chỉ còn ${product.stock_quantity} ${product.unit}`,
      link: createPageUrl('AdminInventory'),
      priority: 'high',
      relatedEntityType: 'Product',
      relatedEntityId: product.id,
      requiresAction: true,
      metadata: {
        product_name: product.name,
        stock_quantity: product.stock_quantity,
        low_stock_threshold: product.low_stock_threshold
      }
    });
  }

  /**
   * 🆕 New Customer Notifications
   */
  static async notifyNewCustomer(customer) {
    await this.createAdminNotification({
      type: 'new_customer',
      title: `👤 Khách Hàng Mới: ${customer.full_name}`,
      message: `${customer.email} vừa đăng ký tài khoản`,
      link: createPageUrl('AdminCustomers'),
      priority: 'low',
      relatedEntityType: 'Customer',
      relatedEntityId: customer.id,
      metadata: {
        customer_name: customer.full_name,
        customer_email: customer.email
      }
    });
  }

  // ========== 🌾 HARVEST NOTIFICATIONS ==========

  /**
   * 🌾 Notify customer about upcoming harvest (3-5 days before)
   */
  static async notifyHarvestReminder(order, lot, daysUntilHarvest) {
    const orderNumber = order.order_number || order.id?.slice(-8);
    const harvestDate = new Date(lot.estimated_harvest_date).toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Customer notification
    await this.createUserNotification({
      recipientEmail: order.customer_email,
      type: 'harvest_reminder',
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
              <p>Chúng tôi vui mừng thông báo sản phẩm bạn đặt trước sắp được thu hoạch:</p>
              
              <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #7CB342;">
                <p style="margin: 5px 0;"><strong>Đơn hàng:</strong> #${orderNumber}</p>
                <p style="margin: 5px 0;"><strong>Sản phẩm:</strong> ${lot.product_name}</p>
                <p style="margin: 5px 0;"><strong>Lô hàng:</strong> ${lot.lot_name}</p>
                <p style="margin: 5px 0;"><strong>Ngày thu hoạch:</strong> ${harvestDate}</p>
                <p style="margin: 5px 0;"><strong>Còn:</strong> <span style="color: #FF9800; font-weight: bold;">${daysUntilHarvest} ngày</span></p>
              </div>

              ${order.remaining_amount > 0 ? `
              <div style="background: #FFF3E0; border-radius: 8px; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; color: #E65100;">
                  💰 <strong>Số tiền còn lại cần thanh toán:</strong> ${order.remaining_amount.toLocaleString('vi-VN')}đ
                </p>
                <p style="margin: 10px 0 0 0; font-size: 14px; color: #666;">
                  Vui lòng thanh toán khi nhận hàng hoặc chuyển khoản trước ngày giao.
                </p>
              </div>
              ` : ''}

              <p>Chúng tôi sẽ liên hệ với bạn để xác nhận thời gian giao hàng cụ thể.</p>
              
              <div style="text-align: center; margin-top: 30px;">
                <a href="${createPageUrl('MyOrders')}" style="background: #7CB342; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold;">
                  Xem Đơn Hàng
                </a>
              </div>
              
              <p style="margin-top: 30px; color: #666; font-size: 14px;">
                Cảm ơn bạn đã tin tưởng và đặt hàng trước tại Farmer Smart! 🌿
              </p>
            </div>
          </div>
        `
      });
      console.log('✅ Harvest reminder email sent to:', order.customer_email);
    } catch (error) {
      console.error('❌ Failed to send harvest reminder email:', error);
    }
  }

  /**
   * 🎉 Notify customer that harvest is ready
   */
  static async notifyHarvestReady(order, lot) {
    const orderNumber = order.order_number || order.id?.slice(-8);

    // Customer notification
    await this.createUserNotification({
      recipientEmail: order.customer_email,
      type: 'harvest_ready',
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
    });

    // Admin notification
    await this.createAdminNotification({
      type: 'harvest_ready',
      title: `🎉 Lot ${lot.lot_name} Đã Thu Hoạch`,
      message: `${lot.product_name} đã sẵn sàng giao. Có ${lot.sold_quantity || 0} đơn cần xử lý.`,
      link: createPageUrl('AdminProductLots'),
      priority: 'high',
      relatedEntityType: 'ProductLot',
      relatedEntityId: lot.id,
      requiresAction: true,
      metadata: {
        lot_id: lot.id,
        lot_name: lot.lot_name,
        product_name: lot.product_name,
        orders_count: lot.sold_quantity || 0
      }
    });

    // Send email
    try {
      await base44.integrations.Core.SendEmail({
        to: order.customer_email,
        subject: `🎉 [${orderNumber}] Sản phẩm đã thu hoạch - Chuẩn bị giao hàng!`,
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #4CAF50, #2E7D32); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
              <h1 style="color: white; margin: 0;">🎉 Đã Thu Hoạch!</h1>
            </div>
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 12px 12px;">
              <p>Xin chào <strong>${order.customer_name}</strong>,</p>
              <p>Tin vui! Sản phẩm bạn đặt trước đã được thu hoạch thành công:</p>
              
              <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #4CAF50;">
                <p style="margin: 5px 0;"><strong>Đơn hàng:</strong> #${orderNumber}</p>
                <p style="margin: 5px 0;"><strong>Sản phẩm:</strong> ${lot.product_name}</p>
                <p style="margin: 5px 0;"><strong>Lô hàng:</strong> ${lot.lot_name}</p>
              </div>

              <p>Chúng tôi đang đóng gói và sẽ giao hàng đến bạn trong thời gian sớm nhất.</p>

              ${order.remaining_amount > 0 ? `
              <div style="background: #FFF3E0; border-radius: 8px; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; color: #E65100;">
                  💰 <strong>Số tiền còn lại:</strong> ${order.remaining_amount.toLocaleString('vi-VN')}đ
                </p>
                <p style="margin: 10px 0 0 0; font-size: 14px; color: #666;">
                  Vui lòng chuẩn bị thanh toán khi nhận hàng.
                </p>
              </div>
              ` : ''}
              
              <div style="text-align: center; margin-top: 30px;">
                <a href="${createPageUrl('MyOrders')}" style="background: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold;">
                  Theo Dõi Đơn Hàng
                </a>
              </div>
            </div>
          </div>
        `
      });
      console.log('✅ Harvest ready email sent to:', order.customer_email);
    } catch (error) {
      console.error('❌ Failed to send harvest ready email:', error);
    }
  }

  /**
   * 💰 Remind customer to pay remaining amount
   */
  static async notifyFinalPaymentReminder(order, lot, daysUntilDelivery = 2) {
    const orderNumber = order.order_number || order.id?.slice(-8);
    const remainingAmount = order.remaining_amount || 0;

    if (remainingAmount <= 0) return; // No need to remind if fully paid

    // Customer notification
    await this.createUserNotification({
      recipientEmail: order.customer_email,
      type: 'final_payment_reminder',
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
    });

    // Admin notification
    await this.createAdminNotification({
      type: 'final_payment_pending',
      title: `💳 Chờ Thanh Toán #${orderNumber}`,
      message: `${order.customer_name} còn ${remainingAmount.toLocaleString('vi-VN')}đ chưa thanh toán`,
      link: createPageUrl('AdminOrders'),
      priority: 'normal',
      relatedEntityType: 'Order',
      relatedEntityId: order.id,
      metadata: {
        order_number: orderNumber,
        customer_name: order.customer_name,
        remaining_amount: remainingAmount
      }
    });

    // Send email
    try {
      await base44.integrations.Core.SendEmail({
        to: order.customer_email,
        subject: `💰 [${orderNumber}] Nhắc nhở thanh toán - ${remainingAmount.toLocaleString('vi-VN')}đ`,
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #FF9800, #F57C00); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
              <h1 style="color: white; margin: 0;">💰 Nhắc Nhở Thanh Toán</h1>
            </div>
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 12px 12px;">
              <p>Xin chào <strong>${order.customer_name}</strong>,</p>
              <p>Đơn hàng Pre-Order của bạn sắp được giao:</p>
              
              <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #FF9800;">
                <p style="margin: 5px 0;"><strong>Đơn hàng:</strong> #${orderNumber}</p>
                <p style="margin: 5px 0;"><strong>Tổng đơn hàng:</strong> ${(order.total_amount || 0).toLocaleString('vi-VN')}đ</p>
                <p style="margin: 5px 0;"><strong>Đã cọc:</strong> ${(order.deposit_amount || 0).toLocaleString('vi-VN')}đ</p>
                <p style="margin: 5px 0; font-size: 18px; color: #FF9800;"><strong>Còn lại:</strong> <strong>${remainingAmount.toLocaleString('vi-VN')}đ</strong></p>
              </div>

              <div style="background: #E3F2FD; border-radius: 8px; padding: 15px; margin: 20px 0;">
                <p style="margin: 0 0 10px 0; font-weight: bold;">🏦 Thông tin chuyển khoản:</p>
                <p style="margin: 5px 0;">Ngân hàng: <strong>Vietcombank</strong></p>
                <p style="margin: 5px 0;">Số TK: <strong>1234567890</strong></p>
                <p style="margin: 5px 0;">Chủ TK: <strong>FARMER SMART</strong></p>
                <p style="margin: 5px 0;">Nội dung: <strong>${orderNumber}</strong></p>
              </div>

              <p>Bạn có thể thanh toán trước qua chuyển khoản hoặc thanh toán khi nhận hàng (COD).</p>
              
              <div style="text-align: center; margin-top: 30px;">
                <a href="${createPageUrl('MyOrders')}" style="background: #FF9800; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold;">
                  Xem Chi Tiết Đơn Hàng
                </a>
              </div>
            </div>
          </div>
        `
      });
      console.log('✅ Final payment reminder email sent to:', order.customer_email);
    } catch (error) {
      console.error('❌ Failed to send final payment reminder email:', error);
    }
  }

  /**
   * 📊 Notify admin about upcoming harvests
   */
  static async notifyAdminUpcomingHarvest(lot, daysUntilHarvest, ordersCount) {
    await this.createAdminNotification({
      type: 'harvest_upcoming',
      title: `🌾 Lot "${lot.lot_name}" sắp thu hoạch`,
      message: `${lot.product_name} - còn ${daysUntilHarvest} ngày. ${ordersCount} đơn hàng đang chờ.`,
      link: createPageUrl('AdminProductLots'),
      priority: daysUntilHarvest <= 2 ? 'urgent' : 'high',
      relatedEntityType: 'ProductLot',
      relatedEntityId: lot.id,
      requiresAction: true,
      metadata: {
        lot_id: lot.id,
        lot_name: lot.lot_name,
        product_name: lot.product_name,
        harvest_date: lot.estimated_harvest_date,
        days_until_harvest: daysUntilHarvest,
        orders_count: ordersCount
      }
    });
  }

  /**
   * 💵 Notify when deposit is received
   */
  static async notifyDepositReceived(order) {
    const orderNumber = order.order_number || order.id?.slice(-8);
    const depositAmount = order.deposit_amount || 0;

    // Customer notification
    await this.createUserNotification({
      recipientEmail: order.customer_email,
      type: 'payment_success',
      title: '✅ Đã Nhận Tiền Cọc',
      message: `Đơn hàng #${orderNumber} đã nhận cọc ${depositAmount.toLocaleString('vi-VN')}đ. Còn lại ${(order.remaining_amount || 0).toLocaleString('vi-VN')}đ khi nhận hàng.`,
      link: createPageUrl('MyOrders'),
      priority: 'high',
      metadata: {
        order_number: orderNumber,
        order_id: order.id,
        deposit_amount: depositAmount,
        remaining_amount: order.remaining_amount
      }
    });

    // Admin notification
    await this.createAdminNotification({
      type: 'deposit_received',
      title: `💵 Nhận Cọc #${orderNumber}`,
      message: `${order.customer_name} đã cọc ${depositAmount.toLocaleString('vi-VN')}đ`,
      link: createPageUrl('AdminOrders'),
      priority: 'normal',
      relatedEntityType: 'Order',
      relatedEntityId: order.id,
      metadata: {
        order_number: orderNumber,
        customer_name: order.customer_name,
        deposit_amount: depositAmount,
        remaining_amount: order.remaining_amount
      }
    });
  }

  // ========== 📈 PRICE FOMO NOTIFICATIONS ==========

  /**
   * 🔥 Notify users about upcoming price increase (FOMO)
   */
  static async notifyPriceIncrease(lot, hoursUntilIncrease, currentPrice, nextPrice) {
    const percentIncrease = Math.round(((nextPrice - currentPrice) / currentPrice) * 100);

    // Broadcast notification to all users
    await this.createUserNotification({
      recipientEmail: null, // Broadcast
      type: 'promo',
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
    });

    // Admin notification
    await this.createAdminNotification({
      type: 'system_alert',
      title: `📈 FOMO: ${lot.product_name}`,
      message: `Giá sẽ tăng ${percentIncrease}% trong ${hoursUntilIncrease}h`,
      link: createPageUrl('AdminProductLots'),
      priority: 'normal',
      relatedEntityType: 'ProductLot',
      relatedEntityId: lot.id,
      metadata: {
        lot_id: lot.id,
        current_price: currentPrice,
        next_price: nextPrice,
        percent_increase: percentIncrease
      }
    });
  }

  /**
   * 📧 Send FOMO email to specific customer
   */
  static async sendFomoEmail(customerEmail, customerName, lot, fomoData) {
    try {
      await base44.integrations.Core.SendEmail({
        to: customerEmail,
        subject: `⏰ ${lot.product_name} - Giá sắp tăng ${fomoData.percent_increase}%!`,
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #FF6B35, #FF9F1C); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
              <h1 style="color: white; margin: 0;">⏰ Giá Sắp Tăng!</h1>
              <p style="color: white; opacity: 0.9; margin: 10px 0 0 0;">Chỉ còn ${fomoData.hours_until_increase} giờ</p>
            </div>
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 12px 12px;">
              <p>Xin chào <strong>${customerName}</strong>,</p>
              <p>Sản phẩm bạn quan tâm sắp tăng giá:</p>
              
              <div style="background: white; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center;">
                <h3 style="margin: 0 0 10px 0;">${lot.product_name}</h3>
                <p style="margin: 0; color: #999; text-decoration: line-through;">
                  Giá sau: ${fomoData.next_price.toLocaleString('vi-VN')}đ
                </p>
                <p style="margin: 10px 0; color: #FF6B35; font-size: 24px; font-weight: bold;">
                  ${fomoData.current_price.toLocaleString('vi-VN')}đ
                </p>
                <span style="background: #FF6B35; color: white; padding: 5px 15px; border-radius: 20px; font-size: 14px;">
                  Tiết kiệm ${fomoData.percent_increase}%
                </span>
              </div>

              <div style="background: #FFF3E0; border-radius: 8px; padding: 15px; margin: 20px 0; text-align: center;">
                <p style="margin: 0; color: #E65100; font-weight: bold;">
                  ⏰ Chỉ còn ${fomoData.hours_until_increase} giờ!
                </p>
              </div>
              
              <div style="text-align: center; margin-top: 30px;">
                <a href="${createPageUrl('PreOrderProductDetail')}?id=${lot.id}" style="background: linear-gradient(135deg, #FF6B35, #FF9F1C); color: white; padding: 15px 40px; text-decoration: none; border-radius: 30px; font-weight: bold;">
                  🛒 Mua Ngay
                </a>
              </div>
            </div>
          </div>
        `
      });
      console.log('✅ FOMO email sent to:', customerEmail);
      return true;
    } catch (error) {
      console.error('❌ Failed to send FOMO email:', error);
      return false;
    }
  }

  /**
   * 💰 Notify when lot price has increased
   */
  static async notifyPriceIncreased(lot, oldPrice, newPrice) {
    const percentIncrease = Math.round(((newPrice - oldPrice) / oldPrice) * 100);

    await this.createAdminNotification({
      type: 'system_alert',
      title: `📈 Giá đã tăng: ${lot.product_name}`,
      message: `Lot "${lot.lot_name}": ${oldPrice.toLocaleString('vi-VN')}đ → ${newPrice.toLocaleString('vi-VN')}đ (+${percentIncrease}%)`,
      link: createPageUrl('AdminProductLots'),
      priority: 'normal',
      relatedEntityType: 'ProductLot',
      relatedEntityId: lot.id,
      metadata: {
        lot_id: lot.id,
        lot_name: lot.lot_name,
        old_price: oldPrice,
        new_price: newPrice,
        percent_increase: percentIncrease
      }
    });
  }
}

export default NotificationService;