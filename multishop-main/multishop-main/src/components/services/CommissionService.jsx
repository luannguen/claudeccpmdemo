/**
 * CommissionService.js
 * Core service tính toán và quản lý hoa hồng từ orders của shops
 * 
 * Phase 1 - Task 1.1 of SaaS Upgrade Plan
 * Created: 2025-01-19
 */

import { base44 } from '@/api/base44Client';

// ========== CONSTANTS ==========

export const COMMISSION_STATUS = {
  PENDING: 'pending',
  CALCULATED: 'calculated',
  APPROVED: 'approved',
  PAID: 'paid',
  CANCELLED: 'cancelled'
};

export const DEFAULT_COMMISSION_RATE = 3; // 3%

// ========== CORE FUNCTIONS ==========

/**
 * Tính commission cho 1 order
 * @param {Object} order - Order object
 * @param {Object} tenant - Tenant object (shop)
 * @returns {Object} { commission_rate, commission_amount, shop_revenue }
 */
export function calculateOrderCommission(order, tenant) {
  // Ưu tiên: custom_commission_rate > commission_rate > default
  const rate = tenant?.custom_commission_rate 
    || tenant?.commission_rate 
    || DEFAULT_COMMISSION_RATE;
  
  const orderAmount = order.total_amount || 0;
  const commissionAmount = Math.round(orderAmount * (rate / 100));
  const shopRevenue = orderAmount - commissionAmount;
  
  return {
    commission_rate: rate,
    commission_amount: commissionAmount,
    shop_revenue: shopRevenue
  };
}

/**
 * Tạo Commission record mới
 * @param {Object} params - { order, tenant, calculation }
 * @returns {Promise<Object>} Commission record
 */
export async function createCommissionRecord({ order, tenant, calculation }) {
  const now = new Date();
  const periodMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  const commission = await base44.entities.Commission.create({
    order_id: order.id,
    order_number: order.order_number,
    shop_id: tenant?.id || order.shop_id,
    shop_name: tenant?.organization_name || order.shop_name,
    order_amount: order.total_amount,
    commission_rate: calculation.commission_rate,
    commission_amount: calculation.commission_amount,
    shop_revenue: calculation.shop_revenue,
    status: COMMISSION_STATUS.CALCULATED,
    calculated_date: now.toISOString(),
    period_month: periodMonth
  });
  
  return commission;
}

/**
 * Kiểm tra order đã có commission chưa
 * @param {string} orderId 
 * @returns {Promise<boolean>}
 */
export async function hasCommissionForOrder(orderId) {
  const existing = await base44.entities.Commission.filter({ order_id: orderId });
  return existing.length > 0;
}

/**
 * Lấy commission theo order ID
 * @param {string} orderId 
 * @returns {Promise<Object|null>}
 */
export async function getCommissionByOrderId(orderId) {
  const commissions = await base44.entities.Commission.filter({ order_id: orderId });
  return commissions[0] || null;
}

/**
 * Lấy danh sách commission theo shop
 * @param {string} shopId 
 * @param {string} periodMonth - Optional: filter by month (YYYY-MM)
 * @returns {Promise<Array>}
 */
export async function getCommissionsByShop(shopId, periodMonth = null) {
  const filter = { shop_id: shopId };
  if (periodMonth) {
    filter.period_month = periodMonth;
  }
  return await base44.entities.Commission.filter(filter, '-created_date', 500);
}

/**
 * Lấy tổng hợp commission theo period
 * @param {string} shopId 
 * @param {string} periodMonth 
 * @returns {Promise<Object>}
 */
export async function getCommissionSummary(shopId, periodMonth) {
  const commissions = await getCommissionsByShop(shopId, periodMonth);
  
  return {
    period: periodMonth,
    shop_id: shopId,
    total_orders: commissions.length,
    total_order_amount: commissions.reduce((sum, c) => sum + (c.order_amount || 0), 0),
    total_commission: commissions.reduce((sum, c) => sum + (c.commission_amount || 0), 0),
    total_shop_revenue: commissions.reduce((sum, c) => sum + (c.shop_revenue || 0), 0),
    pending_count: commissions.filter(c => c.status === COMMISSION_STATUS.PENDING || c.status === COMMISSION_STATUS.CALCULATED).length,
    approved_count: commissions.filter(c => c.status === COMMISSION_STATUS.APPROVED).length,
    paid_count: commissions.filter(c => c.status === COMMISSION_STATUS.PAID).length
  };
}

