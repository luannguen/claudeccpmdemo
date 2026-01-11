/**
 * 📧 Email Module - Public API
 * 
 * @version 1.0.0
 * @description Central email automation module for all transactional and marketing emails.
 * 
 * This is the ONLY entry point for other modules.
 * DO NOT import from internal folders (domain/, infrastructure/, application/).
 * 
 * Tuân thủ: Section 19.2 - Public Surface (Contract) - CHỈ 1 CỬA EXPORT
 * 
 * @example
 * // ✅ ĐÚNG - Import từ index.js
 * import { EmailServiceFacade, EMAIL_TYPE_CONFIG } from '@/components/features/email';
 * 
 * // ❌ SAI - Deep import
 * import { emailTemplateRepository } from '@/components/features/email/infrastructure/repositories/emailTemplateRepository';
 */

// =====================================
// FACADE (Main Public API)
// =====================================

export { EmailServiceFacade } from './application/EmailServiceFacade';

// =====================================
// USE CASES (if needed for custom flows)
// =====================================

export { 
  sendTransactionalEmail, 
  sendMarketingEmail, 
  previewTemplate,
  getSampleData 
} from './application/use-cases';

// =====================================
// TYPES & CONSTANTS
// =====================================

export {
  COMMON_TEMPLATE_VARIABLES,
  ORDER_TEMPLATE_VARIABLES,
  EMAIL_TYPE_CONFIG
} from './types';

// =====================================
// ❌ NOT EXPORTED (Internal only):
// - emailTemplateRepository
// - emailLogRepository
// - IEmailProvider, Base44EmailProvider
// - templateEngine, emailRetryPolicy
// - Domain entities
// =====================================

/**
 * Module version for tracking
 */
export const EMAIL_MODULE_VERSION = '1.0.0';