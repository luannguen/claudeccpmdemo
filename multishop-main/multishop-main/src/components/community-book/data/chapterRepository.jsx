/**
 * Chapter Repository - Data Layer
 * Handles all API calls for BookChapter entity
 */

import { base44 } from '@/api/base44Client';
import { countWords, calculateReadingTime } from '../types';

export const chapterRepository = {


  /**
   * List chapters by book ID
   */
  listByBook: async (bookId) => {
    const chapters = await base44.entities.BookChapter.filter(
      { book_id: bookId },
      'order',
      100
    );
    return chapters;
  },

  /**
   * List published chapters by book ID
   */
  listPublishedByBook: async (bookId) => {
    const chapters = await base44.entities.BookChapter.filter(
      { book_id: bookId, status: 'published' },
      'order',
      100
    );
    return chapters;
  },

  /**
   * Get chapter by ID
   */
  getById: async (chapterId) => {
    const chapters = await base44.entities.BookChapter.filter({ id: chapterId });
    return chapters[0] || null;
  },

  /**
   * Create new chapter
   */
  create: async (data, currentUser) => {
    const wordCount = countWords(data.content);
    const readingTime = calculateReadingTime(wordCount);
    
    // Get current max order for the book
    const existingChapters = await chapterRepository.listByBook(data.book_id);
    const maxOrder = existingChapters.reduce((max, ch) => Math.max(max, ch.order || 0), 0);

    const chapterData = {
      ...data,
      order: data.order ?? maxOrder + 1,
      author_email: currentUser.email,
      author_name: currentUser.full_name,
      author_avatar: currentUser.avatar_url || '',
      status: 'draft',
      version: 1,
      word_count: wordCount,
      reading_time_minutes: readingTime,
      views_count: 0,
      likes_count: 0,
      liked_by: [],
      comments_count: 0,
      excerpt: data.excerpt || data.content?.substring(0, 200) + '...'
    };

    return await base44.entities.BookChapter.create(chapterData);
  },

  /**
   * Update chapter
   */
  update: async (chapterId, data) => {
    const updates = { ...data };
    
    // Recalculate word count and reading time if content changed
    if (data.content) {
      updates.word_count = countWords(data.content);
      updates.reading_time_minutes = calculateReadingTime(updates.word_count);
      updates.version = (data.version || 1) + 1;
    }

    return await base44.entities.BookChapter.update(chapterId, updates);
  },

  /**
   * Delete chapter
   */
  delete: async (chapterId) => {
    return await base44.entities.BookChapter.delete(chapterId);
  },

  /**
   * Publish chapter
   */
  publish: async (chapterId) => {
    return await base44.entities.BookChapter.update(chapterId, {
      status: 'published'
    });
  },

  /**
   * Reorder chapters
   */
  reorder: async (bookId, orderedChapterIds) => {
    const updates = orderedChapterIds.map((id, index) => 
      base44.entities.BookChapter.update(id, { order: index + 1 })
    );
    await Promise.all(updates);
    return true;
  },

  /**
   * Like/Unlike chapter
   */
  toggleLike: async (chapterId, userEmail, currentLikedBy = []) => {
    const isLiked = currentLikedBy.includes(userEmail);
    const newLikedBy = isLiked
      ? currentLikedBy.filter(e => e !== userEmail)
      : [...currentLikedBy, userEmail];

    return await base44.entities.BookChapter.update(chapterId, {
      liked_by: newLikedBy,
      likes_count: newLikedBy.length
    });
  },

  /**
   * Increment view count
   */
  incrementViews: async (chapterId, currentCount = 0) => {
    return await base44.entities.BookChapter.update(chapterId, {
      views_count: currentCount + 1
    });
  },

  /**
   * Import from UserPost
   */
  importFromPost: async (bookId, post, currentUser) => {
    const postData = post.data || post;
    
    return await chapterRepository.create({
      book_id: bookId,
      title: postData.content?.substring(0, 50) || 'Chương mới',
      content: postData.content,
      images: postData.images || [],
      video_url: postData.video_url,
      source_post_id: post.id
    }, currentUser);
  },

  /**
   * Clone chapters to new book (for fork)
   */
  cloneChaptersToBook: async (originalBookId, newBookId, currentUser) => {
    const chapters = await chapterRepository.listByBook(originalBookId);
    
    const clonePromises = chapters.map(chapter => 
      chapterRepository.create({
        book_id: newBookId,
        title: chapter.title,
        content: chapter.content,
        excerpt: chapter.excerpt,
        order: chapter.order,
        images: chapter.images,
        video_url: chapter.video_url,
        source_post_id: chapter.source_post_id
      }, currentUser)
    );

    return await Promise.all(clonePromises);
  }
};

export default chapterRepository;