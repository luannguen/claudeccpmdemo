/**
 * BookReaderView - Main Book Reader Component
 * Immersive reading experience với flip animation
 * Phase 2: Multi-view, Highlights, Page Comments, Resume
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@/components/ui/AnimatedIcon';
import { useBookReader } from './useBookReader';
import { useReadingHighlights } from './useReadingHighlights';
import { usePageComments } from './usePageComments';
import BookReaderPage from './BookReaderPage';
import { 
  ReadingProgressBar, 
  NavigationButtons, 
  SettingsPanel, 
  PageInfo,
  ResumePrompt 
} from './BookReaderControls';
import ViewModeSelector from './ViewModeSelector';
import HighlightsPanel from './HighlightsPanel';
import PageCommentsPanel, { PageCommentBadge } from './PageCommentsPanel';
import { THEME_STYLES, VIEW_MODES } from './types';
import ChapterComments from '@/components/community-book/ui/ChapterComments';
import { useBookmarks } from '@/components/community-book/hooks/useBookmarks';
import { useToast } from '@/components/NotificationToast';

// Focus mode styles
const FOCUS_MODE_STYLES = {
  maxWidth: 'max-w-xl',
  padding: 'px-8 py-12',
  letterSpacing: 'tracking-wide'
};

export default function BookReaderView({ 
  post, 
  currentUser,
  onClose,
  onVote,
  onProductClick,
  initialSettings,
  bookId: propBookId // Optional: pass bookId directly
}) {
  const { addToast } = useToast();
  const {
    pages,
    currentPage,
    currentPageIndex,
    totalPages,
    progress,
    canGoNext,
    canGoPrev,
    goToPage,
    goNext,
    goPrev,
    isFlipping,
    flipDirection,
    settings,
    updateSettings,
    getSavedProgress,
    resumeReading
  } = useBookReader(post, initialSettings);
  
  const [showSettings, setShowSettings] = useState(false);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [showViewModeSelector, setShowViewModeSelector] = useState(false);
  const [showHighlightsPanel, setShowHighlightsPanel] = useState(false);
  const [showPageComments, setShowPageComments] = useState(false);
  const [showChapterComments, setShowChapterComments] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const containerRef = useRef(null);
  
  // Highlights & Notes
  const {
    highlights,
    notes,
    addHighlight,
    removeHighlight,
    updateHighlightColor,
    addNote,
    updateNote,
    removeNote,
    isSyncing,
    isSynced
  } = useReadingHighlights(post?.id, currentUser?.email);
  
  // Page Comments
  const {
    getPageCommentCount,
    getPageComments,
    addPageComment,
    isAddingComment
  } = usePageComments(post?.id, totalPages);
  
  const themeStyles = THEME_STYLES[settings.theme];
  const postData = post?.data || post;
  const isFocusMode = settings.viewMode === VIEW_MODES.FOCUS;
  
  // Determine bookId for features
  const bookId = propBookId || post?.book_id || postData?.book_id;
  const chapterId = post?.id;
  const chapterTitle = postData?.title || post?.title;
  
  // Chapter bookmark functionality
  const { 
    isChapterBookmarked, 
    toggleChapterBookmark,
    isToggling: isTogglingBookmark
  } = useBookmarks(currentUser, bookId);
  
  // Check for saved progress on mount
  useEffect(() => {
    const saved = getSavedProgress();
    if (saved && saved.currentPage > 0 && saved.currentPage < totalPages - 1) {
      setShowResumePrompt(true);
    }
  }, [getSavedProgress, totalPages]);
  
  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        goNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goPrev();
      } else if (e.key === 'Escape') {
        onClose?.();
      } else if (e.key === '1') {
        updateSettings({ viewMode: VIEW_MODES.SCROLL });
      } else if (e.key === '2') {
        updateSettings({ viewMode: VIEW_MODES.BOOK });
      } else if (e.key === '3') {
        updateSettings({ viewMode: VIEW_MODES.FOCUS });
      } else if (e.key === 'h' || e.key === 'H') {
        setShowHighlightsPanel(prev => !prev);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goNext, goPrev, onClose, updateSettings]);
  
  // Touch/Swipe handlers
  const handleTouchStart = useCallback((e) => {
    setTouchStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    });
  }, []);
  
  const handleTouchEnd = useCallback((e) => {
    if (!touchStart) return;
    
    const touchEnd = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY
    };
    
    const diffX = touchStart.x - touchEnd.x;
    const diffY = touchStart.y - touchEnd.y;
    
    // Only handle horizontal swipes (ignore vertical scrolling)
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
      if (diffX > 0) {
        goNext(); // Swipe left = next page
      } else {
        goPrev(); // Swipe right = prev page
      }
    }
    
    setTouchStart(null);
  }, [touchStart, goNext, goPrev]);
  
  // Handle tap on edges
  const handleContainerClick = useCallback((e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const clickX = e.clientX - rect.left;
    const containerWidth = rect.width;
    
    // Tap on left 20% = prev, right 20% = next
    if (clickX < containerWidth * 0.2) {
      goPrev();
    } else if (clickX > containerWidth * 0.8) {
      goNext();
    }
  }, [goNext, goPrev]);
  
  if (!pages.length) {
    return (
      <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
        <div className="text-white text-center">
          <Icon.AlertCircle size={48} className="mx-auto mb-4" />
          <p>Không có nội dung để hiển thị</p>
          <button 
            onClick={onClose}
            className="mt-4 px-6 py-2 bg-white/20 rounded-xl hover:bg-white/30"
          >
            Đóng
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col"
    >
      {/* Background */}
      <div className={`absolute inset-0 ${themeStyles.bg}`} />
      
      {/* Header - Hidden in Focus mode, appears on hover */}
      <motion.div 
        className={`relative z-10 px-4 py-3 flex items-center justify-between border-b ${themeStyles.border} ${
          isFocusMode ? 'opacity-0 hover:opacity-100 transition-opacity duration-300' : ''
        }`}
        initial={false}
        animate={{ 
          y: isFocusMode ? -10 : 0,
          opacity: isFocusMode ? 0 : 1
        }}
        whileHover={{ y: 0, opacity: 1 }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className={`p-2 rounded-full hover:bg-black/5 ${themeStyles.text}`}
          >
            <Icon.X size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7CB342] to-[#FF9800] flex items-center justify-center text-white text-sm font-bold overflow-hidden">
              {postData.author_avatar ? (
                <img src={postData.author_avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                postData.author_name?.[0]?.toUpperCase() || 'U'
              )}
            </div>
            <span className={`font-medium text-sm hidden sm:block ${themeStyles.text}`}>
              {postData.author_name}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* View Mode Selector - Compact */}
          <ViewModeSelector
            currentMode={settings.viewMode}
            onModeChange={(mode) => updateSettings({ viewMode: mode })}
            compact
          />
          
          <PageInfo progress={progress} currentPage={currentPage} />
          
          {/* Highlights Button */}
          <button
            onClick={() => setShowHighlightsPanel(!showHighlightsPanel)}
            className={`p-2 rounded-full hover:bg-black/5 relative ${themeStyles.text}`}
            title="Ghi chú (H)"
          >
            <Icon.Bookmark size={20} />
            {highlights.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#7CB342] text-white text-xs rounded-full flex items-center justify-center">
                {highlights.length}
              </span>
            )}
          </button>

          {/* Chapter Bookmark Button */}
          {bookId && chapterId && (
            <button
              onClick={() => {
                if (!currentUser) {
                  addToast('Vui lòng đăng nhập để đánh dấu chương', 'warning');
                  return;
                }
                toggleChapterBookmark(chapterId, chapterTitle);
              }}
              disabled={isTogglingBookmark}
              className={`p-2 rounded-full hover:bg-black/5 ${themeStyles.text} ${
                isChapterBookmarked(chapterId) ? 'text-amber-500' : ''
              }`}
              title={isChapterBookmarked(chapterId) ? 'Bỏ đánh dấu chương' : 'Đánh dấu chương'}
            >
              {isTogglingBookmark ? (
                <Icon.Spinner size={20} />
              ) : (
                <Icon.Flag size={20} className={isChapterBookmarked(chapterId) ? 'fill-current' : ''} />
              )}
            </button>
          )}

          {/* Chapter Comments Button */}
          <button
            onClick={() => setShowChapterComments(!showChapterComments)}
            className={`p-2 rounded-full hover:bg-black/5 ${themeStyles.text}`}
            title="Bình luận chương"
          >
            <Icon.MessageCircle size={20} />
          </button>
          
          <div className="relative">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-full hover:bg-black/5 ${themeStyles.text}`}
            >
              <Icon.Settings size={20} />
            </button>
            <SettingsPanel 
              settings={settings}
              onUpdateSettings={updateSettings}
              isOpen={showSettings}
              onClose={() => setShowSettings(false)}
            />
          </div>
        </div>
      </motion.div>
      
      {/* Focus mode: Close button always visible */}
      {isFocusMode && (
        <button
          onClick={onClose}
          className={`absolute top-4 left-4 z-20 p-2 rounded-full bg-black/10 hover:bg-black/20 ${themeStyles.text}`}
        >
          <Icon.X size={20} />
        </button>
      )}
      
      {/* Main Content Area */}
      <div 
        ref={containerRef}
        className={`flex-1 relative overflow-hidden group ${
          isFocusMode ? 'flex items-center justify-center' : ''
        }`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={handleContainerClick}
      >
        {/* Page Content */}
        <AnimatePresence mode="wait" custom={flipDirection}>
          <BookReaderPage
            key={currentPage?.id}
            page={currentPage}
            theme={settings.theme}
            fontSize={isFocusMode ? settings.fontSize + 2 : settings.fontSize}
            lineHeight={isFocusMode ? 2 : settings.lineHeight || 1.8}
            currentUser={currentUser}
            onVote={onVote}
            onProductClick={onProductClick}
            isActive={true}
            direction={flipDirection}
            isFocusMode={isFocusMode}
          />
        </AnimatePresence>
        
        {/* Navigation overlay areas */}
        {settings.animationsEnabled && (
          <NavigationButtons
            canGoPrev={canGoPrev}
            canGoNext={canGoNext}
            onPrev={goPrev}
            onNext={goNext}
          />
        )}
        
        {/* Page Comments Badge */}
        <PageCommentBadge
          count={getPageCommentCount(currentPageIndex)}
          onClick={() => setShowPageComments(true)}
        />
        
        {/* Page Comments Panel */}
        <AnimatePresence>
          {showPageComments && (
            <PageCommentsPanel
              pageIndex={currentPageIndex}
              comments={getPageComments(currentPageIndex)}
              currentUser={currentUser}
              onAddComment={addPageComment}
              isAddingComment={isAddingComment}
              onClose={() => setShowPageComments(false)}
            />
          )}
        </AnimatePresence>
        
        {/* Resume Prompt */}
        <AnimatePresence>
          {showResumePrompt && (
            <ResumePrompt
              savedProgress={getSavedProgress()}
              onResume={() => {
                resumeReading();
                setShowResumePrompt(false);
              }}
              onStartFresh={() => {
                goToPage(0);
                setShowResumePrompt(false);
              }}
            />
          )}
        </AnimatePresence>
      </div>
      
      {/* Chapter Comments Panel */}
      <AnimatePresence>
        {showChapterComments && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed right-0 top-0 bottom-0 w-96 bg-white shadow-xl z-50 flex flex-col"
          >
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Bình luận chương</h3>
              <button
                onClick={() => setShowChapterComments(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <Icon.X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {bookId ? (
                <ChapterComments
                  chapterId={chapterId}
                  bookId={bookId}
                  currentUser={currentUser}
                  bookAuthorEmail={postData.author_email || postData.created_by}
                />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Icon.MessageCircle size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Không có thông tin sách</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Highlights Panel */}
      <AnimatePresence>
        {showHighlightsPanel && (
          <HighlightsPanel
            highlights={highlights}
            notes={notes}
            onRemoveHighlight={removeHighlight}
            onUpdateHighlightColor={updateHighlightColor}
            onAddNote={addNote}
            onUpdateNote={updateNote}
            onRemoveNote={removeNote}
            onGoToPage={(pageIndex) => {
              goToPage(pageIndex);
              setShowHighlightsPanel(false);
            }}
            isOpen={showHighlightsPanel}
            onClose={() => setShowHighlightsPanel(false)}
            isSyncing={isSyncing}
            isSynced={isSynced}
          />
        )}
      </AnimatePresence>
      
      {/* View Mode Selector - Full Panel */}
      <ViewModeSelector
        currentMode={settings.viewMode}
        onModeChange={(mode) => updateSettings({ viewMode: mode })}
        isOpen={showViewModeSelector}
        onClose={() => setShowViewModeSelector(false)}
      />
      
      {/* Footer - Simplified in Focus mode */}
      <motion.div 
        className={`relative z-10 px-4 py-3 border-t ${themeStyles.border} ${
          isFocusMode ? 'opacity-0 hover:opacity-100 transition-opacity duration-300' : ''
        }`}
        initial={false}
        animate={{ 
          y: isFocusMode ? 10 : 0,
          opacity: isFocusMode ? 0 : 1
        }}
        whileHover={{ y: 0, opacity: 1 }}
      >
        <div className="flex items-center gap-4">
          {/* Progress Bar */}
          <div className="flex-1">
            <ReadingProgressBar 
              progress={progress}
              pages={pages}
              onPageClick={goToPage}
            />
          </div>
          
          {/* Compact Navigation */}
          <NavigationButtons
            canGoPrev={canGoPrev}
            canGoNext={canGoNext}
            onPrev={goPrev}
            onNext={goNext}
            compact
          />
        </div>
      </motion.div>
      
      {/* Focus mode: Minimal progress indicator */}
      {isFocusMode && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
          <div className="w-32 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#7CB342] transition-all duration-300"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
          <span className={`text-xs ${themeStyles.secondary}`}>
            {progress.current}/{progress.total}
          </span>
        </div>
      )}
      
      {/* Keyboard hints (hidden on mobile) */}
      <div className={`absolute bottom-20 left-1/2 -translate-x-1/2 hidden md:flex items-center gap-4 text-xs ${themeStyles.secondary}`}>
        <span>← → lật trang</span>
        <span>•</span>
        <span>1/2/3 chế độ xem</span>
        <span>•</span>
        <span>H ghi chú</span>
        <span>•</span>
        <span>ESC đóng</span>
      </div>
    </motion.div>
  );
}