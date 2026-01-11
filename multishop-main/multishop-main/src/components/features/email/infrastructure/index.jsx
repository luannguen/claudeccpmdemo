
/**
 * 📧 Email Module - Infrastructure Layer Index
 * 
 * Exports providers and repositories.
 * Infrastructure layer - phụ thuộc external services (Base44, etc.)
 */

// Providers
export { IEmailProvider } from './providers/IEmailProvider';
export { Base44EmailProvider, base44EmailProvider } from './providers/Base44EmailProvider';
export { ConsoleEmailProvider, consoleEmailProvider } from './providers/ConsoleProvider';
export { MockEmailProvider } from './providers/MockProvider';
export { createProvider, getDefaultProvider, PROVIDER_TYPES } from './providers/ProviderFactory';
export { providerManager } from './providers/ProviderManager';

// Repositories
export { emailTemplateRepository } from './repositories/emailTemplateRepository';
export { emailLogRepository } from './repositories/emailLogRepository';
