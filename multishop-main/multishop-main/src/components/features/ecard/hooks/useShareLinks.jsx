/**
 * useShareLinks - Hook for managing share links
 * Feature Logic Layer - Orchestrates domain + data
 * 
 * @module features/ecard/hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/components/AuthProvider';
import { shareLinkRepository } from '../data/shareLinkRepository';

const QUERY_KEY = 'share-links';

/**
 * Hook for managing share links
 */
export function useShareLinks(profileId = null) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Fetch links
  const {
    data: links = [],
    isLoading,
    error
  } = useQuery({
    queryKey: [QUERY_KEY, user?.email, profileId],
    queryFn: () => profileId 
      ? shareLinkRepository.getProfileShareLinks(profileId)
      : shareLinkRepository.getShareLinks(user?.email),
    enabled: !!user?.email,
    staleTime: 60 * 1000 // 1 minute
  });
  
  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data) => shareLinkRepository.createShareLink({
      ...data,
      user_email: user?.email
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    }
  });
  
  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => shareLinkRepository.updateShareLink(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    }
  });
  
  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => shareLinkRepository.deleteShareLink(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    }
  });
  
  // Build short URL from code
  const buildShortUrl = (shortCode) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/s/${shortCode}`;
  };
  
  return {
    links,
    isLoading,
    error,
    
    // Actions
    createLink: createMutation.mutateAsync,
    updateLink: updateMutation.mutateAsync,
    deleteLink: deleteMutation.mutateAsync,
    
    // Helpers
    buildShortUrl,
    
    // Loading states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending
  };
}

/**
 * Hook for share link analytics
 */
export function useShareLinkAnalytics() {
  const { user } = useAuth();
  
  const { data: analytics, isLoading } = useQuery({
    queryKey: [QUERY_KEY, 'analytics', user?.email],
    queryFn: () => shareLinkRepository.getLinkAnalytics(user?.email),
    enabled: !!user?.email,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
  
  return {
    analytics: analytics || {
      totalLinks: 0,
      activeLinks: 0,
      totalClicks: 0,
      totalUniqueClicks: 0,
      sourceBreakdown: {},
      topLinks: []
    },
    isLoading
  };
}

export default useShareLinks;