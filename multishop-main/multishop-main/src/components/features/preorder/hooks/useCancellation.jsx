/**
 * useCancellation - Hook for preorder cancellation
 * 
 * Feature Logic Layer
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { cancellationRepository, lotRepository, walletRepository } from '../data';
import { 
  calculateRefund, 
  canCancelOrder, 
  getEarliestHarvestDate,
  CANCELLATION_POLICY,
  CANCEL_REASONS
} from '../domain';
import NotificationService from '@/components/notifications/NotificationService';
import { createPageUrl } from '@/utils';

/**
 * Hook to check if order can be cancelled
 */
export function useCanCancelOrder(order) {
  const harvestDate = getEarliestHarvestDate(order);
  return canCancelOrder(order, harvestDate);
}

/**
 * Hook to calculate refund for an order
 */
export function useRefundCalculation(order) {
  const harvestDate = getEarliestHarvestDate(order);
  const depositAmount = order?.deposit_amount || 0;
  
  if (!order || !harvestDate || !depositAmount) {
    return null;
  }
  
  return calculateRefund(depositAmount, harvestDate);
}

/**
 * Hook for cancellation mutation
 */
export function useCancelPreOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ order, cancellationReasons, otherReason, refundMethod }) => {
      const harvestDate = getEarliestHarvestDate(order);
      const refundCalc = calculateRefund(order.deposit_amount || 0, harvestDate);
      
      // 1. Create cancellation record
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
        refund_method: refundMethod || 'original_payment',
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

      // 2. Update order status
      await base44.entities.Order.update(order.id, {
        order_status: 'cancelled',
        payment_status: refundCalc.refundAmount > 0 ? 'refund_pending' : 'cancelled',
        internal_note: `Hủy preorder. Hoàn ${refundCalc.refundPercentage}% (${refundCalc.refundAmount.toLocaleString('vi-VN')}đ). Policy: ${refundCalc.policyTier}`
      });

      // 3. Restore lot inventory
      for (const item of (order.items || [])) {
        if (item.is_preorder && item.lot_id) {
          await lotRepository.restoreLotInventory(item.lot_id, item.quantity);
        }
      }

      // 4. Send notifications
      const refundMessage = refundCalc.refundAmount > 0 
        ? `Bạn sẽ được hoàn ${refundCalc.refundAmount.toLocaleString('vi-VN')}đ (${refundCalc.refundPercentage}%).`
        : 'Theo chính sách, tiền cọc không được hoàn lại do đã quá gần ngày thu hoạch.';

      await NotificationService.createUserNotification({
        recipientEmail: order.customer_email,
        type: 'order_cancelled',
        title: '🚫 Đơn Pre-Order Đã Hủy',
        message: `Đơn #${order.order_number} đã được hủy. ${refundMessage}`,
        link: createPageUrl('MyOrders'),
        priority: 'high'
      });

      await NotificationService.createAdminNotification({
        type: 'order_status_change',
        title: `🚫 Hủy Pre-Order #${order.order_number}`,
        message: `${order.customer_name} hủy đơn. Hoàn ${refundCalc.refundPercentage}% = ${refundCalc.refundAmount.toLocaleString('vi-VN')}đ`,
        link: createPageUrl('AdminOrders'),
        priority: refundCalc.refundAmount > 0 ? 'high' : 'normal',
        requiresAction: refundCalc.refundAmount > 0
      });

      return { cancellation, refundCalc };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-orders-list'] });
      queryClient.invalidateQueries({ queryKey: ['admin-all-orders'] });
      queryClient.invalidateQueries({ queryKey: ['public-product-lots'] });
      queryClient.invalidateQueries({ queryKey: ['preorder-cancellations'] });
    }
  });
}

/**
 * Hook for admin to process refund
 */
export function useProcessRefund() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ cancellationId, adminEmail, transactionId }) => {
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

      // Update order payment status
      await base44.entities.Order.update(cancellation.order_id, {
        payment_status: 'refunded'
      });

      // Notify customer
      await NotificationService.createUserNotification({
        recipientEmail: cancellation.customer_email,
        type: 'payment_success',
        title: '💰 Hoàn Tiền Thành Công',
        message: `Đã hoàn ${cancellation.refund_amount.toLocaleString('vi-VN')}đ cho đơn #${cancellation.order_number}`,
        link: createPageUrl('MyOrders'),
        priority: 'high'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['preorder-cancellations'] });
      queryClient.invalidateQueries({ queryKey: ['admin-all-orders'] });
    }
  });
}

/**
 * Hook for pending refund cancellations
 */
export function usePendingRefundCancellations() {
  return useQuery({
    queryKey: ['preorder-cancellations', 'pending'],
    queryFn: () => cancellationRepository.getPendingRefundCancellations()
  });
}

/**
 * Hook for all cancellations (admin)
 */
export function useCancellationsList() {
  return useQuery({
    queryKey: ['preorder-cancellations'],
    queryFn: () => cancellationRepository.listCancellations()
  });
}

// Export constants for UI
export { CANCELLATION_POLICY, CANCEL_REASONS };