/**
 * Approve commission (chuyển từ calculated → approved)
 * @param {string} commissionId 
 * @param {string} approvedBy - Email admin duyệt
 * @returns {Promise<Object>}
 */
export async function approveCommission(commissionId, approvedBy) {
  return await base44.entities.Commission.update(commissionId, {
    status: COMMISSION_STATUS.APPROVED,
    approved_date: new Date().toISOString(),
    notes: `Approved by ${approvedBy}`
  });
}

/**
 * Approve nhiều commission cùng lúc
 * @param {Array<string>} commissionIds 
 * @param {string} approvedBy 
 * @returns {Promise<Array>}
 */
export async function bulkApproveCommissions(commissionIds, approvedBy) {
  const results = [];
  for (const id of commissionIds) {
    const result = await approveCommission(id, approvedBy);
    results.push(result);
  }
  return results;
}

/**
 * Mark commission as paid
 * @param {string} commissionId 
 * @param {Object} paymentInfo - { payment_method, payment_reference }
 * @returns {Promise<Object>}
 */
export async function markCommissionPaid(commissionId, paymentInfo = {}) {
  return await base44.entities.Commission.update(commissionId, {
    status: COMMISSION_STATUS.PAID,
    paid_date: new Date().toISOString(),
    payment_method: paymentInfo.payment_method,
    payment_reference: paymentInfo.payment_reference
  });
}

/**
 * Update pending commission trên tenant
 * @param {string} tenantId 
 * @param {number} amount - Số tiền thêm vào pending
 * @returns {Promise<Object>}
 */
export async function updateTenantPendingCommission(tenantId, amount) {
  const tenants = await base44.entities.Tenant.filter({ id: tenantId });
  const tenant = tenants[0];
  
  if (!tenant) return null;
  
  const newPending = (tenant.pending_commission || 0) + amount;
  
  return await base44.entities.Tenant.update(tenantId, {
    pending_commission: newPending
  });
}

/**
 * Process complete commission flow cho 1 order
 * 1. Check if commission exists
 * 2. Get tenant info
 * 3. Calculate commission
 * 4. Create commission record
 * 5. Update order with commission info
 * 6. Update tenant pending commission
 * 
 * @param {string} orderId 
 * @returns {Promise<Object>} { success, commission, error }
 */
