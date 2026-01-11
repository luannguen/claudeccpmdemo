/**
 * Customer Event Handler - CRM domain
 * 
 * Handles: customer.registered, customer.first_order, customer.milestone
 */

import { notificationEngine } from '../../../core/notificationEngine';
import { CustomerEvents } from '../../../types/EventTypes';
import { createPageUrl } from '@/utils';

/**
 * Handle new customer registered
 */
export const handleCustomerRegistered = async (payload) => {
  const { customer } = payload;

  console.log('👤 [CustomerEventHandler] customer.registered:', customer.full_name);

  await notificationEngine.create({
    actor: 'admin',
    type: 'new_customer',
    recipients: null,
    payload: {
      title: `👤 Khách Hàng Mới: ${customer.full_name}`,
      message: `${customer.email} vừa đăng ký tài khoản`,
      link: createPageUrl('AdminCustomers'),
      priority: 'low',
      metadata: {
        customer_id: customer.id,
        customer_name: customer.full_name,
        customer_email: customer.email,
        source: customer.customer_source
      }
    },
    routing: {
      related_entity_type: 'Customer',
      related_entity_id: customer.id
    }
  });
};

/**
 * Handle customer first order
 */
export const handleCustomerFirstOrder = async (payload) => {
  const { customer, order } = payload;
  const orderNumber = order.order_number || order.id?.slice(-8);

  console.log('🎉 [CustomerEventHandler] customer.first_order:', customer.full_name);

  // Admin notification
  await notificationEngine.create({
    actor: 'admin',
    type: 'customer_first_order',
    recipients: null,
    payload: {
      title: `🎉 Đơn Hàng Đầu Tiên: ${customer.full_name}`,
      message: `Khách hàng mới vừa đặt đơn đầu tiên #${orderNumber}`,
      link: createPageUrl('AdminCustomers') + `?id=${customer.id}`,
      priority: 'normal',
      metadata: {
        customer_id: customer.id,
        customer_name: customer.full_name,
        order_id: order.id,
        order_number: orderNumber,
        order_amount: order.total_amount
      }
    }
  });

  // Customer welcome notification
  if (customer.email) {
    await notificationEngine.create({
      actor: 'client',
      type: 'welcome',
      recipients: customer.email,
      payload: {
        title: '🎉 Chào Mừng Bạn!',
        message: 'Cảm ơn bạn đã tin tưởng và đặt đơn hàng đầu tiên. Chúc bạn mua sắm vui vẻ!',
        link: createPageUrl('MyOrders'),
        priority: 'normal',
        metadata: {
          is_first_order: true
        }
      }
    });
  }
};

/**
 * Handle customer milestone (VIP upgrade, spending milestone, etc.)
 */
export const handleCustomerMilestone = async (payload) => {
  const { customer, milestone, newTier } = payload;

  console.log('🏆 [CustomerEventHandler] customer.milestone:', customer.full_name);

  // Customer notification
  if (customer.email) {
    let title, message;
    
    if (newTier) {
      title = `🎖️ Chúc Mừng Lên Hạng ${newTier}!`;
      message = `Bạn đã được nâng cấp lên thành viên ${newTier}. Tận hưởng nhiều ưu đãi hơn!`;
    } else {
      title = `🏆 ${milestone.title || 'Chúc Mừng!'}`;
      message = milestone.message || 'Bạn đã đạt được một cột mốc mới!';
    }

    await notificationEngine.create({
      actor: 'client',
      type: 'achievement',
      recipients: customer.email,
      payload: {
        title,
        message,
        link: createPageUrl('MyProfile'),
        priority: 'high',
        metadata: {
          milestone_type: milestone?.type,
          new_tier: newTier,
          ...milestone
        }
      }
    });
  }
};

/**
 * Register all customer event handlers
 */
export const registerCustomerHandlers = (registry) => {
  registry.register(CustomerEvents.REGISTERED, handleCustomerRegistered, { priority: 3 });
  registry.register(CustomerEvents.FIRST_ORDER, handleCustomerFirstOrder, { priority: 6 });
  registry.register(CustomerEvents.MILESTONE, handleCustomerMilestone, { priority: 5 });
  
  console.log('✅ Customer event handlers registered');
};

export default {
  handleCustomerRegistered,
  handleCustomerFirstOrder,
  handleCustomerMilestone,
  registerCustomerHandlers
};