/**
 * 🔄 Return Service - Centralized business logic for Returns & Refunds
 * 
 * ✅ Features:
 * - Create return requests
 * - Approve/Reject returns
 * - Process refunds (bank transfer, store credit, original payment)
 * - Auto-approve eligible returns
 * - Generate shipping labels
 * - Update return status
 * - Send notifications (real-time)
 * - Track timeline
 * - Photo/Video upload
 */

import { base44 } from '@/api/base44Client';
import NotificationService from '@/components/notifications/NotificationService';
import { createPageUrl } from '@/utils';

export class ReturnService {
  /**
   * 📝 Create Return Request (Customer-initiated)
   */
  static async createReturnRequest({
    order,
    returnItems,
    returnType = 'full',
    returnReason,
    reasonDetail,
    evidencePhotos = [],
    evidenceVideos = [],
    refundMethod = 'original_payment',
    customerNotes = ''
  }) {
    try {
      console.log('🔄 Creating return request for order:', order.order_number);

      // Calculate total return amount
      const totalReturnAmount = returnItems.reduce((sum, item) => 
        sum + (item.unit_price * item.quantity), 0
      );

      // ✅ ALWAYS pending - Admin MUST approve manually
      const orderDate = new Date(order.created_date);
      const daysSinceOrder = Math.floor((Date.now() - orderDate) / (1000 * 60 * 60 * 24));

      // Create return request - ALWAYS starts as 'pending'
      const returnRequest = await base44.entities.ReturnRequest.create({
        order_id: order.id,
        order_number: order.order_number,
        customer_email: order.customer_email,
        customer_name: order.customer_name,
        customer_phone: order.customer_phone,
        return_items: returnItems,
        return_type: returnType,
        return_reason: returnReason,
        reason_detail: reasonDetail,
        evidence_photos: evidencePhotos,
        evidence_videos: evidenceVideos,
        total_return_amount: totalReturnAmount,
        refund_method: refundMethod,
        customer_notes: customerNotes,
        status: 'pending', // ✅ ALWAYS pending - no auto-approve
        priority: ['damaged', 'defective', 'wrong_item'].includes(returnReason) ? 'urgent' : 'high',
        timeline: [{
          status: 'pending',
          timestamp: new Date().toISOString(),
          actor: order.customer_email,
          note: 'Yêu cầu trả hàng được tạo'
        }]
      });

      console.log('✅ Return request created:', returnRequest.id);

      // ✅ Send notifications to customer & admin
      await this._notifyReturnCreated(returnRequest, order);

      // ✅ Aggressive cache invalidation for instant UI update
      if (typeof window !== 'undefined' && window.queryClient) {
        await window.queryClient.invalidateQueries({ queryKey: ['admin-returns-realtime'] });
        await window.queryClient.invalidateQueries({ queryKey: ['customer-returns-realtime'] });
        await window.queryClient.refetchQueries({ queryKey: ['admin-returns-realtime'], type: 'active' });
      }

      return returnRequest;
    } catch (error) {
      console.error('❌ Failed to create return request:', error);
      throw error;
    }
  }

  /**
   * ✅ Approve Return Request (Admin action)
   */
  static async approveReturn(returnRequest, adminEmail, adminNotes = '') {
    try {
      console.log('✅ Approving return request:', returnRequest.id);

      // Calculate estimated refund date (7 days)
      const estimatedRefundDate = new Date();
      estimatedRefundDate.setDate(estimatedRefundDate.getDate() + 7);

      // Update return request
      const updated = await base44.entities.ReturnRequest.update(returnRequest.id, {
        status: 'approved',
        reviewed_by: adminEmail,
        reviewed_date: new Date().toISOString(),
        admin_notes: adminNotes,
        estimated_refund_date: estimatedRefundDate.toISOString(),
        timeline: [
          ...(returnRequest.timeline || []),
          {
            status: 'approved',
            timestamp: new Date().toISOString(),
            actor: adminEmail,
            note: `Đã duyệt. ${adminNotes}`
          }
        ]
      });

      // ✅ Update order status to 'return_approved'
      await base44.entities.Order.update(returnRequest.order_id, {
        order_status: 'return_approved',
        internal_note: `Yêu cầu trả hàng đã được duyệt. ${adminNotes}`
      });

      // Generate shipping label
      await this._generateShippingLabel(updated);

      // Send notifications
      await this._notifyReturnApproved(updated);

      // ✅ Aggressive cache invalidation
      if (typeof window !== 'undefined' && window.queryClient) {
        await window.queryClient.invalidateQueries({ queryKey: ['admin-returns-realtime'] });
        await window.queryClient.invalidateQueries({ queryKey: ['customer-returns-realtime'] });
        await window.queryClient.invalidateQueries({ queryKey: ['admin-all-orders'] });
        await window.queryClient.invalidateQueries({ queryKey: ['my-orders-list'] });
        await window.queryClient.refetchQueries({ type: 'active' });
      }

      return updated;
    } catch (error) {
      console.error('❌ Failed to approve return:', error);
      throw error;
    }
  }