export async function processOrderCommission(orderId) {
  try {
    // 1. Check existing
    const exists = await hasCommissionForOrder(orderId);
    if (exists) {
      return { success: false, error: 'Commission already exists for this order' };
    }
    
    // 2. Get order
    const orders = await base44.entities.Order.filter({ id: orderId });
    const order = orders[0];
    
    if (!order) {
      return { success: false, error: 'Order not found' };
    }
    
    if (!order.shop_id) {
      return { success: false, error: 'Order does not belong to any shop' };
    }
    
    // 3. Get tenant
    const tenants = await base44.entities.Tenant.filter({ id: order.shop_id });
    const tenant = tenants[0];
    
    // 4. Calculate commission
    const calculation = calculateOrderCommission(order, tenant);
    
    // 5. Create commission record
    const commission = await createCommissionRecord({
      order,
      tenant,
      calculation
    });
    
    // 6. Update order
    await base44.entities.Order.update(orderId, {
      commission_total: calculation.commission_amount,
      shop_revenue: calculation.shop_revenue,
      commission_status: 'calculated'
    });
    
    // 7. Update tenant pending commission
    if (tenant) {
      await updateTenantPendingCommission(tenant.id, calculation.commission_amount);
    }
    
    return { success: true, commission };
    
  } catch (error) {
    console.error('processOrderCommission error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get all commissions with filters
 * @param {Object} filters - { status, shop_id, period_month, date_from, date_to }
 * @param {number} limit 
 * @returns {Promise<Array>}
 */
export async function listCommissions(filters = {}, limit = 500) {
  let commissions = await base44.entities.Commission.list('-created_date', limit);
  
  // Apply filters
  if (filters.status) {
    commissions = commissions.filter(c => c.status === filters.status);
  }
  if (filters.shop_id) {
    commissions = commissions.filter(c => c.shop_id === filters.shop_id);
  }
  if (filters.period_month) {
    commissions = commissions.filter(c => c.period_month === filters.period_month);
  }
  if (filters.date_from) {
    const from = new Date(filters.date_from);
    commissions = commissions.filter(c => new Date(c.created_date) >= from);
  }
  if (filters.date_to) {
    const to = new Date(filters.date_to);
    commissions = commissions.filter(c => new Date(c.created_date) <= to);
  }
  
  return commissions;
}

/**
 * Get platform-wide commission analytics
 * @param {string} periodMonth - Optional
 * @returns {Promise<Object>}
 */
export async function getPlatformCommissionAnalytics(periodMonth = null) {
  const filter = periodMonth ? { period_month: periodMonth } : {};
  const commissions = await base44.entities.Commission.filter(filter, '-created_date', 1000);
  
  // Group by shop
  const byShop = {};
  commissions.forEach(c => {
    if (!byShop[c.shop_id]) {
      byShop[c.shop_id] = {
        shop_id: c.shop_id,
        shop_name: c.shop_name,
        total_orders: 0,
        total_revenue: 0,
        total_commission: 0,
        pending: 0,
        approved: 0,
        paid: 0
      };
    }
    byShop[c.shop_id].total_orders++;
    byShop[c.shop_id].total_revenue += c.order_amount || 0;
    byShop[c.shop_id].total_commission += c.commission_amount || 0;
    
    if (c.status === COMMISSION_STATUS.PENDING || c.status === COMMISSION_STATUS.CALCULATED) {
      byShop[c.shop_id].pending += c.commission_amount || 0;
    } else if (c.status === COMMISSION_STATUS.APPROVED) {
      byShop[c.shop_id].approved += c.commission_amount || 0;
    } else if (c.status === COMMISSION_STATUS.PAID) {
      byShop[c.shop_id].paid += c.commission_amount || 0;
    }
  });
  
  const shopsList = Object.values(byShop).sort((a, b) => b.total_commission - a.total_commission);
  
  return {
    period: periodMonth || 'all',
    total_commissions: commissions.length,
    total_revenue: commissions.reduce((sum, c) => sum + (c.order_amount || 0), 0),
    total_commission_amount: commissions.reduce((sum, c) => sum + (c.commission_amount || 0), 0),
    total_pending: commissions.filter(c => c.status === COMMISSION_STATUS.PENDING || c.status === COMMISSION_STATUS.CALCULATED).reduce((sum, c) => sum + (c.commission_amount || 0), 0),
    total_approved: commissions.filter(c => c.status === COMMISSION_STATUS.APPROVED).reduce((sum, c) => sum + (c.commission_amount || 0), 0),
    total_paid: commissions.filter(c => c.status === COMMISSION_STATUS.PAID).reduce((sum, c) => sum + (c.commission_amount || 0), 0),
    shops_count: shopsList.length,
    by_shop: shopsList
  };
}

// ========== EXPORTS ==========

export const CommissionService = {
  COMMISSION_STATUS,
  DEFAULT_COMMISSION_RATE,
  calculateOrderCommission,
  createCommissionRecord,
  hasCommissionForOrder,
  getCommissionByOrderId,
  getCommissionsByShop,
  getCommissionSummary,
  approveCommission,
  bulkApproveCommissions,
  markCommissionPaid,
  updateTenantPendingCommission,
  processOrderCommission,
  listCommissions,
  getPlatformCommissionAnalytics
};

export default CommissionService;