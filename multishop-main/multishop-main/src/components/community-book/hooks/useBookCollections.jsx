/**
 * useBookCollections Hook
 * Manages book collections
 */

import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collectionRepository } from '../data/collectionRepository';
import { bookRepository } from '../data/bookRepository';
import { useToast } from '@/components/NotificationToast';

export function useBookCollections(currentUser) {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const userEmail = currentUser?.email;

  // Fetch public collections
  const { data: publicCollections = [], isLoading: isLoadingPublic } = useQuery({
    queryKey: ['public-collections'],
    queryFn: () => collectionRepository.listPublic(20),
    staleTime: 60 * 1000
  });

  // Fetch featured collections
  const { data: featuredCollections = [] } = useQuery({
    queryKey: ['featured-collections'],
    queryFn: () => collectionRepository.listFeatured(6),
    staleTime: 60 * 1000
  });

  // Fetch user's collections
  const { data: myCollections = [], isLoading: isLoadingMy } = useQuery({
    queryKey: ['my-collections', userEmail],
    queryFn: () => collectionRepository.listByUser(userEmail),
    enabled: !!userEmail,
    staleTime: 30 * 1000
  });

  // Create collection mutation
  const createMutation = useMutation({
    mutationFn: (data) => collectionRepository.create(data, currentUser),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-collections', userEmail] });
      queryClient.invalidateQueries({ queryKey: ['public-collections'] });
      addToast('Đã tạo bộ sưu tập', 'success');
    },
    onError: () => {
      addToast('Không thể tạo bộ sưu tập', 'error');
    }
  });

  // Update collection mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => collectionRepository.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-collections', userEmail] });
      queryClient.invalidateQueries({ queryKey: ['public-collections'] });
      addToast('Đã cập nhật bộ sưu tập', 'success');
    }
  });

  // Delete collection mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => collectionRepository.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-collections', userEmail] });
      queryClient.invalidateQueries({ queryKey: ['public-collections'] });
      addToast('Đã xóa bộ sưu tập', 'success');
    }
  });

  // Add book to collection mutation
  const addBookMutation = useMutation({
    mutationFn: ({ collectionId, bookId }) => collectionRepository.addBook(collectionId, bookId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-collections', userEmail] });
      addToast('Đã thêm sách vào bộ sưu tập', 'success');
    }
  });

  // Toggle follow mutation
  const followMutation = useMutation({
    mutationFn: (collectionId) => collectionRepository.toggleFollow(collectionId, userEmail),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['public-collections'] });
      queryClient.invalidateQueries({ queryKey: ['featured-collections'] });
    }
  });

  // Handlers
  const createCollection = useCallback((data) => {
    if (!userEmail) {
      addToast('Vui lòng đăng nhập', 'warning');
      return;
    }
    return createMutation.mutateAsync(data);
  }, [userEmail, createMutation, addToast]);

  const updateCollection = useCallback((id, data) => {
    return updateMutation.mutateAsync({ id, data });
  }, [updateMutation]);

  const deleteCollection = useCallback((id) => {
    return deleteMutation.mutateAsync(id);
  }, [deleteMutation]);

  const addBookToCollection = useCallback((collectionId, bookId) => {
    return addBookMutation.mutateAsync({ collectionId, bookId });
  }, [addBookMutation]);

  const toggleFollow = useCallback((collectionId) => {
    if (!userEmail) {
      addToast('Vui lòng đăng nhập', 'warning');
      return;
    }
    return followMutation.mutateAsync(collectionId);
  }, [userEmail, followMutation, addToast]);

  const isFollowing = useCallback((collection) => {
    return collection.followed_by?.includes(userEmail);
  }, [userEmail]);

  return {
    // Data
    publicCollections,
    featuredCollections,
    myCollections,
    isLoading: isLoadingPublic || isLoadingMy,

    // Actions
    createCollection,
    updateCollection,
    deleteCollection,
    addBookToCollection,
    toggleFollow,

    // Helpers
    isFollowing,

    // Status
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending
  };
}

export default useBookCollections;