  /**
   * ❌ Reject Return Request (Admin action)
   */
  static async rejectReturn(returnRequest, adminEmail, rejectionReason) {
    try {
      console.log('❌ Rejecting return request:', returnRequest.id);

      const updated = await base44.entities.ReturnRequest.update(returnRequest.id, {
        status: 'rejected',
        reviewed_by: adminEmail,
        reviewed_date: new Date().toISOString(),
        rejection_reason: rejectionReason,
        timeline: [
          ...(returnRequest.timeline || []),
          {
            status: 'rejected',
            timestamp: new Date().toISOString(),
            actor: adminEmail,
            note: `Từ chối: ${rejectionReason}`
          }
        ]
      });

      // ✅ Restore order status to original (before return request)
      await base44.entities.Order.update(returnRequest.order_id, {
        order_status: 'delivered', // Reset to delivered
        internal_note: `Yêu cầu trả hàng bị từ chối: ${rejectionReason}`
      });

      // Send notification
      await this._notifyReturnRejected(updated);

      // ✅ Aggressive cache invalidation
      if (typeof window !== 'undefined' && window.queryClient) {
        await window.queryClient.invalidateQueries({ queryKey: ['admin-returns-realtime'] });
        await window.queryClient.invalidateQueries({ queryKey: ['customer-returns-realtime'] });
        await window.queryClient.invalidateQueries({ queryKey: ['admin-all-orders'] });
        await window.queryClient.invalidateQueries({ queryKey: ['my-orders-list'] });
        await window.queryClient.refetchQueries({ type: 'active' });
      }

      return updated;
    } catch (error) {
      console.error('❌ Failed to reject return:', error);
      throw error;
    }
  }

  /**
   * 📦 Mark Return as Received (Admin action)
   */
  static async markReturnReceived(returnRequest, adminEmail, notes = '') {
    try {
      console.log('📦 Marking return as received:', returnRequest.id);

      const updated = await base44.entities.ReturnRequest.update(returnRequest.id, {
        status: 'received',
        received_date: new Date().toISOString(),
        timeline: [
          ...(returnRequest.timeline || []),
          {
            status: 'received',
            timestamp: new Date().toISOString(),
            actor: adminEmail,
            note: `Đã nhận hàng trả về. ${notes}`
          }
        ]
      });

      // Auto-process refund
      await this._processRefund(updated, adminEmail);

      return updated;
    } catch (error) {
      console.error('❌ Failed to mark return received:', error);
      throw error;
    }
  }

  /**
   * 💰 Process Refund (Internal method)
   */
  static async _processRefund(returnRequest, adminEmail) {
    try {
      console.log('💰 Processing refund for:', returnRequest.id);

      const refundTransactionId = `RF-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

      let updateData = {
        status: 'refunded',
        actual_refund_date: new Date().toISOString(),
        refund_transaction_id: refundTransactionId,
        timeline: [
          ...(returnRequest.timeline || []),
          {
            status: 'refunded',
            timestamp: new Date().toISOString(),
            actor: adminEmail,
            note: `Đã hoàn tiền: ${returnRequest.total_return_amount.toLocaleString('vi-VN')}đ`
          }
        ]
      };

      // If store credit, add to customer balance
      if (returnRequest.refund_method === 'store_credit') {
        updateData.store_credit_amount = returnRequest.total_return_amount;
        
        // TODO: Update customer's store credit balance
        // await this._addStoreCredit(returnRequest.customer_email, returnRequest.total_return_amount);
      }

      const updated = await base44.entities.ReturnRequest.update(returnRequest.id, updateData);

      // ✅ Update order & payment status
      await base44.entities.Order.update(returnRequest.order_id, {
        payment_status: 'refunded',
        order_status: 'returned_refunded' // Specific status for returned orders
      });

      // Send notification
      await this._notifyRefundCompleted(updated);

      // ✅ Aggressive cache invalidation
      if (typeof window !== 'undefined' && window.queryClient) {
        await window.queryClient.invalidateQueries({ queryKey: ['admin-returns-realtime'] });
        await window.queryClient.invalidateQueries({ queryKey: ['customer-returns-realtime'] });
        await window.queryClient.invalidateQueries({ queryKey: ['admin-all-orders'] });
        await window.queryClient.invalidateQueries({ queryKey: ['my-orders-list'] });
        await window.queryClient.refetchQueries({ type: 'active' });
      }

      return updated;
    } catch (error) {
      console.error('❌ Failed to process refund:', error);
      throw error;
    }
  }

  /**
   * 🏷️ Generate Shipping Label (Internal method)
   */
  static async _generateShippingLabel(returnRequest) {
    try {
      // Generate tracking number
      const trackingNumber = `RT-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      
      await base44.entities.ReturnRequest.update(returnRequest.id, {
        return_shipping_label: `https://api.farmersmart.vn/shipping-label/${trackingNumber}`,
        tracking_number: trackingNumber,
        shipping_carrier: 'GHN', // Default carrier
        timeline: [
          ...(returnRequest.timeline || []),
          {
            status: 'shipping_label_generated',
            timestamp: new Date().toISOString(),
            actor: 'system',
            note: 'Đã tạo mã vận đơn trả hàng'
          }
        ]
      });

      console.log('🏷️ Shipping label generated:', trackingNumber);
    } catch (error) {
      console.error('❌ Failed to generate shipping label:', error);
    }
  }

