import React from 'react';
import { Icon } from '@/components/ui/AnimatedIcon';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function SmartSuggestionsPanel({ suggestions }) {
  if (!suggestions?.length) return null;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Icon.Sparkles size={20} className="text-yellow-500" />
        <h3 className="font-bold text-gray-900">Có thể bạn quan tâm</h3>
      </div>

      <div className="space-y-3">
        {suggestions.map((post, index) => (
          <SuggestionCard key={post.id} post={post} index={index} />
        ))}
      </div>
    </div>
  );
}

function SuggestionCard({ post, index }) {
  const postData = post.data || post;
  const timeAgo = formatDistanceToNow(new Date(post.created_date), { addSuffix: true, locale: vi });

  const handleClick = () => {
    // Open quick preview modal instead of scrolling
    window.dispatchEvent(new CustomEvent('open-suggestion-preview', { 
      detail: { post } 
    }));
  };

  return (
    <div
      onClick={handleClick}
      className="flex gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group block cursor-pointer"
    >
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
        className="flex gap-3 w-full"
      >
      {postData.images?.[0] && (
        <img
          src={postData.images[0]}
          alt=""
          className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
        />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900 line-clamp-2 font-medium group-hover:text-[#7CB342] transition-colors">
          {postData.content?.substring(0, 80)}...
        </p>
        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
          <span>{postData.author_name}</span>
          <span>•</span>
          <span>{timeAgo}</span>
        </div>
      </div>
      <Icon.ChevronRight size={20} className="text-gray-400 group-hover:text-[#7CB342] transition-colors" />
      </motion.div>
    </div>
  );
}