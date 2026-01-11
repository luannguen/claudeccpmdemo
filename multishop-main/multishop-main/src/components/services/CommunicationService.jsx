/**
 * @deprecated since v2.5.0
 * 
 * ⚠️ DEPRECATED: This file is deprecated and will be removed in future versions.
 * 
 * Migration Guide:
 * ```
 * // OLD (deprecated):
 * import CommunicationService from '@/components/services/CommunicationService';
 * await CommunicationService.sendOrderConfirmation(order);
 * 
 * // NEW (recommended):
 * import { eventBus } from '@/components/shared/events';
 * import { EMAIL_EVENT_TYPES } from '@/components/features/email/types/EventPayloads';
 * eventBus.publish(EMAIL_EVENT_TYPES.ORDER_PLACED, { order, orderId: order.id });
 * 
 * // Or use Facade for custom emails:
 * import { EmailServiceFacade } from '@/components/features/email';
 * await EmailServiceFacade.sendOrderConfirmation(order);
 * ```
 * 
 * See: components/features/email/README.md
 * See: components/instruction/EmailModuleRefactorPlan.md
 * 
 * 📧 Communication Service - Unified customer communication system
 * 
 * Features:
 * - Email automation (order confirmation, shipping, delivery, review requests)
 * - SMS notifications  
 * - Push notifications
 * - Cart abandonment tracking
 * 
 * Real-time, optimized, mobile-friendly
 */

// @deprecated - Use EmailServiceFacade from @/components/features/email instead

import { base44 } from '@/api/base44Client';
import { generateOrderConfirmationEmail } from '@/components/email-templates/OrderConfirmationTemplate';
import { generateShippingNotificationEmail } from '@/components/email-templates/ShippingNotificationTemplate';
import { generateDeliveryConfirmationEmail } from '@/components/email-templates/DeliveryConfirmationTemplate';
import { generatePaymentConfirmedEmail } from '@/components/email-templates/PaymentConfirmedTemplate';

class CommunicationService {
  // Retry configuration
  MAX_RETRIES = 3;
  RETRY_DELAY = 2000; // 2 seconds

