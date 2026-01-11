/**
 * useAuthorFollow Hook
 * Manages author following
 */

import { useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authorFollowRepository } from '../data/authorFollowRepository';
import { useToast } from '@/components/NotificationToast';

export function useAuthorFollow(currentUser) {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const userEmail = currentUser?.email;

  // Fetch followed authors
  const { data: followedAuthors = [], isLoading } = useQuery({
    queryKey: ['followed-authors', userEmail],
    queryFn: () => authorFollowRepository.getFollowedAuthors(userEmail),
    enabled: !!userEmail,
    staleTime: 60 * 1000
  });

  // Follow mutation
  const followMutation = useMutation({
    mutationFn: (author) => authorFollowRepository.follow(userEmail, author),
    onSuccess: (_, author) => {
      queryClient.invalidateQueries({ queryKey: ['followed-authors', userEmail] });
      queryClient.invalidateQueries({ queryKey: ['author-follow-status'] });
      addToast(`Đã theo dõi ${author.name || author.full_name}`, 'success');
    },
    onError: () => {
      addToast('Không thể theo dõi tác giả', 'error');
    }
  });

  // Unfollow mutation
  const unfollowMutation = useMutation({
    mutationFn: (authorEmail) => authorFollowRepository.unfollow(userEmail, authorEmail),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followed-authors', userEmail] });
      queryClient.invalidateQueries({ queryKey: ['author-follow-status'] });
      addToast('Đã hủy theo dõi', 'success');
    }
  });

  // Follow/Unfollow handler
  const toggleFollow = useCallback(async (author) => {
    if (!userEmail) {
      addToast('Vui lòng đăng nhập để theo dõi', 'warning');
      return;
    }

    const isCurrentlyFollowing = followedAuthors.some(
      f => f.author_email === author.email
    );

    if (isCurrentlyFollowing) {
      await unfollowMutation.mutateAsync(author.email);
    } else {
      await followMutation.mutateAsync(author);
    }
  }, [userEmail, followedAuthors, followMutation, unfollowMutation, addToast]);

  // Check if following
  const isFollowing = useCallback((authorEmail) => {
    return followedAuthors.some(f => f.author_email === authorEmail);
  }, [followedAuthors]);

  // Get followed author emails for filtering
  const followedAuthorEmails = useMemo(() => {
    return followedAuthors.map(f => f.author_email);
  }, [followedAuthors]);

  return {
    followedAuthors,
    followedAuthorEmails,
    isLoading,
    toggleFollow,
    isFollowing,
    isToggling: followMutation.isPending || unfollowMutation.isPending
  };
}

/**
 * Hook to check single author follow status
 */
export function useAuthorFollowStatus(authorEmail, currentUser) {
  const userEmail = currentUser?.email;

  const { data: followStatus } = useQuery({
    queryKey: ['author-follow-status', userEmail, authorEmail],
    queryFn: () => authorFollowRepository.isFollowing(userEmail, authorEmail),
    enabled: !!userEmail && !!authorEmail,
    staleTime: 60 * 1000
  });

  const { data: followerCount = 0 } = useQuery({
    queryKey: ['author-follower-count', authorEmail],
    queryFn: () => authorFollowRepository.getFollowerCount(authorEmail),
    enabled: !!authorEmail,
    staleTime: 5 * 60 * 1000
  });

  return {
    isFollowing: !!followStatus,
    followerCount
  };
}

export default useAuthorFollow;