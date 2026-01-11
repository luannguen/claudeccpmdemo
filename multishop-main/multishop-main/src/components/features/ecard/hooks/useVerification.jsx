/**
 * useVerification Hook
 * Feature Layer - Orchestrates verification flow
 * 
 * @module features/ecard/hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/components/AuthProvider';
import { verificationRepository } from '../data/verificationRepository';

const STALE_TIME = 5 * 60 * 1000; // 5 minutes

/**
 * Hook for user verification requests
 */
export function useVerification(profileId) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Get user's requests
  const { data: myRequests = [], isLoading } = useQuery({
    queryKey: ['my-verification-requests', user?.email],
    queryFn: () => verificationRepository.getUserRequests(user?.email),
    enabled: !!user?.email,
    staleTime: STALE_TIME
  });
  
  // Request verification mutation
  const requestMutation = useMutation({
    mutationFn: (data) => verificationRepository.createRequest({
      ...data,
      profile_id: profileId,
      user_email: user?.email,
      user_name: user?.full_name
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-verification-requests'] });
    }
  });
  
  // Check if type is pending
  const hasPendingRequest = (type) => {
    return myRequests.some(r => r.type === type && r.status === 'pending');
  };
  
  // Check if type is verified
  const isVerified = (type) => {
    return myRequests.some(r => r.type === type && r.status === 'approved');
  };
  
  return {
    myRequests,
    isLoading,
    requestVerification: requestMutation.mutateAsync,
    isRequesting: requestMutation.isPending,
    hasPendingRequest,
    isVerified
  };
}

/**
 * Hook for admin verification management
 */
export function useAdminVerification() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Get pending requests
  const { data: pendingRequests = [], isLoading: loadingPending } = useQuery({
    queryKey: ['admin-verification-pending'],
    queryFn: () => verificationRepository.getPendingRequests(),
    staleTime: 30 * 1000 // 30 seconds for admin
  });
  
  // Get all requests
  const { data: allRequests = [], isLoading: loadingAll } = useQuery({
    queryKey: ['admin-verification-all'],
    queryFn: () => verificationRepository.getRequests(null, 200),
    staleTime: STALE_TIME
  });
  
  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: ({ requestId, notes }) => 
      verificationRepository.approveRequest(requestId, user?.email, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-verification'] });
      queryClient.invalidateQueries({ queryKey: ['ecard-profiles'] });
    }
  });
  
  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: ({ requestId, reason }) => 
      verificationRepository.rejectRequest(requestId, user?.email, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-verification'] });
    }
  });
  
  // Add badge directly
  const addBadgeMutation = useMutation({
    mutationFn: ({ profileId, badge }) => 
      verificationRepository.addBadge(profileId, badge, user?.email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ecard-profiles'] });
    }
  });
  
  // Remove badge
  const removeBadgeMutation = useMutation({
    mutationFn: ({ profileId, badge }) => 
      verificationRepository.removeBadge(profileId, badge),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ecard-profiles'] });
    }
  });
  
  return {
    pendingRequests,
    allRequests,
    isLoading: loadingPending || loadingAll,
    approveRequest: approveMutation.mutateAsync,
    rejectRequest: rejectMutation.mutateAsync,
    addBadge: addBadgeMutation.mutateAsync,
    removeBadge: removeBadgeMutation.mutateAsync,
    isProcessing: approveMutation.isPending || rejectMutation.isPending
  };
}

export default useVerification;