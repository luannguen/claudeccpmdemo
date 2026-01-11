/**
 * 📧 Provider Factory - Create providers by name
 * 
 * Centralized provider creation
 */

import { base44EmailProvider } from './Base44EmailProvider';
import { consoleEmailProvider } from './ConsoleProvider';
import MockEmailProvider from './MockProvider';

/**
 * Available provider types
 */
export const PROVIDER_TYPES = {
  BASE44: 'base44',
  CONSOLE: 'console',
  MOCK: 'mock'
};

/**
 * Create provider by type
 * 
 * @param {string} type - Provider type
 * @param {Object} [config] - Provider config
 * @returns {IEmailProvider}
 */
export function createProvider(type, config = {}) {
  const normalizedType = type.toLowerCase();

  switch (normalizedType) {
    case PROVIDER_TYPES.BASE44:
      return base44EmailProvider;
      
    case PROVIDER_TYPES.CONSOLE:
      return consoleEmailProvider;
      
    case PROVIDER_TYPES.MOCK:
      return new MockEmailProvider(config);
      
    default:
      throw new Error(`Unknown provider type: ${type}`);
  }
}

/**
 * Get default provider (based on environment)
 * 
 * @returns {IEmailProvider}
 */
export function getDefaultProvider() {
  // Check if dev mode
  const isDev = process.env.NODE_ENV === 'development' || 
                window?.location?.hostname === 'localhost';

  if (isDev) {
    console.log('📧 [ProviderFactory] Using Console provider (dev mode)');
    return consoleEmailProvider;
  }

  console.log('📧 [ProviderFactory] Using Base44 provider (production)');
  return base44EmailProvider;
}

export default {
  createProvider,
  getDefaultProvider,
  PROVIDER_TYPES
};