/**
 * AI Personalization Hook
 * 
 * Hook layer cho hệ thống AI cá nhân hóa.
 * Cung cấp interface để UI ghi nhận hoạt động và đọc hồ sơ AI.
 * 
 * Tuân thủ kiến trúc 3 lớp: UI → Hook → Service
 */

import { useCallback, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { aiPersonalizationAPI, quickLog, ActivityEventTypes, TargetTypes } from '@/components/services/aiPersonalizationService';
import { useAuth } from '@/components/AuthProvider';

// ========== MAIN HOOK ==========

/**
 * Hook chính để sử dụng hệ thống AI cá nhân hóa
 */
export function useAIPersonalization() {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const lastLoggedRef = useRef({}); // Debounce duplicate events
  
  // ========== QUERIES ==========
  
  // Lấy hồ sơ AI của user hiện tại
  const profileQuery = useQuery({
    queryKey: ['ai-profile', user?.email],
    queryFn: async () => {
      const result = await aiPersonalizationAPI.getMyProfile();
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    enabled: isAuthenticated && !!user?.email,
    staleTime: 5 * 60 * 1000, // 5 phút
    refetchOnWindowFocus: false
  });
  
  // Lấy context cá nhân hóa (cho AI chatbot)
  const contextQuery = useQuery({
    queryKey: ['ai-context', user?.email],
    queryFn: async () => {
      const result = await aiPersonalizationAPI.getPersonalizationContext(user.email);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    enabled: isAuthenticated && !!user?.email,
    staleTime: 5 * 60 * 1000
  });
  
  // ========== MUTATIONS ==========
  
  // Mutation để log activity
  const logMutation = useMutation({
    mutationFn: aiPersonalizationAPI.logActivity,
    onSuccess: () => {
      // Invalidate profile sau khi có activity mới (để trigger re-process nếu cần)
      // Không cần invalidate ngay vì AI process định kỳ
    },
    onError: (error) => {
      console.warn('Failed to log activity:', error);
    }
  });
  
  // ========== LOGGING FUNCTIONS ==========
  
  /**
   * Log một activity với debounce
   */
  const logActivity = useCallback((activityData) => {
    if (!isAuthenticated) return; // Không log nếu chưa đăng nhập
    
    // Debounce: tránh log duplicate trong 1 giây
    const key = `${activityData.event_type}_${activityData.target_id || activityData.target_name}`;
    const now = Date.now();
    
    if (lastLoggedRef.current[key] && now - lastLoggedRef.current[key] < 1000) {
      return; // Skip duplicate
    }
    
    lastLoggedRef.current[key] = now;
    logMutation.mutate(activityData);
  }, [isAuthenticated, logMutation]);
  
  // ========== QUICK LOG WRAPPERS ==========
  
  const trackProductView = useCallback((product) => {
    if (!isAuthenticated || !product) return;
    quickLog.productView(product);
  }, [isAuthenticated]);
  
  const trackAddToCart = useCallback((product, quantity = 1) => {
    if (!isAuthenticated || !product) return;
    quickLog.addToCart(product, quantity);
  }, [isAuthenticated]);
  
  const trackAddToWishlist = useCallback((product) => {
    if (!isAuthenticated || !product) return;
    quickLog.addToWishlist(product);
  }, [isAuthenticated]);
  
  const trackPurchase = useCallback((order) => {
    if (!isAuthenticated || !order) return;
    quickLog.purchase(order);
  }, [isAuthenticated]);
  
  const trackPostView = useCallback((post) => {
    if (!isAuthenticated || !post) return;
    quickLog.postView(post);
  }, [isAuthenticated]);
  
  const trackPostLike = useCallback((post) => {
    if (!isAuthenticated || !post) return;
    quickLog.postLike(post);
  }, [isAuthenticated]);
  
  const trackPostComment = useCallback((post, comment) => {
    if (!isAuthenticated || !post) return;
    quickLog.postComment(post, comment);
  }, [isAuthenticated]);
  
  const trackSearch = useCallback((query, resultsCount = 0) => {
    if (!isAuthenticated || !query) return;
    quickLog.search(query, resultsCount);
  }, [isAuthenticated]);
  
  const trackCategoryBrowse = useCallback((category) => {
    if (!isAuthenticated || !category) return;
    quickLog.categoryBrowse(category);
  }, [isAuthenticated]);
  
  const trackFollow = useCallback((targetUser) => {
    if (!isAuthenticated || !targetUser) return;
    quickLog.follow(targetUser);
  }, [isAuthenticated]);
  
  const trackChatbotMessage = useCallback((message, intent) => {
    if (!isAuthenticated) return;
    quickLog.chatbotMessage(message, intent);
  }, [isAuthenticated]);
  
  // ========== RETURN ==========
  
  return {
    // Profile data
    profile: profileQuery.data,
    isLoadingProfile: profileQuery.isLoading,
    profileError: profileQuery.error,
    
    // Personalization context (for chatbot)
    context: contextQuery.data,
    isLoadingContext: contextQuery.isLoading,
    
    // Generic log function
    logActivity,
    isLogging: logMutation.isPending,
    
    // Quick tracking functions
    trackProductView,
    trackAddToCart,
    trackAddToWishlist,
    trackPurchase,
    trackPostView,
    trackPostLike,
    trackPostComment,
    trackSearch,
    trackCategoryBrowse,
    trackFollow,
    trackChatbotMessage,
    
    // Refresh functions
    refreshProfile: () => queryClient.invalidateQueries({ queryKey: ['ai-profile'] }),
    refreshContext: () => queryClient.invalidateQueries({ queryKey: ['ai-context'] }),
    
    // Constants for custom events
    EventTypes: ActivityEventTypes,
    TargetTypes
  };
}

// ========== SPECIALIZED HOOKS ==========

/**
 * Hook chỉ để tracking (không cần profile data)
 * Nhẹ hơn, dùng cho các component chỉ cần log activity
 */
export function useActivityTracker() {
  const { isAuthenticated } = useAuth();
  const lastLoggedRef = useRef({});
  
  const track = useCallback((eventType, targetType, data = {}) => {
    if (!isAuthenticated) return;
    
    const key = `${eventType}_${data.target_id || data.target_name || ''}`;
    const now = Date.now();
    
    if (lastLoggedRef.current[key] && now - lastLoggedRef.current[key] < 1000) {
      return;
    }
    
    lastLoggedRef.current[key] = now;
    
    aiPersonalizationAPI.logActivity({
      event_type: eventType,
      target_type: targetType,
      ...data
    });
  }, [isAuthenticated]);
  
  return { track, EventTypes: ActivityEventTypes, TargetTypes };
}

/**
 * Hook để lấy context cá nhân hóa cho AI/Chatbot
 */
export function usePersonalizationContext(email) {
  return useQuery({
    queryKey: ['ai-context', email],
    queryFn: async () => {
      if (!email) return null;
      const result = await aiPersonalizationAPI.getPersonalizationContext(email);
      if (!result.success) return null;
      return result.data;
    },
    enabled: !!email,
    staleTime: 5 * 60 * 1000
  });
}

/**
 * Hook để admin xem profile AI của user khác
 */
export function useUserAIProfile(email) {
  return useQuery({
    queryKey: ['ai-profile', email],
    queryFn: async () => {
      if (!email) return null;
      const result = await aiPersonalizationAPI.getProfileByEmail(email);
      if (!result.success) return null;
      return result.data;
    },
    enabled: !!email,
    staleTime: 30 * 1000
  });
}

export default useAIPersonalization;