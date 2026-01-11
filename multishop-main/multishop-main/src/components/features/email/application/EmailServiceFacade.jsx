/**
 * 📧 Email Service Facade - Main Public API
 * 
 * Unified facade for all email operations.
 * This is the PRIMARY entry point for other modules.
 * 
 * Tuân thủ: Section 19.2 - Public Surface (Contract)
 */

import { sendTransactionalEmail } from './use-cases/sendTransactionalEmail';
import { sendMarketingEmail } from './use-cases/sendMarketingEmail';
import { previewTemplate, getSampleData } from './use-cases/previewTemplate';
import { emailTemplateRepository, emailLogRepository } from '../infrastructure';
import { base44EmailProvider } from '../infrastructure/providers/Base44EmailProvider';

/**
 * Email Service Facade
 * 
 * Public API for email operations.
 * Other modules should ONLY use this facade.
 */
export class EmailServiceFacade {
  // =====================================
  // ORDER EMAILS
  // =====================================

  /**
   * Send order confirmation email
   */
  static async sendOrderConfirmation(order) {
    const orderNumber = order.order_number || order.id?.slice(-8);
    
    return sendTransactionalEmail({
      type: 'order_confirmation',
      recipientEmail: order.customer_email,
      recipientName: order.customer_name,
      data: {
        order_number: orderNumber,
        customer_name: order.customer_name,
        customer_email: order.customer_email,
        customer_phone: order.customer_phone,
        total_amount: (order.total_amount || 0).toLocaleString('vi-VN'),
        shipping_address: order.shipping_address,
        order_date: new Date(order.created_date).toLocaleDateString('vi-VN'),
        payment_method: order.payment_method,
        items: order.items,
        subtotal: (order.subtotal || 0).toLocaleString('vi-VN'),
        shipping_fee: order.shipping_fee,
        discount_amount: order.discount_amount,
        order_id: order.id
      },
      logData: {
        order_id: order.id,
        order_number: orderNumber,
        subject: `✅ Xác nhận đơn hàng #${orderNumber}`
      }
    });
  }

  /**
   * Send shipping notification email
   */
  static async sendShippingNotification(order) {
    const orderNumber = order.order_number || order.id?.slice(-8);
    
    return sendTransactionalEmail({
      type: 'shipping_notification',
      recipientEmail: order.customer_email,
      recipientName: order.customer_name,
      data: {
        order_number: orderNumber,
        customer_name: order.customer_name,
        total_amount: (order.total_amount || 0).toLocaleString('vi-VN'),
        shipping_address: order.shipping_address,
        tracking_number: order.tracking_number || '',
        shipper_name: order.shipper_name || '',
        shipper_phone: order.shipper_phone || '',
        order_id: order.id
      },
      logData: {
        order_id: order.id,
        order_number: orderNumber,
        subject: `🚚 Đơn #${orderNumber} đang giao`
      }
    });
  }

  /**
   * Send delivery confirmation email
   */
  static async sendDeliveryConfirmation(order) {
    const orderNumber = order.order_number || order.id?.slice(-8);
    
    return sendTransactionalEmail({
      type: 'delivery_confirmation',
      recipientEmail: order.customer_email,
      recipientName: order.customer_name,
      data: {
        order_number: orderNumber,
        customer_name: order.customer_name,
        total_amount: (order.total_amount || 0).toLocaleString('vi-VN'),
        order_date: new Date(order.created_date).toLocaleDateString('vi-VN'),
        order_id: order.id
      },
      logData: {
        order_id: order.id,
        order_number: orderNumber,
        subject: `✅ Đơn #${orderNumber} đã giao`
      }
    });
  }

