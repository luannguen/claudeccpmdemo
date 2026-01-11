/**
 * useChapterComments Hook
 * Manages chapter comments
 */

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chapterCommentRepository } from '../data/chapterCommentRepository';
import { useToast } from '@/components/NotificationToast';

export function useChapterComments(chapterId, bookId, currentUser, bookAuthorEmail) {
  const [replyingTo, setReplyingTo] = useState(null);
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const userEmail = currentUser?.email;

  // Fetch comments
  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['chapter-comments', chapterId],
    queryFn: () => chapterCommentRepository.listByChapter(chapterId),
    enabled: !!chapterId,
    staleTime: 30 * 1000
  });

  // Create comment mutation
  const createMutation = useMutation({
    mutationFn: (data) => chapterCommentRepository.create({
      chapter_id: chapterId,
      book_id: bookId,
      ...data,
      is_author_reply: userEmail === bookAuthorEmail
    }, currentUser),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chapter-comments', chapterId] });
      setReplyingTo(null);
      addToast('Đã gửi bình luận', 'success');
    },
    onError: () => {
      addToast('Không thể gửi bình luận', 'error');
    }
  });

  // Delete comment mutation
  const deleteMutation = useMutation({
    mutationFn: (commentId) => chapterCommentRepository.delete(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chapter-comments', chapterId] });
      addToast('Đã xóa bình luận', 'success');
    },
    onError: () => {
      addToast('Không thể xóa bình luận', 'error');
    }
  });

  // Toggle like mutation
  const likeMutation = useMutation({
    mutationFn: (commentId) => chapterCommentRepository.toggleLike(commentId, userEmail),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chapter-comments', chapterId] });
    }
  });

  // Handlers
  const addComment = useCallback((content) => {
    if (!userEmail) {
      addToast('Vui lòng đăng nhập để bình luận', 'warning');
      return;
    }
    createMutation.mutate({ content });
  }, [userEmail, createMutation, addToast]);

  const addReply = useCallback((parentCommentId, content) => {
    if (!userEmail) {
      addToast('Vui lòng đăng nhập để trả lời', 'warning');
      return;
    }
    createMutation.mutate({ content, parent_comment_id: parentCommentId });
  }, [userEmail, createMutation, addToast]);

  const deleteComment = useCallback((commentId) => {
    deleteMutation.mutate(commentId);
  }, [deleteMutation]);

  const toggleLike = useCallback((commentId) => {
    if (!userEmail) {
      addToast('Vui lòng đăng nhập', 'warning');
      return;
    }
    likeMutation.mutate(commentId);
  }, [userEmail, likeMutation, addToast]);

  const isLiked = useCallback((comment) => {
    return comment.liked_by?.includes(userEmail);
  }, [userEmail]);

  const canDelete = useCallback((comment) => {
    return userEmail === comment.author_email || userEmail === bookAuthorEmail;
  }, [userEmail, bookAuthorEmail]);

  return {
    // Data
    comments,
    isLoading,
    replyingTo,
    
    // Actions
    addComment,
    addReply,
    deleteComment,
    toggleLike,
    setReplyingTo,
    
    // Helpers
    isLiked,
    canDelete,
    
    // Status
    isSubmitting: createMutation.isPending,
    isDeleting: deleteMutation.isPending
  };
}

export default useChapterComments;