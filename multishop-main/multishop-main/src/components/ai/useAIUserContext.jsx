/**
 * useAIUserContext - RBAC-Secured Hook for AI Components
 * 
 * PURPOSE: Provide AI-readable context to chatbots and AI components
 * WITH SECURITY: Ensures user can only access their OWN data + RBAC-restricted data
 * 
 * SECURITY FEATURES:
 * 1. User can ONLY access their own AI profile (email match)
 * 2. Admin roles can access other users' profiles (with explicit permission)
 * 3. Data is filtered based on RBAC permissions
 * 4. Sensitive fields are masked for non-admin users
 * 
 * USAGE:
 * const { context, contextString, isAuthorized } = useAIUserContext();
 * 
 * // For admin viewing another user (requires permission):
 * const { context } = useAIUserContext({ targetEmail: 'other@user.com' });
 * 
 * ARCHITECTURE: Follows 3-layer pattern
 * - This hook (Feature Logic Layer) 
 * - aiPersonalizationAPI (Data/Service Layer)
 * - AI components use this hook (UI Layer)
 */

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/components/AuthProvider';
import { useUserPermissions, useAccessibleModules } from '@/components/hooks/useRBAC';
import { aiPersonalizationAPI } from '@/components/services/aiPersonalizationService';

/**
 * @typedef {Object} AIUserContextOptions
 * @property {boolean} enabled - Enable/disable the query
 * @property {string} targetEmail - Email of user to fetch (admin only, requires permission)
 */

/**
 * @typedef {Object} SecuredAIContext
 * @property {boolean} isAuthorized - Whether current user is authorized to view this data
 * @property {boolean} isOwnProfile - Whether viewing own profile
 * @property {string[]} accessibleModules - RBAC modules user can access
 * @property {Object} securityContext - Security metadata
 */

const STALE_TIME = 5 * 60 * 1000; // 5 minutes

// Sensitive fields that should be masked for non-owners
const SENSITIVE_FIELDS = ['conversionMetrics', 'activityStats', 'timePatterns'];

// Modules that require specific permissions to view AI data
const AI_VIEW_PERMISSION = 'customers.view';
const AI_MANAGE_PERMISSION = 'customers.manage';