  /**
   * Send order cancellation email
   */
  static async sendOrderCancellation(order, reason = 'Không có lý do') {
    const orderNumber = order.order_number || order.id?.slice(-8);
    
    return sendTransactionalEmail({
      type: 'order_cancelled',
      recipientEmail: order.customer_email,
      recipientName: order.customer_name,
      data: {
        order_number: orderNumber,
        customer_name: order.customer_name,
        cancellation_reason: reason,
        total_amount: (order.total_amount || 0).toLocaleString('vi-VN'),
        order_id: order.id
      },
      logData: {
        order_id: order.id,
        order_number: orderNumber,
        subject: `❌ Đơn hàng #${orderNumber} đã bị hủy`
      }
    });
  }

  // =====================================
  // PAYMENT EMAILS
  // =====================================

  /**
   * Send payment confirmed email
   */
  static async sendPaymentConfirmation(order) {
    const orderNumber = order.order_number || order.id?.slice(-8);
    
    return sendTransactionalEmail({
      type: 'payment_confirmed',
      recipientEmail: order.customer_email,
      recipientName: order.customer_name,
      data: {
        order_number: orderNumber,
        customer_name: order.customer_name,
        total_amount: (order.total_amount || 0).toLocaleString('vi-VN'),
        payment_method: order.payment_method,
        order_date: new Date(order.created_date).toLocaleDateString('vi-VN'),
        order_id: order.id
      },
      logData: {
        order_id: order.id,
        order_number: orderNumber,
        subject: `✅ Thanh toán thành công #${orderNumber}`
      }
    });
  }

  /**
   * Send payment failed email
   */
  static async sendPaymentFailed(order) {
    const orderNumber = order.order_number || order.id?.slice(-8);
    
    return sendTransactionalEmail({
      type: 'payment_failed',
      recipientEmail: order.customer_email,
      recipientName: order.customer_name,
      data: {
        order_number: orderNumber,
        customer_name: order.customer_name,
        total_amount: (order.total_amount || 0).toLocaleString('vi-VN'),
        payment_method: order.payment_method || 'Chuyển khoản',
        order_id: order.id
      },
      logData: {
        order_id: order.id,
        order_number: orderNumber,
        subject: `⚠️ Thanh toán thất bại #${orderNumber}`
      }
    });
  }

  // =====================================
  // MARKETING EMAILS
  // =====================================

  /**
   * Send cart recovery email
   */
  static async sendCartRecovery(cart, discountCode = null) {
    return sendMarketingEmail({
      type: 'cart_recovery',
      recipientEmail: cart.user_email || cart.created_by,
      data: {
        items: cart.items,
        cart_total: (cart.subtotal || 0).toLocaleString('vi-VN'),
        discount_code: discountCode
      },
      logData: {
        subject: '🛒 Bạn đã quên giỏ hàng!',
        metadata: {
          cart_id: cart.id,
          discount_code: discountCode
        }
      }
    });
  }

  /**
   * Send review request email (scheduled after delivery)
   */
  static async sendReviewRequest(order) {
    const orderNumber = order.order_number || order.id?.slice(-8);
    
    return sendMarketingEmail({
      type: 'review_request',
      recipientEmail: order.customer_email,
      recipientName: order.customer_name,
      data: {
        order_number: orderNumber,
        customer_name: order.customer_name,
        items: order.items,
        order_id: order.id
      },
      logData: {
        order_id: order.id,
        subject: `⭐ Đánh giá đơn hàng #${orderNumber}`
      }
    });
  }

  /**
   * Send welcome email
   */
  static async sendWelcomeEmail(user) {
    return sendMarketingEmail({
      type: 'welcome_email',
      recipientEmail: user.email,
      recipientName: user.full_name,
      data: {
        customer_name: user.full_name,
        customer_email: user.email
      },
      logData: {
        subject: '👋 Chào mừng bạn đến với Farmer Smart!'
      }
    });
  }

  // =====================================
  // PREORDER EMAILS
  // =====================================

