/**
 * useBookReviews Hook
 * Manages book reviews
 */

import { useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookReviewRepository } from '../data/bookReviewRepository';
import { userInteractionRepository } from '../data/userInteractionRepository';
import { useToast } from '@/components/NotificationToast';

export function useBookReviews(bookId, currentUser) {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const userEmail = currentUser?.email;

  // Fetch reviews
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['book-reviews', bookId],
    queryFn: () => bookReviewRepository.listByBook(bookId),
    enabled: !!bookId,
    staleTime: 30 * 1000
  });

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ['book-review-stats', bookId],
    queryFn: () => bookReviewRepository.getBookStats(bookId),
    enabled: !!bookId,
    staleTime: 60 * 1000
  });

  // Fetch user's review
  const { data: myReview } = useQuery({
    queryKey: ['my-book-review', bookId, userEmail],
    queryFn: () => bookReviewRepository.getUserReview(bookId, userEmail),
    enabled: !!bookId && !!userEmail,
    staleTime: 30 * 1000
  });

  // Check if user is verified reader (completed the book)
  const { data: userInteraction } = useQuery({
    queryKey: ['book-interaction', bookId, userEmail],
    queryFn: () => userInteractionRepository.getByBookAndUser(bookId, userEmail),
    enabled: !!bookId && !!userEmail
  });

  const isVerifiedReader = useMemo(() => {
    return userInteraction?.reading_status === 'completed';
  }, [userInteraction]);

  // Create review mutation
  const createMutation = useMutation({
    mutationFn: (data) => bookReviewRepository.create(data, currentUser, isVerifiedReader),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['book-reviews', bookId] });
      queryClient.invalidateQueries({ queryKey: ['book-review-stats', bookId] });
      queryClient.invalidateQueries({ queryKey: ['my-book-review', bookId, userEmail] });
      // Update book rating
      await bookReviewRepository.updateBookRating(bookId);
      addToast('Đã gửi đánh giá', 'success');
    },
    onError: () => {
      addToast('Không thể gửi đánh giá', 'error');
    }
  });

  // Delete review mutation
  const deleteMutation = useMutation({
    mutationFn: (reviewId) => bookReviewRepository.delete(reviewId),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['book-reviews', bookId] });
      queryClient.invalidateQueries({ queryKey: ['book-review-stats', bookId] });
      queryClient.invalidateQueries({ queryKey: ['my-book-review', bookId, userEmail] });
      await bookReviewRepository.updateBookRating(bookId);
      addToast('Đã xóa đánh giá', 'success');
    }
  });

  // Toggle like mutation
  const likeMutation = useMutation({
    mutationFn: (reviewId) => bookReviewRepository.toggleLike(reviewId, userEmail),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['book-reviews', bookId] });
    }
  });

  // Handlers
  const submitReview = useCallback((data) => {
    if (!userEmail) {
      addToast('Vui lòng đăng nhập để đánh giá', 'warning');
      return;
    }
    return createMutation.mutateAsync({ ...data, book_id: bookId });
  }, [userEmail, bookId, createMutation, addToast]);

  const deleteReview = useCallback((reviewId) => {
    return deleteMutation.mutateAsync(reviewId);
  }, [deleteMutation]);

  const toggleLike = useCallback((reviewId) => {
    if (!userEmail) {
      addToast('Vui lòng đăng nhập', 'warning');
      return;
    }
    return likeMutation.mutateAsync(reviewId);
  }, [userEmail, likeMutation, addToast]);

  const isLiked = useCallback((review) => {
    return review.liked_by?.includes(userEmail);
  }, [userEmail]);

  const canReview = useMemo(() => {
    return !!userEmail && !myReview;
  }, [userEmail, myReview]);

  return {
    // Data
    reviews,
    stats: stats || { average: 0, count: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
    myReview,
    isLoading,

    // Helpers
    isVerifiedReader,
    canReview,
    isLiked,

    // Actions
    submitReview,
    deleteReview,
    toggleLike,

    // Status
    isSubmitting: createMutation.isPending
  };
}

export default useBookReviews;