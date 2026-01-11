/**
 * FeedbackCommentItem - Hiển thị một comment trong thread
 * Hỗ trợ: avatar, images, quote
 */

import React, { useState } from 'react';
import { Icon } from '@/components/ui/AnimatedIcon.jsx';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function FeedbackCommentItem({ 
  comment, 
  currentUserEmail,
  onQuote,
  onImageClick 
}) {
  const [imagePreview, setImagePreview] = useState(null);
  
  const isOwnComment = comment.author_email === currentUserEmail;
  const hasImages = comment.images && comment.images.length > 0;
  const hasQuote = comment.quoted_content || comment.quoted_comment_id;

  return (
    <div
      className={`p-4 rounded-xl ${
        comment.is_internal
          ? 'bg-yellow-50 border-2 border-yellow-200'
          : comment.is_admin
          ? 'bg-green-50 border-2 border-green-200'
          : isOwnComment
          ? 'bg-blue-50 border-2 border-blue-200'
          : 'bg-gray-50 border border-gray-200'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-sm overflow-hidden ${
          comment.is_admin ? 'bg-green-500 text-white' : 
          isOwnComment ? 'bg-blue-500 text-white' :
          'bg-gray-300 text-gray-700'
        }`}>
          {comment.author_avatar ? (
            <img 
              src={comment.author_avatar} 
              alt={comment.author_name}
              className="w-full h-full object-cover"
            />
          ) : (
            comment.author_name?.charAt(0)?.toUpperCase() || '?'
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-medium text-sm">{comment.author_name}</span>
            {comment.is_admin && <Badge className="text-[10px] bg-green-500 px-1.5 py-0">Admin</Badge>}
            {comment.is_internal && <Badge className="text-[10px] bg-yellow-500 px-1.5 py-0">Nội bộ</Badge>}
            {isOwnComment && !comment.is_admin && <Badge className="text-[10px] bg-blue-500 px-1.5 py-0">Bạn</Badge>}
          </div>
          
          {/* Quoted Content */}
          {hasQuote && (
            <div className="mb-2 pl-3 border-l-2 border-gray-300 bg-white/50 rounded-r-lg py-1 px-2">
              <p className="text-xs text-gray-500 font-medium">{comment.quoted_author_name}</p>
              <p className="text-xs text-gray-600 line-clamp-2">{comment.quoted_content}</p>
            </div>
          )}
          
          {/* Content */}
          <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
            {comment.content}
          </p>
          
          {/* Images */}
          {hasImages && (
            <div className="mt-3 flex flex-wrap gap-2">
              {comment.images.map((imgUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onImageClick?.(imgUrl)}
                  className="relative group"
                >
                  <img
                    src={imgUrl}
                    alt={`Attachment ${idx + 1}`}
                    className="w-20 h-20 object-cover rounded-lg border border-gray-200 hover:border-[#7CB342] transition-colors"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg transition-colors flex items-center justify-center">
                    <Icon.ZoomIn size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              ))}
            </div>
          )}
          
          {/* Footer */}
          <div className="flex items-center gap-3 mt-2">
            <p className="text-xs text-gray-500">
              {new Date(comment.created_date).toLocaleString('vi-VN')}
            </p>
            
            {onQuote && !comment.is_internal && (
              <button
                type="button"
                onClick={() => onQuote(comment)}
                className="text-xs text-gray-400 hover:text-[#7CB342] flex items-center gap-1 transition-colors"
              >
                <Icon.CornerDownLeft size={12} />
                Trả lời
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}