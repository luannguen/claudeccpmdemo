/**
 * ReadingStatusButton - Dropdown to change reading status
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@/components/ui/AnimatedIcon';
import { cn } from '@/lib/utils';
import { READING_STATUS, READING_STATUS_LABELS } from '../hooks/useReadingList';

const STATUS_ICONS = {
  [READING_STATUS.WANT_TO_READ]: '📚',
  [READING_STATUS.READING]: '📖',
  [READING_STATUS.COMPLETED]: '✅',
  [READING_STATUS.DROPPED]: '⏸️'
};

const STATUS_COLORS = {
  [READING_STATUS.WANT_TO_READ]: 'bg-blue-100 text-blue-700 border-blue-200',
  [READING_STATUS.READING]: 'bg-green-100 text-green-700 border-green-200',
  [READING_STATUS.COMPLETED]: 'bg-purple-100 text-purple-700 border-purple-200',
  [READING_STATUS.DROPPED]: 'bg-gray-100 text-gray-600 border-gray-200'
};

export default function ReadingStatusButton({
  currentStatus,
  onStatusChange,
  isLoading = false,
  size = 'md',
  className
}) {
  const [isOpen, setIsOpen] = useState(false);

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const handleSelect = (status) => {
    onStatusChange(status);
    setIsOpen(false);
  };

  return (
    <div className={cn('relative', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className={cn(
          'rounded-lg border font-medium transition-colors flex items-center gap-2',
          sizeClasses[size],
          currentStatus
            ? STATUS_COLORS[currentStatus]
            : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
        )}
      >
        {isLoading ? (
          <Icon.Spinner size={16} />
        ) : (
          <>
            <span>{currentStatus ? STATUS_ICONS[currentStatus] : '➕'}</span>
            <span>
              {currentStatus 
                ? READING_STATUS_LABELS[currentStatus].replace(/^[^\s]+\s/, '')
                : 'Thêm vào danh sách'}
            </span>
            <Icon.ChevronDown size={14} />
          </>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden min-w-[180px]"
            >
              {Object.entries(READING_STATUS).map(([key, status]) => (
                <button
                  key={status}
                  onClick={() => handleSelect(status)}
                  className={cn(
                    'w-full px-4 py-2.5 text-left text-sm flex items-center gap-2 transition-colors',
                    currentStatus === status
                      ? 'bg-[#7CB342]/10 text-[#7CB342]'
                      : 'hover:bg-gray-50 text-gray-700'
                  )}
                >
                  <span>{STATUS_ICONS[status]}</span>
                  <span>{READING_STATUS_LABELS[status].replace(/^[^\s]+\s/, '')}</span>
                  {currentStatus === status && (
                    <Icon.Check size={16} className="ml-auto" />
                  )}
                </button>
              ))}

              {currentStatus && (
                <>
                  <div className="border-t border-gray-100" />
                  <button
                    onClick={() => handleSelect(null)}
                    className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <Icon.X size={16} />
                    <span>Xóa khỏi danh sách</span>
                  </button>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}