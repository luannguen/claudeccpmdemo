/**
 * Book Reader Types
 * Types và constants cho Reading Flow feature
 */

// Page types
export const PAGE_TYPES = {
  TEXT: 'text',
  MEDIA: 'media',
  MIXED: 'mixed',
  POLL: 'poll',
  PRODUCTS: 'products'
};

// View modes
export const VIEW_MODES = {
  SCROLL: 'scroll',
  BOOK: 'book',
  FOCUS: 'focus'
};

// Reading themes
export const READING_THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SEPIA: 'sepia',
  PAPER: 'paper'
};

// Reading settings defaults
export const DEFAULT_READING_SETTINGS = {
  fontSize: 16,
  lineHeight: 1.8,
  fontFamily: 'system-ui',
  theme: READING_THEMES.LIGHT,
  viewMode: VIEW_MODES.SCROLL,
  animationsEnabled: true,
  hapticEnabled: true,
  autoNightMode: false
};

// Page break markers
export const PAGE_BREAK_MARKERS = {
  HEADING: /^#{1,3}\s/m,
  HORIZONTAL_RULE: /^---+$/m,
  DOUBLE_NEWLINE: /\n\n\n/,
  BLOCKQUOTE: /^>/m
};

// Theme styles
export const THEME_STYLES = {
  [READING_THEMES.LIGHT]: {
    bg: 'bg-white',
    text: 'text-gray-900',
    secondary: 'text-gray-600',
    border: 'border-gray-200'
  },
  [READING_THEMES.DARK]: {
    bg: 'bg-gray-900',
    text: 'text-gray-100',
    secondary: 'text-gray-400',
    border: 'border-gray-700'
  },
  [READING_THEMES.SEPIA]: {
    bg: 'bg-amber-50',
    text: 'text-amber-900',
    secondary: 'text-amber-700',
    border: 'border-amber-200'
  },
  [READING_THEMES.PAPER]: {
    bg: 'bg-stone-100',
    text: 'text-stone-800',
    secondary: 'text-stone-600',
    border: 'border-stone-300'
  }
};

/**
 * @typedef {Object} PageContent
 * @property {string} id - Page unique ID
 * @property {number} index - Page index (0-based)
 * @property {string} type - PAGE_TYPES
 * @property {string} [text] - Text content
 * @property {string[]} [images] - Image URLs
 * @property {string} [videoUrl] - Video URL
 * @property {Object} [poll] - Poll data
 * @property {Object[]} [products] - Product links
 * @property {string} [sectionTitle] - Section/chapter title
 */

/**
 * @typedef {Object} ReadingProgress
 * @property {string} postId - Post ID
 * @property {number} currentPage - Current page index
 * @property {number} totalPages - Total pages
 * @property {number} percentage - Progress percentage
 * @property {string} lastReadAt - ISO timestamp
 * @property {string[]} highlightedTexts - User highlights
 * @property {Object[]} notes - User notes
 */