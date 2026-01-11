/**
 * useBookFork Hook
 * Manages book forking functionality
 */

import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bookRepository } from '../data/bookRepository';
import { chapterRepository } from '../data/chapterRepository';
import { useToast } from '@/components/NotificationToast';

export function useBookFork(currentUser) {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const forkMutation = useMutation({
    mutationFn: async (book) => {
      // 1. Fork the book
      const forkedBook = await bookRepository.fork(book, currentUser);
      
      // 2. Clone all published chapters
      const chapters = await chapterRepository.listByBook(book.id);
      const publishedChapters = chapters.filter(c => c.status === 'published');
      
      for (const chapter of publishedChapters) {
        await chapterRepository.cloneToBook(chapter, forkedBook.id, currentUser);
      }
      
      // 3. Update book stats
      await bookRepository.updateTOC(forkedBook.id, publishedChapters);
      
      return forkedBook;
    },
    onSuccess: (forkedBook) => {
      queryClient.invalidateQueries({ queryKey: ['community-books'] });
      queryClient.invalidateQueries({ queryKey: ['my-books'] });
      addToast('Đã fork sách thành công!', 'success');
      return forkedBook;
    },
    onError: (error) => {
      addToast('Không thể fork sách: ' + error.message, 'error');
    }
  });

  const handleFork = useCallback(async (book) => {
    if (!currentUser) {
      addToast('Vui lòng đăng nhập để fork sách', 'warning');
      return null;
    }
    
    if (!book.allow_fork) {
      addToast('Sách này không cho phép fork', 'warning');
      return null;
    }
    
    if (book.author_email === currentUser.email) {
      addToast('Bạn không thể fork sách của chính mình', 'warning');
      return null;
    }
    
    return await forkMutation.mutateAsync(book);
  }, [currentUser, forkMutation, addToast]);

  return {
    handleFork,
    isForking: forkMutation.isPending
  };
}

export default useBookFork;