/**
 * Order Event Handler - Commerce domain
 * 
 * Handles: order.created, order.confirmed, order.shipped, order.delivered, order.cancelled
 */

import { notificationEngine } from '../../../core/notificationEngine';
import { OrderEvents } from '../../../types/EventTypes';
import { createPageUrl } from '@/utils';

/**
 * Handle order created event
 */
export const handleOrderCreated = async (payload) => {
  const { order, customer } = payload;
  const orderNumber = order.order_number || order.id?.slice(-8);
  const amount = order.total_amount?.toLocaleString('vi-VN');
  const customerName = customer?.full_name || customer?.name || order.customer_name || 'Khách hàng';

  console.log('📦 [OrderEventHandler] order.created:', orderNumber);

  // 1. Admin notification
  await notificationEngine.create({
    actor: 'admin',
    type: 'new_order',
    recipients: null, // Broadcast to all admins
    payload: {
      title: `🛍️ Đơn Hàng Mới #${orderNumber}`,
      message: `${customerName} đã đặt đơn hàng ${amount}đ`,
      link: createPageUrl('AdminOrders'),
      priority: 'high',
      requiresAction: true,
      metadata: {
        order_number: orderNumber,
        order_id: order.id,
        amount: order.total_amount,
        customer_name: customerName,
        customer_email: order.customer_email,
        items_count: order.items?.length || 0
      }
    },
    routing: {
      related_entity_type: 'Order',
      related_entity_id: order.id
    }
  });

  // 2. Customer notification
  if (order.customer_email) {
    await notificationEngine.create({
      actor: 'client',
      type: 'order_confirmed',
      recipients: order.customer_email,
      payload: {
        title: '✅ Đơn Hàng Đã Được Xác Nhận',
        message: `Đơn hàng #${orderNumber} của bạn đã được tiếp nhận và đang được xử lý`,
        link: createPageUrl('MyOrders'),
        priority: 'high',
        metadata: {
          order_number: orderNumber,
          order_id: order.id,
          amount: order.total_amount
        }
      }
    });
  }
};

/**
 * Handle order status change events
 */
export const handleOrderStatusChange = async (payload) => {
  const { order, newStatus, oldStatus } = payload;
  const orderNumber = order.order_number || order.id?.slice(-8);

  console.log(`📦 [OrderEventHandler] order.${newStatus}:`, orderNumber);

  const statusMessages = {
    confirmed: { 
      title: '✅ Đơn Hàng Đã Xác Nhận', 
      message: 'đã được xác nhận và đang chuẩn bị', 
      type: 'order_confirmed' 
    },
    processing: { 
      title: '📦 Đơn Hàng Đang Chuẩn Bị', 
      message: 'đang được đóng gói', 
      type: 'order_confirmed' 
    },
    shipping: { 
      title: '🚚 Đơn Hàng Đang Giao', 
      message: 'đang trên đường giao đến bạn', 
      type: 'order_shipping' 
    },
    delivered: { 
      title: '🎉 Đơn Hàng Đã Giao', 
      message: 'đã được giao thành công', 
      type: 'order_delivered' 
    },
    cancelled: { 
      title: '❌ Đơn Hàng Đã Hủy', 
      message: 'đã bị hủy', 
      type: 'order_cancelled' 
    }
  };

  const statusInfo = statusMessages[newStatus];
  if (!statusInfo) return;

  // Customer notification
  if (order.customer_email) {
    await notificationEngine.create({
      actor: 'client',
      type: statusInfo.type,
      recipients: order.customer_email,
      payload: {
        title: statusInfo.title,
        message: `Đơn hàng #${orderNumber} ${statusInfo.message}`,
        link: createPageUrl('MyOrders'),
        priority: 'high',
        metadata: {
          order_number: orderNumber,
          order_id: order.id,
          status: newStatus,
          old_status: oldStatus
        }
      }
    });
  }

  // Admin notification for important statuses
  if (['delivered', 'cancelled'].includes(newStatus)) {
    await notificationEngine.create({
      actor: 'admin',
      type: 'order_status_change',
      recipients: null,
      payload: {
        title: `${statusInfo.title} #${orderNumber}`,
        message: `Đơn hàng #${orderNumber} ${statusInfo.message}`,
        link: createPageUrl('AdminOrders'),
        priority: 'normal',
        metadata: {
          order_number: orderNumber,
          status: newStatus,
          customer_name: order.customer_name
        }
      },
      routing: {
        related_entity_type: 'Order',
        related_entity_id: order.id
      }
    });
  }
};

/**
 * Register all order event handlers
 */
export const registerOrderHandlers = (registry) => {
  registry.register(OrderEvents.CREATED, handleOrderCreated, { priority: 10 });
  registry.register(OrderEvents.CONFIRMED, (p) => handleOrderStatusChange({ ...p, newStatus: 'confirmed' }));
  registry.register(OrderEvents.PROCESSING, (p) => handleOrderStatusChange({ ...p, newStatus: 'processing' }));
  registry.register(OrderEvents.SHIPPED, (p) => handleOrderStatusChange({ ...p, newStatus: 'shipping' }));
  registry.register(OrderEvents.DELIVERED, (p) => handleOrderStatusChange({ ...p, newStatus: 'delivered' }));
  registry.register(OrderEvents.CANCELLED, (p) => handleOrderStatusChange({ ...p, newStatus: 'cancelled' }));
  
  console.log('✅ Order event handlers registered');
};

export default {
  handleOrderCreated,
  handleOrderStatusChange,
  registerOrderHandlers
};