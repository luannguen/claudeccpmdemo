/**
 * Chapter Domain Rules - Business Logic
 * Validation and business rules for chapters
 */

import { CHAPTER_STATUS } from '../types';

/**
 * Check if user can edit chapter
 */
export const canEditChapter = (chapter, book, userEmail) => {
  if (!chapter || !book || !userEmail) return false;
  
  // Book author can always edit
  if (book.author_email === userEmail) return true;
  
  // Chapter author can edit their own
  return chapter.author_email === userEmail;
};

/**
 * Check if user can delete chapter
 */
export const canDeleteChapter = (chapter, book, userEmail) => {
  if (!chapter || !book || !userEmail) return false;
  
  // Only book author can delete any chapter
  return book.author_email === userEmail;
};

/**
 * Check if user can publish chapter
 */
export const canPublishChapter = (chapter, book, userEmail) => {
  if (!chapter || !book || !userEmail) return false;
  
  // Only book author can publish
  return book.author_email === userEmail && 
         chapter.status === CHAPTER_STATUS.DRAFT;
};

/**
 * Validate chapter data for creation
 */
export const validateChapterCreate = (data) => {
  const errors = [];

  if (!data.title?.trim()) {
    errors.push({ field: 'title', message: 'Tiêu đề chương không được để trống' });
  } else if (data.title.length < 2) {
    errors.push({ field: 'title', message: 'Tiêu đề phải có ít nhất 2 ký tự' });
  } else if (data.title.length > 200) {
    errors.push({ field: 'title', message: 'Tiêu đề không được quá 200 ký tự' });
  }

  if (!data.content?.trim()) {
    errors.push({ field: 'content', message: 'Nội dung chương không được để trống' });
  } else if (data.content.length < 50) {
    errors.push({ field: 'content', message: 'Nội dung phải có ít nhất 50 ký tự' });
  }

  if (!data.book_id) {
    errors.push({ field: 'book_id', message: 'Thiếu ID sách' });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate chapter data for update
 */
export const validateChapterUpdate = (data) => {
  const errors = [];

  if (data.title !== undefined) {
    if (!data.title?.trim()) {
      errors.push({ field: 'title', message: 'Tiêu đề chương không được để trống' });
    } else if (data.title.length < 2) {
      errors.push({ field: 'title', message: 'Tiêu đề phải có ít nhất 2 ký tự' });
    }
  }

  if (data.content !== undefined && data.content.length < 50) {
    errors.push({ field: 'content', message: 'Nội dung phải có ít nhất 50 ký tự' });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Get chapter status badge config
 */
export const getChapterStatusBadge = (status) => {
  switch (status) {
    case CHAPTER_STATUS.PUBLISHED:
      return { label: 'Đã xuất bản', color: 'bg-green-100 text-green-800' };
    case CHAPTER_STATUS.PENDING_REVIEW:
      return { label: 'Chờ duyệt', color: 'bg-orange-100 text-orange-800' };
    default:
      return { label: 'Bản nháp', color: 'bg-yellow-100 text-yellow-800' };
  }
};

/**
 * Generate chapter excerpt from content
 */
export const generateExcerpt = (content, maxLength = 200) => {
  if (!content) return '';
  
  // Remove markdown syntax
  const cleanContent = content
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]+`/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[#*_~>|-]/g, '')
    .replace(/\n+/g, ' ')
    .trim();

  if (cleanContent.length <= maxLength) return cleanContent;
  
  return cleanContent.substring(0, maxLength).trim() + '...';
};

/**
 * Sort chapters by order
 */
export const sortChaptersByOrder = (chapters) => {
  return [...chapters].sort((a, b) => (a.order || 0) - (b.order || 0));
};