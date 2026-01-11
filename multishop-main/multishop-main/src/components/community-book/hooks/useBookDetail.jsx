/**
 * useBookDetail Hook
 * Manages single book detail view state and operations
 */

import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookRepository } from '../data/bookRepository';
import { chapterRepository } from '../data/chapterRepository';
import { 
  canEditBook, 
  canDeleteBook, 
  canPublishBook, 
  canForkBook,
  canContributeToBook 
} from '../domain/bookRules';
import { sortChaptersByOrder } from '../domain/chapterRules';
import { useToast } from '@/components/NotificationToast';

export function useBookDetail(bookId, currentUser) {
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  // Fetch book
  const { 
    data: book, 
    isLoading: isLoadingBook,
    isError: isBookError 
  } = useQuery({
    queryKey: ['book', bookId],
    queryFn: () => bookRepository.getById(bookId),
    enabled: !!bookId,
    staleTime: 60 * 1000
  });

  // Fetch chapters
  const { 
    data: chapters = [], 
    isLoading: isLoadingChapters 
  } = useQuery({
    queryKey: ['book-chapters', bookId],
    queryFn: () => chapterRepository.listByBook(bookId),
    enabled: !!bookId,
    staleTime: 60 * 1000
  });

  // Sorted chapters
  const sortedChapters = sortChaptersByOrder(chapters);
  const activeChapter = sortedChapters[activeChapterIndex] || null;

  // Track view
  useEffect(() => {
    if (book && currentUser?.email) {
      bookRepository.incrementViews(book.id, book.views_count);
    }
  }, [book?.id, currentUser?.email]);

  // Permissions
  const permissions = {
    canEdit: canEditBook(book, currentUser?.email),
    canDelete: canDeleteBook(book, currentUser?.email),
    canPublish: canPublishBook(book, currentUser?.email),
    canFork: canForkBook(book, currentUser?.email),
    canContribute: canContributeToBook(book, currentUser?.email)
  };

  // Like book mutation
  const likeBookMutation = useMutation({
    mutationFn: () => 
      bookRepository.toggleLike(book.id, currentUser.email, book.liked_by || []),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['book', bookId] });
    }
  });

  // Delete book mutation
  const deleteBookMutation = useMutation({
    mutationFn: () => bookRepository.delete(bookId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-books'] });
      addToast('Đã xóa sách', 'success');
    },
    onError: () => {
      addToast('Không thể xóa sách', 'error');
    }
  });

  // Publish book mutation
  const publishBookMutation = useMutation({
    mutationFn: () => bookRepository.publish(bookId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['book', bookId] });
      queryClient.invalidateQueries({ queryKey: ['community-books'] });
      addToast('Đã xuất bản sách!', 'success');
    },
    onError: () => {
      addToast('Không thể xuất bản sách', 'error');
    }
  });

  // Fork book mutation
  const forkBookMutation = useMutation({
    mutationFn: async () => {
      const newBook = await bookRepository.fork(book, currentUser);
      // Clone all chapters
      await chapterRepository.cloneToBook(book.id, newBook.id, currentUser);
      return newBook;
    },
    onSuccess: (newBook) => {
      queryClient.invalidateQueries({ queryKey: ['community-books'] });
      addToast('Đã fork sách thành công!', 'success');
      return newBook;
    },
    onError: () => {
      addToast('Không thể fork sách', 'error');
    }
  });

  // Handlers
  const handleLike = useCallback(() => {
    if (!currentUser) return;
    likeBookMutation.mutate();
  }, [currentUser, likeBookMutation]);

  const handleDelete = useCallback(async () => {
    if (!permissions.canDelete) return;
    return await deleteBookMutation.mutateAsync();
  }, [permissions.canDelete, deleteBookMutation]);

  const handlePublish = useCallback(async () => {
    if (!permissions.canPublish) return;
    return await publishBookMutation.mutateAsync();
  }, [permissions.canPublish, publishBookMutation]);

  const handleFork = useCallback(async () => {
    if (!permissions.canFork) return;
    return await forkBookMutation.mutateAsync();
  }, [permissions.canFork, forkBookMutation]);

  const goToChapter = useCallback((index) => {
    if (index >= 0 && index < sortedChapters.length) {
      setActiveChapterIndex(index);
    }
  }, [sortedChapters.length]);

  const goToNextChapter = useCallback(() => {
    goToChapter(activeChapterIndex + 1);
  }, [activeChapterIndex, goToChapter]);

  const goToPrevChapter = useCallback(() => {
    goToChapter(activeChapterIndex - 1);
  }, [activeChapterIndex, goToChapter]);

  // Computed
  const isLiked = book?.liked_by?.includes(currentUser?.email);
  const isLoading = isLoadingBook || isLoadingChapters;
  const hasNextChapter = activeChapterIndex < sortedChapters.length - 1;
  const hasPrevChapter = activeChapterIndex > 0;

  return {
    // Data
    book,
    chapters: sortedChapters,
    activeChapter,
    activeChapterIndex,
    
    // Loading states
    isLoading,
    isBookError,
    isDeleting: deleteBookMutation.isPending,
    isPublishing: publishBookMutation.isPending,
    isForking: forkBookMutation.isPending,
    
    // Permissions
    permissions,
    
    // Computed
    isLiked,
    hasNextChapter,
    hasPrevChapter,
    
    // Handlers
    handleLike,
    handleDelete,
    handlePublish,
    handleFork,
    goToChapter,
    goToNextChapter,
    goToPrevChapter,
    setActiveChapterIndex
  };
}

export default useBookDetail;