  /**
   * Send harvest reminder email
   */
  static async sendHarvestReminder(order, lot, daysUntilHarvest) {
    const orderNumber = order.order_number || order.id?.slice(-8);
    
    return sendTransactionalEmail({
      type: 'harvest_reminder',
      recipientEmail: order.customer_email,
      recipientName: order.customer_name,
      data: {
        order_number: orderNumber,
        customer_name: order.customer_name,
        lot_name: lot.lot_name,
        product_name: lot.product_name,
        harvest_date: new Date(lot.estimated_harvest_date).toLocaleDateString('vi-VN'),
        days_until_harvest: daysUntilHarvest,
        remaining_amount: (order.remaining_amount || 0).toLocaleString('vi-VN'),
        order_id: order.id
      },
      logData: {
        order_id: order.id,
        subject: `🌾 Sản phẩm sắp thu hoạch - ${lot.product_name}`
      }
    });
  }

  /**
   * Send harvest ready email
   */
  static async sendHarvestReady(order, lot) {
    const orderNumber = order.order_number || order.id?.slice(-8);
    
    return sendTransactionalEmail({
      type: 'harvest_ready',
      recipientEmail: order.customer_email,
      recipientName: order.customer_name,
      data: {
        order_number: orderNumber,
        customer_name: order.customer_name,
        lot_name: lot.lot_name,
        product_name: lot.product_name,
        order_id: order.id
      },
      logData: {
        order_id: order.id,
        subject: `🎉 Sản phẩm đã thu hoạch - ${lot.product_name}`
      }
    });
  }

  /**
   * Send deposit reminder email
   */
  static async sendDepositReminder(order, daysLeft) {
    const orderNumber = order.order_number || order.id?.slice(-8);
    
    return sendTransactionalEmail({
      type: 'deposit_reminder',
      recipientEmail: order.customer_email,
      recipientName: order.customer_name,
      data: {
        order_number: orderNumber,
        customer_name: order.customer_name,
        deposit_amount: (order.deposit_amount || 0).toLocaleString('vi-VN'),
        remaining_amount: (order.remaining_amount || 0).toLocaleString('vi-VN'),
        days_left: daysLeft,
        order_id: order.id
      },
      logData: {
        order_id: order.id,
        subject: `💰 Nhắc nhở thanh toán cọc #${orderNumber}`
      }
    });
  }

  // =====================================
  // REFERRAL EMAILS
  // =====================================

  /**
   * Send referral welcome email
   */
  static async sendReferralWelcome(member) {
    return sendMarketingEmail({
      type: 'referral_welcome',
      recipientEmail: member.email,
      recipientName: member.name,
      data: {
        customer_name: member.name,
        referral_code: member.referral_code
      },
      logData: {
        subject: '🤝 Chào mừng bạn tham gia chương trình giới thiệu!'
      }
    });
  }

  /**
   * Send referral commission email
   */
  static async sendReferralCommission(member, commission, referredCustomer) {
    return sendMarketingEmail({
      type: 'referral_commission',
      recipientEmail: member.email,
      recipientName: member.name,
      data: {
        customer_name: member.name,
        commission_amount: (commission || 0).toLocaleString('vi-VN'),
        referred_customer: referredCustomer
      },
      logData: {
        subject: `💵 Bạn nhận được hoa hồng ${commission.toLocaleString('vi-VN')}đ!`
      }
    });
  }

  // =====================================
  // SECURITY EMAILS (NEW v2.6.0)
  // =====================================

  /**
   * Send password changed notification
   */
  static async sendPasswordChangedEmail(user) {
    return sendTransactionalEmail({
      type: 'security_password_changed',
      recipientEmail: user.email,
      recipientName: user.full_name,
      data: {
        customer_name: user.full_name,
        changed_date: new Date(user.changed_date || Date.now()).toLocaleString('vi-VN'),
        device_info: user.device_info || 'Unknown device'
      },
      logData: {
        subject: '🔐 Mật khẩu của bạn đã được thay đổi'
      }
    });
  }

