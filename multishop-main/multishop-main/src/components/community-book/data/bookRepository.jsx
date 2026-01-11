/**
 * Book Repository - Data Layer
 * Handles all API calls for CommunityBook entity
 */

import { base44 } from '@/api/base44Client';
import { generateSlug, countWords, calculateReadingTime } from '../types';

export const bookRepository = {
  /**
   * List all published books
   */
  listPublished: async (limit = 50) => {
    const books = await base44.entities.CommunityBook.filter(
      { status: 'published', visibility: 'public' },
      '-updated_date',
      limit
    );
    return books;
  },

  /**
   * List books by author
   */
  listByAuthor: async (authorEmail, limit = 50) => {
    const books = await base44.entities.CommunityBook.filter(
      { author_email: authorEmail },
      '-updated_date',
      limit
    );
    return books;
  },

  /**
   * List featured books
   */
  listFeatured: async (limit = 10) => {
    const books = await base44.entities.CommunityBook.filter(
      { status: 'published', featured: true },
      '-likes_count',
      limit
    );
    return books;
  },

  /**
   * Get book by ID
   */
  getById: async (bookId) => {
    const books = await base44.entities.CommunityBook.filter({ id: bookId });
    return books[0] || null;
  },

  /**
   * Get book by slug
   */
  getBySlug: async (slug) => {
    const books = await base44.entities.CommunityBook.filter({ slug });
    return books[0] || null;
  },

  /**
   * Create new book
   */
  create: async (data, currentUser) => {
    const slug = generateSlug(data.title);
    
    const bookData = {
      ...data,
      slug,
      author_email: currentUser.email,
      author_name: currentUser.full_name,
      author_avatar: currentUser.avatar_url || '',
      status: 'draft',
      chapters_count: 0,
      contributors_count: 0,
      views_count: 0,
      likes_count: 0,
      forks_count: 0,
      reading_time_minutes: 0,
      word_count: 0,
      table_of_contents: [],
      liked_by: []
    };

    return await base44.entities.CommunityBook.create(bookData);
  },

  /**
   * Update book
   */
  update: async (bookId, data) => {
    return await base44.entities.CommunityBook.update(bookId, data);
  },

  /**
   * Delete book
   */
  delete: async (bookId) => {
    return await base44.entities.CommunityBook.delete(bookId);
  },

  /**
   * Publish book
   */
  publish: async (bookId) => {
    return await base44.entities.CommunityBook.update(bookId, {
      status: 'published'
    });
  },

  /**
   * Archive book
   */
  archive: async (bookId) => {
    return await base44.entities.CommunityBook.update(bookId, {
      status: 'archived'
    });
  },

  /**
   * Like/Unlike book
   */
  toggleLike: async (bookId, userEmail, currentLikedBy = []) => {
    const isLiked = currentLikedBy.includes(userEmail);
    const newLikedBy = isLiked
      ? currentLikedBy.filter(e => e !== userEmail)
      : [...currentLikedBy, userEmail];

    return await base44.entities.CommunityBook.update(bookId, {
      liked_by: newLikedBy,
      likes_count: newLikedBy.length
    });
  },

  /**
   * Increment view count
   */
  incrementViews: async (bookId, currentCount = 0) => {
    return await base44.entities.CommunityBook.update(bookId, {
      views_count: currentCount + 1
    });
  },

  /**
   * Update table of contents
   */
  updateTOC: async (bookId, chapters) => {
    const toc = chapters
      .sort((a, b) => a.order - b.order)
      .map(ch => ({
        chapter_id: ch.id,
        title: ch.title,
        order: ch.order
      }));

    const totalWords = chapters.reduce((sum, ch) => sum + (ch.word_count || 0), 0);
    const readingTime = calculateReadingTime(totalWords);

    return await base44.entities.CommunityBook.update(bookId, {
      table_of_contents: toc,
      chapters_count: chapters.length,
      word_count: totalWords,
      reading_time_minutes: readingTime,
      last_updated_chapter: new Date().toISOString()
    });
  },

  /**
   * Fork a book
   */
  fork: async (originalBook, currentUser) => {
    const newBook = await bookRepository.create({
      title: `${originalBook.title} (Fork)`,
      description: originalBook.description,
      cover_image: originalBook.cover_image,
      category: originalBook.category,
      tags: originalBook.tags,
      visibility: 'private',
      allow_contributions: true,
      allow_fork: true,
      forked_from: originalBook.id
    }, currentUser);

    // Increment fork count on original
    await base44.entities.CommunityBook.update(originalBook.id, {
      forks_count: (originalBook.forks_count || 0) + 1
    });

    return newBook;
  },

  /**
   * Search books
   */
  search: async (query, limit = 20) => {
    const allBooks = await base44.entities.CommunityBook.filter(
      { status: 'published', visibility: 'public' },
      '-likes_count',
      200
    );

    const searchLower = query.toLowerCase();
    return allBooks
      .filter(book => 
        book.title?.toLowerCase().includes(searchLower) ||
        book.description?.toLowerCase().includes(searchLower) ||
        book.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      )
      .slice(0, limit);
  }
};

export default bookRepository;