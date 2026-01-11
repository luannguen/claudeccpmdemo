/**
 * 📧 Send Transactional Email Use Case
 * 
 * Core use case for sending transactional emails (order, payment, etc.)
 * Application layer - orchestrates domain + infrastructure.
 */

import { emailTemplateRepository, emailLogRepository } from '../../infrastructure';
import { templateEngine, emailRetryPolicy } from '../../domain';
import { base44EmailProvider } from '../../infrastructure/providers/Base44EmailProvider';

/**
 * Send a transactional email
 * 
 * @param {Object} params
 * @param {string} params.type - Email type (order_confirmation, shipping_notification, etc.)
 * @param {string} params.recipientEmail - Recipient email address
 * @param {string} [params.recipientName] - Recipient name
 * @param {Object} params.data - Template data for variable replacement
 * @param {Object} [params.provider] - Email provider (default: base44EmailProvider)
 * @param {Object} [params.logData] - Additional data for logging
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
export async function sendTransactionalEmail({
  type,
  recipientEmail,
  recipientName,
  data,
  provider = base44EmailProvider,
  logData = {}
}) {
  console.log(`📧 [sendTransactionalEmail] Type: ${type}, To: ${recipientEmail}`);

  let emailStatus = 'sent';
  let errorMessage = null;
  let messageId = null;

  try {
    // 1. Get template from database
    const template = await emailTemplateRepository.getByType(type);
    
    if (!template) {
      console.warn(`⚠️ No template found for type: ${type}`);
      // Could fallback to built-in templates here
      return {
        success: false,
        error: `No template found for type: ${type}`
      };
    }

    // 2. Render template with data
    const { subject, htmlBody } = templateEngine.renderEmail(template, {
      ...data,
      customer_name: recipientName || data.customer_name || 'Quý khách'
    });

    if (!subject || !htmlBody) {
      return {
        success: false,
        error: 'Failed to render email template'
      };
    }

    // 3. Send email with retry
    const result = await emailRetryPolicy.execute(async () => {
      return provider.send({
        to: recipientEmail,
        subject,
        htmlBody,
        fromName: 'Farmer Smart'
      });
    });

    if (!result.success) {
      emailStatus = 'failed';
      errorMessage = result.error;
    } else {
      messageId = result.messageId;
      
      // Update template usage count (non-blocking)
      emailTemplateRepository.incrementUsage(template.id).catch(err => 
        console.warn('⚠️ Failed to increment usage:', err.message)
      );
    }

    console.log(`${result.success ? '✅' : '❌'} [sendTransactionalEmail] ${type} to ${recipientEmail}: ${result.success ? 'sent' : result.error}`);

    return result;

  } catch (error) {
    console.error(`❌ [sendTransactionalEmail] Failed:`, error);
    emailStatus = 'failed';
    errorMessage = error.message;

    return {
      success: false,
      error: error.message
    };

  } finally {
    // 4. Log communication (always, even on failure)
    await emailLogRepository.create({
      customer_email: recipientEmail,
      customer_name: recipientName || data?.customer_name || 'Khách hàng',
      channel: 'email',
      type,
      subject: logData.subject || `Email ${type}`,
      content: logData.content || `${type} email sent`,
      order_id: data?.order_id || logData.order_id,
      order_number: data?.order_number || logData.order_number,
      status: emailStatus,
      error_message: errorMessage,
      metadata: {
        ...logData.metadata,
        message_id: messageId
      }
    });
  }
}

export default sendTransactionalEmail;