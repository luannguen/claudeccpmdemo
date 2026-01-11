/**
 * BookReviewCard - Display a book review
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@/components/ui/AnimatedIcon';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

function StarRating({ rating, size = 16 }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <Icon.Star
          key={star}
          size={size}
          className={star <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}
        />
      ))}
    </div>
  );
}

export default function BookReviewCard({
  review,
  onLike,
  onDelete,
  isLiked = false,
  canDelete = false,
  compact = false
}) {
  const timeAgo = formatDistanceToNow(new Date(review.created_date), { addSuffix: true, locale: vi });

  if (compact) {
    return (
      <div className="p-3 bg-white rounded-xl border border-gray-100">
        <div className="flex items-center gap-2 mb-2">
          <StarRating rating={review.rating} size={14} />
          <span className="text-xs text-gray-500">{review.reviewer_name}</span>
        </div>
        <p className="text-sm text-gray-700 line-clamp-2">{review.content}</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 bg-white rounded-2xl border border-gray-100 group"
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7CB342] to-[#FF9800] flex items-center justify-center text-white font-bold overflow-hidden flex-shrink-0">
          {review.reviewer_avatar ? (
            <img src={review.reviewer_avatar} alt="" className="w-full h-full object-cover" />
          ) : (
            review.reviewer_name?.[0]?.toUpperCase()
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-gray-900">{review.reviewer_name}</span>
            {review.is_verified_reader && (
              <span className="text-xs px-1.5 py-0.5 bg-green-100 text-green-700 rounded flex items-center gap-1">
                <Icon.CheckCircle size={10} />
                Đã đọc xong
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <StarRating rating={review.rating} />
            <span className="text-xs text-gray-400">{timeAgo}</span>
          </div>
        </div>
        {canDelete && (
          <button
            onClick={() => onDelete?.(review.id)}
            className="p-1.5 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
          >
            <Icon.Trash size={16} />
          </button>
        )}
      </div>

      {/* Title */}
      {review.title && (
        <h4 className="font-medium text-gray-900 mt-3">{review.title}</h4>
      )}

      {/* Content */}
      <p className="text-gray-700 mt-2">{review.content}</p>

      {/* Pros & Cons */}
      {(review.pros?.length > 0 || review.cons?.length > 0) && (
        <div className="grid grid-cols-2 gap-3 mt-3">
          {review.pros?.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-green-600">Điểm mạnh</p>
              {review.pros.map((pro, i) => (
                <p key={i} className="text-xs text-gray-600 flex items-start gap-1">
                  <span className="text-green-500">+</span> {pro}
                </p>
              ))}
            </div>
          )}
          {review.cons?.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-red-600">Điểm yếu</p>
              {review.cons.map((con, i) => (
                <p key={i} className="text-xs text-gray-600 flex items-start gap-1">
                  <span className="text-red-500">−</span> {con}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <button
          onClick={() => onLike?.(review.id)}
          className={`flex items-center gap-1.5 text-sm transition-colors ${
            isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
          }`}
        >
          <Icon.Heart size={16} className={isLiked ? 'fill-current' : ''} />
          {review.likes_count > 0 && review.likes_count}
          <span className="text-xs">Hữu ích</span>
        </button>
        {review.would_recommend && (
          <span className="text-xs text-green-600 flex items-center gap-1">
            <Icon.ThumbsUp size={12} />
            Khuyên đọc
          </span>
        )}
      </div>
    </motion.div>
  );
}

export { StarRating };