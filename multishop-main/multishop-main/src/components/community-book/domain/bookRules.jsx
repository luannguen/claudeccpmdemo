/**
 * Book Domain Rules - Business Logic
 * Validation and business rules for books
 */

import { BOOK_STATUS, BOOK_VISIBILITY } from '../types';

/**
 * Check if user can edit book
 * @param {Object} book - Book object
 * @param {string} userEmail - User email
 * @param {Object} contributor - Optional contributor record for the user
 */
export const canEditBook = (book, userEmail, contributor = null) => {
  if (!book || !userEmail) return false;
  
  // Author can always edit
  if (book.author_email === userEmail) return true;
  
  // Check if user is an active contributor with edit permissions
  if (contributor) {
    const isActive = contributor.status === 'accepted';
    const hasEditPermission = 
      contributor.role === 'owner' || 
      contributor.role === 'editor' ||
      contributor.permissions?.can_edit_book_settings;
    return isActive && hasEditPermission;
  }
  
  return false;
};

/**
 * Check if user can delete book
 */
export const canDeleteBook = (book, userEmail) => {
  if (!book || !userEmail) return false;
  // Only author can delete, and only if not published or has no chapters
  return book.author_email === userEmail && 
         (book.status === BOOK_STATUS.DRAFT || book.chapters_count === 0);
};

/**
 * Check if user can publish book
 */
export const canPublishBook = (book, userEmail) => {
  if (!book || !userEmail) return false;
  // Must be author and have at least 1 chapter
  return book.author_email === userEmail && 
         book.chapters_count > 0 &&
         book.status === BOOK_STATUS.DRAFT;
};

/**
 * Check if user can fork book
 */
export const canForkBook = (book, userEmail) => {
  if (!book || !userEmail) return false;
  // Can fork if book allows it and is published
  return book.allow_fork && 
         book.status === BOOK_STATUS.PUBLISHED &&
         book.visibility === BOOK_VISIBILITY.PUBLIC;
};

/**
 * Check if user can contribute to book
 */
export const canContributeToBook = (book, userEmail) => {
  if (!book || !userEmail) return false;
  // Can contribute if book allows it and is not archived
  return book.allow_contributions && 
         book.status !== BOOK_STATUS.ARCHIVED &&
         book.visibility !== BOOK_VISIBILITY.PRIVATE;
};

/**
 * Check if user can view book
 * @param {Object} book - Book object
 * @param {string} userEmail - User email
 * @param {Object} contributor - Optional contributor record for the user
 */
export const canViewBook = (book, userEmail, contributor = null) => {
  if (!book) return false;
  
  // Author can always view
  if (book.author_email === userEmail) return true;
  
  // Public books can be viewed by anyone
  if (book.visibility === BOOK_VISIBILITY.PUBLIC) return true;
  
  // Private books only by author
  if (book.visibility === BOOK_VISIBILITY.PRIVATE) return false;
  
  // Contributors visibility - check if user is an active contributor
  if (book.visibility === BOOK_VISIBILITY.CONTRIBUTORS) {
    if (contributor && contributor.status === 'accepted') {
      return true;
    }
    return false;
  }
  
  return false;
};

/**
 * Validate book data for creation
 */
export const validateBookCreate = (data) => {
  const errors = [];

  if (!data.title?.trim()) {
    errors.push({ field: 'title', message: 'Tiêu đề không được để trống' });
  } else if (data.title.length < 3) {
    errors.push({ field: 'title', message: 'Tiêu đề phải có ít nhất 3 ký tự' });
  } else if (data.title.length > 200) {
    errors.push({ field: 'title', message: 'Tiêu đề không được quá 200 ký tự' });
  }

  if (data.description && data.description.length > 1000) {
    errors.push({ field: 'description', message: 'Mô tả không được quá 1000 ký tự' });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate book data for update
 */
export const validateBookUpdate = (data) => {
  const errors = [];

  if (data.title !== undefined) {
    if (!data.title?.trim()) {
      errors.push({ field: 'title', message: 'Tiêu đề không được để trống' });
    } else if (data.title.length < 3) {
      errors.push({ field: 'title', message: 'Tiêu đề phải có ít nhất 3 ký tự' });
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Get book status badge config
 */
export const getBookStatusBadge = (status) => {
  switch (status) {
    case BOOK_STATUS.PUBLISHED:
      return { label: 'Đã xuất bản', color: 'bg-green-100 text-green-800' };
    case BOOK_STATUS.ARCHIVED:
      return { label: 'Đã lưu trữ', color: 'bg-gray-100 text-gray-800' };
    default:
      return { label: 'Bản nháp', color: 'bg-yellow-100 text-yellow-800' };
  }
};

/**
 * Sort books by different criteria
 */
export const sortBooks = (books, sortBy) => {
  const sorted = [...books];
  
  switch (sortBy) {
    case 'popular':
      return sorted.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));
    case 'views':
      return sorted.sort((a, b) => (b.views_count || 0) - (a.views_count || 0));
    case 'newest':
      return sorted.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    case 'updated':
      return sorted.sort((a, b) => new Date(b.updated_date) - new Date(a.updated_date));
    case 'chapters':
      return sorted.sort((a, b) => (b.chapters_count || 0) - (a.chapters_count || 0));
    default:
      return sorted;
  }
};

/**
 * Filter books by category
 */
export const filterBooksByCategory = (books, category) => {
  if (!category || category === 'all') return books;
  return books.filter(book => book.category === category);
};