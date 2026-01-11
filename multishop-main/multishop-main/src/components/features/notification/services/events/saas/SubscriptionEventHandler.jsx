/**
 * Subscription Event Handler - SaaS domain
 * 
 * Handles: subscription.expiry_warning, subscription.expired, subscription.renewed
 */

import { notificationEngine } from '../../../core/notificationEngine';
import { SubscriptionEvents } from '../../../types/EventTypes';
import { createPageUrl } from '@/utils';

/**
 * Handle subscription expiry warning
 */
export const handleExpiryWarning = async (payload) => {
  const { tenant, daysLeft } = payload;

  console.log('⏰ [SubscriptionEventHandler] subscription.expiry_warning:', tenant.shop_name);

  if (tenant.owner_email) {
    await notificationEngine.create({
      actor: 'tenant',
      type: 'subscription_expiry_warning',
      recipients: tenant.owner_email,
      payload: {
        title: `⏰ Gói Dịch Vụ Sắp Hết Hạn`,
        message: `Gói dịch vụ của shop "${tenant.shop_name}" sẽ hết hạn trong ${daysLeft} ngày. Gia hạn ngay để tránh gián đoạn.`,
        link: createPageUrl('TenantBilling'),
        priority: daysLeft <= 3 ? 'urgent' : 'high',
        metadata: {
          tenant_id: tenant.id,
          days_left: daysLeft,
          plan_name: tenant.subscription_plan
        }
      },
      routing: {
        tenant_id: tenant.id
      }
    });
  }
};

/**
 * Handle subscription expired
 */
export const handleSubscriptionExpired = async (payload) => {
  const { tenant } = payload;

  console.log('❌ [SubscriptionEventHandler] subscription.expired:', tenant.shop_name);

  if (tenant.owner_email) {
    await notificationEngine.create({
      actor: 'tenant',
      type: 'subscription_expired',
      recipients: tenant.owner_email,
      payload: {
        title: '❌ Gói Dịch Vụ Đã Hết Hạn',
        message: `Gói dịch vụ của shop "${tenant.shop_name}" đã hết hạn. Gia hạn ngay để tiếp tục sử dụng.`,
        link: createPageUrl('TenantBilling'),
        priority: 'urgent',
        metadata: {
          tenant_id: tenant.id
        }
      },
      routing: {
        tenant_id: tenant.id
      }
    });
  }

  // Admin notification
  await notificationEngine.create({
    actor: 'admin',
    type: 'subscription_expired',
    recipients: null,
    payload: {
      title: `⚠️ Subscription Hết Hạn: ${tenant.shop_name}`,
      message: `Shop ${tenant.shop_name} (${tenant.owner_email}) đã hết hạn subscription`,
      link: createPageUrl('SuperAdminTenants'),
      priority: 'normal',
      metadata: {
        tenant_id: tenant.id,
        shop_name: tenant.shop_name
      }
    }
  });
};

/**
 * Handle subscription renewed
 */
export const handleSubscriptionRenewed = async (payload) => {
  const { tenant, newPlan, endDate } = payload;

  console.log('✅ [SubscriptionEventHandler] subscription.renewed:', tenant.shop_name);

  if (tenant.owner_email) {
    await notificationEngine.create({
      actor: 'tenant',
      type: 'subscription_renewed',
      recipients: tenant.owner_email,
      payload: {
        title: '✅ Gia Hạn Thành Công!',
        message: `Gói ${newPlan || 'dịch vụ'} đã được gia hạn đến ${new Date(endDate).toLocaleDateString('vi-VN')}`,
        link: createPageUrl('TenantBilling'),
        priority: 'high',
        metadata: {
          tenant_id: tenant.id,
          new_plan: newPlan,
          end_date: endDate
        }
      },
      routing: {
        tenant_id: tenant.id
      }
    });
  }
};

/**
 * Handle trial ending
 */
export const handleTrialEnding = async (payload) => {
  const { tenant, daysLeft } = payload;

  console.log('📅 [SubscriptionEventHandler] subscription.trial_ending:', tenant.shop_name);

  if (tenant.owner_email) {
    await notificationEngine.create({
      actor: 'tenant',
      type: 'trial_ending',
      recipients: tenant.owner_email,
      payload: {
        title: `📅 Thời Gian Dùng Thử Còn ${daysLeft} Ngày`,
        message: `Nâng cấp lên gói trả phí để tiếp tục sử dụng đầy đủ tính năng.`,
        link: createPageUrl('TenantBilling'),
        priority: daysLeft <= 2 ? 'urgent' : 'high',
        metadata: {
          tenant_id: tenant.id,
          days_left: daysLeft
        }
      },
      routing: {
        tenant_id: tenant.id
      }
    });
  }
};

/**
 * Register all subscription event handlers
 */
export const registerSubscriptionHandlers = (registry) => {
  registry.register(SubscriptionEvents.EXPIRY_WARNING, handleExpiryWarning, { priority: 8 });
  registry.register(SubscriptionEvents.EXPIRED, handleSubscriptionExpired, { priority: 10 });
  registry.register(SubscriptionEvents.RENEWED, handleSubscriptionRenewed, { priority: 6 });
  registry.register(SubscriptionEvents.TRIAL_ENDING, handleTrialEnding, { priority: 8 });
  
  console.log('✅ Subscription event handlers registered');
};

export default {
  handleExpiryWarning,
  handleSubscriptionExpired,
  handleSubscriptionRenewed,
  handleTrialEnding,
  registerSubscriptionHandlers
};