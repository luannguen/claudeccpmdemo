
/**
 * AI Components Index
 * 
 * Central export for all AI-related components, hooks, and utilities
 * 
 * SECURITY: All AI context access is RBAC-secured
 * - Users can only access their own AI profile
 * - Admin access requires explicit permissions
 * - Sensitive data is masked appropriately
 */

// Background Engine (mount in Layout)
export { default as AIPersonalizationEngine, triggerAIEvent, AIEvents } from './AIPersonalizationEngine';

// RBAC-Secured Context Provider for AI Components
export { 
  AIContextProvider, 
  useAIContext, 
  withAIContext,
  AIAuthGuard 
} from './AIContextProvider';

// RBAC-Secured Hook for AI user context
export { useAIUserContext, default as useAIUserContextDefault } from './useAIUserContext';

// Re-export service for direct use (use with caution - prefer hooks for RBAC)
export { 
  aiPersonalizationAPI, 
  quickLog, 
  ActivityEventTypes, 
  TargetTypes 
} from '../services/aiPersonalizationService';

// Full User Context Hook (combines all data sources)
export { 
  useUserFullContext, 
  useLocalUserData, 
  useAIContextSummary 
} from './useUserFullContext';

// User Context Service
export { userContextAPI } from '../services/userContextService';
