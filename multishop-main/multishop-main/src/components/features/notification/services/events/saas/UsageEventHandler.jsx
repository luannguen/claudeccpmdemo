/**
 * Usage Event Handler - SaaS domain
 * 
 * Handles: usage.limit_warning, usage.limit_reached
 */

import { notificationEngine } from '../../../core/notificationEngine';
import { UsageEvents } from '../../../types/EventTypes';
import { createPageUrl } from '@/utils';

/**
 * Handle usage limit warning (e.g., 80% of limit)
 */
export const handleUsageLimitWarning = async (payload) => {
  const { tenant, resource, percentage, current, limit } = payload;

  console.log('⚠️ [UsageEventHandler] usage.limit_warning:', resource, percentage + '%');

  const resourceLabels = {
    orders: 'đơn hàng',
    products: 'sản phẩm',
    storage: 'dung lượng',
    api_calls: 'lượt gọi API'
  };

  const resourceLabel = resourceLabels[resource] || resource;

  if (tenant.owner_email) {
    await notificationEngine.create({
      actor: 'tenant',
      type: 'usage_limit_warning',
      recipients: tenant.owner_email,
      payload: {
        title: `⚠️ Sắp Hết Hạn Mức ${resourceLabel}`,
        message: `Shop đã sử dụng ${percentage}% hạn mức ${resourceLabel} (${current}/${limit}). Nâng cấp gói để tăng hạn mức.`,
        link: createPageUrl('TenantBilling'),
        priority: percentage >= 90 ? 'urgent' : 'high',
        metadata: {
          tenant_id: tenant.id,
          resource,
          percentage,
          current,
          limit
        }
      },
      routing: {
        tenant_id: tenant.id
      }
    });
  }
};

/**
 * Handle usage limit reached (100%)
 */
export const handleUsageLimitReached = async (payload) => {
  const { tenant, resource, current, limit } = payload;

  console.log('🚫 [UsageEventHandler] usage.limit_reached:', resource);

  const resourceLabels = {
    orders: 'đơn hàng',
    products: 'sản phẩm',
    storage: 'dung lượng',
    api_calls: 'lượt gọi API'
  };

  const resourceLabel = resourceLabels[resource] || resource;

  if (tenant.owner_email) {
    await notificationEngine.create({
      actor: 'tenant',
      type: 'usage_limit_reached',
      recipients: tenant.owner_email,
      payload: {
        title: `🚫 Đã Hết Hạn Mức ${resourceLabel}`,
        message: `Shop đã sử dụng hết hạn mức ${resourceLabel} (${current}/${limit}). Nâng cấp gói ngay để tiếp tục hoạt động.`,
        link: createPageUrl('TenantBilling'),
        priority: 'urgent',
        requiresAction: true,
        metadata: {
          tenant_id: tenant.id,
          resource,
          current,
          limit
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
    type: 'tenant_usage_exceeded',
    recipients: null,
    payload: {
      title: `🚫 Tenant Vượt Hạn Mức: ${tenant.shop_name}`,
      message: `Shop ${tenant.shop_name} đã hết ${resourceLabel} (${current}/${limit})`,
      link: createPageUrl('SuperAdminTenants'),
      priority: 'normal',
      metadata: {
        tenant_id: tenant.id,
        resource,
        current,
        limit
      }
    }
  });
};

/**
 * Register all usage event handlers
 */
export const registerUsageHandlers = (registry) => {
  registry.register(UsageEvents.LIMIT_WARNING, handleUsageLimitWarning, { priority: 8 });
  registry.register(UsageEvents.LIMIT_REACHED, handleUsageLimitReached, { priority: 10 });
  
  console.log('✅ Usage event handlers registered');
};

export default {
  handleUsageLimitWarning,
  handleUsageLimitReached,
  registerUsageHandlers
};