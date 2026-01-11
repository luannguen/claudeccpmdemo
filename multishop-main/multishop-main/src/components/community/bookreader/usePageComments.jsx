/**
 * usePageComments Hook
 * Quản lý comments theo từng trang
 */

import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export function usePageComments(postId, totalPages) {
  const queryClient = useQueryClient();
  const [activePageComments, setActivePageComments] = useState(null);

  // Fetch all comments for post
  const { data: allComments = [], isLoading } = useQuery({
    queryKey: ['page-comments', postId],
    queryFn: async () => {
      const comments = await base44.entities.PostComment.filter({
        post_id: postId,
        status: 'active'
      });
      return comments;
    },
    enabled: !!postId
  });

  // Group comments by page
  const commentsByPage = useMemo(() => {
    const grouped = {};
    for (let i = 0; i < totalPages; i++) {
      grouped[i] = [];
    }

    allComments.forEach(comment => {
      const pageIndex = comment.page_index ?? 0; // Default to page 0 if not set
      if (grouped[pageIndex]) {
        grouped[pageIndex].push(comment);
      }
    });

    return grouped;
  }, [allComments, totalPages]);

  // Get comment count per page
  const getPageCommentCount = useCallback((pageIndex) => {
    return commentsByPage[pageIndex]?.length || 0;
  }, [commentsByPage]);

  // Get comments for specific page
  const getPageComments = useCallback((pageIndex) => {
    return commentsByPage[pageIndex] || [];
  }, [commentsByPage]);

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async ({ content, pageIndex, currentUser }) => {
      return base44.entities.PostComment.create({
        post_id: postId,
        content,
        page_index: pageIndex,
        author_name: currentUser?.full_name || 'Người dùng',
        author_avatar: currentUser?.avatar_url || '',
        status: 'active',
        likes_count: 0,
        liked_by: []
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['page-comments', postId]);
    }
  });

  // Add comment to specific page
  const addPageComment = useCallback(async (content, pageIndex, currentUser) => {
    if (!content.trim() || !currentUser) return null;
    return addCommentMutation.mutateAsync({ content, pageIndex, currentUser });
  }, [addCommentMutation]);

  // Toggle active page comments panel
  const togglePageComments = useCallback((pageIndex) => {
    setActivePageComments(prev => 
      prev === pageIndex ? null : pageIndex
    );
  }, []);

  return {
    commentsByPage,
    isLoading,
    getPageCommentCount,
    getPageComments,
    addPageComment,
    isAddingComment: addCommentMutation.isPending,
    activePageComments,
    togglePageComments,
    setActivePageComments
  };
}

export default usePageComments;