/**
 * 📧 Base44EmailProvider - Adapter for Base44 Core.SendEmail
 * 
 * Implementation of IEmailProvider using Base44's built-in SendEmail integration.
 * 
 * Tuân thủ: Section 19.6 - Ports & Adapters (Dependency Inversion)
 */

import { base44 } from '@/api/base44Client';
import { IEmailProvider } from './IEmailProvider';

/**
 * Base44 Email Provider
 * 
 * Uses Base44's Core.SendEmail integration to send emails.
 * Default provider for the Email Module.
 */
export class Base44EmailProvider extends IEmailProvider {
  constructor(options = {}) {
    super();
    this.name = 'Base44';
    this.priority = 1; // Primary provider
    this.defaultFromName = options.fromName || 'Farmer Smart';
  }

  async checkHealth() {
    try {
      return !!base44.integrations?.Core?.SendEmail;
    } catch {
      return false;
    }
  }

  /**
   * Send a single email via Base44
   * 
   * @param {Object} params
   * @param {string} params.to - Recipient email
   * @param {string} [params.toName] - Recipient name
   * @param {string} params.subject - Email subject
   * @param {string} params.body - HTML content
   * @param {string} [params.fromName] - Sender name
   * @returns {Promise<{success: boolean, messageId?: string, error?: string, provider: string}>}
   */
  async send({ to, toName, subject, body, htmlBody, fromName }) {
    // Support both 'body' and 'htmlBody' for backward compatibility
    const emailBody = body || htmlBody;
    try {
      console.log(`📧 [${this.name}] Sending email to:`, to);
      console.log(`📧 [${this.name}] Subject:`, subject);

      const response = await base44.integrations.Core.SendEmail({
        from_name: fromName || this.defaultFromName,
        to,
        subject,
        body: emailBody
      });

      console.log(`✅ [${this.name}] Email sent successfully`);

      return {
        success: true,
        messageId: response?.messageId || `base44_${Date.now()}`,
        provider: this.name
      };
    } catch (error) {
      console.error(`❌ [${this.name}] Email send failed:`, error.message);

      return {
        success: false,
        error: error.message,
        provider: this.name
      };
    }
  }

  /**
   * Send bulk emails via Base44
   * 
   * Note: Base44 doesn't have native bulk send, so we send individually
   * with rate limiting to avoid overwhelming the API.
   * 
   * @param {string[]} recipients - Array of recipient emails
   * @param {string} subject - Email subject
   * @param {string} htmlBody - HTML content
   * @param {Object} [options] - Additional options
   * @param {number} [options.delayMs=100] - Delay between sends (ms)
   * @returns {Promise<{success: number, failed: number, errors: Array}>}
   */
  async sendBulk(recipients, subject, htmlBody, options = {}) {
    const { delayMs = 100, fromName } = options;
    
    let success = 0;
    let failed = 0;
    const errors = [];

    console.log(`📧 [${this.name}] Sending bulk email to ${recipients.length} recipients`);

    for (const to of recipients) {
      try {
        const result = await this.send({ to, subject, htmlBody, fromName });
        
        if (result.success) {
          success++;
        } else {
          failed++;
          errors.push({ to, error: result.error });
        }

        // Rate limiting
        if (delayMs > 0) {
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      } catch (error) {
        failed++;
        errors.push({ to, error: error.message });
      }
    }

    console.log(`✅ [${this.name}] Bulk send complete: ${success} success, ${failed} failed`);

    return { success, failed, errors };
  }

  /**
   * Check if Base44 is available
   */
  async isAvailable() {
    try {
      // Base44 is always available if we're in the app
      return !!base44.integrations?.Core?.SendEmail;
    } catch {
      return false;
    }
  }

  /**
   * Health check for Base44 provider
   */
  async healthCheck() {
    const available = await this.isAvailable();
    return {
      healthy: available,
      message: available ? 'Base44 SendEmail integration available' : 'Base44 SendEmail not available'
    };
  }
}

// Singleton instance for convenience
export const base44EmailProvider = new Base44EmailProvider();

export default Base44EmailProvider;