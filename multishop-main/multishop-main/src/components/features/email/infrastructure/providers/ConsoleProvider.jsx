/**
 * 📧 Console Provider - Dev/Test provider (logs only, no actual send)
 * 
 * Dùng cho môi trường dev để tránh spam emails
 */

import { IEmailProvider } from './IEmailProvider';

export class ConsoleEmailProvider extends IEmailProvider {
  constructor() {
    super();
    this.name = 'Console';
    this.sentEmails = [];
  }

  async send({ to, toName, subject, body, priority, metadata }) {
    console.log('📧 [ConsoleProvider] Email would be sent:');
    console.log('  To:', to, toName ? `(${toName})` : '');
    console.log('  Subject:', subject);
    console.log('  Priority:', priority);
    console.log('  Body length:', body.length, 'chars');
    
    // Store for inspection
    const email = {
      id: `console_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      to,
      toName,
      subject,
      body,
      priority,
      metadata,
      timestamp: new Date().toISOString()
    };
    
    this.sentEmails.push(email);
    
    // Trim history
    if (this.sentEmails.length > 100) {
      this.sentEmails.shift();
    }

    return {
      success: true,
      messageId: email.id,
      provider: this.name
    };
  }

  /**
   * Get sent emails (for testing)
   */
  getSentEmails() {
    return [...this.sentEmails];
  }

  /**
   * Clear sent emails
   */
  clear() {
    this.sentEmails = [];
  }

  /**
   * Find email by recipient
   */
  findByRecipient(email) {
    return this.sentEmails.filter(e => e.to === email);
  }
}

export const consoleEmailProvider = new ConsoleEmailProvider();

export default consoleEmailProvider;