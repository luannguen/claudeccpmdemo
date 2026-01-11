/**
 * useReadingList Hook
 * Manages user's reading list
 */

import { useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userInteractionRepository, READING_STATUS, READING_STATUS_LABELS } from '../data/userInteractionRepository';
import { bookRepository } from '../data/bookRepository';
import { useToast } from '@/components/NotificationToast';

export { READING_STATUS, READING_STATUS_LABELS };

export function useReadingList(currentUser) {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const userEmail = currentUser?.email;

  // Fetch all user interactions
  const { data: allInteractions = [], isLoading } = useQuery({
    queryKey: ['reading-list', userEmail],
    queryFn: () => userInteractionRepository.getReadingList(userEmail),
    enabled: !!userEmail,
    staleTime: 60 * 1000
  });

  // Fetch book details for interactions
  const { data: booksMap = {} } = useQuery({
    queryKey: ['reading-list-books', allInteractions.map(i => i.book_id).join(',')],
    queryFn: async () => {
      if (allInteractions.length === 0) return {};
      
      const bookIds = [...new Set(allInteractions.map(i => i.book_id))];
      const books = await Promise.all(
        bookIds.map(id => bookRepository.getById(id).catch(() => null))
      );
      
      return books.reduce((acc, book) => {
        if (book) acc[book.id] = book;
        return acc;
      }, {});
    },
    enabled: allInteractions.length > 0,
    staleTime: 60 * 1000
  });

  // Group by status
  const readingLists = useMemo(() => {
    const lists = {
      [READING_STATUS.READING]: [],
      [READING_STATUS.WANT_TO_READ]: [],
      [READING_STATUS.COMPLETED]: [],
      [READING_STATUS.DROPPED]: []
    };

    allInteractions.forEach(interaction => {
      const book = booksMap[interaction.book_id];
      if (book && interaction.reading_status) {
        lists[interaction.reading_status]?.push({
          ...interaction,
          book
        });
      }
    });

    // Sort by last_read_at
    Object.keys(lists).forEach(status => {
      lists[status].sort((a, b) => 
        new Date(b.last_read_at || b.updated_date) - new Date(a.last_read_at || a.updated_date)
      );
    });

    return lists;
  }, [allInteractions, booksMap]);

  // Currently reading (top 5)
  const currentlyReading = useMemo(() => {
    return readingLists[READING_STATUS.READING].slice(0, 5);
  }, [readingLists]);

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ bookId, status }) => 
      userInteractionRepository.updateReadingStatus(bookId, userEmail, status),
    onSuccess: (_, { bookId, status }) => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ['reading-list', userEmail] });
      queryClient.invalidateQueries({ queryKey: ['book-interaction', bookId, userEmail] });
      queryClient.invalidateQueries({ queryKey: ['reading-progress', bookId, userEmail] });
      queryClient.invalidateQueries({ queryKey: ['book-highlights', bookId, userEmail] });
      
      if (status) {
        addToast(`Đã cập nhật trạng thái: ${READING_STATUS_LABELS[status]}`, 'success');
      } else {
        addToast('Đã xóa khỏi danh sách đọc', 'success');
      }
    },
    onError: () => {
      addToast('Không thể cập nhật trạng thái', 'error');
    }
  });

  // Handlers
  const addToReadingList = useCallback((bookId, status = READING_STATUS.WANT_TO_READ) => {
    if (!userEmail) {
      addToast('Vui lòng đăng nhập', 'warning');
      return;
    }
    updateStatusMutation.mutate({ bookId, status });
  }, [userEmail, updateStatusMutation, addToast]);

  const updateReadingStatus = useCallback((bookId, status) => {
    if (!userEmail) return;
    updateStatusMutation.mutate({ bookId, status });
  }, [userEmail, updateStatusMutation]);

  const removeFromList = useCallback((bookId) => {
    if (!userEmail) return;
    updateStatusMutation.mutate({ bookId, status: null });
  }, [userEmail, updateStatusMutation]);

  // Get status for a specific book
  const getBookStatus = useCallback((bookId) => {
    const interaction = allInteractions.find(i => i.book_id === bookId);
    return interaction?.reading_status || null;
  }, [allInteractions]);

  return {
    // Data
    readingLists,
    currentlyReading,
    allInteractions,
    isLoading,
    
    // Actions
    addToReadingList,
    updateReadingStatus,
    removeFromList,
    getBookStatus,
    
    // Status
    isUpdating: updateStatusMutation.isPending,
    
    // Constants
    READING_STATUS,
    READING_STATUS_LABELS
  };
}

export default useReadingList;