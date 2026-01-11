/**
 * BookDetail Page
 * View and read a book with its chapters
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Icon } from '@/components/ui/AnimatedIcon';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

import {
  useBookDetail,
  useBookFork,
  useReadingList,
  useBookmarks,
  useReadingProgress,
  useBookCollections,
  ChapterCard,
  BookmarkButton,
  ReadingStatusButton,
  ProgressResume,
  BookReviewsSection,
  RecommendationsWidget,
  BookDiscussionsSection,
  AddToCollectionButton,
  CreateCollectionModal,
  FollowAuthorButton,
  BOOK_CATEGORY_LABELS,
  BOOK_STATUS,
  READING_STATUS
} from '@/components/community-book';

import { BookReaderView } from '@/components/community/bookreader';

export default function BookDetail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookId = searchParams.get('id');
  
  const [showReader, setShowReader] = useState(false);
  const [showTOC, setShowTOC] = useState(true);
  const [showCreateCollection, setShowCreateCollection] = useState(false);

  // Get current user
  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      try {
        return await base44.auth.me();
      } catch {
        return null;
      }
    }
  });

  const {
    book,
    chapters,
    activeChapter,
    activeChapterIndex,
    isLoading,
    isBookError,
    isLiked,
    hasNextChapter,
    hasPrevChapter,
    permissions,
    handleLike,
    handlePublish,
    goToChapter,
    goToNextChapter,
    goToPrevChapter,
    isPublishing
  } = useBookDetail(bookId, currentUser);

  const { handleFork, isForking } = useBookFork(currentUser);

  // Collections
  const { createCollection, isCreating: isCreatingCollection } = useBookCollections(currentUser);

  // Reading list and bookmarks
  const { addToReadingList, getBookStatus, isUpdating: isUpdatingStatus } = useReadingList(currentUser);
  const { isBookBookmarked, toggleBookBookmark, isToggling: isTogglingBookmark } = useBookmarks(currentUser, bookId);
  const { resumeInfo, saveProgressNow } = useReadingProgress(bookId, chapters.length, currentUser);

  const currentReadingStatus = getBookStatus(bookId);

  // Redirect if no book ID
  useEffect(() => {
    if (!bookId) {
      navigate(createPageUrl('BookLibrary'));
    }
  }, [bookId, navigate]);

  // Open reader when activeChapter changes
  const handleChapterClick = (chapter, index) => {
    goToChapter(index);
    setShowReader(true);
    // Save progress
    if (currentUser) {
      saveProgressNow(chapter.id, index, 0);
    }
  };

  // Resume reading
  const handleResume = () => {
    if (resumeInfo.chapterIndex !== undefined) {
      goToChapter(resumeInfo.chapterIndex);
      setShowReader(true);
    }
  };

  const handleStartOver = () => {
    goToChapter(0);
    setShowReader(true);
    if (currentUser && chapters[0]) {
      saveProgressNow(chapters[0].id, 0, 0);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F5F9F3] to-white pt-28 flex items-center justify-center">
        <div className="text-center">
          <Icon.Spinner size={48} className="text-[#7CB342] mx-auto" />
          <p className="mt-4 text-gray-500">Đang tải sách...</p>
        </div>
      </div>
    );
  }

  if (isBookError || !book) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F5F9F3] to-white pt-28 flex items-center justify-center">
        <div className="text-center">
          <Icon.AlertCircle size={48} className="text-red-500 mx-auto" />
          <h2 className="text-xl font-bold mt-4">Không tìm thấy sách</h2>
          <p className="text-gray-500 mt-2">Sách không tồn tại hoặc đã bị xóa.</p>
          <button
            onClick={() => navigate(createPageUrl('BookLibrary'))}
            className="mt-4 px-6 py-2 bg-[#7CB342] text-white rounded-xl"
          >
            Về Thư Viện
          </button>
        </div>
      </div>
    );
  }

  const categoryLabel = BOOK_CATEGORY_LABELS[book.category] || book.category;
  const timeAgo = formatDistanceToNow(new Date(book.updated_date || book.created_date), { 
    addSuffix: true, 
    locale: vi 
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F9F3] to-white pt-28 pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(createPageUrl('BookLibrary'))}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-[#7CB342] transition-colors"
        >
          <Icon.ArrowLeft size={20} />
          Về Thư Viện
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Book Info - Left Column */}
          <div className="lg:col-span-1">
            <div className="sticky top-28">
              {/* Cover */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="aspect-[3/4] rounded-2xl overflow-hidden bg-gradient-to-br from-[#7CB342]/20 to-[#FF9800]/20 shadow-lg mb-6"
              >
                {book.cover_image ? (
                  <img 
                    src={book.cover_image} 
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6">
                    <Icon.FileText size={64} className="text-[#7CB342]/60 mb-4" />
                    <p className="text-lg font-bold text-gray-700 text-center">{book.title}</p>
                  </div>
                )}
              </motion.div>

              {/* Meta */}
              <div className="space-y-4">
                <h1 className="text-2xl font-bold text-gray-900">{book.title}</h1>
                
                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7CB342] to-[#FF9800] flex items-center justify-center text-white font-bold overflow-hidden">
                    {book.author_avatar ? (
                      <img src={book.author_avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      book.author_name?.[0]?.toUpperCase()
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{book.author_name}</p>
                    <p className="text-sm text-gray-500">Cập nhật {timeAgo}</p>
                  </div>
                  <FollowAuthorButton
                    author={{
                      email: book.author_email,
                      name: book.author_name,
                      avatar: book.author_avatar
                    }}
                    currentUser={currentUser}
                    variant="compact"
                  />
                </div>

                {/* Description */}
                {book.description && (
                  <p className="text-gray-600">{book.description}</p>
                )}

                {/* Category & Tags */}
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-[#7CB342]/10 text-[#7CB342] rounded-full text-sm">
                    {categoryLabel}
                  </span>
                  {book.tags?.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-xl p-3 border border-gray-100 text-center">
                    <p className="text-2xl font-bold text-[#7CB342]">{book.chapters_count || 0}</p>
                    <p className="text-xs text-gray-500">Chương</p>
                  </div>
                  <div className="bg-white rounded-xl p-3 border border-gray-100 text-center">
                    <p className="text-2xl font-bold text-[#7CB342]">{book.reading_time_minutes || 0}</p>
                    <p className="text-xs text-gray-500">Phút đọc</p>
                  </div>
                  <div className="bg-white rounded-xl p-3 border border-gray-100 text-center">
                    <p className="text-2xl font-bold text-gray-700">{book.views_count || 0}</p>
                    <p className="text-xs text-gray-500">Lượt xem</p>
                  </div>
                  <div className="bg-white rounded-xl p-3 border border-gray-100 text-center">
                    <p className="text-2xl font-bold text-red-500">{book.likes_count || 0}</p>
                    <p className="text-xs text-gray-500">Yêu thích</p>
                  </div>
                </div>

                {/* Resume Reading */}
                {currentUser && resumeInfo.hasProgress && (
                  <ProgressResume
                    resumeInfo={resumeInfo}
                    chapters={chapters}
                    onResume={handleResume}
                    onStartOver={handleStartOver}
                  />
                )}

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  {/* Reading Status + Bookmark */}
                  <div className="flex gap-2">
                    <ReadingStatusButton
                      currentStatus={currentReadingStatus}
                      onStatusChange={(status) => addToReadingList(bookId, status)}
                      isLoading={isUpdatingStatus}
                      className="flex-1"
                    />
                    <BookmarkButton
                      isBookmarked={isBookBookmarked}
                      onToggle={toggleBookBookmark}
                      variant="outline"
                    />
                  </div>

                  {chapters.length > 0 && !resumeInfo.hasProgress && (
                    <button
                      onClick={() => {
                        goToChapter(0);
                        setShowReader(true);
                        if (currentUser && chapters[0]) {
                          addToReadingList(bookId, READING_STATUS.READING);
                          saveProgressNow(chapters[0].id, 0, 0);
                        }
                      }}
                      className="w-full py-3 bg-gradient-to-r from-[#7CB342] to-[#558B2F] text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <Icon.FileText size={20} />
                      Bắt Đầu Đọc
                    </button>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={handleLike}
                      className={`flex-1 py-2.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                        isLiked 
                          ? 'bg-red-50 text-red-600 border-2 border-red-200' 
                          : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'
                      }`}
                    >
                      <Icon.Heart size={18} />
                      {isLiked ? 'Đã thích' : 'Thích'}
                    </button>

                    {permissions.canFork && (
                        <button
                          onClick={async () => {
                            const forkedBook = await handleFork(book);
                            if (forkedBook) {
                              navigate(createPageUrl('BookEditor') + `?id=${forkedBook.id}`);
                            }
                          }}
                          disabled={isForking}
                          className="flex-1 py-2.5 bg-purple-50 text-purple-600 rounded-xl font-medium hover:bg-purple-100 transition-all flex items-center justify-center gap-2"
                        >
                          {isForking ? (
                            <Icon.Spinner size={18} />
                          ) : (
                            <Icon.Copy size={18} />
                          )}
                          Fork
                        </button>
                      )}
                    </div>

                    {/* Add to Collection */}
                    <AddToCollectionButton
                      bookId={bookId}
                      currentUser={currentUser}
                      onCreateNew={() => setShowCreateCollection(true)}
                    />

                  {permissions.canEdit && (
                    <button
                      onClick={() => navigate(createPageUrl('BookEditor') + `?id=${book.id}`)}
                      className="w-full py-2.5 border-2 border-[#7CB342] text-[#7CB342] rounded-xl font-medium hover:bg-[#7CB342]/5 transition-all flex items-center justify-center gap-2"
                    >
                      <Icon.Edit size={18} />
                      Chỉnh Sửa
                    </button>
                  )}

                  {permissions.canPublish && (
                    <button
                      onClick={handlePublish}
                      disabled={isPublishing}
                      className="w-full py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                    >
                      {isPublishing ? (
                        <Icon.Spinner size={18} />
                      ) : (
                        <Icon.CheckCircle size={18} />
                      )}
                      Xuất Bản
                    </button>
                  )}
                </div>

                {/* Fork Info */}
                {book.forked_from && (
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-sm">
                    <p className="text-purple-700 flex items-center gap-2">
                      <Icon.Copy size={16} />
                      Đây là bản fork
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Chapters - Right Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Table of Contents */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Icon.List size={24} />
                  Mục Lục ({chapters.length} chương)
                </h2>
                <button
                  onClick={() => setShowTOC(!showTOC)}
                  className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
                >
                  {showTOC ? <Icon.ChevronUp size={20} /> : <Icon.ChevronDown size={20} />}
                </button>
              </div>

              <AnimatePresence>
                {showTOC && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3"
                  >
                    {chapters.length === 0 ? (
                      <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                        <Icon.FileText size={48} className="text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">Sách chưa có chương nào</p>
                      </div>
                    ) : (
                      chapters.map((chapter, index) => (
                        <ChapterCard
                          key={chapter.id}
                          chapter={chapter}
                          index={index}
                          isActive={activeChapterIndex === index}
                          onView={handleChapterClick}
                        />
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Discussions Section */}
            <BookDiscussionsSection 
              bookId={bookId} 
              currentUser={currentUser} 
              bookAuthorEmail={book.author_email}
            />

            {/* Reviews Section */}
            <BookReviewsSection bookId={bookId} currentUser={currentUser} />

            {/* Recommendations */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Icon.Sparkles size={24} className="text-purple-500" />
                Gợi Ý Cho Bạn
              </h2>
              <RecommendationsWidget 
                currentUser={currentUser} 
                currentBookId={bookId}
                showSimilar
                showForYou
                showPopular={false}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Create Collection Modal */}
      <CreateCollectionModal
        isOpen={showCreateCollection}
        onClose={() => setShowCreateCollection(false)}
        onCreate={async (data) => {
          const collection = await createCollection({ ...data, book_ids: [bookId] });
          if (collection) {
            setShowCreateCollection(false);
          }
        }}
        isSubmitting={isCreatingCollection}
      />

      {/* Book Reader Modal */}
      <AnimatePresence>
        {showReader && activeChapter && (
          <BookReaderView
            post={{
              id: activeChapter.id,
              data: {
                content: activeChapter.content,
                author_name: activeChapter.author_name,
                author_avatar: activeChapter.author_avatar,
                images: activeChapter.images,
                video_url: activeChapter.video_url
              }
            }}
            currentUser={currentUser}
            onClose={() => setShowReader(false)}
            initialSettings={{
              viewMode: 'focus'
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}