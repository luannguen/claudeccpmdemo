/**
 * Use Case Registry - Refactored
 * 
 * Central registry for all use cases, hooks, and patterns.
 * AI must check this before creating new services/hooks.
 * 
 * Structure:
 * - domains/       → Use cases by domain (product, order, etc.)
 * - hookRegistry   → Consolidated hook mappings
 * - errorRegistry  → Error handling patterns
 * - viewModeRegistry → View mode system
 * - performanceRegistry → Performance optimizations
 */

// ========== DOMAIN USE CASES ==========
import { productUseCases } from './domains/productUseCases';
import { orderUseCases } from './domains/orderUseCases';
import { customerUseCases } from './domains/customerUseCases';
import { referralUseCases } from './domains/referralUseCases';
import { cmsUseCases } from './domains/cmsUseCases';
import { featureUseCases } from './domains/featureUseCases';
import { notificationUseCases } from './domains/notificationUseCases';
import { uiUseCases } from './domains/uiUseCases';
import { rbacUseCases } from './domains/rbacUseCases';
import { aiPersonalizationUseCases } from './domains/aiPersonalizationUseCases';

// ========== REGISTRIES ==========
export { consolidatedHooks, getConsolidatedHook, hasHook, hookCategories } from './hookRegistry';
export { errorHandlingRegistry, getErrorHandler, getErrorHandlersByType } from './errorRegistry';
export { viewModeRegistry, VIEW_MODES, LAYOUT_PRESETS, getViewModeComponent, getLayoutPreset } from './viewModeRegistry';
export { performanceRegistry, shouldVirtualize, getStaleTime } from './performanceRegistry';

// ========== COMBINED USE CASE REGISTRY ==========
export const useCaseRegistry = [
  ...productUseCases,
  ...orderUseCases,
  ...customerUseCases,
  ...referralUseCases,
  ...cmsUseCases,
  ...featureUseCases,
  ...notificationUseCases,
  ...uiUseCases,
  ...rbacUseCases,
  ...aiPersonalizationUseCases
];

// ========== HELPER FUNCTIONS ==========

/**
 * Find use case by ID
 * @param {string} id - e.g., 'product.list'
 */
export function findUseCase(id) {
  return useCaseRegistry.find(uc => uc.id === id);
}

/**
 * Find use cases by domain
 * @param {string} domain - e.g., 'product'
 */
export function findUseCasesByDomain(domain) {
  return useCaseRegistry.filter(uc => uc.domain === domain);
}

/**
 * Find use case by hook name
 * @param {string} hookName - e.g., 'useProductList'
 */
export function findUseCaseByHook(hookName) {
  return useCaseRegistry.find(uc => uc.hook === hookName);
}

/**
 * Get all domains
 */
export function getAllDomains() {
  return [...new Set(useCaseRegistry.map(uc => uc.domain))];
}

/**
 * Check if a use case exists for a specific action
 */
export function hasUseCase(domain, action) {
  return !!useCaseRegistry.find(uc => uc.id === `${domain}.${action}`);
}

/**
 * Get service method for a use case
 */
export function getServiceForUseCase(useCaseId) {
  const uc = findUseCase(useCaseId);
  return uc?.service || null;
}

/**
 * Get repository for a use case (alias for getServiceForUseCase)
 */
export function getRepositoryForUseCase(useCaseId) {
  return getServiceForUseCase(useCaseId);
}

/**
 * Get hook for a use case
 */
export function getHookForUseCase(useCaseId) {
  const uc = findUseCase(useCaseId);
  return uc?.hook || null;
}

/**
 * Print registry summary (for debugging)
 */
export function printRegistrySummary() {
  const domains = getAllDomains();
  console.log('📚 Use Case Registry Summary\n');
  console.log(`Total: ${useCaseRegistry.length} use cases across ${domains.length} domains\n`);
  
  domains.forEach(domain => {
    const useCases = findUseCasesByDomain(domain);
    console.log(`${domain.toUpperCase()} (${useCases.length})`);
    useCases.forEach(uc => {
      console.log(`  └─ ${uc.id}: ${uc.hook || 'N/A'}`);
    });
  });
}

// ========== DEFAULT EXPORT ==========
export default useCaseRegistry;