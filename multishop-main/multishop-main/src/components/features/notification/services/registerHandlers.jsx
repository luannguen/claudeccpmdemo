/**
 * Handler Registration - Auto-register all event handlers on module init
 * 
 * Import this file to initialize the event system
 */

import { eventRegistry } from '../core/eventRegistry';

// Static imports for all domain handlers
import { registerCommerceHandlers } from './events/commerce';
import { registerFarmingHandlers } from './events/farming';
import { registerSocialDomainHandlers } from './events/social';
import { registerCRMHandlers } from './events/crm';
import { registerSaaSHandlers } from './events/saas';
import { registerSystemDomainHandlers } from './events/system';

let initialized = false;

/**
 * Register all handlers safely
 */
const safeRegisterAllHandlers = (registry) => {
  if (!registry) return;
  
  try { registerCommerceHandlers(registry); } catch {}
  try { registerFarmingHandlers(registry); } catch {}
  try { registerSocialDomainHandlers(registry); } catch {}
  try { registerCRMHandlers(registry); } catch {}
  try { registerSaaSHandlers(registry); } catch {}
  try { registerSystemDomainHandlers(registry); } catch {}
};

/**
 * Initialize event handlers (idempotent)
 */
export const initializeHandlers = () => {
  if (initialized) return;
  
  safeRegisterAllHandlers(eventRegistry);
  initialized = true;
};

/**
 * Check if initialized
 */
export const isInitialized = () => initialized;

/**
 * Reset (for testing)
 */
export const reset = () => {
  eventRegistry.clear?.();
  initialized = false;
};

// Auto-initialize on import
if (typeof window !== 'undefined' && !window.SKIP_NOTIFICATION_INIT) {
  setTimeout(() => {
    try { initializeHandlers(); } catch {}
  }, 100);
}

export default initializeHandlers;