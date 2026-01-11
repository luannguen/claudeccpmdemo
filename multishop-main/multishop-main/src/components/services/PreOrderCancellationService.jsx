/**
 * 🚫 PreOrder Cancellation Service
 * 
 * Xử lý logic hủy đơn preorder với:
 * - Cancellation Policy theo thời gian trước thu hoạch
 * - Tính toán refund theo %
 * - Tracking cancellation reason
 * - Restore lot inventory
 */

import { base44 } from '@/api/base44Client';
import NotificationService from '@/components/notifications/NotificationService';
import { createPageUrl } from '@/utils';

// ========== CANCELLATION POLICY TIERS ==========
// Có thể move vào PlatformConfig entity để admin có thể chỉnh

export const PREORDER_CANCELLATION_POLICY = {
  // Hủy trước 14+ ngày thu hoạch: Hoàn 100%
  tier_1: {
    days_before_harvest: 14,
    refund_percentage: 100,
    label: '14+ ngày trước thu hoạch',
    description: 'Hoàn 100% tiền cọc'
  },
  // Hủy 7-14 ngày trước thu hoạch: Hoàn 80%
  tier_2: {
    days_before_harvest: 7,
    refund_percentage: 80,
    label: '7-14 ngày trước thu hoạch',
    description: 'Hoàn 80% tiền cọc, giữ lại 20% phí xử lý'
  },
  // Hủy 3-7 ngày trước thu hoạch: Hoàn 50%
  tier_3: {
    days_before_harvest: 3,
    refund_percentage: 50,
    label: '3-7 ngày trước thu hoạch',
    description: 'Hoàn 50% tiền cọc'
  },
  // Hủy dưới 3 ngày trước thu hoạch: Không hoàn
  tier_4: {
    days_before_harvest: 0,
    refund_percentage: 0,
    label: 'Dưới 3 ngày trước thu hoạch',
    description: 'Không hoàn tiền cọc - Đã quá gần ngày thu hoạch'
  }
};

// ========== CANCELLATION REASONS FOR PREORDER ==========

export const PREORDER_CANCEL_REASONS = [
  { id: 'changed_mind', label: 'Tôi đổi ý, không muốn mua nữa' },
  { id: 'financial_issue', label: 'Có vấn đề tài chính' },
  { id: 'found_alternative', label: 'Tìm được nguồn cung cấp khác' },
  { id: 'harvest_date_too_late', label: 'Ngày thu hoạch quá xa' },
  { id: 'quality_concern', label: 'Lo ngại về chất lượng sản phẩm' },
  { id: 'price_concern', label: 'Giá tăng nhiều so với dự kiến' },
  { id: 'duplicate_order', label: 'Đặt trùng đơn hàng' },
  { id: 'other', label: 'Lý do khác' }
];

class PreOrderCancellationService {
  
  /**
   * 📊 Calculate refund based on policy
   */
  static calculateRefund(order, harvestDate) {
    const now = new Date();
    const harvest = new Date(harvestDate);
    const daysBeforeHarvest = Math.ceil((harvest - now) / (1000 * 60 * 60 * 24));
    
    const depositAmount = order.deposit_amount || 0;
    
    let policyTier = 'tier_4'; // Default: no refund
    let refundPercentage = 0;
    
    if (daysBeforeHarvest >= 14) {
      policyTier = 'tier_1';
      refundPercentage = PREORDER_CANCELLATION_POLICY.tier_1.refund_percentage;
    } else if (daysBeforeHarvest >= 7) {
      policyTier = 'tier_2';
      refundPercentage = PREORDER_CANCELLATION_POLICY.tier_2.refund_percentage;
    } else if (daysBeforeHarvest >= 3) {
      policyTier = 'tier_3';
      refundPercentage = PREORDER_CANCELLATION_POLICY.tier_3.refund_percentage;
    }
    
    const refundAmount = Math.round(depositAmount * refundPercentage / 100);
    const penaltyAmount = depositAmount - refundAmount;
    
    return {
      daysBeforeHarvest,
      policyTier,
      policy: PREORDER_CANCELLATION_POLICY[policyTier],
      depositAmount,
      refundPercentage,
      refundAmount,
      penaltyAmount,
      canCancel: true, // Always allow, but with penalty
      policyApplied: refundPercentage === 100 ? 'full_refund' : 
                     refundPercentage > 0 ? 'partial_refund' : 'no_refund'
    };
  }

  /**
   * ✅ Check if order can be cancelled
   */
  static canCancelOrder(order) {
    // Cannot cancel if already cancelled, delivered, or being shipped
    const nonCancellableStatuses = ['cancelled', 'delivered', 'shipping', 'returned_refunded'];
    
    if (nonCancellableStatuses.includes(order.order_status)) {
      return {
        canCancel: false,
        reason: 'Đơn hàng không thể hủy với trạng thái hiện tại'
      };
    }
    
    // For preorder: check harvest date
    if (order.has_preorder_items) {
      const harvestDate = this._getEarliestHarvestDate(order);
      if (harvestDate) {
        const now = new Date();
        const harvest = new Date(harvestDate);
        
        // If harvest date passed, cannot cancel
        if (harvest < now) {
          return {
            canCancel: false,
            reason: 'Đã qua ngày thu hoạch, không thể hủy đơn'
          };
        }
      }
    }
    
    return { canCancel: true, reason: null };
  }

