/**
 * usePortfolio - Hook for managing E-Card portfolios
 * Feature Logic Layer - State and orchestration
 * 
 * @module features/ecard/hooks
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { portfolioRepository } from '../data/portfolioRepository';
import { useAuth } from '@/components/AuthProvider';

const QUERY_KEYS = {
  list: (profileId) => ['ecard-portfolios', profileId],
  user: (email) => ['ecard-portfolios-user', email],
  detail: (id) => ['ecard-portfolio', id],
  featured: (profileId) => ['ecard-portfolios-featured', profileId],
  stats: (profileId) => ['ecard-portfolio-stats', profileId]
};

/**
 * Hook for listing portfolios by profile
 */
export function usePortfolioList(profileId, options = {}) {
  const { status = 'published' } = options;
  
  return useQuery({
    queryKey: [...QUERY_KEYS.list(profileId), status],
    queryFn: () => portfolioRepository.listByProfile(profileId, { status }),
    enabled: !!profileId,
    staleTime: 30 * 1000
  });
}

/**
 * Hook for managing user's own portfolios
 */
export function useMyPortfolios() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: QUERY_KEYS.user(user?.email),
    queryFn: () => portfolioRepository.listByUser(user?.email),
    enabled: !!user?.email,
    staleTime: 30 * 1000
  });

  const createMutation = useMutation({
    mutationFn: (data) => portfolioRepository.create({
      ...data,
      user_email: user.email
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.user(user?.email) });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => portfolioRepository.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.user(user?.email) });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => portfolioRepository.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.user(user?.email) });
    }
  });

  const reorderMutation = useMutation({
    mutationFn: (ids) => portfolioRepository.reorder(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.user(user?.email) });
    }
  });

  const toggleFeaturedMutation = useMutation({
    mutationFn: (id) => portfolioRepository.toggleFeatured(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.user(user?.email) });
    }
  });

  return {
    portfolios: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    
    // Mutations
    create: createMutation.mutateAsync,
    update: (id, data) => updateMutation.mutateAsync({ id, data }),
    delete: deleteMutation.mutateAsync,
    reorder: reorderMutation.mutateAsync,
    toggleFeatured: toggleFeaturedMutation.mutateAsync,
    
    // States
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending
  };
}

/**
 * Hook for featured portfolios (public view)
 */
export function useFeaturedPortfolios(profileId, limit = 3) {
  return useQuery({
    queryKey: [...QUERY_KEYS.featured(profileId), limit],
    queryFn: () => portfolioRepository.listFeatured(profileId, limit),
    enabled: !!profileId,
    staleTime: 60 * 1000
  });
}

/**
 * Hook for portfolio detail
 */
export function usePortfolioDetail(id) {
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: QUERY_KEYS.detail(id),
    queryFn: async () => {
      const item = await portfolioRepository.getById(id);
      if (item) {
        // Track view (async, don't wait)
        portfolioRepository.incrementView(id);
      }
      return item;
    },
    enabled: !!id,
    staleTime: 30 * 1000
  });

  const likeMutation = useMutation({
    mutationFn: (increment = true) => portfolioRepository.toggleLike(id, increment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.detail(id) });
    }
  });

  return {
    portfolio: query.data,
    isLoading: query.isLoading,
    like: () => likeMutation.mutateAsync(true),
    unlike: () => likeMutation.mutateAsync(false),
    isLiking: likeMutation.isPending
  };
}

/**
 * Hook for portfolio statistics
 */
export function usePortfolioStats(profileId) {
  return useQuery({
    queryKey: QUERY_KEYS.stats(profileId),
    queryFn: () => portfolioRepository.getStats(profileId),
    enabled: !!profileId,
    staleTime: 60 * 1000
  });
}