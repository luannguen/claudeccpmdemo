/**
 * 📧 Mock Provider - Testing provider
 * 
 * Configurable success/failure for unit tests
 */

import { IEmailProvider } from './IEmailProvider';

export class MockEmailProvider extends IEmailProvider {
  constructor(config = {}) {
    super();
    this.name = 'Mock';
    this.config = {
      alwaysSucceed: config.alwaysSucceed !== false,
      alwaysFail: config.alwaysFail || false,
      delay: config.delay || 0,
      failureRate: config.failureRate || 0,
      errorMessage: config.errorMessage || 'Mock provider error'
    };
    this.calls = [];
  }

  async send({ to, subject, body, priority, metadata }) {
    // Record call
    this.calls.push({
      to,
      subject,
      body,
      priority,
      metadata,
      timestamp: Date.now()
    });

    // Simulate delay
    if (this.config.delay > 0) {
      await new Promise(resolve => setTimeout(resolve, this.config.delay));
    }

    // Force failure
    if (this.config.alwaysFail) {
      return {
        success: false,
        error: this.config.errorMessage,
        provider: this.name
      };
    }

    // Random failure
    if (this.config.failureRate > 0) {
      if (Math.random() < this.config.failureRate) {
        return {
          success: false,
          error: `Random failure (rate: ${this.config.failureRate})`,
          provider: this.name
        };
      }
    }

    // Success
    return {
      success: true,
      messageId: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      provider: this.name
    };
  }

  /**
   * Get all calls (for testing assertions)
   */
  getCalls() {
    return [...this.calls];
  }

  /**
   * Get last call
   */
  getLastCall() {
    return this.calls[this.calls.length - 1];
  }

  /**
   * Clear call history
   */
  reset() {
    this.calls = [];
  }

  /**
   * Configure behavior
   */
  configure(config) {
    this.config = { ...this.config, ...config };
  }
}

export default MockEmailProvider;