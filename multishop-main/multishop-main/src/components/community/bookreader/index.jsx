/**
 * Book Reader Module - Public API
 * Export các component và hook cho tính năng đọc bài dạng sách
 * Phase 2: Multi-view, Highlights, Page Comments, Resume
 * 
 * Features:
 * - Full Markdown rendering (kế thừa từ PostCard + react-markdown)
 * - Adaptive pagination theo ngữ nghĩa
 * - Multi-view modes: Scroll/Book/Focus
 * - Highlights & Notes
 * - Page-specific comments
 * - Reading resume
 */

// Main View
export { default as BookReaderView } from './BookReaderView';

// Hooks
export { useBookReader } from './useBookReader';
export { useReadingHighlights } from './useReadingHighlights';
export { usePageComments } from './usePageComments';

// Controls
export { 
  ReadingProgressBar,
  NavigationButtons,
  SettingsPanel,
  PageInfo,
  ResumePrompt
} from './BookReaderControls';

// Page Renderer (with full Markdown support)
export { default as BookReaderPage } from './BookReaderPage';

// Phase 2 Components
export { default as ViewModeSelector } from './ViewModeSelector';
export { default as HighlightsPanel } from './HighlightsPanel';
export { default as PageCommentsPanel, PageCommentBadge } from './PageCommentsPanel';

// Types & Constants
export * from './types';