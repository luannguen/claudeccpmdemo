/**
 * BookCard - Display a book in library grid
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@/components/ui/AnimatedIcon';
import { BOOK_CATEGORY_LABELS, BOOK_STATUS } from '../types';
import { getBookStatusBadge } from '../domain/bookRules';

export default function BookCard({ 
  book, 
  currentUser,
  onView,
  onLike,
  onFork,
  showStatus = false,
  compact = false
}) {
  const isLiked = book.liked_by?.includes(currentUser?.email);
  const isOwner = book.author_email === currentUser?.email;
  const statusBadge = getBookStatusBadge(book.status);
  const categoryLabel = BOOK_CATEGORY_LABELS[book.category] || book.category;

  if (compact) {
    return (
      <motion.div
        whileHover={{ y: -2 }}
        onClick={() => onView?.(book)}
        className="flex gap-3 p-3 bg-white rounded-xl border border-gray-100 hover:border-[#7CB342]/30 cursor-pointer transition-all"
      >
        {/* Cover */}
        <div className="w-16 h-20 rounded-lg overflow-hidden bg-gradient-to-br from-[#7CB342]/20 to-[#FF9800]/20 flex-shrink-0">
          {book.cover_image ? (
            <img src={book.cover_image} alt={book.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Icon.FileText size={24} className="text-[#7CB342]" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm text-gray-900 truncate">{book.title}</h4>
          <p className="text-xs text-gray-500 mt-0.5">{book.author_name}</p>
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
            <span>{book.chapters_count || 0} chương</span>
            <span>•</span>
            <span>{book.reading_time_minutes || 0} phút đọc</span>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.1)' }}
      className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-[#7CB342]/30 transition-all group"
    >
      {/* Cover Image */}
      <div 
        onClick={() => onView?.(book)}
        className="relative aspect-[3/4] bg-gradient-to-br from-[#7CB342]/20 to-[#FF9800]/20 cursor-pointer overflow-hidden"
      >
        {book.cover_image ? (
          <img 
            src={book.cover_image} 
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4">
            <Icon.FileText size={48} className="text-[#7CB342]/60 mb-2" />
            <p className="text-sm text-gray-500 text-center font-medium line-clamp-3">{book.title}</p>
          </div>
        )}

        {/* Status Badge */}
        {showStatus && book.status !== BOOK_STATUS.PUBLISHED && (
          <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}>
            {statusBadge.label}
          </div>
        )}

        {/* Fork Badge */}
        {book.forked_from && (
          <div className="absolute top-2 right-2 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium flex items-center gap-1">
            <Icon.Copy size={12} />
            Fork
          </div>
        )}

        {/* Category Badge */}
        <div className="absolute bottom-2 left-2 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs">
          {categoryLabel}
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
              <Icon.FileText size={24} className="text-[#7CB342]" />
            </div>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 
          onClick={() => onView?.(book)}
          className="font-bold text-gray-900 line-clamp-1 cursor-pointer hover:text-[#7CB342] transition-colors"
        >
          {book.title}
        </h3>

        {book.description && (
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{book.description}</p>
        )}

        {/* Author */}
        <div className="flex items-center gap-2 mt-3">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#7CB342] to-[#FF9800] flex items-center justify-center text-white text-xs font-bold overflow-hidden">
            {book.author_avatar ? (
              <img src={book.author_avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              book.author_name?.[0]?.toUpperCase()
            )}
          </div>
          <span className="text-sm text-gray-600">{book.author_name}</span>
          {isOwner && (
            <span className="text-xs bg-[#7CB342]/10 text-[#7CB342] px-1.5 py-0.5 rounded">Của bạn</span>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Icon.FileText size={12} />
              {book.chapters_count || 0} chương
            </span>
            <span className="flex items-center gap-1">
              <Icon.Clock size={12} />
              {book.reading_time_minutes || 0}p
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLike?.(book);
              }}
              className={`p-1.5 rounded-full transition-colors ${
                isLiked 
                  ? 'text-red-500 bg-red-50' 
                  : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
              }`}
            >
              <Icon.Heart size={16} />
            </button>
            <span className="text-xs text-gray-500 min-w-[20px]">{book.likes_count || 0}</span>

            {book.allow_fork && !isOwner && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onFork?.(book);
                }}
                className="p-1.5 rounded-full text-gray-400 hover:text-purple-500 hover:bg-purple-50 transition-colors"
                title="Fork sách này"
              >
                <Icon.Copy size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}