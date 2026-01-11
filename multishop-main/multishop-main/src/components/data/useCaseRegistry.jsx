
/**
 * Use Case Registry (Re-export)
 * 
 * This file re-exports from the refactored registry structure.
 * Maintains backward compatibility with existing imports.
 * 
 * New Structure:
 * - components/data/registry/index.js (main entry)
 * - components/data/registry/domains/ (use cases by domain)
 * - components/data/registry/hookRegistry.js
 * - components/data/registry/errorRegistry.js
 * - components/data/registry/viewModeRegistry.js
 * - components/data/registry/performanceRegistry.js
 */

// Re-export everything from new location
export {
  // Use cases
  useCaseRegistry,
  findUseCase,
  findUseCasesByDomain,
  findUseCaseByHook,
  getAllDomains,
  hasUseCase,
  getRepositoryForUseCase, // Renamed from getServiceForUseCase for consistency with existing codebase for now.
  getHookForUseCase,
  printRegistrySummary,
  
  // Hooks
  consolidatedHooks,
  getConsolidatedHook,
  // hasHook, // Assuming these will be exposed by the new registry/index.js
  // hookCategories, // Assuming these will be exposed by the new registry/index.js
  
  // Error handling
  errorHandlingRegistry,
  // getErrorHandler, // Assuming these will be exposed by the new registry/index.js
  // getErrorHandlersByType, // Assuming these will be exposed by the new registry/index.js
  
  // View mode
  viewModeRegistry,
  // VIEW_MODES, // Assuming these will be exposed by the new registry/index.js
  // LAYOUT_PRESETS, // Assuming these will be exposed by the new registry/index.js
  // getViewModeComponent, // Assuming these will be exposed by the new registry/index.js
  // getLayoutPreset, // Assuming these will be exposed by the new registry/index.js
  
  // Performance
  performanceRegistry,
  // shouldVirtualize, // Assuming these will be exposed by the new registry/index.js
  // getStaleTime // Assuming these will be exposed by the new registry/index.js
} from './registry/index';

// Default export for backward compatibility
export { default } from './registry/index';
