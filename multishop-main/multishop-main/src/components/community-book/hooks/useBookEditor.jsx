/**
 * useBookEditor Hook
 * Manages book creation and editing state
 */

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookRepository } from '../data/bookRepository';
import { chapterRepository } from '../data/chapterRepository';
import { versionRepository } from '../data/versionRepository';
import { validateBookCreate, validateBookUpdate } from '../domain/bookRules';
import { validateChapterCreate, validateChapterUpdate, generateExcerpt } from '../domain/chapterRules';
import { useToast } from '@/components/NotificationToast';

export function useBookEditor(bookId, currentUser) {
  const [editingChapterId, setEditingChapterId] = useState(null);
  const [isCreatingChapter, setIsCreatingChapter] = useState(false);
  
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  // Fetch book (if editing existing)
  const { 
    data: book, 
    isLoading: isLoadingBook 
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

  // Fetch user's posts for import
  const { data: userPosts = [] } = useQuery({
    queryKey: ['user-posts-for-import', currentUser?.email],
    queryFn: async () => {
      const { base44 } = await import('@/api/base44Client');
      const posts = await base44.entities.UserPost.filter(
        { created_by: currentUser.email, status: 'active' },
        '-created_date',
        100
      );
      return posts;
    },
    enabled: !!currentUser?.email,
    staleTime: 5 * 60 * 1000
  });

  // Create book mutation
  const createBookMutation = useMutation({
    mutationFn: (data) => bookRepository.create(data, currentUser),
    onSuccess: (newBook) => {
      queryClient.invalidateQueries({ queryKey: ['community-books'] });
      queryClient.invalidateQueries({ queryKey: ['my-books'] });
      addToast('Đã tạo sách mới!', 'success');
      return newBook;
    },
    onError: (error) => {
      addToast('Không thể tạo sách: ' + error.message, 'error');
    }
  });

  // Update book mutation
  const updateBookMutation = useMutation({
    mutationFn: ({ id, data }) => bookRepository.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['book', bookId] });
      addToast('Đã cập nhật sách', 'success');
    },
    onError: (error) => {
      addToast('Không thể cập nhật: ' + error.message, 'error');
    }
  });

  // Create chapter mutation
  const createChapterMutation = useMutation({
    mutationFn: async (data) => {
      const chapter = await chapterRepository.create(data, currentUser);
      // Create initial version
      await versionRepository.createInitial(chapter, currentUser);
      return chapter;
    },
    onSuccess: async () => {
      // Refresh chapters and update TOC
      const updatedChapters = await chapterRepository.listByBook(bookId);
      await bookRepository.updateTOC(bookId, updatedChapters);
      
      queryClient.invalidateQueries({ queryKey: ['book-chapters', bookId] });
      queryClient.invalidateQueries({ queryKey: ['book', bookId] });
      setIsCreatingChapter(false);
      addToast('Đã thêm chương mới', 'success');
    },
    onError: (error) => {
      addToast('Không thể tạo chương: ' + error.message, 'error');
    }
  });

  // Update chapter mutation with auto-versioning
  const updateChapterMutation = useMutation({
    mutationFn: async ({ id, data, previousContent }) => {
      const updatedChapter = await chapterRepository.update(id, data);
      // Auto-create version on edit
      if (previousContent !== data.content) {
        await versionRepository.createVersion(
          { ...updatedChapter, id, book_id: bookId },
          previousContent,
          currentUser
        );
      }
      return updatedChapter;
    },
    onSuccess: async () => {
      // Update TOC
      const updatedChapters = await chapterRepository.listByBook(bookId);
      await bookRepository.updateTOC(bookId, updatedChapters);
      
      queryClient.invalidateQueries({ queryKey: ['book-chapters', bookId] });
      queryClient.invalidateQueries({ queryKey: ['book', bookId] });
      queryClient.invalidateQueries({ queryKey: ['chapter-versions'] });
      setEditingChapterId(null);
      addToast('Đã cập nhật chương', 'success');
    },
    onError: (error) => {
      addToast('Không thể cập nhật: ' + error.message, 'error');
    }
  });

  // Delete chapter mutation
  const deleteChapterMutation = useMutation({
    mutationFn: (chapterId) => chapterRepository.delete(chapterId),
    onSuccess: async () => {
      // Update TOC
      const updatedChapters = await chapterRepository.listByBook(bookId);
      await bookRepository.updateTOC(bookId, updatedChapters);
      
      queryClient.invalidateQueries({ queryKey: ['book-chapters', bookId] });
      queryClient.invalidateQueries({ queryKey: ['book', bookId] });
      addToast('Đã xóa chương', 'success');
    },
    onError: (error) => {
      addToast('Không thể xóa: ' + error.message, 'error');
    }
  });

  // Reorder chapters mutation
  const reorderChaptersMutation = useMutation({
    mutationFn: (orderedIds) => chapterRepository.reorder(bookId, orderedIds),
    onSuccess: async () => {
      const updatedChapters = await chapterRepository.listByBook(bookId);
      await bookRepository.updateTOC(bookId, updatedChapters);
      
      queryClient.invalidateQueries({ queryKey: ['book-chapters', bookId] });
      queryClient.invalidateQueries({ queryKey: ['book', bookId] });
    }
  });

  // Import post as chapter mutation
  const importPostMutation = useMutation({
    mutationFn: (post) => chapterRepository.importFromPost(bookId, post, currentUser),
    onSuccess: async () => {
      const updatedChapters = await chapterRepository.listByBook(bookId);
      await bookRepository.updateTOC(bookId, updatedChapters);
      
      queryClient.invalidateQueries({ queryKey: ['book-chapters', bookId] });
      queryClient.invalidateQueries({ queryKey: ['book', bookId] });
      addToast('Đã import bài viết thành chương', 'success');
    },
    onError: (error) => {
      addToast('Không thể import: ' + error.message, 'error');
    }
  });

  // Publish chapter mutation
  const publishChapterMutation = useMutation({
    mutationFn: (chapterId) => chapterRepository.publish(chapterId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['book-chapters', bookId] });
      addToast('Đã xuất bản chương', 'success');
    }
  });

  // Handlers
  const handleCreateBook = useCallback(async (data) => {
    const validation = validateBookCreate(data);
    if (!validation.isValid) {
      addToast(validation.errors[0].message, 'error');
      return null;
    }
    return await createBookMutation.mutateAsync(data);
  }, [createBookMutation, addToast]);

  const handleUpdateBook = useCallback(async (data) => {
    const validation = validateBookUpdate(data);
    if (!validation.isValid) {
      addToast(validation.errors[0].message, 'error');
      return null;
    }
    return await updateBookMutation.mutateAsync({ id: bookId, data });
  }, [bookId, updateBookMutation, addToast]);

  const handleCreateChapter = useCallback(async (data) => {
    const chapterData = {
      ...data,
      book_id: bookId,
      excerpt: data.excerpt || generateExcerpt(data.content)
    };
    
    const validation = validateChapterCreate(chapterData);
    if (!validation.isValid) {
      addToast(validation.errors[0].message, 'error');
      return null;
    }
    
    return await createChapterMutation.mutateAsync(chapterData);
  }, [bookId, createChapterMutation, addToast]);

  const handleUpdateChapter = useCallback(async (chapterId, data, previousContent = '') => {
    const validation = validateChapterUpdate(data);
    if (!validation.isValid) {
      addToast(validation.errors[0].message, 'error');
      return null;
    }
    
    if (data.content && !data.excerpt) {
      data.excerpt = generateExcerpt(data.content);
    }
    
    return await updateChapterMutation.mutateAsync({ id: chapterId, data, previousContent });
  }, [updateChapterMutation, addToast]);

  const handleDeleteChapter = useCallback(async (chapterId) => {
    return await deleteChapterMutation.mutateAsync(chapterId);
  }, [deleteChapterMutation]);

  const handleReorderChapters = useCallback((orderedIds) => {
    reorderChaptersMutation.mutate(orderedIds);
  }, [reorderChaptersMutation]);

  const handleImportPost = useCallback((post) => {
    importPostMutation.mutate(post);
  }, [importPostMutation]);

  const handlePublishChapter = useCallback((chapterId) => {
    publishChapterMutation.mutate(chapterId);
  }, [publishChapterMutation]);

  return {
    // Data
    book,
    chapters,
    userPosts,
    editingChapterId,
    isCreatingChapter,
    
    // Loading states
    isLoading: isLoadingBook || isLoadingChapters,
    isSaving: createBookMutation.isPending || updateBookMutation.isPending,
    isSavingChapter: createChapterMutation.isPending || updateChapterMutation.isPending,
    isDeletingChapter: deleteChapterMutation.isPending,
    isImporting: importPostMutation.isPending,
    
    // Setters
    setEditingChapterId,
    setIsCreatingChapter,
    
    // Handlers
    handleCreateBook,
    handleUpdateBook,
    handleCreateChapter,
    handleUpdateChapter,
    handleDeleteChapter,
    handleReorderChapters,
    handleImportPost,
    handlePublishChapter
  };
}

export default useBookEditor;