  /**
   * Send password reset request email
   */
  static async sendPasswordResetEmail(user) {
    return sendTransactionalEmail({
      type: 'security_password_reset',
      recipientEmail: user.email,
      recipientName: user.full_name,
      data: {
        customer_name: user.full_name,
        reset_link: user.reset_link,
        expiry_time: user.expiry_time || '24 giờ'
      },
      logData: {
        subject: '🔑 Yêu cầu đặt lại mật khẩu'
      }
    });
  }

  /**
   * Send new device login alert
   */
  static async sendNewDeviceLoginEmail(user) {
    return sendTransactionalEmail({
      type: 'security_new_device',
      recipientEmail: user.email,
      recipientName: user.full_name,
      data: {
        customer_name: user.full_name,
        device_info: user.device_info || 'Unknown device',
        login_time: new Date(user.login_time || Date.now()).toLocaleString('vi-VN'),
        location: user.location || 'Unknown location'
      },
      logData: {
        subject: '⚠️ Đăng nhập từ thiết bị mới'
      }
    });
  }

  // =====================================
  // REFUND EMAILS (NEW v2.6.0)
  // =====================================

  /**
   * Send refund requested confirmation
   */
  static async sendRefundRequestedEmail({ order, reason, amount }) {
    const orderNumber = order.order_number || order.id?.slice(-8);
    
    return sendTransactionalEmail({
      type: 'refund_requested',
      recipientEmail: order.customer_email,
      recipientName: order.customer_name,
      data: {
        order_number: orderNumber,
        customer_name: order.customer_name,
        amount: (amount || order.total_amount || 0).toLocaleString('vi-VN'),
        reason: reason || 'Không có lý do cụ thể'
      },
      logData: {
        order_id: order.id,
        subject: `📝 Yêu cầu hoàn tiền #${orderNumber} đã nhận`
      }
    });
  }

  /**
   * Send refund approved notification
   */
  static async sendRefundApprovedEmail({ order, amount, refund_method }) {
    const orderNumber = order.order_number || order.id?.slice(-8);
    
    return sendTransactionalEmail({
      type: 'refund_approved',
      recipientEmail: order.customer_email,
      recipientName: order.customer_name,
      data: {
        order_number: orderNumber,
        customer_name: order.customer_name,
        amount: (amount || order.total_amount || 0).toLocaleString('vi-VN'),
        refund_method: refund_method || 'Chuyển khoản'
      },
      logData: {
        order_id: order.id,
        subject: `✅ Yêu cầu hoàn tiền #${orderNumber} đã được duyệt`
      }
    });
  }

  /**
   * Send refund succeeded receipt
   */
  static async sendRefundSucceededEmail({ order, amount, txn_id, refund_date }) {
    const orderNumber = order.order_number || order.id?.slice(-8);
    
    return sendTransactionalEmail({
      type: 'refund_succeeded',
      recipientEmail: order.customer_email,
      recipientName: order.customer_name,
      data: {
        order_number: orderNumber,
        customer_name: order.customer_name,
        amount: (amount || order.total_amount || 0).toLocaleString('vi-VN'),
        txn_id: txn_id || 'N/A',
        refund_date: new Date(refund_date || Date.now()).toLocaleString('vi-VN')
      },
      logData: {
        order_id: order.id,
        subject: `💵 Hoàn tiền thành công #${orderNumber}`
      }
    });
  }

  // =====================================
  // LOYALTY EMAILS (NEW v2.6.0)
  // =====================================

  /**
   * Send points expiring soon reminder
   */
  static async sendPointsExpiringEmail(user) {
    return sendMarketingEmail({
      type: 'loyalty_points_expiring',
      recipientEmail: user.email,
      recipientName: user.full_name,
      data: {
        customer_name: user.full_name,
        points: user.points,
        expiry_date: new Date(user.expiry_date).toLocaleDateString('vi-VN')
      },
      logData: {
        subject: `⏰ ${user.points} điểm sắp hết hạn!`
      }
    });
  }