  /**
   * 🔄 Retry logic wrapper
   */
  async retryOperation(operation, maxRetries = this.MAX_RETRIES) {
    let lastError;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        console.warn(`❌ Attempt ${attempt}/${maxRetries} failed:`, error.message);
        
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY * attempt));
        }
      }
    }
    throw lastError;
  }

  /**
   * 🎯 Get template from database or use default
   */
  async getTemplate(type) {
    try {
      const templates = await base44.entities.EmailTemplate.filter({ 
        type, 
        is_active: true 
      }, '-created_date', 100);

      // Find default template for this type
      const defaultTemplate = templates.find(t => t.is_default);
      if (defaultTemplate) {
        console.log('✅ Using database template:', defaultTemplate.name);
        return defaultTemplate;
      }

      // Fallback to first active template
      if (templates.length > 0) {
        console.log('⚠️ No default template, using first active');
        return templates[0];
      }

      console.log('⚠️ No database template found, using built-in');
      return null;
    } catch (error) {
      console.error('❌ Failed to fetch template:', error);
      return null;
    }
  }

  /**
   * 📝 Replace variables in template
   */
  replaceVariables(content, data) {
    let result = content;
    Object.entries(data).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      result = result.replace(regex, value || '');
    });
    return result;
  }
  /**
   * 📱 Send SMS Notification
   */
  async sendSMS(phoneNumber, message) {
    try {
      console.log('📱 Sending SMS to:', phoneNumber);
      
      // TODO: Integrate with SMS provider (Twilio, AWS SNS, etc.)
      // For now, log only
      console.log('SMS Message:', message);
      
      // Future implementation:
      // await base44.integrations.SMS.send({ to: phoneNumber, message });
      
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to send SMS:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 📱 Send Order Status SMS
   */
  async sendOrderStatusSMS(order, status) {
    const orderNumber = order.order_number || order.id?.slice(-8);
    const phone = order.customer_phone;
    
    if (!phone) return;

    const messages = {
      confirmed: `Farmer Smart: Don hang #${orderNumber} da duoc xac nhan. Chung toi dang chuan bi hang cho ban!`,
      shipping: `Farmer Smart: Don hang #${orderNumber} dang tren duong giao den ban. Vui long chu dien thoai!`,
      delivered: `Farmer Smart: Don hang #${orderNumber} da duoc giao thanh cong. Cam on ban da mua hang!`
    };

    const message = messages[status];
    if (message) {
      await this.sendSMS(phone, message);
    }
  }

  /**
   * ⭐ Send Review Request (after 3-7 days)
   */
  async scheduleReviewRequest(order) {
    try {
      // Mark order for review automation
      const metadata = order.metadata || {};
      await base44.entities.Order.update(order.id, {
        metadata: {
          ...metadata,
          review_request_eligible: true,
          delivered_date: new Date().toISOString()
        }
      });
      
      console.log('✅ Order marked for review request automation:', order.order_number);
    } catch (error) {
      console.error('❌ Failed to schedule review request:', error);
    }
  }

  /**
   * Log communication (with enhanced error details)
   */
  async logCommunication({
    customer_email,
    customer_name,
    channel,
    type,
    subject,
    content,
    order_id = null,
    order_number = null,
    status = 'sent',
    error_message = null
  }) {
    try {
      const logData = {
        customer_email,
        customer_name,
        channel,
        type,
        subject,
        content,
        order_id,
        order_number,
        status,
        sent_date: new Date().toISOString()
      };

      // Add error details to metadata if failed
      if (status === 'failed' && error_message) {
        logData.metadata = {
          error: error_message,
          timestamp: new Date().toISOString()
        };
      }

      await base44.asServiceRole.entities.CommunicationLog.create(logData);
    } catch (error) {
      console.error('❌ Failed to log communication:', error);
    }
  }

  /**
   * Send order confirmation email (Enhanced with database templates)
   */
  async sendOrderConfirmation(order) {
    const orderNumber = order.order_number || order.id?.slice(-8);
    let emailStatus = 'sent';
    let errorMessage = null;

    try {
      console.log('📧 [CONFIRMATION] Sending to:', order.customer_email);

      // Send SMS in parallel
      this.sendOrderStatusSMS(order, 'confirmed').catch(err => 
        console.warn('SMS failed (non-critical):', err.message)
      );

      // Get template from database
      const dbTemplate = await this.getTemplate('order_confirmation');
      
      let htmlBody, emailSubject;
      
      if (dbTemplate) {
        // Use database template
        const templateData = {
          order_number: orderNumber,
          customer_name: order.customer_name,
          customer_email: order.customer_email,
          customer_phone: order.customer_phone,
          total_amount: (order.total_amount || 0).toLocaleString('vi-VN'),
          shipping_address: order.shipping_address,
          order_date: new Date(order.created_date).toLocaleDateString('vi-VN'),
          payment_method: order.payment_method,
          shop_name: order.shop_name || 'Farmer Smart'
        };

        htmlBody = this.replaceVariables(dbTemplate.html_content, templateData);
        emailSubject = this.replaceVariables(dbTemplate.subject, templateData);

        // Update usage count
        base44.entities.EmailTemplate.update(dbTemplate.id, {
          usage_count: (dbTemplate.usage_count || 0) + 1,
          last_used_date: new Date().toISOString()
        }).catch(err => console.warn('Failed to update usage count:', err));
      } else {
        // Fallback to built-in template
        htmlBody = generateOrderConfirmationEmail(order);
        emailSubject = `✅ Xác nhận đơn hàng #${orderNumber}`;
      }

      // Send email with retry logic
      console.log('📤 [CONFIRMATION] Calling SendEmail integration...');
      console.log('📤 To:', order.customer_email);
      console.log('📤 Subject:', emailSubject);
      console.log('📤 Content length:', htmlBody?.length);

      await this.retryOperation(async () => {
        const response = await base44.integrations.Core.SendEmail({
          from_name: 'Farmer Smart',
          to: order.customer_email,
          subject: emailSubject,
          body: htmlBody
        });
        console.log('📬 SendEmail response:', response);
        return response;
      });

      console.log('✅ [CONFIRMATION] Email sent successfully to', order.customer_email);
      emailStatus = 'sent';

    } catch (error) {
      console.error('❌ [CONFIRMATION] Email failed:', error);
      emailStatus = 'failed';
      errorMessage = error.message;
    } finally {
      await this.logCommunication({
        customer_email: order.customer_email,
        customer_name: order.customer_name,
        channel: 'email',
        type: 'order_confirmation',
        subject: `✅ Xác nhận đơn hàng #${orderNumber}`,
        content: `Order confirmation email for #${orderNumber}`,
        order_id: order.id,
        order_number: orderNumber,
        status: emailStatus,
        error_message: errorMessage
      });
    }
  }

  /**
   * Send shipping notification (Enhanced with database templates)
   */
  async sendShippingNotification(order) {
    const orderNumber = order.order_number || order.id?.slice(-8);
    let emailStatus = 'sent';
    let errorMessage = null;

    try {
      console.log('📧 [SHIPPING] Sending to:', order.customer_email);

      // Send SMS in parallel
      this.sendOrderStatusSMS(order, 'shipping').catch(err => 
        console.warn('SMS failed (non-critical):', err.message)
      );

      // Get template from database
      const dbTemplate = await this.getTemplate('shipping_notification');
      
      let htmlBody, emailSubject;
      
      if (dbTemplate) {
        const templateData = {
          order_number: orderNumber,
          customer_name: order.customer_name,
          customer_email: order.customer_email,
          total_amount: (order.total_amount || 0).toLocaleString('vi-VN'),
          shipping_address: order.shipping_address,
          tracking_number: order.tracking_number || '',
          shipper_name: order.shipper_name || '',
          shipper_phone: order.shipper_phone || '',
          payment_method: order.payment_method
        };

        htmlBody = this.replaceVariables(dbTemplate.html_content, templateData);
        emailSubject = this.replaceVariables(dbTemplate.subject, templateData);

        base44.entities.EmailTemplate.update(dbTemplate.id, {
          usage_count: (dbTemplate.usage_count || 0) + 1,
          last_used_date: new Date().toISOString()
        }).catch(err => console.warn('Failed to update usage count:', err));
      } else {
        htmlBody = generateShippingNotificationEmail(order);
        emailSubject = `🚚 Đơn #${orderNumber} đang giao`;
      }

      console.log('📤 [SHIPPING] Calling SendEmail...');
      
      await this.retryOperation(async () => {
        const response = await base44.integrations.Core.SendEmail({
          from_name: 'Farmer Smart',
          to: order.customer_email,
          subject: emailSubject,
          body: htmlBody
        });
        console.log('📬 SendEmail response:', response);
        return response;
      });

      console.log('✅ [SHIPPING] Email sent successfully to', order.customer_email);
      emailStatus = 'sent';

    } catch (error) {
      console.error('❌ [SHIPPING] Email failed:', error);
      emailStatus = 'failed';
      errorMessage = error.message;
    } finally {
      await this.logCommunication({
        customer_email: order.customer_email,
        customer_name: order.customer_name,
        channel: 'email',
        type: 'shipping_notification',
        subject: `🚚 Đơn #${orderNumber} đang giao`,
        content: `Shipping notification for #${orderNumber}`,
        order_id: order.id,
        order_number: orderNumber,
        status: emailStatus,
        error_message: errorMessage
      });
    }
  }

  /**
   * Send delivery confirmation + review request (Enhanced with database templates)
   */
  async sendDeliveryConfirmation(order) {
    const orderNumber = order.order_number || order.id?.slice(-8);
    let emailStatus = 'sent';
    let errorMessage = null;

    try {
      console.log('📧 [DELIVERY] Sending to:', order.customer_email);

      // Send SMS in parallel
      this.sendOrderStatusSMS(order, 'delivered').catch(err => 
        console.warn('SMS failed (non-critical):', err.message)
      );

      // Schedule review request
      this.scheduleReviewRequest(order).catch(err => 
        console.warn('Review scheduling failed (non-critical):', err.message)
      );

      // Get template from database
      const dbTemplate = await this.getTemplate('delivery_confirmation');
      
      let htmlBody, emailSubject;
      
      if (dbTemplate) {
        const templateData = {
          order_number: orderNumber,
          customer_name: order.customer_name,
          customer_email: order.customer_email,
          total_amount: (order.total_amount || 0).toLocaleString('vi-VN'),
          order_date: new Date(order.created_date).toLocaleDateString('vi-VN')
        };

        htmlBody = this.replaceVariables(dbTemplate.html_content, templateData);
        emailSubject = this.replaceVariables(dbTemplate.subject, templateData);

        base44.entities.EmailTemplate.update(dbTemplate.id, {
          usage_count: (dbTemplate.usage_count || 0) + 1,
          last_used_date: new Date().toISOString()
        }).catch(err => console.warn('Failed to update usage count:', err));
      } else {
        htmlBody = generateDeliveryConfirmationEmail(order);
        emailSubject = `✅ Đơn #${orderNumber} đã giao`;
      }

      console.log('📤 [DELIVERY] Calling SendEmail...');

      await this.retryOperation(async () => {
        const response = await base44.integrations.Core.SendEmail({
          from_name: 'Farmer Smart',
          to: order.customer_email,
          subject: emailSubject,
          body: htmlBody
        });
        console.log('📬 SendEmail response:', response);
        return response;
      });

      console.log('✅ [DELIVERY] Email sent successfully to', order.customer_email);
      emailStatus = 'sent';

    } catch (error) {
      console.error('❌ [DELIVERY] Email failed:', error);
      emailStatus = 'failed';
      errorMessage = error.message;
    } finally {
      await this.logCommunication({
        customer_email: order.customer_email,
        customer_name: order.customer_name,
        channel: 'email',
        type: 'delivery_confirmation',
        subject: `✅ Đơn #${orderNumber} đã giao`,
        content: `Delivery confirmation for #${orderNumber}`,
        order_id: order.id,
        order_number: orderNumber,
        status: emailStatus,
        error_message: errorMessage
      });
    }
  }

  /**
   * 💳 Send payment confirmed email (Enhanced with database templates)
   */
  async sendPaymentConfirmation(order) {
    const orderNumber = order.order_number || order.id?.slice(-8);
    let emailStatus = 'sent';
    let errorMessage = null;

    try {
      console.log('📧 [PAYMENT] Sending to:', order.customer_email);

      // Get template from database
      const dbTemplate = await this.getTemplate('payment_confirmed');
      
      let htmlBody, emailSubject;
      
      if (dbTemplate) {
        const templateData = {
          order_number: orderNumber,
          customer_name: order.customer_name,
          customer_email: order.customer_email,
          total_amount: (order.total_amount || 0).toLocaleString('vi-VN'),
          payment_method: order.payment_method,
          order_date: new Date(order.created_date).toLocaleDateString('vi-VN')
        };

        htmlBody = this.replaceVariables(dbTemplate.html_content, templateData);
        emailSubject = this.replaceVariables(dbTemplate.subject, templateData);

        base44.entities.EmailTemplate.update(dbTemplate.id, {
          usage_count: (dbTemplate.usage_count || 0) + 1,
          last_used_date: new Date().toISOString()
        }).catch(err => console.warn('Failed to update usage count:', err));
      } else {
        htmlBody = generatePaymentConfirmedEmail(order);
        emailSubject = `✅ Thanh toán thành công #${orderNumber}`;
      }

      console.log('📤 [PAYMENT] Calling SendEmail...');

      await this.retryOperation(async () => {
        const response = await base44.integrations.Core.SendEmail({
          from_name: 'Farmer Smart',
          to: order.customer_email,
          subject: emailSubject,
          body: htmlBody
        });
        console.log('📬 SendEmail response:', response);
        return response;
      });

      console.log('✅ [PAYMENT] Email sent successfully to', order.customer_email);
      emailStatus = 'sent';

    } catch (error) {
      console.error('❌ [PAYMENT] Email failed:', error);
      emailStatus = 'failed';
      errorMessage = error.message;
    } finally {
      await this.logCommunication({
        customer_email: order.customer_email,
        customer_name: order.customer_name,
        channel: 'email',
        type: 'payment_confirmed',
        subject: `✅ Thanh toán thành công #${orderNumber}`,
        content: `Payment confirmation for #${orderNumber}`,
        order_id: order.id,
        order_number: orderNumber,
        status: emailStatus,
        error_message: errorMessage
      });
    }
  }

  /**
   * ❌ Send order cancellation email
   */
  async sendOrderCancellation(order, cancellationReason = 'Không có lý do') {
    const orderNumber = order.order_number || order.id?.slice(-8);
    let emailStatus = 'sent';
    let errorMessage = null;

    try {
      console.log('📧 [CANCELLED] Sending to:', order.customer_email);

      const dbTemplate = await this.getTemplate('order_cancelled');
      
      let htmlBody, emailSubject;
      
      if (dbTemplate) {
        const templateData = {
          order_number: orderNumber,
          customer_name: order.customer_name,
          cancellation_reason: cancellationReason,
          total_amount: (order.total_amount || 0).toLocaleString('vi-VN')
        };

        htmlBody = this.replaceVariables(dbTemplate.html_content, templateData);
        emailSubject = this.replaceVariables(dbTemplate.subject, templateData);

        base44.entities.EmailTemplate.update(dbTemplate.id, {
          usage_count: (dbTemplate.usage_count || 0) + 1,
          last_used_date: new Date().toISOString()
        }).catch(err => console.warn('Failed to update usage count:', err));
      } else {
        // Fallback HTML
        htmlBody = `<h1>Đơn hàng #${orderNumber} đã bị hủy</h1><p>Lý do: ${cancellationReason}</p>`;
        emailSubject = `❌ Đơn hàng #${orderNumber} đã bị hủy`;
      }

      await this.retryOperation(async () => {
        const response = await base44.integrations.Core.SendEmail({
          from_name: 'Farmer Smart',
          to: order.customer_email,
          subject: emailSubject,
          body: htmlBody
        });
        console.log('📬 SendEmail response:', response);
        return response;
      });

      console.log('✅ [CANCELLED] Email sent successfully');
      emailStatus = 'sent';

    } catch (error) {
      console.error('❌ [CANCELLED] Email failed:', error);
      emailStatus = 'failed';
      errorMessage = error.message;
    } finally {
      await this.logCommunication({
        customer_email: order.customer_email,
        customer_name: order.customer_name,
        channel: 'email',
        type: 'order_cancelled',
        subject: `❌ Đơn hàng #${orderNumber} đã bị hủy`,
        content: `Cancellation email for #${orderNumber}`,
        order_id: order.id,
        order_number: orderNumber,
        status: emailStatus,
        error_message: errorMessage
      });
    }
  }

  /**
   * ⚠️ Send payment failed email
   */
  async sendPaymentFailed(order) {
    const orderNumber = order.order_number || order.id?.slice(-8);
    let emailStatus = 'sent';
    let errorMessage = null;

    try {
      console.log('📧 [PAYMENT_FAILED] Sending to:', order.customer_email);

      const dbTemplate = await this.getTemplate('payment_failed');
      
      let htmlBody, emailSubject;
      
      if (dbTemplate) {
        const templateData = {
          order_number: orderNumber,
          customer_name: order.customer_name,
          total_amount: (order.total_amount || 0).toLocaleString('vi-VN'),
          payment_method: order.payment_method || 'Chuyển khoản'
        };

        htmlBody = this.replaceVariables(dbTemplate.html_content, templateData);
        emailSubject = this.replaceVariables(dbTemplate.subject, templateData);

        base44.entities.EmailTemplate.update(dbTemplate.id, {
          usage_count: (dbTemplate.usage_count || 0) + 1,
          last_used_date: new Date().toISOString()
        }).catch(err => console.warn('Failed to update usage count:', err));
      } else {
        htmlBody = `<h1>Thanh toán thất bại cho đơn #${orderNumber}</h1>`;
        emailSubject = `⚠️ Thanh toán thất bại #${orderNumber}`;
      }

      await this.retryOperation(async () => {
        const response = await base44.integrations.Core.SendEmail({
          from_name: 'Farmer Smart',
          to: order.customer_email,
          subject: emailSubject,
          body: htmlBody
        });
        return response;
      });

      console.log('✅ [PAYMENT_FAILED] Email sent successfully');
      emailStatus = 'sent';

    } catch (error) {
      console.error('❌ [PAYMENT_FAILED] Email failed:', error);
      emailStatus = 'failed';
      errorMessage = error.message;
    } finally {
      await this.logCommunication({
        customer_email: order.customer_email,
        customer_name: order.customer_name,
        channel: 'email',
        type: 'payment_failed',
        subject: `⚠️ Thanh toán thất bại #${orderNumber}`,
        content: `Payment failed email for #${orderNumber}`,
        order_id: order.id,
        order_number: orderNumber,
        status: emailStatus,
        error_message: errorMessage
      });
    }
  }

  /**
   * 🛒 Send abandoned cart recovery email
   */
  async sendAbandonedCartRecoveryEmail(cart, config, discountCode = null) {
    let emailStatus = 'sent';
    let errorMessage = null;

    try {
      console.log('📧 [CART_RECOVERY] Sending to:', cart.user_email || cart.created_by);

      // Email HTML will be generated in backend function
      // This is a backup method for manual sends

      await this.retryOperation(async () => {
        const response = await base44.integrations.Core.SendEmail({
          from_name: 'Farmer Smart',
          to: cart.user_email || cart.created_by,
          subject: config?.email_subject || '🛒 Bạn đã quên giỏ hàng của mình?',
          body: `
            <h1>Giỏ hàng của bạn đang chờ!</h1>
            <p>Có ${cart.items?.length || 0} sản phẩm trong giỏ hàng của bạn.</p>
            ${discountCode ? `<p>Mã giảm giá: <strong>${discountCode}</strong></p>` : ''}
            <p>Tổng: ${(cart.subtotal || 0).toLocaleString('vi-VN')}đ</p>
            <a href="${Deno.env.get('APP_URL') || 'https://farmersmart.vn'}/services" style="display:inline-block;padding:12px 30px;background:#7CB342;color:white;text-decoration:none;border-radius:8px">
              Hoàn tất đơn hàng
            </a>
          `
        });
        return response;
      });

      console.log('✅ [CART_RECOVERY] Email sent successfully');
      emailStatus = 'sent';

    } catch (error) {
      console.error('❌ [CART_RECOVERY] Email failed:', error);
      emailStatus = 'failed';
      errorMessage = error.message;
    } finally {
      await this.logCommunication({
        customer_email: cart.user_email || cart.created_by,
        customer_name: 'Khách hàng',
        channel: 'email',
        type: 'cart_recovery',
        subject: config?.email_subject || 'Cart Recovery',
        content: `Abandoned cart recovery for ${cart.items?.length || 0} items`,
        status: emailStatus,
        error_message: errorMessage,
        metadata: {
          cart_id: cart.id,
          cart_value: cart.subtotal,
          discount_code: discountCode
        }
      });
    }
  }

  /**
   * Send push notification
   */
  async sendPushNotification(title, body, tag = 'default') {
    try {
      if (!('Notification' in window)) return;
      
      if (Notification.permission === 'granted') {
        new Notification(title, { body, icon: '/icon-192x192.png', tag });
      }
    } catch (error) {
      console.error('❌ Push failed:', error);
    }
  }
}

export default new CommunicationService();