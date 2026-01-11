/**
 * Tenant Event Handler - SaaS domain
 * 
 * Handles: tenant.shop_created, tenant.shop_approved, tenant.shop_suspended, tenant.new_shop_order
 */

import { notificationEngine } from '../../../core/notificationEngine';
import { TenantEvents } from '../../../types/EventTypes';
import { createPageUrl } from '@/utils';

/**
 * Handle new shop order for tenant
 */
export const handleNewShopOrder = async (payload) => {
  const { order, tenant, shop } = payload;
  const orderNumber = order.order_number || order.id?.slice(-8);
  const amount = order.total_amount?.toLocaleString('vi-VN');

  console.log('🏪 [TenantEventHandler] tenant.new_shop_order:', orderNumber);

  await notificationEngine.create({
    actor: 'tenant',
    type: 'new_shop_order',
    recipients: tenant.owner_email,
    payload: {
      title: `🛍️ Đơn Hàng Mới #${orderNumber}`,
      message: `Shop ${shop?.name || tenant.shop_name} có đơn hàng mới ${amount}đ`,
      link: createPageUrl('ShopOrders'),
      priority: 'high',
      requiresAction: true,
      metadata: {
        order_id: order.id,
        order_number: orderNumber,
        amount: order.total_amount,
        customer_name: order.customer_name,
        shop_id: shop?.id || tenant.shop_id
      }
    },
    routing: {
      tenant_id: tenant.id,
      related_entity_type: 'Order',
      related_entity_id: order.id
    }
  });
};

/**
 * Handle shop created
 */
export const handleShopCreated = async (payload) => {
  const { tenant, shop } = payload;

  console.log('🏪 [TenantEventHandler] tenant.shop_created:', shop?.name);

  // Admin notification
  await notificationEngine.create({
    actor: 'admin',
    type: 'new_shop',
    recipients: null,
    payload: {
      title: `🏪 Shop Mới Đăng Ký: ${shop?.name || tenant.shop_name}`,
      message: `${tenant.owner_email} vừa tạo shop mới, cần duyệt`,
      link: createPageUrl('SuperAdminTenants'),
      priority: 'high',
      requiresAction: true,
      metadata: {
        tenant_id: tenant.id,
        shop_name: shop?.name || tenant.shop_name,
        owner_email: tenant.owner_email
      }
    },
    routing: {
      related_entity_type: 'Tenant',
      related_entity_id: tenant.id
    }
  });

  // Owner notification
  if (tenant.owner_email) {
    await notificationEngine.create({
      actor: 'tenant',
      type: 'shop_created',
      recipients: tenant.owner_email,
      payload: {
        title: '🎉 Shop Đã Được Tạo',
        message: `Shop "${shop?.name || tenant.shop_name}" đang chờ duyệt. Chúng tôi sẽ thông báo khi được phê duyệt.`,
        link: createPageUrl('ShopDashboard'),
        priority: 'high',
        metadata: {
          tenant_id: tenant.id
        }
      },
      routing: {
        tenant_id: tenant.id
      }
    });
  }
};

/**
 * Handle shop approved
 */
export const handleShopApproved = async (payload) => {
  const { tenant, shop } = payload;

  console.log('✅ [TenantEventHandler] tenant.shop_approved:', shop?.name);

  if (tenant.owner_email) {
    await notificationEngine.create({
      actor: 'tenant',
      type: 'shop_approved',
      recipients: tenant.owner_email,
      payload: {
        title: '✅ Shop Đã Được Duyệt!',
        message: `Chúc mừng! Shop "${shop?.name || tenant.shop_name}" đã được phê duyệt và có thể bắt đầu bán hàng.`,
        link: createPageUrl('ShopDashboard'),
        priority: 'high',
        metadata: {
          tenant_id: tenant.id,
          shop_name: shop?.name || tenant.shop_name
        }
      },
      routing: {
        tenant_id: tenant.id
      }
    });
  }
};

/**
 * Handle shop suspended
 */
export const handleShopSuspended = async (payload) => {
  const { tenant, shop, reason } = payload;

  console.log('⚠️ [TenantEventHandler] tenant.shop_suspended:', shop?.name);

  if (tenant.owner_email) {
    await notificationEngine.create({
      actor: 'tenant',
      type: 'shop_suspended',
      recipients: tenant.owner_email,
      payload: {
        title: '⚠️ Shop Bị Tạm Dừng',
        message: reason || `Shop "${shop?.name || tenant.shop_name}" đã bị tạm dừng. Vui lòng liên hệ hỗ trợ.`,
        link: createPageUrl('TenantSettings'),
        priority: 'urgent',
        metadata: {
          tenant_id: tenant.id,
          reason
        }
      },
      routing: {
        tenant_id: tenant.id
      }
    });
  }
};

/**
 * Register all tenant event handlers
 */
export const registerTenantHandlers = (registry) => {
  registry.register(TenantEvents.NEW_SHOP_ORDER, handleNewShopOrder, { priority: 10 });
  registry.register(TenantEvents.SHOP_CREATED, handleShopCreated, { priority: 8 });
  registry.register(TenantEvents.SHOP_APPROVED, handleShopApproved, { priority: 8 });
  registry.register(TenantEvents.SHOP_SUSPENDED, handleShopSuspended, { priority: 10 });
  
  console.log('✅ Tenant event handlers registered');
};

export default {
  handleNewShopOrder,
  handleShopCreated,
  handleShopApproved,
  handleShopSuspended,
  registerTenantHandlers
};