export function useAIUserContext(options = {}) {
  const { user, isAuthenticated } = useAuth();
  const { enabled = true, targetEmail = null } = options;
  
  // Get user's RBAC permissions
  const { data: userPermissions = [] } = useUserPermissions();
  const { data: accessibleModules = [] } = useAccessibleModules();

  // Security checks
  const isAdmin = user?.role === 'admin' || userPermissions.includes('*');
  const hasCustomerViewPermission = isAdmin || userPermissions.includes(AI_VIEW_PERMISSION) || userPermissions.includes('customers.*');
  const hasCustomerManagePermission = isAdmin || userPermissions.includes(AI_MANAGE_PERMISSION) || userPermissions.includes('customers.*');
  
  // Determine which email to fetch
  const emailToFetch = targetEmail || user?.email;
  const isOwnProfile = emailToFetch === user?.email;
  
  // Authorization check: Can only view others' profiles if has permission
  const isAuthorized = isOwnProfile || (targetEmail && hasCustomerViewPermission);

  const query = useQuery({
    queryKey: ['ai-user-context-secured', emailToFetch, user?.id],
    queryFn: async () => {
      // Security Gate 1: Must be authenticated
      if (!isAuthenticated || !user?.email) {
        throw new Error('UNAUTHORIZED: User not authenticated');
      }
      
      // Security Gate 2: Must have authorization
      if (!isAuthorized) {
        throw new Error('FORBIDDEN: No permission to view this profile');
      }
      
      // Security Gate 3: Cannot view others without permission
      if (!isOwnProfile && !hasCustomerViewPermission) {
        throw new Error('FORBIDDEN: Customer view permission required');
      }
      
      // Fetch the AI context
      const result = await aiPersonalizationAPI.getAIReadableContext(emailToFetch);
      if (!result.success) {
        throw new Error(result.message);
      }
      
      // Security Gate 4: Mask sensitive data for non-owners without manage permission
      let contextData = result.data;
      if (!isOwnProfile && !hasCustomerManagePermission) {
        contextData = maskSensitiveData(contextData);
      }
      
      return {
        ...contextData,
        _security: {
          viewedBy: user.email,
          isOwnProfile,
          permissionLevel: hasCustomerManagePermission ? 'manage' : hasCustomerViewPermission ? 'view' : 'owner_only',
          accessedAt: new Date().toISOString()
        }
      };
    },
    enabled: enabled && isAuthenticated && !!emailToFetch && isAuthorized,
    staleTime: STALE_TIME,
    cacheTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false // Don't retry on auth errors
  });

  // Build a default context for new users
  const defaultContext = {
    hasProfile: false,
    contextString: 'NEW_USER | No history | Recommend: popular products, welcome offers',
    fullContext: 'Người dùng mới, chưa có dữ liệu cá nhân hóa.',
    segment: 'new_user',
    intent: 'unknown',
    persona: 'unknown',
    categories: [],
    recommendations: ['welcome_offer', 'popular_products', 'category_intro'],
    sentiment: 'neutral',
    buyingTendency: 'unknown',
    engagement: 'new',
    priceRange: null,
    favoriteProducts: [],
    recentSearches: [],
    conversionMetrics: {},
    timePatterns: {},
    behavioralPatterns: [],
    contentPrefs: {},
    activityStats: {},
    lastUpdated: null
  };

  const context = query.data || defaultContext;

  return {
    // Security metadata
    isAuthorized,
    isOwnProfile,
    accessibleModules,
    securityContext: {
      canViewOthers: hasCustomerViewPermission,
      canManageOthers: hasCustomerManagePermission,
      isAdmin,
      currentUserEmail: user?.email,
      targetEmail: emailToFetch
    },
    
    // Main data
    context,
    contextString: context.contextString,
    fullContext: context.fullContext,
    
    // Quick access to common fields
    hasProfile: context.hasProfile,
    segment: context.segment,
    intent: context.intent,
    persona: context.persona,
    sentiment: context.sentiment,
    buyingTendency: context.buyingTendency,
    engagement: context.engagement,
    categories: context.categories,
    recommendations: context.recommendations,
    favoriteProducts: context.favoriteProducts,
    recentSearches: context.recentSearches,
    priceRange: context.priceRange,
    
    // State
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    
    // Actions
    refresh: query.refetch,
    
    /**
     * Build RBAC-aware prompt context
     * Only includes data user is allowed to see
     */
    buildPromptContext: (maxTokens = 200) => {
      if (!isAuthorized) {
        return 'ACCESS_DENIED | User not authorized to view this profile';
      }
      
      if (!context.hasProfile) {
        return 'NEW_USER | No purchase history | Recommend trending products';
      }
      
      const parts = [];
      
      // Add security prefix for non-owner access
      if (!isOwnProfile) {
        parts.push(`[ADMIN_VIEW:${user?.email}]`);
      }
      
      parts.push(`SEGMENT:${context.segment}`);
      if (context.intent !== 'unknown') parts.push(`INTENT:${context.intent}`);
      if (context.buyingTendency !== 'unknown') parts.push(`BUY:${context.buyingTendency}`);
      
      if (context.categories?.length > 0) {
        parts.push(`CATS:[${context.categories.slice(0, 3).join(',')}]`);
      }
      
      if (context.priceRange?.avg) {
        parts.push(`AVG_PRICE:${Math.round(context.priceRange.avg / 1000)}k`);
      }
      
      // Only include detailed data for own profile or with manage permission
      if (isOwnProfile || hasCustomerManagePermission) {
        if (context.recentSearches?.length > 0) {
          parts.push(`SEARCHES:[${context.recentSearches.slice(0, 2).join(',')}]`);
        }
        
        if (context.favoriteProducts?.length > 0) {
          const names = context.favoriteProducts.slice(0, 2).map(p => p.name?.substring(0, 15)).filter(Boolean);
          if (names.length) parts.push(`FAVS:[${names.join(',')}]`);
        }
      }
      
      if (context.recommendations?.length > 0) {
        parts.push(`ACTIONS:[${context.recommendations.slice(0, 2).join(',')}]`);
      }
      
      // Add accessible modules for context
      if (accessibleModules.length > 0 && accessibleModules.length < 10) {
        parts.push(`MODULES:[${accessibleModules.slice(0, 5).join(',')}]`);
      }
      
      return parts.join(' | ');
    },
    
    /**
     * Build RBAC-aware system prompt for chatbot
     * Tells AI what user is allowed to access
     */
    buildSystemPromptRBAC: () => {
      const lines = [];
      lines.push('USER PERMISSIONS:');
      lines.push(`- Role: ${user?.role || 'user'}`);
      lines.push(`- Modules: ${accessibleModules.join(', ') || 'none'}`);
      
      if (isAdmin) {
        lines.push('- Level: ADMIN (full access)');
      } else if (hasCustomerManagePermission) {
        lines.push('- Level: MANAGER (can manage customers)');
      } else if (hasCustomerViewPermission) {
        lines.push('- Level: VIEWER (read-only customer access)');
      } else {
        lines.push('- Level: USER (own data only)');
      }
      
      lines.push('');
      lines.push('RESTRICTIONS:');
      if (!isAdmin) {
        lines.push('- Cannot access other users\' personal data');
        lines.push('- Cannot perform admin operations');
        if (!accessibleModules.includes('reports')) {
          lines.push('- Cannot access reports/analytics');
        }
        if (!accessibleModules.includes('orders')) {
          lines.push('- Cannot access order management');
        }
      }
      
      return lines.join('\n');
    },
    
    // Get recommendations based on context
    getRecommendationType: () => {
      if (!context.hasProfile) return 'popular';
      
      switch (context.segment) {
        case 'loyal_buyer': return 'personalized';
        case 'deal_hunter': return 'deals';
        case 'organic_enthusiast': return 'organic';
        case 'community_active': return 'community_picks';
        case 'browser': return 'trending';
        case 'premium_customer': return 'premium';
        case 'price_sensitive': return 'value';
        default: return 'popular';
      }
    },
    
    // Check if user likely to convert
    isLikelyToConvert: () => {
      return context.intent === 'ready_to_buy' || 
             context.buyingTendency === 'high' ||
             (context.conversionMetrics?.cart_to_purchase_rate > 0.5);
    },
    
    // Get communication style suggestion
    getCommunicationStyle: () => {
      if (!context.hasProfile) return 'friendly_welcome';
      
      const persona = context.persona;
      const styles = {
        'ba_noi_tro': 'practical_helpful',
        'gen_z_organic': 'casual_trendy',
        'professional_busy': 'concise_efficient',
        'health_conscious': 'informative_caring',
        'family_provider': 'trustworthy_supportive',
        'eco_warrior': 'passionate_mission',
        'value_seeker': 'value_focused',
        'quality_first': 'detailed_premium'
      };
      
      return styles[persona] || 'friendly_helpful';
    },
    
    /**
     * Check if current user can perform specific action based on RBAC
     */
    canPerformAction: (action, module) => {
      if (isAdmin) return true;
      const permission = `${module}.${action}`;
      return userPermissions.includes(permission) || userPermissions.includes(`${module}.*`);
    }
  };
}

/**
 * Mask sensitive data for non-owners
 */
function maskSensitiveData(contextData) {
  const masked = { ...contextData };
  
  // Mask conversion metrics
  if (masked.conversionMetrics) {
    masked.conversionMetrics = {
      _masked: true,
      view_to_cart_rate: null,
      cart_to_purchase_rate: null,
      avg_order_value: null
    };
  }
  
  // Mask detailed activity stats
  if (masked.activityStats) {
    masked.activityStats = {
      _masked: true,
      total_views: '***',
      total_purchases: '***'
    };
  }
  
  // Mask time patterns
  if (masked.timePatterns) {
    masked.timePatterns = { _masked: true };
  }
  
  // Mask recent searches (privacy)
  if (masked.recentSearches) {
    masked.recentSearches = ['[MASKED]'];
  }
  
  return masked;
}

export default useAIUserContext;