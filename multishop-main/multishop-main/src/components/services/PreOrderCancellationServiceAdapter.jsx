/**
 * PreOrderCancellationService - Legacy Adapter
 * 
 * ⚠️ DEPRECATED: Sử dụng @/components/features/preorder thay thế
 * 
 * @deprecated Use @/components/features/preorder instead
 * 
 * Migration:
 * ```javascript
 * // ❌ OLD
 * import PreOrderCancellationService from '@/components/services/PreOrderCancellationService';
 * 
 * // ✅ NEW
 * import { 
 *   useCancelPreOrder, 
 *   CANCELLATION_POLICY,
 *   calculateRefund 
 * } from '@/components/features/preorder';
 * ```
 */

import { base44 } from '@/api/base44Client';
import NotificationService from '@/components/notifications/NotificationService';
import { createPageUrl } from '@/utils';
import {
  CANCELLATION_POLICY,
  CANCEL_REASONS,
  calculateRefund,
  canCancelOrder,
  getEarliestHarvestDate
} from '@/components/features/preorder';
import { 
  cancellationRepository,
  lotRepository
} from '@/components/features/preorder/data';

// Re-export constants
export const PREORDER_CANCELLATION_POLICY = CANCELLATION_POLICY;
export const PREORDER_CANCEL_REASONS = CANCEL_REASONS;

// Legacy service class
class PreOrderCancellationService {
  
  static calculateRefund(order, harvestDate) {
    const depositAmount = order.deposit_amount || 0;
    return calculateRefund(depositAmount, harvestDate);
  }

  static canCancelOrder(order) {
    const harvestDate = getEarliestHarvestDate(order);
    return canCancelOrder(order, harvestDate);
  }

  static async cancelPreOrder({
    order,
    cancellationReasons,
    otherReason = '',
    refundMethod = 'original_payment'
  }) {
    const harvestDate = getEarliestHarvestDate(order);
    const refundCalc = calculateRefund(order.deposit_amount || 0, harvestDate);
    
    const cancellation = await cancellationRepository.createCancellation({
      order_id: order.id,
      order_number: order.order_number,
      customer_email: order.customer_email,
      customer_name: order.customer_name,
      customer_phone: order.customer_phone,
      lot_id: order.items?.find(i => i.lot_id)?.lot_id,
      lot_name: order.items?.find(i => i.lot_id)?.product_name,
      product_name: order.items?.[0]?.product_name,
      order_date: order.created_date,
      estimated_harvest_date: harvestDate,
      cancellation_date: new Date().toISOString(),
      days_before_harvest: refundCalc.daysBeforeHarvest,
      cancellation_reasons: cancellationReasons,
      other_reason: otherReason,
      original_deposit: refundCalc.depositAmount,
      refund_percentage: refundCalc.refundPercentage,
      refund_amount: refundCalc.refundAmount,
      penalty_amount: refundCalc.penaltyAmount,
      refund_method: refundMethod,
      refund_status: refundCalc.refundAmount > 0 ? 'pending' : 'completed',
      policy_applied: refundCalc.policyApplied,
      policy_tier: refundCalc.policyTier,
      timeline: [{
        status: 'cancelled',
        timestamp: new Date().toISOString(),
        actor: order.customer_email,
        note: `Khách hủy đơn. Lý do: ${cancellationReasons.join(', ')}${otherReason ? ` - ${otherReason}` : ''}`
      }]
    });

    await base44.entities.Order.update(order.id, {
      order_status: 'cancelled',
      payment_status: refundCalc.refundAmount > 0 ? 'refund_pending' : 'cancelled',
      internal_note: `Hủy preorder. Hoàn ${refundCalc.refundPercentage}% (${refundCalc.refundAmount.toLocaleString('vi-VN')}đ). Policy: ${refundCalc.policyTier}`
    });

    for (const item of (order.items || [])) {
      if (item.is_preorder && item.lot_id) {
        await lotRepository.restoreLotInventory(item.lot_id, item.quantity);
      }
    }

    await this._sendCancellationNotifications(order, cancellation, refundCalc);
    this._invalidateCaches();

    return { cancellation, refundCalc };
  }

