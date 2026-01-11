/**
 * ReadingListWidget - Display user's reading list
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@/components/ui/AnimatedIcon';
import { createPageUrl } from '@/utils';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useReadingList, READING_STATUS, READING_STATUS_LABELS } from '../hooks/useReadingList';

function ReadingBookCard({ item, onContinue, onChangeStatus }) {
  const { book, progress_percent, last_read_at, current_chapter_index } = item;
  const timeAgo = last_read_at 
    ? formatDistanceToNow(new Date(last_read_at), { addSuffix: true, locale: vi })
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3 p-3 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-shadow"
    >
      {/* Cover */}
      <div className="w-14 h-20 rounded-lg overflow-hidden bg-gradient-to-br from-[#7CB342]/20 to-[#FF9800]/20 flex-shrink-0">
        {book.cover_image ? (
          <img src={book.cover_image} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Icon.FileText size={24} className="text-[#7CB342]/60" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-900 text-sm line-clamp-1">{book.title}</h4>
        <p className="text-xs text-gray-500 mt-0.5">{book.author_name}</p>
        
        {/* Progress */}
        <div className="mt-2">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>Chương {current_chapter_index + 1}/{book.chapters_count || '?'}</span>
            <span>{progress_percent}%</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress_percent}%` }}
              className="h-full bg-gradient-to-r from-[#7CB342] to-[#8BC34A] rounded-full"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => onContinue(book)}
            className="flex-1 py-1.5 bg-[#7CB342] text-white rounded-lg text-xs font-medium hover:bg-[#558B2F] transition-colors"
          >
            Tiếp tục đọc
          </button>
          {timeAgo && (
            <span className="text-xs text-gray-400">{timeAgo}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function StatusTab({ status, label, count, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
        isActive
          ? 'bg-[#7CB342] text-white'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      {label} {count > 0 && `(${count})`}
    </button>
  );
}

export default function ReadingListWidget({ currentUser, compact = false }) {
  const navigate = useNavigate();
  const [activeStatus, setActiveStatus] = useState(READING_STATUS.READING);
  
  const {
    readingLists,
    currentlyReading,
    isLoading
  } = useReadingList(currentUser);

  const handleContinueReading = (book) => {
    navigate(createPageUrl('BookDetail') + `?id=${book.id}`);
  };

  // Compact mode - only show currently reading
  if (compact) {
    if (isLoading || currentlyReading.length === 0) return null;

    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Icon.FileText size={18} />
          Đang đọc
        </h3>
        <div className="space-y-2">
          {currentlyReading.slice(0, 3).map(item => (
            <ReadingBookCard
              key={item.id}
              item={item}
              onContinue={handleContinueReading}
            />
          ))}
        </div>
        {currentlyReading.length > 3 && (
          <button
            onClick={() => navigate(createPageUrl('MyReadingList'))}
            className="w-full mt-3 py-2 text-[#7CB342] text-sm font-medium hover:bg-[#7CB342]/5 rounded-lg transition-colors"
          >
            Xem tất cả ({currentlyReading.length})
          </button>
        )}
      </div>
    );
  }

  // Full mode
  const currentList = readingLists[activeStatus] || [];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          <Icon.FileText size={20} />
          Danh Sách Đọc
        </h3>
      </div>

      {/* Status Tabs */}
      <div className="p-3 border-b border-gray-100 overflow-x-auto">
        <div className="flex gap-2">
          {Object.entries(READING_STATUS).map(([key, status]) => (
            <StatusTab
              key={status}
              status={status}
              label={READING_STATUS_LABELS[status]}
              count={readingLists[status]?.length || 0}
              isActive={activeStatus === status}
              onClick={() => setActiveStatus(status)}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 max-h-[400px] overflow-y-auto">
        {isLoading ? (
          <div className="text-center py-8">
            <Icon.Spinner size={32} className="text-[#7CB342] mx-auto" />
          </div>
        ) : currentList.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Icon.FileText size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">Chưa có sách nào</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {currentList.map(item => (
                <ReadingBookCard
                  key={item.id}
                  item={item}
                  onContinue={handleContinueReading}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}