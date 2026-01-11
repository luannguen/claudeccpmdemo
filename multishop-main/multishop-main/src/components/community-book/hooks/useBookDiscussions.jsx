/**
 * useBookDiscussions Hook
 * Manages book discussions
 */

import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { discussionRepository } from '../data/discussionRepository';
import { useToast } from '@/components/NotificationToast';

export function useBookDiscussions(bookId, currentUser, bookAuthorEmail = null) {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const userEmail = currentUser?.email;

  const [activeDiscussionId, setActiveDiscussionId] = useState(null);

  // Fetch discussions
  const { data: discussions = [], isLoading } = useQuery({
    queryKey: ['book-discussions', bookId],
    queryFn: () => discussionRepository.listByBook(bookId),
    enabled: !!bookId,
    staleTime: 30 * 1000
  });

  // Fetch active discussion details with replies
  const { data: activeDiscussion } = useQuery({
    queryKey: ['discussion', activeDiscussionId],
    queryFn: () => discussionRepository.getById(activeDiscussionId),
    enabled: !!activeDiscussionId,
    staleTime: 30 * 1000
  });

  const { data: replies = [] } = useQuery({
    queryKey: ['discussion-replies', activeDiscussionId],
    queryFn: () => discussionRepository.listReplies(activeDiscussionId),
    enabled: !!activeDiscussionId,
    staleTime: 30 * 1000
  });

  // Is current user the book author?
  const isBookAuthor = useMemo(() => {
    return userEmail && bookAuthorEmail && userEmail === bookAuthorEmail;
  }, [userEmail, bookAuthorEmail]);

  // Create discussion mutation
  const createMutation = useMutation({
    mutationFn: (data) => discussionRepository.create({ ...data, book_id: bookId }, currentUser),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['book-discussions', bookId] });
      addToast('Đã tạo thảo luận mới', 'success');
    },
    onError: () => {
      addToast('Không thể tạo thảo luận', 'error');
    }
  });

  // Toggle like mutation
  const likeMutation = useMutation({
    mutationFn: (discussionId) => discussionRepository.toggleLike(discussionId, userEmail),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['book-discussions', bookId] });
      queryClient.invalidateQueries({ queryKey: ['discussion', activeDiscussionId] });
    }
  });

  // Create reply mutation
  const replyMutation = useMutation({
    mutationFn: (data) => discussionRepository.createReply(
      { ...data, book_id: bookId },
      currentUser,
      isBookAuthor
    ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discussion-replies', activeDiscussionId] });
      queryClient.invalidateQueries({ queryKey: ['discussion', activeDiscussionId] });
      queryClient.invalidateQueries({ queryKey: ['book-discussions', bookId] });
      addToast('Đã gửi phản hồi', 'success');
    }
  });

  // Delete discussion mutation
  const deleteMutation = useMutation({
    mutationFn: (discussionId) => discussionRepository.delete(discussionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['book-discussions', bookId] });
      setActiveDiscussionId(null);
      addToast('Đã xóa thảo luận', 'success');
    }
  });

  // Toggle like reply mutation
  const likeReplyMutation = useMutation({
    mutationFn: (replyId) => discussionRepository.toggleLikeReply(replyId, userEmail),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discussion-replies', activeDiscussionId] });
    }
  });

  // Handlers
  const createDiscussion = useCallback((data) => {
    if (!userEmail) {
      addToast('Vui lòng đăng nhập để thảo luận', 'warning');
      return;
    }
    return createMutation.mutateAsync(data);
  }, [userEmail, createMutation, addToast]);

  const toggleLike = useCallback((discussionId) => {
    if (!userEmail) return;
    return likeMutation.mutateAsync(discussionId);
  }, [userEmail, likeMutation]);

  const addReply = useCallback((content, parentReplyId = null) => {
    if (!userEmail) {
      addToast('Vui lòng đăng nhập để phản hồi', 'warning');
      return;
    }
    return replyMutation.mutateAsync({
      discussion_id: activeDiscussionId,
      content,
      parent_reply_id: parentReplyId
    });
  }, [userEmail, activeDiscussionId, replyMutation, addToast]);

  const deleteDiscussion = useCallback((discussionId) => {
    return deleteMutation.mutateAsync(discussionId);
  }, [deleteMutation]);

  const toggleLikeReply = useCallback((replyId) => {
    if (!userEmail) return;
    return likeReplyMutation.mutateAsync(replyId);
  }, [userEmail, likeReplyMutation]);

  // Helpers
  const isLiked = useCallback((discussion) => {
    return discussion.liked_by?.includes(userEmail);
  }, [userEmail]);

  const isReplyLiked = useCallback((reply) => {
    return reply.liked_by?.includes(userEmail);
  }, [userEmail]);

  const canDelete = useCallback((discussion) => {
    return userEmail && (
      discussion.author_email === userEmail || isBookAuthor
    );
  }, [userEmail, isBookAuthor]);

  const canManage = useCallback((discussion) => {
    return isBookAuthor || discussion.author_email === userEmail;
  }, [isBookAuthor, userEmail]);

  return {
    // Data
    discussions,
    activeDiscussion,
    activeDiscussionId,
    replies,
    isLoading,

    // Actions
    setActiveDiscussionId,
    createDiscussion,
    toggleLike,
    addReply,
    deleteDiscussion,
    toggleLikeReply,

    // Helpers
    isLiked,
    isReplyLiked,
    canDelete,
    canManage,
    isBookAuthor,

    // Status
    isCreating: createMutation.isPending,
    isReplying: replyMutation.isPending
  };
}

export default useBookDiscussions;