/**
 * ChapterComments - Display and manage chapter comments
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@/components/ui/AnimatedIcon';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useChapterComments } from '../hooks/useChapterComments';
import { useConfirmDialog } from '@/components/hooks/useConfirmDialog';

function CommentInput({ 
  placeholder = 'Viết bình luận...', 
  onSubmit, 
  isSubmitting,
  autoFocus = false,
  onCancel
}) {
  const [content, setContent] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    onSubmit(content.trim());
    setContent('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7CB342]/50 focus:border-[#7CB342]"
      />
      <button
        type="submit"
        disabled={!content.trim() || isSubmitting}
        className="px-4 py-2 bg-[#7CB342] text-white rounded-xl text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#558B2F] transition-colors"
      >
        {isSubmitting ? <Icon.Spinner size={16} /> : <Icon.Send size={16} />}
      </button>
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-2 text-gray-500 hover:text-gray-700"
        >
          Hủy
        </button>
      )}
    </form>
  );
}

function CommentItem({ 
  comment, 
  onLike, 
  onReply, 
  onDelete, 
  isLiked, 
  canDelete,
  isReplyingTo,
  onSubmitReply,
  onCancelReply,
  isSubmitting
}) {
  const timeAgo = formatDistanceToNow(new Date(comment.created_date), { addSuffix: true, locale: vi });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group"
    >
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7CB342] to-[#FF9800] flex items-center justify-center text-white text-sm font-bold flex-shrink-0 overflow-hidden">
          {comment.author_avatar ? (
            <img src={comment.author_avatar} alt="" className="w-full h-full object-cover" />
          ) : (
            comment.author_name?.[0]?.toUpperCase()
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="bg-gray-50 rounded-xl px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm text-gray-900">{comment.author_name}</span>
              {comment.is_author_reply && (
                <span className="text-xs px-1.5 py-0.5 bg-[#7CB342]/20 text-[#7CB342] rounded">Tác giả</span>
              )}
              {comment.is_pinned && (
                <Icon.Pin size={12} className="text-amber-500" />
              )}
            </div>
            <p className="text-sm text-gray-700 mt-0.5">{comment.content}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-1 px-1">
            <button
              onClick={() => onLike(comment.id)}
              className={`text-xs flex items-center gap-1 transition-colors ${
                isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
              }`}
            >
              <Icon.Heart size={14} className={isLiked ? 'fill-current' : ''} />
              {comment.likes_count > 0 && comment.likes_count}
            </button>
            <button
              onClick={() => onReply(comment.id)}
              className="text-xs text-gray-400 hover:text-[#7CB342] transition-colors"
            >
              Trả lời
            </button>
            <span className="text-xs text-gray-400">{timeAgo}</span>
            {canDelete && (
              <button
                onClick={() => onDelete(comment.id)}
                className="text-xs text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
              >
                Xóa
              </button>
            )}
          </div>

          {/* Reply Input */}
          {isReplyingTo && (
            <div className="mt-2">
              <CommentInput
                placeholder={`Trả lời ${comment.author_name}...`}
                onSubmit={(content) => onSubmitReply(comment.id, content)}
                isSubmitting={isSubmitting}
                autoFocus
                onCancel={onCancelReply}
              />
            </div>
          )}

          {/* Replies */}
          {comment.replies_count > 0 && (
            <div className="mt-2 ml-4 pl-3 border-l-2 border-gray-100">
              {/* Replies would be loaded here */}
              <p className="text-xs text-gray-500">
                {comment.replies_count} phản hồi
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function ChapterComments({
  chapterId,
  bookId,
  currentUser,
  bookAuthorEmail
}) {
  const { showConfirm } = useConfirmDialog();
  
  const {
    comments,
    isLoading,
    replyingTo,
    addComment,
    addReply,
    deleteComment,
    toggleLike,
    setReplyingTo,
    isLiked,
    canDelete,
    isSubmitting
  } = useChapterComments(chapterId, bookId, currentUser, bookAuthorEmail);

  const handleDelete = async (commentId) => {
    const confirmed = await showConfirm({
      title: 'Xóa bình luận',
      message: 'Bạn có chắc muốn xóa bình luận này?',
      type: 'danger',
      confirmText: 'Xóa'
    });
    
    if (confirmed) {
      deleteComment(commentId);
    }
  };

  return (
    <div className="space-y-4">
      {/* Comment Input */}
      <CommentInput
        placeholder="Viết bình luận về chương này..."
        onSubmit={addComment}
        isSubmitting={isSubmitting}
      />

      {/* Comments List */}
      {isLoading ? (
        <div className="text-center py-8">
          <Icon.Spinner size={24} className="text-[#7CB342] mx-auto" />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Icon.MessageCircle size={32} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm">Chưa có bình luận nào</p>
          <p className="text-xs">Hãy là người đầu tiên bình luận!</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {comments.map(comment => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onLike={toggleLike}
                onReply={setReplyingTo}
                onDelete={handleDelete}
                isLiked={isLiked(comment)}
                canDelete={canDelete(comment)}
                isReplyingTo={replyingTo === comment.id}
                onSubmitReply={addReply}
                onCancelReply={() => setReplyingTo(null)}
                isSubmitting={isSubmitting}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}