  /**
   * 🚫 Process PreOrder Cancellation
   */
  static async cancelPreOrder({
    order,
    cancellationReasons,
    otherReason = '',
    refundMethod = 'original_payment'
  }) {
    console.log('🚫 Processing preorder cancellation:', order.order_number);
    
    const harvestDate = this._getEarliestHarvestDate(order);
    const refundCalc = this.calculateRefund(order, harvestDate);
    
    // 1. Create cancellation record
    const cancellation = await base44.entities.PreOrderCancellation.create({
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

    // 2. Update order status
    await base44.entities.Order.update(order.id, {
      order_status: 'cancelled',
      payment_status: refundCalc.refundAmount > 0 ? 'refund_pending' : 'cancelled',
      internal_note: `Hủy preorder. Hoàn ${refundCalc.refundPercentage}% (${refundCalc.refundAmount.toLocaleString('vi-VN')}đ). Policy: ${refundCalc.policyTier}`
    });

    // 3. Restore lot inventory
    await this._restoreLotInventory(order);

    // 4. Send notifications
    await this._sendCancellationNotifications(order, cancellation, refundCalc);

    // 5. Invalidate caches
    this._invalidateCaches();

    console.log('✅ PreOrder cancellation processed:', cancellation.id);
    
    return {
      cancellation,
      refundCalc
    };
  }

  /**
   * 💰 Process Refund for Cancellation (Admin action)
   */
  static async processRefund(cancellationId, adminEmail, transactionId) {
    const cancellation = await base44.entities.PreOrderCancellation.filter(
      { id: cancellationId }, '-created_date', 1
    ).then(res => res[0]);

    if (!cancellation) {
      throw new Error('Không tìm thấy yêu cầu hủy');
    }

    await base44.entities.PreOrderCancellation.update(cancellationId, {
      refund_status: 'completed',
      refund_date: new Date().toISOString(),
      refund_transaction_id: transactionId,
      processed_by: adminEmail,
      timeline: [
        ...(cancellation.timeline || []),
        {
          status: 'refunded',
          timestamp: new Date().toISOString(),
          actor: adminEmail,
          note: `Đã hoàn ${cancellation.refund_amount.toLocaleString('vi-VN')}đ. Mã GD: ${transactionId}`
        }
      ]
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

    this._invalidateCaches();
  }

  /**
   * 🔧 Admin Override Policy
   */
  static async adminOverrideRefund(cancellationId, adminEmail, newRefundAmount, reason) {
    const cancellation = await base44.entities.PreOrderCancellation.filter(
      { id: cancellationId }, '-created_date', 1
    ).then(res => res[0]);

    if (!cancellation) {
      throw new Error('Không tìm thấy yêu cầu hủy');
    }

    const newPercentage = Math.round((newRefundAmount / cancellation.original_deposit) * 100);
    const newPenalty = cancellation.original_deposit - newRefundAmount;

    await base44.entities.PreOrderCancellation.update(cancellationId, {
      refund_amount: newRefundAmount,
      refund_percentage: newPercentage,
      penalty_amount: newPenalty,
      admin_override: true,
      admin_override_reason: reason,
      processed_by: adminEmail,
      timeline: [
        ...(cancellation.timeline || []),
        {
          status: 'override',
          timestamp: new Date().toISOString(),
          actor: adminEmail,
          note: `Admin override: Hoàn ${newRefundAmount.toLocaleString('vi-VN')}đ (${newPercentage}%). Lý do: ${reason}`
        }
      ]
    });

    this._invalidateCaches();
  }

  // ========== PRIVATE METHODS ==========

  static _getEarliestHarvestDate(order) {
    if (!order.items) return null;
    
    const preorderItems = order.items.filter(i => i.is_preorder && i.estimated_harvest_date);
    if (preorderItems.length === 0) return null;
    
    const dates = preorderItems.map(i => new Date(i.estimated_harvest_date));
    return new Date(Math.min(...dates)).toISOString();
  }

  static async _restoreLotInventory(order) {
    for (const item of (order.items || [])) {
      if (item.is_preorder && item.lot_id) {
        try {
          const lots = await base44.entities.ProductLot.filter(
            { id: item.lot_id }, '-created_date', 1
          );
          
          if (lots[0]) {
            const lot = lots[0];
            await base44.entities.ProductLot.update(lot.id, {
              available_quantity: (lot.available_quantity || 0) + item.quantity,
              sold_quantity: Math.max(0, (lot.sold_quantity || 0) - item.quantity)
            });
            console.log(`✅ Restored ${item.quantity} to lot ${lot.lot_name}`);
          }
        } catch (error) {
          console.error('Failed to restore lot inventory:', error);
        }
      }
    }
  }

  static async _sendCancellationNotifications(order, cancellation, refundCalc) {
    // Customer notification
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

    // Admin notification
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