  static async processRefund(cancellationId, adminEmail, transactionId) {
    const cancellation = await cancellationRepository.getCancellationById(cancellationId);
    if (!cancellation) throw new Error('Không tìm thấy yêu cầu hủy');

    await cancellationRepository.updateCancellation(cancellationId, {
      refund_status: 'completed',
      refund_date: new Date().toISOString(),
      refund_transaction_id: transactionId,
      processed_by: adminEmail
    });

    await cancellationRepository.addCancellationTimeline(cancellationId, {
      status: 'refunded',
      actor: adminEmail,
      note: `Đã hoàn ${cancellation.refund_amount.toLocaleString('vi-VN')}đ. Mã GD: ${transactionId}`
    });

    await base44.entities.Order.update(cancellation.order_id, {
      payment_status: 'refunded'
    });

    await NotificationService.createUserNotification({
      recipientEmail: cancellation.customer_email,
      type: 'payment_success',
      title: '💰 Hoàn Tiền Thành Công',
      message: `Đã hoàn ${cancellation.refund_amount.toLocaleString('vi-VN')}đ cho đơn #${cancellation.order_number}`,
      link: createPageUrl('MyOrders'),
      priority: 'high'
    });

    this._invalidateCaches();
  }

  static async adminOverrideRefund(cancellationId, adminEmail, newRefundAmount, reason) {
    const cancellation = await cancellationRepository.getCancellationById(cancellationId);
    if (!cancellation) throw new Error('Không tìm thấy yêu cầu hủy');

    const newPercentage = Math.round((newRefundAmount / cancellation.original_deposit) * 100);
    const newPenalty = cancellation.original_deposit - newRefundAmount;

    await cancellationRepository.updateCancellation(cancellationId, {
      refund_amount: newRefundAmount,
      refund_percentage: newPercentage,
      penalty_amount: newPenalty,
      admin_override: true,
      admin_override_reason: reason,
      processed_by: adminEmail
    });

    await cancellationRepository.addCancellationTimeline(cancellationId, {
      status: 'override',
      actor: adminEmail,
      note: `Admin override: Hoàn ${newRefundAmount.toLocaleString('vi-VN')}đ (${newPercentage}%). Lý do: ${reason}`
    });

    this._invalidateCaches();
  }

  static _getEarliestHarvestDate(order) {
    return getEarliestHarvestDate(order);
  }

  static async _sendCancellationNotifications(order, cancellation, refundCalc) {
    const refundMessage = refundCalc.refundAmount > 0 
      ? `Bạn sẽ được hoàn ${refundCalc.refundAmount.toLocaleString('vi-VN')}đ (${refundCalc.refundPercentage}%).`
      : 'Theo chính sách, tiền cọc không được hoàn lại do đã quá gần ngày thu hoạch.';

    await NotificationService.createUserNotification({
      recipientEmail: order.customer_email,
      type: 'order_cancelled',
      title: '🚫 Đơn Pre-Order Đã Hủy',
      message: `Đơn #${order.order_number} đã được hủy. ${refundMessage}`,
      link: createPageUrl('MyOrders'),
      priority: 'high',
      metadata: {
        order_id: order.id,
        refund_amount: refundCalc.refundAmount,
        refund_percentage: refundCalc.refundPercentage
      }
    });

    await NotificationService.createAdminNotification({
      type: 'order_status_change',
      title: `🚫 Hủy Pre-Order #${order.order_number}`,
      message: `${order.customer_name} hủy đơn. Hoàn ${refundCalc.refundPercentage}% = ${refundCalc.refundAmount.toLocaleString('vi-VN')}đ`,
      link: createPageUrl('AdminOrders'),
      priority: refundCalc.refundAmount > 0 ? 'high' : 'normal',
      requiresAction: refundCalc.refundAmount > 0,
      relatedEntityType: 'Order',
      relatedEntityId: order.id,
      metadata: {
        order_number: order.order_number,
        customer_name: order.customer_name,
        refund_amount: refundCalc.refundAmount,
        policy_tier: refundCalc.policyTier
      }
    });
  }

  static _invalidateCaches() {
    if (typeof window !== 'undefined' && window.queryClient) {
      window.queryClient.invalidateQueries({ queryKey: ['my-orders-list'] });
      window.queryClient.invalidateQueries({ queryKey: ['admin-all-orders'] });
      window.queryClient.invalidateQueries({ queryKey: ['public-product-lots'] });
      window.queryClient.invalidateQueries({ queryKey: ['admin-product-lots'] });
      window.queryClient.invalidateQueries({ queryKey: ['preorder-cancellations'] });
    }
  }
}

export default PreOrderCancellationService;