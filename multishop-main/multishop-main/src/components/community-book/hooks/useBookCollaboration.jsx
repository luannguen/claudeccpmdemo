/**
 * useBookCollaboration Hook
 * Manages collaboration, invites, and permissions
 */

import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contributorRepository } from '../data/contributorRepository';
import { bookRepository } from '../data/bookRepository';
import { 
  canInviteToBook, 
  canChangeRole, 
  canRemoveContributor,
  getInvitableRoles,
  validateInvite,
  isActiveContributor
} from '../domain/contributorRules';
import { useToast } from '@/components/NotificationToast';

export function useBookCollaboration(bookId, currentUser) {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  // Fetch book
  const { data: book } = useQuery({
    queryKey: ['book', bookId],
    queryFn: () => bookRepository.getById(bookId),
    enabled: !!bookId,
    staleTime: 60 * 1000
  });

  // Fetch contributors
  const { 
    data: contributors = [], 
    isLoading: isLoadingContributors 
  } = useQuery({
    queryKey: ['book-contributors', bookId],
    queryFn: () => contributorRepository.listByBook(bookId),
    enabled: !!bookId,
    staleTime: 30 * 1000
  });

  // Get current user's role
  const currentUserContributor = useMemo(() => {
    if (!currentUser?.email) return null;
    
    // Owner check
    if (book?.author_email === currentUser.email) {
      return { role: 'owner', status: 'accepted', permissions: { 
        can_add_chapter: true,
        can_edit_chapter: true,
        can_delete_chapter: true,
        can_publish_chapter: true,
        can_invite_others: true,
        can_edit_book_settings: true
      }};
    }
    
    return contributors.find(c => 
      c.user_email === currentUser.email && c.status === 'accepted'
    );
  }, [book, contributors, currentUser]);

  const currentUserRole = currentUserContributor?.role || null;
  const currentUserPermissions = currentUserContributor?.permissions || {};

  // Active contributors only
  const activeContributors = useMemo(() => 
    contributors.filter(isActiveContributor),
    [contributors]
  );

  // Pending invites
  const pendingInvites = useMemo(() => 
    contributors.filter(c => c.status === 'pending'),
    [contributors]
  );

  // Permission checks
  const canInvite = useMemo(() => 
    canInviteToBook(book, currentUser?.email, currentUserRole),
    [book, currentUser, currentUserRole]
  );

  const invitableRoles = useMemo(() => 
    getInvitableRoles(currentUserRole || 'viewer'),
    [currentUserRole]
  );

  // Invite mutation
  const inviteMutation = useMutation({
    mutationFn: async ({ email, name, avatar, role, note }) => {
      const validation = validateInvite({ email, role });
      if (!validation.isValid) {
        throw new Error(validation.errors[0].message);
      }
      
      return await contributorRepository.invite(
        bookId,
        { email, name, avatar },
        currentUser.email,
        role,
        note
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['book-contributors', bookId] });
      addToast('Đã gửi lời mời!', 'success');
    },
    onError: (error) => {
      addToast(error.message || 'Không thể gửi lời mời', 'error');
    }
  });

  // Accept invite mutation
  const acceptInviteMutation = useMutation({
    mutationFn: (contributorId) => contributorRepository.accept(contributorId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['book-contributors', bookId] });
      queryClient.invalidateQueries({ queryKey: ['pending-invites'] });
      addToast('Đã chấp nhận lời mời!', 'success');
    },
    onError: () => {
      addToast('Không thể chấp nhận lời mời', 'error');
    }
  });

  // Reject invite mutation
  const rejectInviteMutation = useMutation({
    mutationFn: (contributorId) => contributorRepository.reject(contributorId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['book-contributors', bookId] });
      queryClient.invalidateQueries({ queryKey: ['pending-invites'] });
      addToast('Đã từ chối lời mời', 'info');
    }
  });

  // Remove contributor mutation
  const removeMutation = useMutation({
    mutationFn: (contributorId) => contributorRepository.remove(contributorId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['book-contributors', bookId] });
      addToast('Đã xóa người đóng góp', 'success');
    },
    onError: () => {
      addToast('Không thể xóa', 'error');
    }
  });

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: ({ contributorId, newRole }) => 
      contributorRepository.updateRole(contributorId, newRole),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['book-contributors', bookId] });
      addToast('Đã cập nhật vai trò', 'success');
    }
  });

  // Handlers
  const handleInvite = useCallback(async (data) => {
    if (!canInvite) {
      addToast('Bạn không có quyền mời', 'error');
      return null;
    }
    return await inviteMutation.mutateAsync(data);
  }, [canInvite, inviteMutation, addToast]);

  const handleAcceptInvite = useCallback((contributorId) => {
    acceptInviteMutation.mutate(contributorId);
  }, [acceptInviteMutation]);

  const handleRejectInvite = useCallback((contributorId) => {
    rejectInviteMutation.mutate(contributorId);
  }, [rejectInviteMutation]);

  const handleRemoveContributor = useCallback((contributor) => {
    if (!canRemoveContributor(currentUserRole, contributor.role)) {
      addToast('Bạn không có quyền xóa người này', 'error');
      return;
    }
    removeMutation.mutate(contributor.id);
  }, [currentUserRole, removeMutation, addToast]);

  const handleChangeRole = useCallback((contributor, newRole) => {
    if (!canChangeRole(currentUserRole, contributor.role, newRole)) {
      addToast('Bạn không có quyền thay đổi vai trò này', 'error');
      return;
    }
    updateRoleMutation.mutate({ contributorId: contributor.id, newRole });
  }, [currentUserRole, updateRoleMutation, addToast]);

  const hasPermission = useCallback((permission) => {
    return currentUserPermissions[permission] === true;
  }, [currentUserPermissions]);

  return {
    // Data
    book,
    contributors: activeContributors,
    pendingInvites,
    allContributors: contributors,
    
    // Current user context
    currentUserRole,
    currentUserPermissions,
    isOwner: book?.author_email === currentUser?.email,
    
    // Permissions
    canInvite,
    invitableRoles,
    hasPermission,
    
    // Loading states
    isLoading: isLoadingContributors,
    isInviting: inviteMutation.isPending,
    isAccepting: acceptInviteMutation.isPending,
    isRejecting: rejectInviteMutation.isPending,
    isRemoving: removeMutation.isPending,
    
    // Handlers
    handleInvite,
    handleAcceptInvite,
    handleRejectInvite,
    handleRemoveContributor,
    handleChangeRole
  };
}

/**
 * Hook for user's pending invitations
 */
export function usePendingInvites(userEmail) {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const { data: pendingInvites = [], isLoading } = useQuery({
    queryKey: ['pending-invites', userEmail],
    queryFn: () => contributorRepository.listPendingForUser(userEmail),
    enabled: !!userEmail,
    staleTime: 30 * 1000
  });

  const acceptMutation = useMutation({
    mutationFn: (contributorId) => contributorRepository.accept(contributorId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-invites'] });
      addToast('Đã chấp nhận lời mời!', 'success');
    }
  });

  const rejectMutation = useMutation({
    mutationFn: (contributorId) => contributorRepository.reject(contributorId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-invites'] });
      addToast('Đã từ chối lời mời', 'info');
    }
  });

  return {
    pendingInvites,
    pendingCount: pendingInvites.length,
    isLoading,
    handleAccept: (id) => acceptMutation.mutate(id),
    handleReject: (id) => rejectMutation.mutate(id),
    isAccepting: acceptMutation.isPending,
    isRejecting: rejectMutation.isPending
  };
}

export default useBookCollaboration;