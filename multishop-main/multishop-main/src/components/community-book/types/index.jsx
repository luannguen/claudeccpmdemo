/**
 * Community Book Module - Types & DTOs
 * 
 * @typedef {Object} BookDTO
 * @property {string} id
 * @property {string} title
 * @property {string} slug
 * @property {string} description
 * @property {string} cover_image
 * @property {string} author_email
 * @property {string} author_name
 * @property {string} author_avatar
 * @property {string} category
 * @property {string[]} tags
 * @property {string} status - draft | published | archived
 * @property {string} visibility - public | private | contributors
 * @property {boolean} allow_contributions
 * @property {boolean} allow_fork
 * @property {string} forked_from
 * @property {number} chapters_count
 * @property {number} contributors_count
 * @property {number} views_count
 * @property {number} likes_count
 * @property {number} forks_count
 * @property {number} reading_time_minutes
 * @property {number} word_count
 * @property {TOCItem[]} table_of_contents
 * @property {boolean} featured
 * @property {string} created_date
 * @property {string} updated_date
 * 
 * @typedef {Object} ChapterDTO
 * @property {string} id
 * @property {string} book_id
 * @property {string} title
 * @property {string} content
 * @property {string} excerpt
 * @property {number} order
 * @property {string} author_email
 * @property {string} author_name
 * @property {string} author_avatar
 * @property {string} source_post_id
 * @property {string} status - draft | published | pending_review
 * @property {number} version
 * @property {string[]} images
 * @property {string} video_url
 * @property {number} reading_time_minutes
 * @property {number} word_count
 * @property {number} views_count
 * @property {number} likes_count
 * @property {number} comments_count
 * @property {string} created_date
 * @property {string} updated_date
 * 
 * @typedef {Object} TOCItem
 * @property {string} chapter_id
 * @property {string} title
 * @property {number} order
 * 
 * @typedef {Object} BookCreateDTO
 * @property {string} title
 * @property {string} description
 * @property {string} cover_image
 * @property {string} category
 * @property {string[]} tags
 * @property {string} visibility
 * @property {boolean} allow_contributions
 * @property {boolean} allow_fork
 * 
 * @typedef {Object} ChapterCreateDTO
 * @property {string} book_id
 * @property {string} title
 * @property {string} content
 * @property {string} excerpt
 * @property {string[]} images
 * @property {string} video_url
 * @property {string} source_post_id
 */

// Book Categories
export const BOOK_CATEGORIES = {
  GUIDE: 'guide',
  RECIPE_COLLECTION: 'recipe-collection',
  EXPERIENCE: 'experience',
  TUTORIAL: 'tutorial',
  STORY: 'story',
  KNOWLEDGE: 'knowledge'
};

export const BOOK_CATEGORY_LABELS = {
  [BOOK_CATEGORIES.GUIDE]: '📘 Hướng dẫn',
  [BOOK_CATEGORIES.RECIPE_COLLECTION]: '🍳 Bộ sưu tập công thức',
  [BOOK_CATEGORIES.EXPERIENCE]: '💡 Kinh nghiệm',
  [BOOK_CATEGORIES.TUTORIAL]: '📚 Giáo trình',
  [BOOK_CATEGORIES.STORY]: '📖 Câu chuyện',
  [BOOK_CATEGORIES.KNOWLEDGE]: '🧠 Kiến thức'
};

// Book Status
export const BOOK_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived'
};

export const BOOK_STATUS_LABELS = {
  [BOOK_STATUS.DRAFT]: 'Bản nháp',
  [BOOK_STATUS.PUBLISHED]: 'Đã xuất bản',
  [BOOK_STATUS.ARCHIVED]: 'Đã lưu trữ'
};

// Chapter Status
export const CHAPTER_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  PENDING_REVIEW: 'pending_review'
};

export const CHAPTER_STATUS_LABELS = {
  [CHAPTER_STATUS.DRAFT]: 'Bản nháp',
  [CHAPTER_STATUS.PUBLISHED]: 'Đã xuất bản',
  [CHAPTER_STATUS.PENDING_REVIEW]: 'Chờ duyệt'
};

// Visibility
export const BOOK_VISIBILITY = {
  PUBLIC: 'public',
  PRIVATE: 'private',
  CONTRIBUTORS: 'contributors'
};

export const BOOK_VISIBILITY_LABELS = {
  [BOOK_VISIBILITY.PUBLIC]: 'Công khai',
  [BOOK_VISIBILITY.PRIVATE]: 'Riêng tư',
  [BOOK_VISIBILITY.CONTRIBUTORS]: 'Chỉ người đóng góp'
};

// Utility functions
export const calculateReadingTime = (wordCount) => {
  // Average reading speed: 200 words per minute
  return Math.ceil(wordCount / 200);
};

export const countWords = (text) => {
  if (!text) return 0;
  // Remove markdown syntax and count words
  const cleanText = text
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/`[^`]+`/g, '') // Remove inline code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Replace links with text
    .replace(/[#*_~>|-]/g, '') // Remove markdown symbols
    .replace(/\s+/g, ' ')
    .trim();
  
  return cleanText.split(' ').filter(word => word.length > 0).length;
};

export const generateSlug = (title) => {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50) + '-' + Date.now().toString(36);
};