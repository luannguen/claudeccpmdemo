/**
 * AIContextProvider - RBAC-Secured Context Provider for AI Components
 * 
 * PURPOSE: Wrap AI components (chatbot, recommendations, etc.) to provide
 * secure, RBAC-controlled access to user personalization context.
 * 
 * SECURITY:
 * - Users can only access their OWN AI profile by default
 * - Admin access to other profiles requires explicit permission
 * - Sensitive data is masked for non-owners without manage permission
 * - All access is logged in security context
 * 
 * USAGE:
 * <AIContextProvider>
 *   <ChatBot />
 *   <ProductRecommendations />
 * </AIContextProvider>
 * 
 * // For admin viewing another user:
 * <AIContextProvider targetEmail="other@user.com">
 *   <CustomerInsights />
 * </AIContextProvider>
 * 
 * Inside child components:
 * const { contextString, isAuthorized, canPerformAction } = useAIContext();
 */

import React, { createContext, useContext, useMemo } from 'react';
import { useAIUserContext } from './useAIUserContext';

const AIContext = createContext(null);

/**
 * Hook to access AI context from child components
 * @throws Error if used outside AIContextProvider
 */
export function useAIContext() {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAIContext must be used within AIContextProvider');
  }
  return context;
}

/**
 * AIContextProvider Component - RBAC-Secured
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {boolean} props.enabled - Whether to fetch context (default: true)
 * @param {string} props.targetEmail - Email of user to fetch (admin only)
 */
export function AIContextProvider({ children, enabled = true, targetEmail = null }) {
  const aiContext = useAIUserContext({ enabled, targetEmail });

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    // Security metadata (IMPORTANT)
    isAuthorized: aiContext.isAuthorized,
    isOwnProfile: aiContext.isOwnProfile,
    accessibleModules: aiContext.accessibleModules,
    securityContext: aiContext.securityContext,
    
    // Core context
    context: aiContext.context,
    contextString: aiContext.contextString,
    fullContext: aiContext.fullContext,
    
    // Quick access
    hasProfile: aiContext.hasProfile,
    segment: aiContext.segment,
    intent: aiContext.intent,
    persona: aiContext.persona,
    sentiment: aiContext.sentiment,
    buyingTendency: aiContext.buyingTendency,
    engagement: aiContext.engagement,
    categories: aiContext.categories,
    recommendations: aiContext.recommendations,
    favoriteProducts: aiContext.favoriteProducts,
    recentSearches: aiContext.recentSearches,
    priceRange: aiContext.priceRange,
    
    // State
    isLoading: aiContext.isLoading,
    isError: aiContext.isError,
    error: aiContext.error,
    
    // Helper methods
    buildPromptContext: aiContext.buildPromptContext,
    buildSystemPromptRBAC: aiContext.buildSystemPromptRBAC,
    getRecommendationType: aiContext.getRecommendationType,
    isLikelyToConvert: aiContext.isLikelyToConvert,
    getCommunicationStyle: aiContext.getCommunicationStyle,
    canPerformAction: aiContext.canPerformAction,
    refresh: aiContext.refresh
  }), [aiContext]);

  // If not authorized, render children but with restricted context
  if (!aiContext.isAuthorized && !aiContext.isLoading) {
    const restrictedValue = {
      isAuthorized: false,
      isOwnProfile: false,
      accessibleModules: [],
      securityContext: aiContext.securityContext,
      context: null,
      contextString: 'ACCESS_DENIED',
      fullContext: 'Không có quyền truy cập dữ liệu này.',
      hasProfile: false,
      segment: null,
      intent: null,
      persona: null,
      isLoading: false,
      isError: true,
      error: new Error('FORBIDDEN: No permission to access this profile'),
      buildPromptContext: () => 'ACCESS_DENIED',
      buildSystemPromptRBAC: () => 'ACCESS_DENIED',
      canPerformAction: () => false,
      getRecommendationType: () => 'none',
      isLikelyToConvert: () => false,
      getCommunicationStyle: () => 'restricted',
      refresh: aiContext.refresh
    };
    
    return (
      <AIContext.Provider value={restrictedValue}>
        {children}
      </AIContext.Provider>
    );
  }

  return (
    <AIContext.Provider value={contextValue}>
      {children}
    </AIContext.Provider>
  );
}

/**
 * HOC to inject RBAC-secured AI context into a component
 * 
 * USAGE:
 * const EnhancedChatBot = withAIContext(ChatBot);
 * const AdminInsights = withAIContext(CustomerInsights, { targetEmail: 'user@example.com' });
 */
export function withAIContext(Component, defaultOptions = {}) {
  return function AIContextWrapper(props) {
    const { targetEmail, aiEnabled = true, ...restProps } = props;
    return (
      <AIContextProvider 
        enabled={aiEnabled} 
        targetEmail={targetEmail || defaultOptions.targetEmail}
      >
        <Component {...restProps} />
      </AIContextProvider>
    );
  };
}

/**
 * Guard component that only renders children if user is authorized
 * 
 * USAGE:
 * <AIAuthGuard fallback={<NoAccessMessage />}>
 *   <SensitiveAIComponent />
 * </AIAuthGuard>
 */
export function AIAuthGuard({ children, fallback = null, requireManagePermission = false }) {
  const context = useAIContext();
  
  if (!context.isAuthorized) {
    return fallback;
  }
  
  if (requireManagePermission && !context.securityContext?.canManageOthers && !context.isOwnProfile) {
    return fallback;
  }
  
  return children;
}

export default AIContextProvider;