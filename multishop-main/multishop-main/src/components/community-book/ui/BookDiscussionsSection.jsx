/**
 * BookDiscussionsSection - Discussions for a book
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@/components/ui/AnimatedIcon';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useBookDiscussions } from '../hooks/useBookDiscussions';
import { useConfirmDialog } from '@/components/hooks/useConfirmDialog';

const TOPIC_TYPES = {
  general: { label: 'Chung', color: 'bg-gray-100 text-gray-700' },
  question: { label: 'Hỏi đáp', color: 'bg-blue-100 text-blue-700' },
  suggestion: { label: 'Góp ý', color: 'bg-green-100 text-green-700' },
  spoiler: { label: 'Spoiler', color: 'bg-red-100 text-red-700' },
  review: { label: 'Đánh giá', color: 'bg-amber-100 text-amber-700' }
};

function CreateDiscussionForm({ onSubmit, isSubmitting, onCancel }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [topicType, setTopicType] = useState('general');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    onSubmit({ title: title.trim(), content: content.trim(), topic_type: topicType });
    setTitle('');
    setContent('');
    setTopicType('general');
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      onSubmit={handleSubmit}
      className="bg-white rounded-xl border border-gray-200 p-4 space-y-3"
    >
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Tiêu đề thảo luận..."
        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7CB342]/50"
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Nội dung..."
        rows={3}
        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7CB342]/50 resize-none"
      />
      <div className="flex items-center justify-between">
        <select
          value={topicType}
          onChange={(e) => setTopicType(e.target.value)}
          className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none"
        >
          {Object.entries(TOPIC_TYPES).map(([key, { label }]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={!title.trim() || !content.trim() || isSubmitting}
            className="px-4 py-2 bg-[#7CB342] text-white rounded-lg text-sm font-medium disabled:opacity-50"
          >
            {isSubmitting ? <Icon.Spinner size={16} /> : 'Đăng'}
          </button>
        </div>
      </div>
    </motion.form>
  );
}

function DiscussionCard({ discussion, onClick, onLike, isLiked }) {
  const timeAgo = formatDistanceToNow(new Date(discussion.created_date), { addSuffix: true, locale: vi });
  const topicConfig = TOPIC_TYPES[discussion.topic_type] || TOPIC_TYPES.general;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white rounded-xl border border-gray-100 p-4 cursor-pointer hover:shadow-md transition-all"
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7CB342] to-[#FF9800] flex items-center justify-center text-white font-bold flex-shrink-0 overflow-hidden">
          {discussion.author_avatar ? (
            <img src={discussion.author_avatar} alt="" className="w-full h-full object-cover" />
          ) : (
            discussion.author_name?.[0]?.toUpperCase()
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {discussion.is_pinned && (
              <Icon.Pin size={14} className="text-amber-500" />
            )}
            <h4 className="font-medium text-gray-900 line-clamp-1">{discussion.title}</h4>
            <span className={`px-2 py-0.5 rounded-full text-xs ${topicConfig.color}`}>
              {topicConfig.label}
            </span>
          </div>
          <p className="text-sm text-gray-500 line-clamp-2 mt-1">{discussion.content}</p>
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
            <span>{discussion.author_name}</span>
            <span>{timeAgo}</span>
            <span className="flex items-center gap-1">
              <Icon.MessageCircle size={12} />
              {discussion.replies_count || 0}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLike(discussion.id);
              }}
              className={`flex items-center gap-1 ${isLiked ? 'text-red-500' : 'hover:text-red-500'}`}
            >
              <Icon.Heart size={12} className={isLiked ? 'fill-current' : ''} />
              {discussion.likes_count || 0}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function DiscussionDetail({ 
  discussion, 
  replies, 
  onBack, 
  onAddReply, 
  onDelete,
  onLikeReply,
  isReplying,
  isReplyLiked,
  canDelete,
  currentUser
}) {
  const [replyContent, setReplyContent] = useState('');
  const { showConfirm } = useConfirmDialog();

  const handleSubmitReply = (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    onAddReply(replyContent.trim());
    setReplyContent('');
  };

  const handleDelete = async () => {
    const confirmed = await showConfirm({
      title: 'Xóa thảo luận',
      message: 'Bạn có chắc muốn xóa thảo luận này?',
      type: 'danger',
      confirmText: 'Xóa'
    });
    if (confirmed) {
      onDelete(discussion.id);
    }
  };

  const topicConfig = TOPIC_TYPES[discussion.topic_type] || TOPIC_TYPES.general;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg">
          <Icon.ArrowLeft size={20} />
        </button>
        <h3 className="font-bold text-gray-900 flex-1">{discussion.title}</h3>
        {canDelete && (
          <button onClick={handleDelete} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
            <Icon.Trash size={18} />
          </button>
        )}
      </div>

      {/* Main content */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7CB342] to-[#FF9800] flex items-center justify-center text-white font-bold flex-shrink-0">
            {discussion.author_avatar ? (
              <img src={discussion.author_avatar} alt="" className="w-full h-full object-cover rounded-full" />
            ) : (
              discussion.author_name?.[0]?.toUpperCase()
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">{discussion.author_name}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${topicConfig.color}`}>
                {topicConfig.label}
              </span>
            </div>
            <p className="mt-2 text-gray-700 whitespace-pre-wrap">{discussion.content}</p>
          </div>
        </div>
      </div>

      {/* Replies */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-700">
          Phản hồi ({replies.length})
        </h4>
        {replies.map(reply => (
          <motion.div
            key={reply.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3 pl-4 border-l-2 border-gray-100"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7CB342] to-[#FF9800] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {reply.author_avatar ? (
                <img src={reply.author_avatar} alt="" className="w-full h-full object-cover rounded-full" />
              ) : (
                reply.author_name?.[0]?.toUpperCase()
              )}
            </div>
            <div className="flex-1">
              <div className="bg-gray-50 rounded-lg px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{reply.author_name}</span>
                  {reply.is_author_reply && (
                    <span className="text-xs px-1.5 py-0.5 bg-[#7CB342]/20 text-[#7CB342] rounded">Tác giả</span>
                  )}
                </div>
                <p className="text-sm text-gray-700 mt-1">{reply.content}</p>
              </div>
              <button
                onClick={() => onLikeReply(reply.id)}
                className={`text-xs flex items-center gap-1 mt-1 ml-1 ${
                  isReplyLiked(reply) ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                }`}
              >
                <Icon.Heart size={12} className={isReplyLiked(reply) ? 'fill-current' : ''} />
                {reply.likes_count > 0 && reply.likes_count}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Reply input */}
      {currentUser && !discussion.is_closed && (
        <form onSubmit={handleSubmitReply} className="flex gap-2">
          <input
            type="text"
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Viết phản hồi..."
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7CB342]/50"
          />
          <button
            type="submit"
            disabled={!replyContent.trim() || isReplying}
            className="px-4 py-2 bg-[#7CB342] text-white rounded-lg disabled:opacity-50"
          >
            {isReplying ? <Icon.Spinner size={16} /> : <Icon.Send size={16} />}
          </button>
        </form>
      )}

      {discussion.is_closed && (
        <p className="text-center text-sm text-gray-500 py-4 bg-gray-50 rounded-lg">
          Thảo luận này đã đóng
        </p>
      )}
    </div>
  );
}

export default function BookDiscussionsSection({ bookId, currentUser, bookAuthorEmail }) {
  const [showCreateForm, setShowCreateForm] = useState(false);

  const {
    discussions,
    activeDiscussion,
    activeDiscussionId,
    replies,
    isLoading,
    setActiveDiscussionId,
    createDiscussion,
    toggleLike,
    addReply,
    deleteDiscussion,
    toggleLikeReply,
    isLiked,
    isReplyLiked,
    canDelete,
    isCreating,
    isReplying
  } = useBookDiscussions(bookId, currentUser, bookAuthorEmail);

  const handleCreate = async (data) => {
    await createDiscussion(data);
    setShowCreateForm(false);
  };

  // Show detail view
  if (activeDiscussion) {
    return (
      <div className="space-y-4">
        <DiscussionDetail
          discussion={activeDiscussion}
          replies={replies}
          onBack={() => setActiveDiscussionId(null)}
          onAddReply={addReply}
          onDelete={deleteDiscussion}
          onLikeReply={toggleLikeReply}
          isReplying={isReplying}
          isReplyLiked={isReplyLiked}
          canDelete={canDelete(activeDiscussion)}
          currentUser={currentUser}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Icon.MessageCircle size={24} />
          Thảo Luận ({discussions.length})
        </h3>
        {currentUser && !showCreateForm && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-[#7CB342] text-white rounded-xl text-sm font-medium hover:bg-[#558B2F] transition-colors flex items-center gap-2"
          >
            <Icon.Plus size={16} />
            Tạo thảo luận
          </button>
        )}
      </div>

      {/* Create Form */}
      <AnimatePresence>
        {showCreateForm && (
          <CreateDiscussionForm
            onSubmit={handleCreate}
            isSubmitting={isCreating}
            onCancel={() => setShowCreateForm(false)}
          />
        )}
      </AnimatePresence>

      {/* Discussions List */}
      {isLoading ? (
        <div className="text-center py-8">
          <Icon.Spinner size={32} className="text-[#7CB342] mx-auto" />
        </div>
      ) : discussions.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <Icon.MessageCircle size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Chưa có thảo luận nào</p>
          <p className="text-sm text-gray-400">Hãy là người đầu tiên bắt đầu thảo luận!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {discussions.map(discussion => (
            <DiscussionCard
              key={discussion.id}
              discussion={discussion}
              onClick={() => setActiveDiscussionId(discussion.id)}
              onLike={toggleLike}
              isLiked={isLiked(discussion)}
            />
          ))}
        </div>
      )}
    </div>
  );
}