/**
 * 📧 Send Marketing Email Use Case
 * 
 * Use case for sending marketing/promotional emails (cart recovery, promo, etc.)
 * Application layer - orchestrates domain + infrastructure.
 */

import { emailTemplateRepository, emailLogRepository } from '../../infrastructure';
import { templateEngine, emailRetryPolicy } from '../../domain';
import { base44EmailProvider } from '../../infrastructure/providers/Base44EmailProvider';

/**
 * Send a marketing email
 * 
 * @param {Object} params
 * @param {string} params.type - Email type (cart_recovery, promo, welcome_email, etc.)
 * @param {string} params.recipientEmail - Recipient email
 * @param {string} [params.recipientName] - Recipient name
 * @param {Object} params.data - Template data
 * @param {Object} [params.provider] - Email provider
 * @param {Object} [params.logData] - Additional log data
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function sendMarketingEmail({
  type,
  recipientEmail,
  recipientName,
  data,
  provider = base44EmailProvider,
  logData = {}
}) {
  console.log(`📧 [sendMarketingEmail] Type: ${type}, To: ${recipientEmail}`);

  let emailStatus = 'sent';
  let errorMessage = null;

  try {
    // 1. Get template
    const template = await emailTemplateRepository.getByType(type);
    
    if (!template) {
      // Marketing emails might not have templates - could be inline
      console.warn(`⚠️ No template for marketing type: ${type}`);
      return {
        success: false,
        error: `No template found for type: ${type}`
      };
    }

    // 2. Render template
    const { subject, htmlBody } = templateEngine.renderEmail(template, {
      ...data,
      customer_name: recipientName || data.customer_name || 'Quý khách'
    });

    // 3. Send with retry (fewer retries for marketing)
    const marketingRetryPolicy = {
      ...emailRetryPolicy,
      config: { ...emailRetryPolicy.config, maxRetries: 2 }
    };

    const result = await marketingRetryPolicy.execute(async () => {
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
      emailTemplateRepository.incrementUsage(template.id).catch(() => {});
    }

    console.log(`${result.success ? '✅' : '❌'} [sendMarketingEmail] ${type}: ${result.success ? 'sent' : result.error}`);

    return result;

  } catch (error) {
    console.error(`❌ [sendMarketingEmail] Failed:`, error);
    emailStatus = 'failed';
    errorMessage = error.message;
    return { success: false, error: error.message };

  } finally {
    await emailLogRepository.create({
      customer_email: recipientEmail,
      customer_name: recipientName || 'Khách hàng',
      channel: 'email',
      type,
      subject: logData.subject || `Marketing: ${type}`,
      content: logData.content || `${type} marketing email`,
      status: emailStatus,
      error_message: errorMessage,
      metadata: logData.metadata
    });
  }
}

export default sendMarketingEmail;