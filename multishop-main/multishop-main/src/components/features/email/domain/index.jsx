/**
 * 📧 Email Module - Domain Layer Index
 * 
 * Exports domain services and policies.
 * Domain layer không phụ thuộc infrastructure/UI.
 */

// Policies
export { 
  emailRetryPolicy,
  executeWithRetry,
  createRetryPolicy,
  isRetryableError,
  calculateDelay,
  DEFAULT_RETRY_CONFIG
} from './policies/retryPolicy';

// Services
export {
  templateEngine,
  renderTemplate,
  renderEmailTemplate,
  extractVariables,
  validateTemplate,
  createTemplateEngine,
  TEMPLATE_FILTERS
} from './services/templateEngine';