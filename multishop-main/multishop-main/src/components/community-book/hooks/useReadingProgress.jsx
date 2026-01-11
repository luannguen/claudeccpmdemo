/**
 * useReadingProgress Hook
 * Manages reading progress tracking
 */

import { useCallback, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userInteractionRepository } from '../data/userInteractionRepository';

export function useReadingProgress(bookId, totalChapters, currentUser) {
  const queryClient = useQueryClient();
  const userEmail = currentUser?.email;
  const saveTimeoutRef = useRef(null);

  // Fetch current progress
  const { data: interaction, isLoading } = useQuery({
    queryKey: ['reading-progress', bookId, userEmail],
    queryFn: () => userInteractionRepository.getByBookAndUser(bookId, userEmail),
    enabled: !!userEmail && !!bookId,
    staleTime: 30 * 1000
  });

  // Update progress mutation
  const updateMutation = useMutation({
    mutationFn: (progressData) =>
      userInteractionRepository.updateProgress(bookId, userEmail, {
        ...progressData,
        totalChapters
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reading-progress', bookId, userEmail] });
      queryClient.invalidateQueries({ queryKey: ['reading-list', userEmail] });
    }
  });

  // Debounced save progress
  const saveProgress = useCallback((chapterId, chapterIndex, page = 0) => {
    if (!userEmail || !bookId) return;

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce save
    saveTimeoutRef.current = setTimeout(() => {
      updateMutation.mutate({
        chapterId,
        chapterIndex,
        page
      });
    }, 2000); // Save after 2 seconds of inactivity
  }, [userEmail, bookId, updateMutation]);

  // Immediate save (for explicit actions)
  const saveProgressNow = useCallback((chapterId, chapterIndex, page = 0) => {
    if (!userEmail || !bookId) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    updateMutation.mutate({
      chapterId,
      chapterIndex,
      page
    });
  }, [userEmail, bookId, updateMutation]);

  // Mark chapter as read
  const markChapterRead = useCallback((chapterId, chapterIndex) => {
    if (!userEmail || !bookId) return;
    
    updateMutation.mutate({
      chapterId,
      chapterIndex,
      page: 0 // Reset page when marking complete
    });
  }, [userEmail, bookId, updateMutation]);

  // Get resume info
  const resumeInfo = {
    chapterId: interaction?.current_chapter_id,
    chapterIndex: interaction?.current_chapter_index || 0,
    page: interaction?.current_page || 0,
    progressPercent: interaction?.progress_percent || 0,
    chaptersRead: interaction?.chapters_read || [],
    lastReadAt: interaction?.last_read_at,
    hasProgress: !!(interaction?.current_chapter_id || interaction?.chapters_read?.length > 0)
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    // Data
    resumeInfo,
    isLoading,
    
    // Actions
    saveProgress,
    saveProgressNow,
    markChapterRead,
    
    // Status
    isSaving: updateMutation.isPending
  };
}

export default useReadingProgress;