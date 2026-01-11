/**
 * CommissionService Adapter
 * 
 * Backward compatibility adapter for legacy code.
 * Re-exports from features/saas module.
 * 
 * @deprecated Use @/components/features/saas instead
 */

export {
  COMMISSION_STATUS,
  DEFAULT_COMMISSION_RATE
} from '@/components/features/saas';

export {
  calculateCommission,
  calculateOrderCommission,
  getEffectiveCommissionRate,
  calculateTotalCommission,
  calculateCommissionByStatus,
  groupCommissionsByShop,
  canApproveCommission,
  canMarkCommissionPaid
} from '@/components/features/saas/domain/commissionCalculator';

export {
  commissionRepository
} from '@/components/features/saas/data';

// Legacy function signatures
export async function createCommissionRecord(params) {
  const { commissionRepository } = await import('@/components/features/saas/data');
  const { order, tenant, calculation } = params;
  
  const now = new Date();
  const periodMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  return await commissionRepository.createCommission({
    order_id: order.id,
    order_number: order.order_number,
    shop_id: tenant?.id || order.shop_id,
    shop_name: tenant?.organization_name || order.shop_name,
    order_amount: order.total_amount,
    commission_rate: calculation.commission_rate,
    commission_amount: calculation.commission_amount,
    shop_revenue: calculation.shop_revenue,
    status: 'calculated',
    calculated_date: now.toISOString(),
    period_month: periodMonth
  });
}

export async function hasCommissionForOrder(orderId) {
  const { commissionRepository } = await import('@/components/features/saas/data');
  return await commissionRepository.hasCommissionForOrder(orderId);
}

export async function getCommissionByOrderId(orderId) {
  const { commissionRepository } = await import('@/components/features/saas/data');
  return await commissionRepository.getCommissionByOrderId(orderId);
}

export async function getCommissionsByShop(shopId, periodMonth) {
  const { commissionRepository } = await import('@/components/features/saas/data');
  return await commissionRepository.getCommissionsByShop(shopId, periodMonth);
}

export async function getCommissionSummary(shopId, periodMonth) {
  const { commissionRepository } = await import('@/components/features/saas/data');
  const { calculateCommissionByStatus } = await import('@/components/features/saas/domain/commissionCalculator');
  
  const commissions = await commissionRepository.getCommissionsByShop(shopId, periodMonth);
  const statusBreakdown = calculateCommissionByStatus(commissions);
  
  return {
    period: periodMonth,
    shop_id: shopId,
    total_orders: commissions.length,
    total_order_amount: commissions.reduce((sum, c) => sum + (c.order_amount || 0), 0),
    total_commission: statusBreakdown.total,
    total_shop_revenue: commissions.reduce((sum, c) => sum + (c.shop_revenue || 0), 0),
    pending_count: commissions.filter(c => c.status === 'pending' || c.status === 'calculated').length,
    approved_count: commissions.filter(c => c.status === 'approved').length,
    paid_count: commissions.filter(c => c.status === 'paid').length
  };
}

export async function approveCommission(commissionId, approvedBy) {
  const { commissionRepository } = await import('@/components/features/saas/data');
  return await commissionRepository.approveCommission(commissionId, approvedBy);
}

export async function bulkApproveCommissions(commissionIds, approvedBy) {
  const { commissionRepository } = await import('@/components/features/saas/data');
  return await commissionRepository.bulkApproveCommissions(commissionIds, approvedBy);
}

export async function markCommissionPaid(commissionId, paymentInfo) {
  const { commissionRepository } = await import('@/components/features/saas/data');
  return await commissionRepository.markCommissionPaid(commissionId, paymentInfo);
}

export async function updateTenantPendingCommission(tenantId, amount) {
  const { tenantRepository } = await import('@/components/features/saas/data');
  return await tenantRepository.updatePendingCommission(tenantId, amount);
}

export async function processOrderCommission(orderId) {
  const { base44 } = await import('@/api/base44Client');
  const response = await base44.functions.invoke('calculateOrderCommission', { order_id: orderId });
  return response.data;
}

export async function listCommissions(filters, limit) {
  const { commissionRepository } = await import('@/components/features/saas/data');
  return await commissionRepository.listCommissions(filters, limit);
}

export async function getPlatformCommissionAnalytics(periodMonth) {
  const { commissionRepository } = await import('@/components/features/saas/data');
  const { groupCommissionsByShop, calculateCommissionByStatus } = 
    await import('@/components/features/saas/domain/commissionCalculator');
  
  const filter = periodMonth ? { period_month: periodMonth } : {};
  const commissions = await commissionRepository.listCommissions(filter, 1000);
  
  const byShop = groupCommissionsByShop(commissions);
  const shopsList = Object.values(byShop).sort((a, b) => b.total_commission - a.total_commission);
  const statusBreakdown = calculateCommissionByStatus(commissions);
  
  return {
    period: periodMonth || 'all',
    total_commissions: commissions.length,
    total_revenue: commissions.reduce((sum, c) => sum + (c.order_amount || 0), 0),
    total_commission_amount: statusBreakdown.total,
    total_pending: statusBreakdown.pending,
    total_approved: statusBreakdown.approved,
    total_paid: statusBreakdown.paid,
    shops_count: shopsList.length,
    by_shop: shopsList
  };
}

// Legacy default export
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