  /**
   * Send tier upgraded congratulation
   */
  static async sendTierUpgradedEmail(user) {
    return sendMarketingEmail({
      type: 'loyalty_tier_upgraded',
      recipientEmail: user.email,
      recipientName: user.full_name,
      data: {
        customer_name: user.full_name,
        new_tier: user.new_tier,
        benefits: user.benefits || []
      },
      logData: {
        subject: `🎉 Chúc mừng bạn đã thăng hạng ${user.new_tier}!`
      }
    });
  }

  // =====================================
  // SAAS EMAILS (NEW v2.6.0)
  // =====================================

  /**
   * Send member invitation email
   */
  static async sendMemberInvitedEmail(data) {
    return sendTransactionalEmail({
      type: 'saas_member_invited',
      recipientEmail: data.invitee_email,
      recipientName: data.invitee_name,
      data: {
        invitee_name: data.invitee_name,
        inviter_name: data.inviter_name,
        shop_name: data.shop_name,
        invite_link: data.invite_link,
        role: data.role || 'member'
      },
      logData: {
        subject: `👋 Bạn được mời tham gia ${data.shop_name}`
      }
    });
  }

  /**
   * Send subscription payment failed alert
   */
  static async sendSubscriptionPaymentFailedEmail(data) {
    return sendTransactionalEmail({
      type: 'saas_payment_failed',
      recipientEmail: data.email,
      data: {
        shop_name: data.shop_name,
        amount: (data.amount || 0).toLocaleString('vi-VN'),
        retry_link: data.retry_link
      },
      logData: {
        subject: `⚠️ Thanh toán thất bại - ${data.shop_name}`
      }
    });
  }

  /**
   * Send subscription expiry warning
   */
  static async sendSubscriptionExpiryWarningEmail(data) {
    return sendTransactionalEmail({
      type: 'saas_expiry_warning',
      recipientEmail: data.email,
      data: {
        shop_name: data.shop_name,
        expiry_date: new Date(data.expiry_date).toLocaleDateString('vi-VN'),
        renew_link: data.renew_link
      },
      logData: {
        subject: `⏰ Gói dịch vụ ${data.shop_name} sắp hết hạn`
      }
    });
  }

  /**
   * Send invoice email
   */
  static async sendInvoiceEmail(data) {
    return sendTransactionalEmail({
      type: 'saas_invoice',
      recipientEmail: data.email,
      data: {
        shop_name: data.shop_name,
        invoice_number: data.invoice_number,
        amount: (data.amount || 0).toLocaleString('vi-VN'),
        due_date: new Date(data.due_date).toLocaleDateString('vi-VN'),
        invoice_link: data.invoice_link
      },
      logData: {
        subject: `📄 Hóa đơn #${data.invoice_number}`
      }
    });
  }

  // =====================================
  // GENERIC / CUSTOM
  // =====================================

  /**
   * Send a custom email using a specific type
   */
  static async sendCustomEmail({ type, recipientEmail, recipientName, data, isMarketing = false }) {
    if (isMarketing) {
      return sendMarketingEmail({ type, recipientEmail, recipientName, data });
    }
    return sendTransactionalEmail({ type, recipientEmail, recipientName, data });
  }

  // =====================================
  // TEMPLATE MANAGEMENT
  // =====================================

  /**
   * Preview a template with sample data
   */
  static previewTemplate = previewTemplate;

  /**
   * Get sample data for a template type
   */
  static getSampleData = getSampleData;

  /**
   * Get email logs for an order
   */
  static async getEmailLogsForOrder(orderId) {
    return emailLogRepository.getByOrderId(orderId);
  }

  /**
   * Get email statistics
   */
  static async getEmailStats() {
    return emailLogRepository.getStats();
  }

  // =====================================
  // PROVIDER HEALTH
  // =====================================

  /**
   * Check if email provider is healthy
   */
  static async healthCheck() {
    return base44EmailProvider.healthCheck();
  }
}

export default EmailServiceFacade;