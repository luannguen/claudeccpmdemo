/**
 * PageCommentsPanel - Panel comments theo trang
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@/components/ui/AnimatedIcon';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function PageCommentsPanel({
  pageIndex,
  comments,
  currentUser,
  onAddComment,
  isAddingComment,
  onClose
}) {
  const [newComment, setNewComment] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser) return;

    await onAddComment(newComment, pageIndex, currentUser);
    setNewComment('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="absolute bottom-full mb-2 left-4 right-4 bg-white rounded-2xl shadow-xl border border-gray-200 max-h-80 flex flex-col z-30"
    >
      {/* Header */}
      <div className="p-3 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon.MessageCircle size={18} className="text-[#7CB342]" />
          <span className="font-semibold text-sm text-gray-900">
            Bình luận trang {pageIndex + 1}
          </span>
          <span className="text-xs text-gray-500">({comments.length})</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-full"
        >
          <Icon.X size={16} />
        </button>
      </div>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {comments.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <Icon.MessageCircle size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">Chưa có bình luận nào</p>
            <p className="text-xs">Hãy là người đầu tiên bình luận!</p>
          </div>
        ) : (
          comments.map((comment) => {
            const commentData = comment.data || comment;
            const timeAgo = formatDistanceToNow(
              new Date(comment.created_date),
              { addSuffix: true, locale: vi }
            );

            return (
              <div key={comment.id} className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7CB342] to-[#FF9800] flex items-center justify-center text-white text-xs font-bold overflow-hidden flex-shrink-0">
                  {commentData.author_avatar ? (
                    <img 
                      src={commentData.author_avatar} 
                      alt="" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    commentData.author_name?.[0]?.toUpperCase() || 'U'
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="bg-gray-50 rounded-xl p-2">
                    <p className="text-xs font-medium text-gray-900">
                      {commentData.author_name}
                    </p>
                    <p className="text-sm text-gray-700 mt-0.5">
                      {commentData.content}
                    </p>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 ml-2">{timeAgo}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input */}
      {currentUser ? (
        <form onSubmit={handleSubmit} className="p-3 border-t border-gray-100">
          <div className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Viết bình luận..."
              className="flex-1 px-3 py-2 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7CB342]"
            />
            <button
              type="submit"
              disabled={!newComment.trim() || isAddingComment}
              className="px-3 py-2 bg-[#7CB342] text-white rounded-xl disabled:opacity-50"
            >
              {isAddingComment ? (
                <Icon.Spinner size={16} />
              ) : (
                <Icon.Send size={16} />
              )}
            </button>
          </div>
        </form>
      ) : (
        <div className="p-3 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-500">
            Đăng nhập để bình luận
          </p>
        </div>
      )}
    </motion.div>
  );
}

// Badge hiển thị số comments trên trang
export function PageCommentBadge({ count, onClick }) {
  if (count === 0) return null;

  return (
    <button
      onClick={onClick}
      className="absolute bottom-4 right-4 flex items-center gap-1 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-colors"
    >
      <Icon.MessageCircle size={14} className="text-[#7CB342]" />
      <span className="text-xs font-medium text-gray-700">{count}</span>
    </button>
  );
}