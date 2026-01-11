/**
 * MyReadingList Page
 * User's personal reading list management
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Icon } from '@/components/ui/AnimatedIcon';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

import {
  useReadingList,
  useBookmarks,
  READING_STATUS,
  READING_STATUS_LABELS
} from '@/components/community-book';

const STATUS_TABS = [
  { key: READING_STATUS.READING, icon: '📖', label: 'Đang đọc' },
  { key: READING_STATUS.WANT_TO_READ, icon: '📚', label: 'Muốn đọc' },
  { key: READING_STATUS.COMPLETED, icon: '✅', label: 'Đã hoàn thành' },
  { key: READING_STATUS.DROPPED, icon: '⏸️', label: 'Tạm dừng' },
  { key: 'bookmarked', icon: '🔖', label: 'Đã lưu' }
];

function BookListItem({ item, onContinue, onChangeStatus, onRemove, availableStatuses }) {
  const { book, progress_percent, last_read_at, current_chapter_index, reading_status } = item;
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  
  const timeAgo = last_read_at 
    ? formatDistanceToNow(new Date(last_read_at), { addSuffix: true, locale: vi })
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex gap-4 p-4 bg-white rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow"
    >
      {/* Cover */}
      <div 
        onClick={() => onContinue(book)}
        className="w-20 h-28 rounded-xl overflow-hidden bg-gradient-to-br from-[#7CB342]/20 to-[#FF9800]/20 flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
      >
        {book.cover_image ? (
          <img src={book.cover_image} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Icon.FileText size={32} className="text-[#7CB342]/60" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 
          onClick={() => onContinue(book)}
          className="font-bold text-gray-900 line-clamp-1 cursor-pointer hover:text-[#7CB342] transition-colors"
        >
          {book.title}
        </h4>
        <p className="text-sm text-gray-500 mt-0.5">{book.author_name}</p>
        
        {/* Progress */}
        {reading_status === READING_STATUS.READING && (
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>Chương {(current_chapter_index || 0) + 1}/{book.chapters_count || '?'}</span>
              <span>{progress_percent || 0}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress_percent || 0}%` }}
                className="h-full bg-gradient-to-r from-[#7CB342] to-[#8BC34A] rounded-full"
              />
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
          <span>{book.chapters_count || 0} chương</span>
          <span>•</span>
          <span>{book.reading_time_minutes || 0} phút đọc</span>
          {timeAgo && (
            <>
              <span>•</span>
              <span>{timeAgo}</span>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={() => onContinue(book)}
            className="px-4 py-1.5 bg-[#7CB342] text-white rounded-lg text-sm font-medium hover:bg-[#558B2F] transition-colors"
          >
            {reading_status === READING_STATUS.READING ? 'Tiếp tục' : 'Đọc ngay'}
          </button>
          
          {/* Status change dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowStatusMenu(!showStatusMenu)}
              className="p-1.5 text-gray-400 hover:text-[#7CB342] rounded-lg hover:bg-gray-50 transition-colors"
              title="Đổi trạng thái"
            >
              <Icon.MoreHorizontal size={16} />
            </button>
            
            {showStatusMenu && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowStatusMenu(false)} 
                />
                <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20 min-w-[160px]">
                  {availableStatuses?.filter(s => s.key !== reading_status && s.key !== 'bookmarked').map(status => (
                    <button
                      key={status.key}
                      onClick={() => {
                        onChangeStatus(book.id, status.key);
                        setShowStatusMenu(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <span>{status.icon}</span>
                      <span>{status.label}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          
          <button
            onClick={() => onRemove(book.id)}
            className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
            title="Xóa khỏi danh sách"
          >
            <Icon.X size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function MyReadingList() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(READING_STATUS.READING);

  // Get current user
  const { data: currentUser, isLoading: isLoadingUser } = useQuery({
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
    readingLists,
    isLoading,
    updateReadingStatus,
    removeFromList
  } = useReadingList(currentUser);

  const { bookmarkedBooks, isLoading: isLoadingBookmarks } = useBookmarks(currentUser);

  // Redirect if not logged in
  if (!isLoadingUser && !currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F5F9F3] to-white pt-28 pb-24">
        <div className="max-w-4xl mx-auto px-4 text-center py-20">
          <Icon.FileText size={64} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Danh Sách Đọc</h2>
          <p className="text-gray-500 mb-6">Đăng nhập để quản lý danh sách đọc của bạn</p>
          <button
            onClick={() => base44.auth.redirectToLogin(window.location.href)}
            className="px-6 py-3 bg-[#7CB342] text-white rounded-xl font-medium hover:bg-[#558B2F] transition-colors"
          >
            Đăng Nhập
          </button>
        </div>
      </div>
    );
  }

  const handleContinue = (book) => {
    navigate(createPageUrl('BookDetail') + `?id=${book.id}`);
  };

  const handleRemove = (bookId) => {
    removeFromList(bookId);
  };

  // Get current list based on tab
  const currentList = activeTab === 'bookmarked' 
    ? bookmarkedBooks 
    : readingLists[activeTab] || [];

  const isListLoading = activeTab === 'bookmarked' ? isLoadingBookmarks : isLoading;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F9F3] to-white pt-28 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(createPageUrl('BookLibrary'))}
            className="mb-4 flex items-center gap-2 text-gray-600 hover:text-[#7CB342] transition-colors"
          >
            <Icon.ArrowLeft size={20} />
            Về Thư Viện
          </button>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <span>📚</span>
            Danh Sách Đọc Của Tôi
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {STATUS_TABS.map(tab => {
            const count = tab.key === 'bookmarked' 
              ? bookmarkedBooks.length 
              : readingLists[tab.key]?.length || 0;
            
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
                  activeTab === tab.key
                    ? 'bg-[#7CB342] text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {count > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                    activeTab === tab.key ? 'bg-white/20' : 'bg-gray-100'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content */}
        {isListLoading ? (
          <div className="text-center py-20">
            <Icon.Spinner size={48} className="text-[#7CB342] mx-auto" />
            <p className="mt-4 text-gray-500">Đang tải...</p>
          </div>
        ) : currentList.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <Icon.FileText size={64} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Chưa có sách nào</h3>
            <p className="text-gray-500 mb-6">
              {activeTab === 'bookmarked' 
                ? 'Bạn chưa lưu sách nào' 
                : 'Khám phá thư viện và thêm sách vào danh sách'}
            </p>
            <button
              onClick={() => navigate(createPageUrl('BookLibrary'))}
              className="px-6 py-3 bg-[#7CB342] text-white rounded-xl font-medium hover:bg-[#558B2F] transition-colors"
            >
              Khám Phá Thư Viện
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {currentList.map(item => (
                <BookListItem
                  key={item.id || item.book?.id}
                  item={activeTab === 'bookmarked' ? { book: item, ...item.interaction } : item}
                  onContinue={handleContinue}
                  onChangeStatus={updateReadingStatus}
                  onRemove={handleRemove}
                  availableStatuses={STATUS_TABS}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Stats */}
        {!isListLoading && (
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {STATUS_TABS.slice(0, 4).map(tab => {
              const count = readingLists[tab.key]?.length || 0;
              return (
                <div 
                  key={tab.key}
                  className="bg-white rounded-xl p-4 border border-gray-100 text-center"
                >
                  <p className="text-2xl font-bold text-[#7CB342]">{count}</p>
                  <p className="text-xs text-gray-500 mt-1">{tab.label}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}