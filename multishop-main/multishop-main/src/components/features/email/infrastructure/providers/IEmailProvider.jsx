/**
 * 📧 IEmailProvider - Port Interface for Email Sending
 * 
 * Abstract interface (Port) cho email providers.
 * Cho phép swap provider dễ dàng (Base44 → SendGrid → AWS SES)
 * 
 * Tuân thủ: Section 19.6 - Ports & Adapters (Dependency Inversion)
 */

/**
 * @typedef {Object} SendEmailParams
 * @property {string} to - Recipient email
 * @property {string} subject - Email subject
 * @property {string} htmlBody - HTML content
 * @property {string} [from] - Sender email
 * @property {string} [fromName] - Sender name
 * @property {string} [textBody] - Plain text fallback
 */

/**
 * @typedef {Object} SendEmailResult
 * @property {boolean} success - Whether send succeeded
 * @property {string} [messageId] - Provider's message ID
 * @property {string} [error] - Error message if failed
 * @property {string} provider - Provider name
 */

/**
 * Email Provider Interface (Port)
 * 
 * Implementations:
 * - Base44EmailProvider (default)
 * - SendGridProvider (future)
 * - AwsSesProvider (future)
 * 
 * @interface IEmailProvider
 */
export class IEmailProvider {
  /**
   * Provider name for logging
   * @type {string}
   */
  name = 'IEmailProvider';

  /**
   * Send a single email
   * 
   * @param {SendEmailParams} params - Email parameters
   * @returns {Promise<SendEmailResult>} Send result
   * @abstract
   */
  async send(params) {
    throw new Error('Method send() must be implemented');
  }

  /**
   * Send bulk emails (same content, multiple recipients)
   * 
   * @param {string[]} recipients - Array of recipient emails
   * @param {string} subject - Email subject
   * @param {string} htmlBody - HTML content
   * @param {Object} [options] - Additional options
   * @returns {Promise<{success: number, failed: number, errors: Array}>}
   * @abstract
   */
  async sendBulk(recipients, subject, htmlBody, options = {}) {
    throw new Error('Method sendBulk() must be implemented');
  }

  /**
   * Check if provider is available/configured
   * 
   * @returns {Promise<boolean>}
   */
  async isAvailable() {
    return true;
  }

  /**
   * Get provider health status
   * 
   * @returns {Promise<{healthy: boolean, message?: string}>}
   */
  async healthCheck() {
    return { healthy: true };
  }
}

export default IEmailProvider;