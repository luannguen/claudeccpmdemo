/**
 * Community Book Module - Public API
 * 
 * This module provides functionality for creating, managing, and reading
 * community-authored books with collaborative features.
 * 
 * @module community-book
 */

// Types & Constants
export {
  BOOK_CATEGORIES,
  BOOK_CATEGORY_LABELS,
  BOOK_STATUS,
  BOOK_STATUS_LABELS,
  CHAPTER_STATUS,
  CHAPTER_STATUS_LABELS,
  BOOK_VISIBILITY,
  BOOK_VISIBILITY_LABELS,
  calculateReadingTime,
  countWords,
  generateSlug
} from './types';

// Hooks
export { useBookLibrary } from './hooks/useBookLibrary';
export { useBookDetail } from './hooks/useBookDetail';
export { useBookEditor } from './hooks/useBookEditor';
export { useBookCollaboration, usePendingInvites } from './hooks/useBookCollaboration';
export { useChapterVersions } from './hooks/useChapterVersions';
export { useBookFork } from './hooks/useBookFork';
export { useReadingList, READING_STATUS, READING_STATUS_LABELS } from './hooks/useReadingList';
export { useBookmarks } from './hooks/useBookmarks';
export { useReadingProgress } from './hooks/useReadingProgress';
export { useChapterComments } from './hooks/useChapterComments';
export { useBookCollections } from './hooks/useBookCollections';
export { useBookReviews } from './hooks/useBookReviews';
export { useBookRecommendations } from './hooks/useBookRecommendations';
export { useBookDiscussions } from './hooks/useBookDiscussions';
export { useAuthorFollow, useAuthorFollowStatus } from './hooks/useAuthorFollow';

// UI Components
export { default as BookCard } from './ui/BookCard';
export { default as ChapterCard } from './ui/ChapterCard';
export { default as BookLibraryFilters } from './ui/BookLibraryFilters';
export { default as CreateBookModal } from './ui/CreateBookModal';
export { default as BookPromoSection } from './ui/BookPromoSection';
export { default as InviteContributorModal } from './ui/InviteContributorModal';
export { default as ContributorsList } from './ui/ContributorsList';
export { default as PendingInvitesWidget } from './ui/PendingInvitesWidget';
export { default as VersionHistoryPanel } from './ui/VersionHistoryPanel';
export { default as DiffViewer } from './ui/DiffViewer';
export { default as ReadingListWidget } from './ui/ReadingListWidget';
export { default as BookmarkButton } from './ui/BookmarkButton';
export { default as ReadingStatusButton } from './ui/ReadingStatusButton';
export { default as ProgressResume } from './ui/ProgressResume';
export { default as ChapterComments } from './ui/ChapterComments';
export { default as CollectionCard } from './ui/CollectionCard';
export { default as BookReviewCard } from './ui/BookReviewCard';
export { default as BookReviewForm } from './ui/BookReviewForm';
export { default as BookReviewsSection } from './ui/BookReviewsSection';
export { default as RecommendationsWidget } from './ui/RecommendationsWidget';
export { default as RichChapterEditor } from './ui/RichChapterEditor';
export { default as ChapterContentRenderer } from './ui/ChapterContentRenderer';
export { default as ImportPostSelector } from './ui/ImportPostSelector';
export { default as BookDiscussionsSection } from './ui/BookDiscussionsSection';
export { default as CreateCollectionModal } from './ui/CreateCollectionModal';
export { default as AddToCollectionButton } from './ui/AddToCollectionButton';
export { default as FollowAuthorButton } from './ui/FollowAuthorButton';
export { default as FollowedAuthorsWidget } from './ui/FollowedAuthorsWidget';
export { default as ChapterTemplateSelector } from './ui/ChapterTemplateSelector';

// Domain Rules (for advanced use cases)
export {
  canEditBook,
  canDeleteBook,
  canPublishBook,
  canForkBook,
  canContributeToBook,
  canViewBook,
  validateBookCreate,
  validateBookUpdate,
  getBookStatusBadge,
  sortBooks,
  filterBooksByCategory
} from './domain/bookRules';

export {
  canEditChapter,
  canDeleteChapter,
  canPublishChapter,
  validateChapterCreate,
  validateChapterUpdate,
  getChapterStatusBadge,
  generateExcerpt,
  sortChaptersByOrder
} from './domain/chapterRules';

// Contributor/Collaboration Rules
export {
  CONTRIBUTOR_STATUS,
  CONTRIBUTOR_ROLES,
  ROLE_LABELS,
  STATUS_LABELS,
  canInviteToBook,
  canChangeRole,
  canRemoveContributor,
  getInvitableRoles,
  validateInvite,
  getPermissionLabel,
  getDefaultPermissions,
  isActiveContributor,
  getRoleBadge,
  getStatusBadge
} from './domain/contributorRules';

// Chapter Templates
export { CHAPTER_TEMPLATES, TEMPLATE_LIST, getTemplate } from './domain/chapterTemplates';