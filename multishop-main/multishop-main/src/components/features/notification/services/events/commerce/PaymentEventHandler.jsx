/**
 * Payment Event Handler - Commerce domain
 * 
 * Handles: payment.verification_needed, payment.confirmed, payment.failed, payment.deposit_received
 */

import { notificationEngine } from '../../../core/notificationEngine';
import { PaymentEvents } from '../../../types/EventTypes';
import { createPageUrl } from '@/utils';

/**
 * Handle payment verification needed
 */
export const handlePaymentVerificationNeeded = async (payload) => {
  const { order } = payload;
  const orderNumber = order.order_number || order.id?.slice(-8);
  const amount = order.total_amount?.toLocaleString('vi-VN');

  console.log('💳 [PaymentEventHandler] payment.verification_needed:', orderNumber);

  await notificationEngine.create({
    actor: 'admin',
    type: 'payment_verification_needed',
    recipients: null,
    payload: {
      title: `💳 Cần Xác Minh Thanh Toán #${orderNumber}`,
      message: `Khách hàng ${order.customer_name} đã chuyển khoản ${amount}đ. Vui lòng xác minh!`,
      link: createPageUrl('AdminPaymentVerification'),
      priority: 'urgent',
      requiresAction: true,
      metadata: {
        order_number: orderNumber,
        amount: order.total_amount,
        customer_name: order.customer_name,
        payment_method: order.payment_method
      }
    },
    routing: {
      related_entity_type: 'Order',
      related_entity_id: order.id
    }
  });
};

/**
 * Handle payment confirmed
 */
export const handlePaymentConfirmed = async (payload) => {
  const { order } = payload;
  const orderNumber = order.order_number || order.id?.slice(-8);

  console.log('✅ [PaymentEventHandler] payment.confirmed:', orderNumber);

  // Customer notification
  if (order.customer_email) {
    await notificationEngine.create({
      actor: 'client',
      type: 'payment_success',
      recipients: order.customer_email,
      payload: {
        title: '✅ Thanh Toán Thành Công',
        message: `Thanh toán cho đơn hàng #${orderNumber} đã được xác nhận. Đơn hàng đang được chuẩn bị!`,
        link: createPageUrl('MyOrders'),
        priority: 'high',
        metadata: {
          order_number: orderNumber,
          order_id: order.id
        }
      }
    });
  }

  // Admin notification
  await notificationEngine.create({
    actor: 'admin',
    type: 'payment_received',
    recipients: null,
    payload: {
      title: `✅ Thanh Toán Đã Xác Nhận #${orderNumber}`,
      message: `Đơn hàng #${orderNumber} đã thanh toán thành công`,
      link: createPageUrl('AdminOrders'),
      priority: 'normal',
      metadata: {
        order_number: orderNumber,
        amount: order.total_amount
      }
    },
    routing: {
      related_entity_type: 'Order',
      related_entity_id: order.id
    }
  });
};

/**
 * Handle payment failed
 */
export const handlePaymentFailed = async (payload) => {
  const { order, error } = payload;
  const orderNumber = order.order_number || order.id?.slice(-8);

  console.log('❌ [PaymentEventHandler] payment.failed:', orderNumber);

  if (order.customer_email) {
    await notificationEngine.create({
      actor: 'client',
      type: 'payment_failed',
      recipients: order.customer_email,
      payload: {
        title: '⚠️ Thanh Toán Thất Bại',
        message: `Thanh toán cho đơn hàng #${orderNumber} không thành công. Vui lòng thử lại.`,
        link: createPageUrl('MyOrders'),
        priority: 'high',
        metadata: {
          order_number: orderNumber,
          order_id: order.id,
          error: error || 'Unknown error'
        }
      }
    });
  }
};

/**
 * Handle deposit received
 */
export const handleDepositReceived = async (payload) => {
  const { order } = payload;
  const orderNumber = order.order_number || order.id?.slice(-8);
  const depositAmount = order.deposit_amount || 0;

  console.log('💵 [PaymentEventHandler] payment.deposit_received:', orderNumber);

  // Customer notification
  if (order.customer_email) {
    await notificationEngine.create({
      actor: 'client',
      type: 'payment_success',
      recipients: order.customer_email,
      payload: {
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
      }
    });
  }

  // Admin notification
  await notificationEngine.create({
    actor: 'admin',
    type: 'deposit_received',
    recipients: null,
    payload: {
      title: `💵 Nhận Cọc #${orderNumber}`,
      message: `${order.customer_name} đã cọc ${depositAmount.toLocaleString('vi-VN')}đ`,
      link: createPageUrl('AdminOrders'),
      priority: 'normal',
      metadata: {
        order_number: orderNumber,
        customer_name: order.customer_name,
        deposit_amount: depositAmount,
        remaining_amount: order.remaining_amount
      }
    },
    routing: {
      related_entity_type: 'Order',
      related_entity_id: order.id
    }
  });
};

/**
 * Register all payment event handlers
 */
export const registerPaymentHandlers = (registry) => {
  registry.register(PaymentEvents.VERIFICATION_NEEDED, handlePaymentVerificationNeeded, { priority: 10 });
  registry.register(PaymentEvents.CONFIRMED, handlePaymentConfirmed, { priority: 10 });
  registry.register(PaymentEvents.FAILED, handlePaymentFailed, { priority: 10 });
  registry.register(PaymentEvents.DEPOSIT_RECEIVED, handleDepositReceived, { priority: 8 });
  
  console.log('✅ Payment event handlers registered');
};

export default {
  handlePaymentVerificationNeeded,
  handlePaymentConfirmed,
  handlePaymentFailed,
  handleDepositReceived,
  registerPaymentHandlers
};