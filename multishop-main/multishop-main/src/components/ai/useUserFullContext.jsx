/**
 * useUserFullContext Hook
 * 
 * Provides complete user context for AI/Chatbot/Personalization
 * Combines real-time local data + entity data + AI profile
 * 
 * Architecture: Hook Layer (AI-CODING-RULES compliant)
 * 
 * @module useUserFullContext
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/components/AuthProvider';
import userContextAPI from '@/components/services/userContextService';

// ========== MAIN HOOK ==========

export function useUserFullContext(options = {}) {
  const { 
    enabled = true,
    refetchInterval = 30000, // 30s
    includeLocalData = true,
    includeEntityData = true,
    includeAIProfile = true
  } = options;

  const { user, isAuthenticated } = useAuth();
  const userEmail = user?.email;
  const queryClient = useQueryClient();

  // Local data (instant, no query needed)
  const [localData, setLocalData] = useState(() => ({
    cart: userContextAPI.getCartItems(),
    wishlist: userContextAPI.getWishlistItems()
  }));

  // Refresh local data on storage changes
  useEffect(() => {
    if (!includeLocalData) return;

    const handleStorage = () => {
      setLocalData({
        cart: userContextAPI.getCartItems(),
        wishlist: userContextAPI.getWishlistItems()
      });
    };

    // Listen for cart/wishlist updates
    window.addEventListener('storage', handleStorage);
    window.addEventListener('cart-updated', handleStorage);
    window.addEventListener('wishlist-updated', handleStorage);
    window.addEventListener('add-to-cart', handleStorage);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('cart-updated', handleStorage);
      window.removeEventListener('wishlist-updated', handleStorage);
      window.removeEventListener('add-to-cart', handleStorage);
    };
  }, [includeLocalData]);

  // Entity data (orders, profile, community)
  const { data: entityData, isLoading: entityLoading } = useQuery({
    queryKey: ['userEntityContext', userEmail],
    queryFn: async () => {
      if (!userEmail) return null;
      
      const [ordersResult, profileResult, communityResult] = await Promise.all([
        userContextAPI.getRecentOrders(userEmail, 5),
        userContextAPI.getUserProfile(userEmail),
        userContextAPI.getCommunityProfile(userEmail)
      ]);

      return {
        orders: ordersResult.success ? ordersResult.data : null,
        profile: profileResult.success ? profileResult.data : null,
        community: communityResult.success ? communityResult.data : null
      };
    },
    enabled: enabled && isAuthenticated && includeEntityData,
    staleTime: 60000, // 1 min
    refetchInterval
  });

  // AI Profile
  const { data: aiProfile, isLoading: aiLoading } = useQuery({
    queryKey: ['userAIProfile', userEmail],
    queryFn: async () => {
      if (!userEmail) return null;
      const result = await userContextAPI.getAIProfile(userEmail);
      return result.success ? result.data : null;
    },
    enabled: enabled && isAuthenticated && includeAIProfile,
    staleTime: 300000, // 5 min (AI profile changes less frequently)
  });

  // Refresh function
  const refresh = useCallback(() => {
    setLocalData({
      cart: userContextAPI.getCartItems(),
      wishlist: userContextAPI.getWishlistItems()
    });
    queryClient.invalidateQueries({ queryKey: ['userEntityContext', userEmail] });
    queryClient.invalidateQueries({ queryKey: ['userAIProfile', userEmail] });
  }, [queryClient, userEmail]);

  // Build context summary (token-efficient for LLM)
  const contextSummary = useMemo(() => {
    const parts = [];

    // Local data
    if (includeLocalData) {
      if (!localData.cart.isEmpty) {
        parts.push(`CART:${localData.cart.count}|${Math.round(localData.cart.total/1000)}k`);
      }
      if (!localData.wishlist.isEmpty) {
        parts.push(`WISH:${localData.wishlist.count}`);
      }
    }

    // Entity data
    if (includeEntityData && entityData) {
      if (entityData.orders?.count > 0) {
        parts.push(`ORD:${entityData.orders.count}|pend:${entityData.orders.pending_count}`);
      }
      if (entityData.community?.is_active) {
        parts.push(`COMM:${entityData.community.posts_count}p`);
      }
    }

    // AI Profile
    if (includeAIProfile && aiProfile) {
      parts.push(`AI:${aiProfile.segment}|${aiProfile.intent}`);
      if (aiProfile.persona && aiProfile.persona !== 'unknown') {
        parts.push(`PERSONA:${aiProfile.persona}`);
      }
    }

    return parts.length > 0 ? parts.join(' | ') : 'NEW_USER';
  }, [localData, entityData, aiProfile, includeLocalData, includeEntityData, includeAIProfile]);

  // Flags for quick checks
  const flags = useMemo(() => ({
    isAuthenticated,
    hasCart: !localData.cart.isEmpty,
    hasWishlist: !localData.wishlist.isEmpty,
    hasOrders: entityData?.orders?.count > 0,
    hasPendingOrders: entityData?.orders?.pending_count > 0,
    isCommunitylActive: entityData?.community?.is_active || false,
    hasAIProfile: !!aiProfile,
    isLoading: entityLoading || aiLoading
  }), [isAuthenticated, localData, entityData, aiProfile, entityLoading, aiLoading]);

  return {
    // User info
    user,
    userEmail,
    isAuthenticated,

    // Local data (instant)
    cart: localData.cart,
    wishlist: localData.wishlist,

    // Entity data (async)
    orders: entityData?.orders || null,
    profile: entityData?.profile || null,
    community: entityData?.community || null,

    // AI Profile
    aiProfile,

    // Computed
    contextSummary,
    flags,

    // Loading states
    isLoading: entityLoading || aiLoading,
    entityLoading,
    aiLoading,

    // Actions
    refresh
  };
}

// ========== SPECIALIZED HOOKS ==========

/**
 * Hook for just cart + wishlist (no API calls)
 */
export function useLocalUserData() {
  const [data, setData] = useState(() => ({
    cart: userContextAPI.getCartItems(),
    wishlist: userContextAPI.getWishlistItems()
  }));

  useEffect(() => {
    const handleUpdate = () => {
      setData({
        cart: userContextAPI.getCartItems(),
        wishlist: userContextAPI.getWishlistItems()
      });
    };

    window.addEventListener('storage', handleUpdate);
    window.addEventListener('cart-updated', handleUpdate);
    window.addEventListener('wishlist-updated', handleUpdate);
    window.addEventListener('add-to-cart', handleUpdate);

    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('cart-updated', handleUpdate);
      window.removeEventListener('wishlist-updated', handleUpdate);
      window.removeEventListener('add-to-cart', handleUpdate);
    };
  }, []);

  return data;
}

/**
 * Hook for AI-readable context only
 */
export function useAIContextSummary() {
  const { contextSummary, aiProfile, flags, isLoading } = useUserFullContext({
    includeLocalData: true,
    includeEntityData: true,
    includeAIProfile: true
  });

  return {
    summary: contextSummary,
    segment: aiProfile?.segment,
    persona: aiProfile?.persona,
    intent: aiProfile?.intent,
    flags,
    isLoading
  };
}

export default useUserFullContext;