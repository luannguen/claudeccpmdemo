import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

/**
 * Hook to fetch all reviews
 */
export function useAdminReviewsData() {
  return useQuery({
    queryKey: ['admin-reviews'],
    queryFn: async () => {
      const result = await base44.entities.Review.list('-created_date', 500);
      return result || [];
    },
    staleTime: 0,
    refetchInterval: 30 * 1000,
  });
}

/**
 * Hook to calculate review statistics
 */
export function useReviewStats(reviews = []) {
  return useMemo(() => ({
    total: reviews.length,
    approved: reviews.filter(r => r.status === 'approved').length,
    pending: reviews.filter(r => r.status === 'pending').length,
    rejected: reviews.filter(r => r.status === 'rejected').length,
    verified: reviews.filter(r => r.verified_purchase).length,
    withPhotos: reviews.filter(r => (r.images?.length || 0) > 0).length,
    withVideos: reviews.filter(r => (r.videos?.length || 0) > 0).length,
    avgRating: reviews.length > 0 
      ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
      : 0
  }), [reviews]);
}

/**
 * Hook for review mutations (update, delete)
 */
export function useReviewMutations() {
  const queryClient = useQueryClient();
  const onSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
    queryClient.invalidateQueries({ queryKey: ['top-reviews'] });
  };

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Review.update(id, { status }),
    onSuccess,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Review.delete(id),
    onSuccess,
  });

  return { updateStatusMutation, deleteMutation };
}

/**
 * Hook to manage review page state (filters, modals)
 */
export function useAdminReviewsState() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [verifiedFilter, setVerifiedFilter] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);

  const filters = {
    searchTerm,
    statusFilter,
    ratingFilter,
    verifiedFilter,
  };

  const setters = {
    setSearchTerm,
    setStatusFilter,
    setRatingFilter,
    setVerifiedFilter,
  };

  return { filters, setters, selectedReview, setSelectedReview };
}

/**
 * Hook to filter reviews based on current state
 */
export function useFilteredReviews(reviews, filters) {
  const { searchTerm, statusFilter, ratingFilter, verifiedFilter } = filters;
  return useMemo(() => {
    return reviews.filter(review => {
      const matchesSearch = 
        review.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.comment?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || review.status === statusFilter;
      const matchesRating = ratingFilter === "all" || review.rating === parseInt(ratingFilter);
      const matchesVerified = !verifiedFilter || review.verified_purchase;
      return matchesSearch && matchesStatus && matchesRating && matchesVerified;
    });
  }, [reviews, searchTerm, statusFilter, ratingFilter, verifiedFilter]);
}