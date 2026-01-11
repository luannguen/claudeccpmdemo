/**
 * User Interaction Repository
 * Data layer for BookUserInteraction entity
 */

import { base44 } from '@/api/base44Client';

export const READING_STATUS = {
  WANT_TO_READ: 'want_to_read',
  READING: 'reading',
  COMPLETED: 'completed',
  DROPPED: 'dropped'
};

export const READING_STATUS_LABELS = {
  [READING_STATUS.WANT_TO_READ]: '📚 Muốn đọc',
  [READING_STATUS.READING]: '📖 Đang đọc',
  [READING_STATUS.COMPLETED]: '✅ Đã hoàn thành',
  [READING_STATUS.DROPPED]: '⏸️ Tạm dừng'
};

export const userInteractionRepository = {
  /**
   * Get user's interaction with a specific book
   */
  getByBookAndUser: async (bookId, userEmail) => {
    const results = await base44.entities.BookUserInteraction.filter(
      { book_id: bookId, user_email: userEmail },
      '-updated_date',
      1
    );
    return results[0] || null;
  },

  /**
   * Get or create interaction
   */
  getOrCreate: async (bookId, userEmail) => {
    let interaction = await userInteractionRepository.getByBookAndUser(bookId, userEmail);
    
    if (!interaction) {
      interaction = await base44.entities.BookUserInteraction.create({
        book_id: bookId,
        user_email: userEmail,
        reading_status: null,
        is_bookmarked: false,
        bookmarked_chapters: [],
        current_chapter_index: 0,
        current_page: 0,
        progress_percent: 0,
        chapters_read: [],
        total_reading_time_minutes: 0,
        highlights: [],
        notes: []
      });
    }
    
    return interaction;
  },

  /**
   * Update reading status
   */
  updateReadingStatus: async (bookId, userEmail, status) => {
    const interaction = await userInteractionRepository.getOrCreate(bookId, userEmail);
    
    const updates = { reading_status: status };
    
    if (status === READING_STATUS.READING && !interaction.started_at) {
      updates.started_at = new Date().toISOString();
    }
    
    if (status === READING_STATUS.COMPLETED && !interaction.completed_at) {
      updates.completed_at = new Date().toISOString();
      updates.progress_percent = 100;
    }
    
    return await base44.entities.BookUserInteraction.update(interaction.id, updates);
  },

  /**
   * Toggle book bookmark
   */
  toggleBookmark: async (bookId, userEmail) => {
    const interaction = await userInteractionRepository.getOrCreate(bookId, userEmail);
    
    return await base44.entities.BookUserInteraction.update(interaction.id, {
      is_bookmarked: !interaction.is_bookmarked
    });
  },

  /**
   * Bookmark a chapter
   */
  bookmarkChapter: async (bookId, userEmail, chapterId, chapterTitle, note = '') => {
    const interaction = await userInteractionRepository.getOrCreate(bookId, userEmail);
    
    const bookmarkedChapters = interaction.bookmarked_chapters || [];
    const exists = bookmarkedChapters.find(b => b.chapter_id === chapterId);
    
    if (exists) {
      // Remove bookmark
      const filtered = bookmarkedChapters.filter(b => b.chapter_id !== chapterId);
      return await base44.entities.BookUserInteraction.update(interaction.id, {
        bookmarked_chapters: filtered
      });
    } else {
      // Add bookmark
      bookmarkedChapters.push({
        chapter_id: chapterId,
        title: chapterTitle,
        note,
        bookmarked_at: new Date().toISOString()
      });
      return await base44.entities.BookUserInteraction.update(interaction.id, {
        bookmarked_chapters: bookmarkedChapters
      });
    }
  },

  /**
   * Update reading progress
   */
  updateProgress: async (bookId, userEmail, { chapterId, chapterIndex, page, totalChapters }) => {
    const interaction = await userInteractionRepository.getOrCreate(bookId, userEmail);
    
    const chaptersRead = interaction.chapters_read || [];
    if (chapterId && !chaptersRead.includes(chapterId)) {
      chaptersRead.push(chapterId);
    }
    
    // Calculate progress percent
    const progressPercent = totalChapters > 0 
      ? Math.round((chaptersRead.length / totalChapters) * 100)
      : 0;
    
    const updates = {
      current_chapter_id: chapterId,
      current_chapter_index: chapterIndex,
      current_page: page || 0,
      progress_percent: progressPercent,
      chapters_read: chaptersRead,
      last_read_at: new Date().toISOString()
    };
    
    // Auto-set reading status
    if (!interaction.reading_status || interaction.reading_status === READING_STATUS.WANT_TO_READ) {
      updates.reading_status = READING_STATUS.READING;
      if (!interaction.started_at) {
        updates.started_at = new Date().toISOString();
      }
    }
    
    // Auto-complete if all chapters read
    if (progressPercent >= 100 && interaction.reading_status !== READING_STATUS.COMPLETED) {
      updates.reading_status = READING_STATUS.COMPLETED;
      updates.completed_at = new Date().toISOString();
    }
    
    return await base44.entities.BookUserInteraction.update(interaction.id, updates);
  },

  /**
   * Get user's reading list by status
   */
  getReadingList: async (userEmail, status = null) => {
    const query = { user_email: userEmail };
    if (status) {
      query.reading_status = status;
    }
    
    return await base44.entities.BookUserInteraction.filter(
      query,
      '-last_read_at',
      100
    );
  },

  /**
   * Get user's bookmarked books
   */
  getBookmarkedBooks: async (userEmail) => {
    return await base44.entities.BookUserInteraction.filter(
      { user_email: userEmail, is_bookmarked: true },
      '-updated_date',
      100
    );
  },

  /**
   * Add rating and review
   */
  addReview: async (bookId, userEmail, rating, review = '') => {
    const interaction = await userInteractionRepository.getOrCreate(bookId, userEmail);
    
    return await base44.entities.BookUserInteraction.update(interaction.id, {
      rating,
      review
    });
  },

  /**
   * Add highlight
   */
  addHighlight: async (bookId, userEmail, chapterId, text, note = '', color = 'yellow') => {
    const interaction = await userInteractionRepository.getOrCreate(bookId, userEmail);
    
    const highlights = interaction.highlights || [];
    highlights.push({
      chapter_id: chapterId,
      text,
      note,
      color,
      created_at: new Date().toISOString()
    });
    
    return await base44.entities.BookUserInteraction.update(interaction.id, {
      highlights
    });
  },

  /**
   * Add note
   */
  addNote: async (bookId, userEmail, chapterId, content) => {
    const interaction = await userInteractionRepository.getOrCreate(bookId, userEmail);
    
    const notes = interaction.notes || [];
    notes.push({
      chapter_id: chapterId,
      content,
      created_at: new Date().toISOString()
    });
    
    return await base44.entities.BookUserInteraction.update(interaction.id, {
      notes
    });
  }
};

export default userInteractionRepository;