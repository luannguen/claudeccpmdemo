/**
 * useBookLibrary Hook
 * Manages book library state and operations
 */

import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookRepository } from '../data/bookRepository';
import { sortBooks, filterBooksByCategory } from '../domain/bookRules';
import { useToast } from '@/components/NotificationToast';

export function useBookLibrary(currentUser) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  // Fetch published books
  const { 
    data: allBooks = [], 
    isLoading, 
    isError,
    error 
  } = useQuery({
    queryKey: ['community-books'],
    queryFn: () => bookRepository.listPublished(100),
    staleTime: 2 * 60 * 1000
  });

  // Fetch featured books
  const { data: featuredBooks = [] } = useQuery({
    queryKey: ['community-books-featured'],
    queryFn: () => bookRepository.listFeatured(6),
    staleTime: 5 * 60 * 1000
  });

  // Fetch my books (if logged in)
  const { data: myBooks = [] } = useQuery({
    queryKey: ['my-books', currentUser?.email],
    queryFn: () => bookRepository.listByAuthor(currentUser.email),
    enabled: !!currentUser?.email,
    staleTime: 60 * 1000
  });

  // Filter and sort books
  const filteredBooks = useMemo(() => {
    let result = allBooks;

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(book =>
        book.title?.toLowerCase().includes(query) ||
        book.description?.toLowerCase().includes(query) ||
        book.author_name?.toLowerCase().includes(query) ||
        book.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Filter by category
    result = filterBooksByCategory(result, categoryFilter);

    // Sort
    result = sortBooks(result, sortBy);

    return result;
  }, [allBooks, searchQuery, categoryFilter, sortBy]);

  // Create book mutation
  const createBookMutation = useMutation({
    mutationFn: (data) => bookRepository.create(data, currentUser),
    onSuccess: (newBook) => {
      queryClient.invalidateQueries({ queryKey: ['community-books'] });
      queryClient.invalidateQueries({ queryKey: ['my-books'] });
      addToast('Đã tạo sách mới', 'success');
      return newBook;
    },
    onError: (error) => {
      addToast('Không thể tạo sách: ' + error.message, 'error');
    }
  });

  // Like book mutation
  const likeBookMutation = useMutation({
    mutationFn: ({ bookId, likedBy }) => 
      bookRepository.toggleLike(bookId, currentUser.email, likedBy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-books'] });
    }
  });

  // Fork book mutation
  const forkBookMutation = useMutation({
    mutationFn: (book) => bookRepository.fork(book, currentUser),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-books'] });
      queryClient.invalidateQueries({ queryKey: ['my-books'] });
      addToast('Đã fork sách thành công!', 'success');
    },
    onError: (error) => {
      addToast('Không thể fork sách: ' + error.message, 'error');
    }
  });

  // Handlers
  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  const handleCategoryChange = useCallback((category) => {
    setCategoryFilter(category);
  }, []);

  const handleSortChange = useCallback((sort) => {
    setSortBy(sort);
  }, []);

  const handleCreateBook = useCallback(async (data) => {
    return await createBookMutation.mutateAsync(data);
  }, [createBookMutation]);

  const handleLikeBook = useCallback((book) => {
    if (!currentUser) return;
    likeBookMutation.mutate({ 
      bookId: book.id, 
      likedBy: book.liked_by || [] 
    });
  }, [currentUser, likeBookMutation]);

  const handleForkBook = useCallback((book) => {
    if (!currentUser) return;
    forkBookMutation.mutate(book);
  }, [currentUser, forkBookMutation]);

  return {
    // Data
    books: filteredBooks,
    allBooks,
    featuredBooks,
    myBooks,
    
    // Loading states
    isLoading,
    isError,
    error,
    isCreating: createBookMutation.isPending,
    isForking: forkBookMutation.isPending,
    
    // Filters
    searchQuery,
    categoryFilter,
    sortBy,
    
    // Handlers
    handleSearch,
    handleCategoryChange,
    handleSortChange,
    handleCreateBook,
    handleLikeBook,
    handleForkBook,
    
    // Utils
    setSearchQuery,
    setCategoryFilter,
    setSortBy
  };
}

export default useBookLibrary;