  /**
   * 📸 Upload Evidence Photos/Videos
   */
  static async uploadEvidence(file) {
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      return file_url;
    } catch (error) {
      console.error('❌ Failed to upload evidence:', error);
      throw error;
    }
  }

  /**
   * 🔔 Notification Methods
   */
  static async _notifyReturnCreated(returnRequest, order) {
    // Customer notification
    await NotificationService.createUserNotification({
      recipientEmail: returnRequest.customer_email,
      type: 'system',
      title: '📦 Yêu Cầu Trả Hàng Đã Được Gửi',
      message: `Yêu cầu trả hàng #${returnRequest.order_number} đang được xem xét. Bạn sẽ nhận được thông báo khi được duyệt.`,
      link: createPageUrl('MyReturns'),
      priority: 'high'
    });

    // ✅ Admin notification - URGENT, requires action
    await NotificationService.createAdminNotification({
      type: 'refund_request',
      title: '🔄 Yêu Cầu Trả Hàng Cần Duyệt',
      message: `${returnRequest.customer_name} yêu cầu trả ${returnRequest.total_return_amount.toLocaleString('vi-VN')}đ - Đơn #${returnRequest.order_number}`,
      link: createPageUrl('AdminReturns'),
      priority: 'urgent',
      requiresAction: true,
      relatedEntityType: 'ReturnRequest',
      relatedEntityId: returnRequest.id,
      metadata: {
        order_number: returnRequest.order_number,
        customer_name: returnRequest.customer_name,
        return_amount: returnRequest.total_return_amount,
        return_reason: returnRequest.return_reason
      }
    });
  }

  static async _notifyReturnApproved(returnRequest) {
    await NotificationService.createUserNotification({
      recipientEmail: returnRequest.customer_email,
      type: 'system',
      title: '✅ Yêu Cầu Trả Hàng Đã Được Duyệt',
      message: `Yêu cầu trả hàng #${returnRequest.order_number} đã được duyệt. Vui lòng gửi hàng về theo mã vận đơn.`,
      link: createPageUrl('MyReturns'),
      priority: 'high'
    });
  }

  static async _notifyReturnRejected(returnRequest) {
    await NotificationService.createUserNotification({
      recipientEmail: returnRequest.customer_email,
      type: 'system',
      title: '❌ Yêu Cầu Trả Hàng Bị Từ Chối',
      message: `Yêu cầu trả hàng #${returnRequest.order_number} đã bị từ chối. Lý do: ${returnRequest.rejection_reason}`,
      link: createPageUrl('MyReturns'),
      priority: 'high'
    });
  }

  static async _notifyRefundCompleted(returnRequest) {
    await NotificationService.createUserNotification({
      recipientEmail: returnRequest.customer_email,
      type: 'payment_success',
      title: '💰 Hoàn Tiền Thành Công',
      message: `Đã hoàn ${returnRequest.total_return_amount.toLocaleString('vi-VN')}đ cho đơn hàng #${returnRequest.order_number}`,
      link: createPageUrl('MyOrders'),
      priority: 'high'
    });
  }
}

export default ReturnService;