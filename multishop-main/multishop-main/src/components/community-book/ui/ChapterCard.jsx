/**
 * ChapterCard - Display a chapter in book detail/editor
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@/components/ui/AnimatedIcon';
import { CHAPTER_STATUS } from '../types';
import { getChapterStatusBadge } from '../domain/chapterRules';

export default function ChapterCard({ 
  chapter, 
  index,
  isActive = false,
  showStatus = false,
  showActions = false,
  onView,
  onEdit,
  onDelete,
  onPublish,
  onVersionHistory,
  draggable = false
}) {
  const statusBadge = getChapterStatusBadge(chapter.status);
  const isPublished = chapter.status === CHAPTER_STATUS.PUBLISHED;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      whileHover={{ x: 4 }}
      onClick={() => onView?.(chapter, index)}
      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
        isActive 
          ? 'border-[#7CB342] bg-[#7CB342]/5' 
          : 'border-gray-100 bg-white hover:border-[#7CB342]/30'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Chapter Number / Drag Handle */}
        <div 
          className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 ${
            isActive 
              ? 'bg-[#7CB342] text-white' 
              : 'bg-gray-100 text-gray-600'
          } ${draggable ? 'cursor-grab active:cursor-grabbing' : ''}`}
        >
          {draggable ? (
            <Icon.Menu size={16} />
          ) : (
            index + 1
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className={`font-medium truncate ${isActive ? 'text-[#7CB342]' : 'text-gray-900'}`}>
              {chapter.title}
            </h4>
            
            {showStatus && !isPublished && (
              <span className={`text-xs px-1.5 py-0.5 rounded ${statusBadge.color}`}>
                {statusBadge.label}
              </span>
            )}

            {chapter.source_post_id && (
              <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                Import
              </span>
            )}
          </div>

          {chapter.excerpt && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{chapter.excerpt}</p>
          )}

          {/* Stats */}
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Icon.FileText size={12} />
              {chapter.word_count || 0} từ
            </span>
            <span className="flex items-center gap-1">
              <Icon.Clock size={12} />
              {chapter.reading_time_minutes || 0} phút
            </span>
            {chapter.views_count > 0 && (
              <span className="flex items-center gap-1">
                <Icon.Eye size={12} />
                {chapter.views_count}
              </span>
            )}
            {chapter.likes_count > 0 && (
              <span className="flex items-center gap-1">
                <Icon.Heart size={12} />
                {chapter.likes_count}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex items-center gap-1 flex-shrink-0">
            {onVersionHistory && chapter.version > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onVersionHistory(chapter);
                }}
                className="p-1.5 rounded-lg text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                title="Lịch sử phiên bản"
              >
                <Icon.Clock size={16} />
              </button>
            )}
            {!isPublished && onPublish && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPublish(chapter.id);
                }}
                className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                title="Xuất bản"
              >
                <Icon.CheckCircle size={16} />
              </button>
            )}
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(chapter);
                }}
                className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                title="Chỉnh sửa"
              >
                <Icon.Edit size={16} />
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(chapter.id);
                }}
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Xóa"
              >
                <Icon.Trash size={16} />
              </button>
            )}
          </div>
        )}

        {/* Arrow Indicator */}
        {!showActions && (
          <Icon.ChevronRight size={20} className={`flex-shrink-0 ${isActive ? 'text-[#7CB342]' : 'text-gray-300'}`} />
        )}
      </div>
    </motion.div>
  );
}