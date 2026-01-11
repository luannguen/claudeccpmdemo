/**
 * useBookRecommendations Hook
 * Generates book recommendations based on user behavior
 */

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { userInteractionRepository } from '../data/userInteractionRepository';

export function useBookRecommendations(currentUser, currentBookId = null) {
  const userEmail = currentUser?.email;

  // Fetch user's reading history
  const { data: userInteractions = [] } = useQuery({
    queryKey: ['user-interactions', userEmail],
    queryFn: () => userInteractionRepository.getReadingList(userEmail),
    enabled: !!userEmail,
    staleTime: 5 * 60 * 1000
  });

  // Fetch all published books
  const { data: allBooks = [] } = useQuery({
    queryKey: ['all-published-books'],
    queryFn: async () => {
      return await base44.entities.CommunityBook.filter(
        { status: 'published', visibility: 'public' },
        '-views_count',
        100
      );
    },
    staleTime: 5 * 60 * 1000
  });

  // Get current book for "similar" recommendations
  const { data: currentBook } = useQuery({
    queryKey: ['book', currentBookId],
    queryFn: () => base44.entities.CommunityBook.get(currentBookId),
    enabled: !!currentBookId,
    staleTime: 5 * 60 * 1000
  });

  // Generate recommendations
  const recommendations = useMemo(() => {
    if (allBooks.length === 0) return { forYou: [], similar: [], popular: [], newReleases: [] };

    const readBookIds = new Set(userInteractions.map(i => i.book_id));
    const unreadBooks = allBooks.filter(b => !readBookIds.has(b.id) && b.id !== currentBookId);

    // Extract user preferences from reading history
    const userCategories = {};
    const userTags = {};
    const userAuthors = {};

    userInteractions.forEach(interaction => {
      const book = allBooks.find(b => b.id === interaction.book_id);
      if (book) {
        userCategories[book.category] = (userCategories[book.category] || 0) + 1;
        book.tags?.forEach(tag => {
          userTags[tag] = (userTags[tag] || 0) + 1;
        });
        userAuthors[book.author_email] = (userAuthors[book.author_email] || 0) + 1;
      }
    });

    // Score books for personalized recommendations
    const scoredBooks = unreadBooks.map(book => {
      let score = 0;

      // Category match
      if (userCategories[book.category]) {
        score += userCategories[book.category] * 10;
      }

      // Tag matches
      book.tags?.forEach(tag => {
        if (userTags[tag]) {
          score += userTags[tag] * 5;
        }
      });

      // Same author
      if (userAuthors[book.author_email]) {
        score += userAuthors[book.author_email] * 15;
      }

      // Popularity boost
      score += (book.likes_count || 0) * 0.5;
      score += (book.views_count || 0) * 0.1;

      // Rating boost
      score += (book.rating_average || 0) * 2;

      return { ...book, recommendScore: score };
    });

    // For You - Personalized recommendations
    const forYou = scoredBooks
      .sort((a, b) => b.recommendScore - a.recommendScore)
      .slice(0, 10);

    // Similar to current book
    let similar = [];
    if (currentBook) {
      similar = unreadBooks
        .filter(b => {
          // Same category
          if (b.category === currentBook.category) return true;
          // Overlapping tags
          const commonTags = b.tags?.filter(t => currentBook.tags?.includes(t));
          if (commonTags?.length > 0) return true;
          // Same author
          if (b.author_email === currentBook.author_email) return true;
          return false;
        })
        .slice(0, 6);
    }

    // Popular - Most liked/viewed
    const popular = [...unreadBooks]
      .sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0))
      .slice(0, 10);

    // New Releases - Recently created
    const newReleases = [...unreadBooks]
      .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
      .slice(0, 10);

    return { forYou, similar, popular, newReleases };
  }, [allBooks, userInteractions, currentBook, currentBookId]);

  return {
    forYou: recommendations.forYou,
    similar: recommendations.similar,
    popular: recommendations.popular,
    newReleases: recommendations.newReleases,
    isLoading: allBooks.length === 0
  };
}

export default useBookRecommendations;