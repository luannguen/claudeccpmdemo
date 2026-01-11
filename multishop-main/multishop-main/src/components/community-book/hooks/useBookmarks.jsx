/**
 * useBookmarks Hook
 * Manages book and chapter bookmarks
 */

import { useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userInteractionRepository } from '../data/userInteractionRepository';
import { bookRepository } from '../data/bookRepository';
import { useToast } from '@/components/NotificationToast';

export function useBookmarks(currentUser, bookId = null) {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const userEmail = currentUser?.email;

  // Fetch user's bookmarked books
  const { data: bookmarkedInteractions = [], isLoading: isLoadingList } = useQuery({
    queryKey: ['bookmarked-books', userEmail],
    queryFn: () => userInteractionRepository.getBookmarkedBooks(userEmail),
    enabled: !!userEmail && !bookId,
    staleTime: 60 * 1000
  });

  // Fetch specific book interaction
  const { data: bookInteraction, isLoading: isLoadingBook } = useQuery({
    queryKey: ['book-interaction', bookId, userEmail],
    queryFn: () => userInteractionRepository.getByBookAndUser(bookId, userEmail),
    enabled: !!userEmail && !!bookId,
    staleTime: 30 * 1000
  });

  // Fetch book details for bookmarked list
  const { data: bookmarkedBooks = [] } = useQuery({
    queryKey: ['bookmarked-books-details', bookmarkedInteractions.map(i => i.book_id).join(',')],
    queryFn: async () => {
      if (bookmarkedInteractions.length === 0) return [];
      
      const books = await Promise.all(
        bookmarkedInteractions.map(async (interaction) => {
          const book = await bookRepository.getById(interaction.book_id).catch(() => null);
          return book ? { ...book, interaction } : null;
        })
      );
      
      return books.filter(Boolean);
    },
    enabled: bookmarkedInteractions.length > 0,
    staleTime: 60 * 1000
  });

  // Check if book is bookmarked
  const isBookBookmarked = useMemo(() => {
    if (bookId && bookInteraction) {
      return bookInteraction.is_bookmarked;
    }
    return bookmarkedInteractions.some(i => i.book_id === bookId);
  }, [bookId, bookInteraction, bookmarkedInteractions]);

  // Check if chapter is bookmarked
  const isChapterBookmarked = useCallback((chapterId) => {
    if (!bookInteraction) return false;
    return bookInteraction.bookmarked_chapters?.some(b => b.chapter_id === chapterId);
  }, [bookInteraction]);

  // Get bookmarked chapters for current book
  const bookmarkedChapters = useMemo(() => {
    return bookInteraction?.bookmarked_chapters || [];
  }, [bookInteraction]);

  // Toggle book bookmark mutation
  const toggleBookMutation = useMutation({
    mutationFn: (targetBookId) => 
      userInteractionRepository.toggleBookmark(targetBookId, userEmail),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['bookmarked-books', userEmail] });
      queryClient.invalidateQueries({ queryKey: ['book-interaction', bookId, userEmail] });
      addToast(
        result.is_bookmarked ? 'Đã thêm vào danh sách yêu thích' : 'Đã bỏ khỏi danh sách yêu thích',
        'success'
      );
    },
    onError: () => {
      addToast('Không thể cập nhật bookmark', 'error');
    }
  });

  // Toggle chapter bookmark mutation
  const toggleChapterMutation = useMutation({
    mutationFn: ({ chapterId, chapterTitle, note }) =>
      userInteractionRepository.bookmarkChapter(bookId, userEmail, chapterId, chapterTitle, note),
    onSuccess: (result, { chapterId }) => {
      queryClient.invalidateQueries({ queryKey: ['book-interaction', bookId, userEmail] });
      const isNowBookmarked = result.bookmarked_chapters?.some(b => b.chapter_id === chapterId);
      addToast(
        isNowBookmarked ? 'Đã đánh dấu chương' : 'Đã bỏ đánh dấu chương',
        'success'
      );
    },
    onError: () => {
      addToast('Không thể đánh dấu chương', 'error');
    }
  });

  // Handlers
  const toggleBookBookmark = useCallback((targetBookId = bookId) => {
    if (!userEmail) {
      addToast('Vui lòng đăng nhập', 'warning');
      return;
    }
    toggleBookMutation.mutate(targetBookId);
  }, [userEmail, bookId, toggleBookMutation, addToast]);

  const toggleChapterBookmark = useCallback((chapterId, chapterTitle, note = '') => {
    if (!userEmail) {
      addToast('Vui lòng đăng nhập', 'warning');
      return;
    }
    if (!bookId) {
      addToast('Chưa chọn sách', 'warning');
      return;
    }
    toggleChapterMutation.mutate({ chapterId, chapterTitle, note });
  }, [userEmail, bookId, toggleChapterMutation, addToast]);

  return {
    // Data
    bookmarkedBooks,
    bookmarkedChapters,
    isBookBookmarked,
    isChapterBookmarked,
    isLoading: isLoadingList || isLoadingBook,
    
    // Actions
    toggleBookBookmark,
    toggleChapterBookmark,
    
    // Status
    isToggling: toggleBookMutation.isPending || toggleChapterMutation.isPending
  };
}

export default useBookmarks;