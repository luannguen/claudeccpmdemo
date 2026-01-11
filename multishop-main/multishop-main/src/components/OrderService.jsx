/**
 * 📦 Order Service - Centralized order management with auto-notifications
 */

import { base44 } from '@/api/base44Client';
// ✅ MIGRATED: Using features/notification module (v2.1)
import { NotificationServiceFacade } from '@/components/features/notification';
import orderReferralBridge from '@/components/services/orderReferralBridge';

class OrderService {
  /**
   * Update order status with automatic notifications
   */
  static async updateOrderStatus(order, newStatus, internalNote = '') {
    try {
      console.log(`🔄 Updating order ${order.order_number} from ${order.order_status} to ${newStatus}`);
      
      const updates = {
        order_status: newStatus,
        ...(internalNote && { internal_note: internalNote })
      };

      // ✅ Update order
      const updated = await base44.entities.Order.update(order.id, updates);

      // 🔥 NEW: Auto reverse commission khi return/refund
      if (newStatus === 'returned_refunded' && order.referral_commission_calculated) {
        await orderReferralBridge.handleOrderReturnRefund(order.id, 'order_returned');
        console.log('✅ Commission reversed for returned order');
      }

      // ✅ Send notifications for status change (MIGRATED v2.1)
      await NotificationServiceFacade.orderStatusChanged(updated, order.order_status, newStatus);

      // ✅ Aggressive cache invalidation
      if (typeof window !== 'undefined' && window.queryClient) {
        await window.queryClient.invalidateQueries({ queryKey: ['admin-all-orders'] });
        await window.queryClient.invalidateQueries({ queryKey: ['my-orders-list'] });
        await window.queryClient.invalidateQueries({ queryKey: ['admin-notifications-realtime'] });
        await window.queryClient.invalidateQueries({ queryKey: ['user-notifications-realtime'] });
        await window.queryClient.refetchQueries({ type: 'active' });
      }

      console.log('✅ Order updated & notifications sent');
      return updated;
    } catch (error) {
      console.error('❌ Order update failed:', error);
      throw error;
    }
  }

  /**
   * Bulk update order statuses
   */
  static async bulkUpdateStatus(orders, newStatus, internalNote = '') {
    console.log(`🔄 Bulk updating ${orders.length} orders to ${newStatus}`);
    
    const results = await Promise.allSettled(
      orders.map(order => this.updateOrderStatus(order, newStatus, internalNote))
    );

    const succeeded = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    console.log(`✅ Bulk update complete: ${succeeded} success, ${failed} failed`);
    
    return { succeeded, failed };
  }
}

export default OrderService;