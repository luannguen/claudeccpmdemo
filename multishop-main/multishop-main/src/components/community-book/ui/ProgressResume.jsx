/**
 * ProgressResume - Resume reading from where you left off
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@/components/ui/AnimatedIcon';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function ProgressResume({
  resumeInfo,
  chapters,
  onResume,
  onStartOver,
  show = true
}) {
  if (!show || !resumeInfo?.hasProgress) return null;

  const currentChapter = chapters?.find(c => c.id === resumeInfo.chapterId);
  const timeAgo = resumeInfo.lastReadAt
    ? formatDistanceToNow(new Date(resumeInfo.lastReadAt), { addSuffix: true, locale: vi })
    : null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="bg-gradient-to-r from-[#7CB342]/10 to-[#8BC34A]/10 border border-[#7CB342]/20 rounded-2xl p-4"
        >
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="w-12 h-12 rounded-xl bg-[#7CB342] text-white flex items-center justify-center flex-shrink-0">
              <Icon.FileText size={24} />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-gray-900">Tiếp tục đọc</h4>
              {currentChapter && (
                <p className="text-sm text-gray-600 mt-0.5 line-clamp-1">
                  Chương {resumeInfo.chapterIndex + 1}: {currentChapter.title}
                </p>
              )}
              
              {/* Progress Bar */}
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>Tiến độ</span>
                  <span>{resumeInfo.progressPercent}%</span>
                </div>
                <div className="h-2 bg-white rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${resumeInfo.progressPercent}%` }}
                    transition={{ duration: 0.5 }}
                    className="h-full bg-gradient-to-r from-[#7CB342] to-[#8BC34A] rounded-full"
                  />
                </div>
              </div>

              {timeAgo && (
                <p className="text-xs text-gray-400 mt-2">
                  Đọc lần cuối {timeAgo}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={onResume}
              className="flex-1 py-2.5 bg-[#7CB342] text-white rounded-xl font-medium hover:bg-[#558B2F] transition-colors flex items-center justify-center gap-2"
            >
              <Icon.Play size={18} />
              Tiếp tục đọc
            </button>
            <button
              onClick={onStartOver}
              className="px-4 py-2.5 bg-white text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-colors border border-gray-200"
            >
              Đọc từ đầu
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}