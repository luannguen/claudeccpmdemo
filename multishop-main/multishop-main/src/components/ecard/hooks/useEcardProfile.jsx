/**
 * Hook: useEcardProfile
 * Orchestrates E-Card profile operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/NotificationToast';
import * as ecardRepository from '../data/ecardRepository';

// Safe toast wrapper
const useSafeToast = () => {
  try {
    return useToast();
  } catch {
    return { addToast: () => {} };
  }
};

export function useEcardProfile() {
  const queryClient = useQueryClient();
  const { addToast } = useSafeToast();

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['ecardProfile'],
    queryFn: async () => {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) return null;
      
      const user = await base44.auth.me();
      if (!user) return null;
      
      return ecardRepository.getOrCreateProfile(user);
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000, // Keep in cache 10 minutes
    retry: false,
    throwOnError: false
  });

  const updateMutation = useMutation({
    mutationFn: ({ profileId, updates }) => 
      ecardRepository.updateProfile(profileId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ecardProfile'] });
      addToast('Đã cập nhật E-Card', 'success');
    },
    onError: () => {
      addToast('Không thể cập nhật E-Card', 'error');
    }
  });

  return {
    profile,
    isLoading,
    error,
    updateProfile: updateMutation.mutate,
    updateProfileAsync: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending
  };
}

export function usePublicEcardProfile(slug) {
  return useQuery({
    queryKey: ['publicEcardProfile', slug],
    queryFn: () => ecardRepository.getProfileBySlug(slug),
    enabled: !!slug,
    staleTime: 1 * 60 * 1000
  });
}

export function useEcardSearch(query) {
  return useQuery({
    queryKey: ['ecardSearch', query],
    queryFn: () => ecardRepository.searchProfiles(query),
    enabled: query.length >= 2,
    staleTime: 30 * 1000
  });
}