import React from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@/components/ui/AnimatedIcon';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import PostContentRenderer from './PostContentRenderer';

export default function PostQuickPreview({ post, onClose, onViewFull, showReadButton = true }) {
  if (!post) return null;

  const postData = post.data || post;
  const timeAgo = formatDistanceToNow(new Date(post.created_date), { addSuffix: true, locale: vi });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#7CB342] to-[#558B2F] rounded-full flex items-center justify-center text-white font-bold">
              {postData.author_name?.charAt(0) || 'U'}
            </div>
            <div>
              <h3 className="font-bold text-gray-900">{postData.author_name}</h3>
              <p className="text-sm text-gray-500">{timeAgo}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
          >
            <Icon.X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          <PostContentRenderer content={postData.content} className="mb-4" />

          {/* Preview Image */}
          {postData.images?.[0] && (
            <img 
              src={postData.images[0]} 
              alt="Preview" 
              className="w-full rounded-xl mb-4"
            />
          )}

          {/* Stats */}
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Icon.Heart size={16} />
              <span>{postData.likes_count || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <Icon.MessageCircle size={16} />
              <span>{postData.comments_count || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <Icon.Eye size={16} />
              <span>{postData.views_count || 0}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex gap-3">
          {showReadButton && (
            <button
              onClick={onViewFull}
              className="flex-1 bg-[#7CB342] text-white py-3 rounded-xl font-medium hover:bg-[#689F38] transition-colors flex items-center justify-center gap-2"
            >
              <Icon.FileText size={18} />
              Đọc chi tiết
            </button>
          )}
          <button
            onClick={onClose}
            className={`py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors ${showReadButton ? 'px-6' : 'flex-1'}`}
          >
            Đóng
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}