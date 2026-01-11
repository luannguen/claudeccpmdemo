/**
 * useConnectionRecommendations - Hook for connection recommendations
 * Feature Logic Layer - Orchestrates domain + data
 * 
 * @module features/ecard/hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/components/AuthProvider';
import { recommendationRepository } from '../data/recommendationRepository';

const QUERY_KEY = 'connection-recommendations';

/**
 * Hook for managing connection recommendations
 */
export function useConnectionRecommendations() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Fetch recommendations
  const {
    data: recommendations = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: [QUERY_KEY, user?.email],
    queryFn: () => recommendationRepository.getRecommendations(user?.email, 10),
    enabled: !!user?.email,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  });
  
  // Dismiss mutation
  const dismissMutation = useMutation({
    mutationFn: (id) => recommendationRepository.dismissRecommendation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    }
  });
  
  // Accept mutation
  const acceptMutation = useMutation({
    mutationFn: (id) => recommendationRepository.acceptRecommendation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    }
  });
  
  return {
    recommendations,
    isLoading,
    error,
    
    // Actions
    dismiss: dismissMutation.mutateAsync,
    accept: acceptMutation.mutateAsync,
    refresh: refetch,
    
    // Loading states
    isDismissing: dismissMutation.isPending,
    isAccepting: acceptMutation.isPending
  };
}

/**
 * Hook for generating recommendations (admin/background use)
 */
export function useGenerateRecommendations() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const generateMutation = useMutation({
    mutationFn: async ({ userProfile, existingConnectionIds }) => {
      return recommendationRepository.generateRecommendations(
        user?.id,
        user?.email,
        userProfile,
        existingConnectionIds
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    }
  });
  
  return {
    generate: generateMutation.mutateAsync,
    isGenerating: generateMutation.isPending,
    error: generateMutation.error
  };
}

/**
 * Hook for recommendation stats
 */
export function useRecommendationStats() {
  const { user } = useAuth();
  
  const { data: stats, isLoading } = useQuery({
    queryKey: [QUERY_KEY, 'stats', user?.email],
    queryFn: () => recommendationRepository.getRecommendationStats(user?.email),
    enabled: !!user?.email,
    staleTime: 10 * 60 * 1000 // 10 minutes
  });
  
  return {
    stats: stats || { total: 0, pending: 0, accepted: 0, dismissed: 0 },
    isLoading
  };
}

export default useConnectionRecommendations;