/**
 * FollowedAuthorsWidget - Display followed authors
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@/components/ui/AnimatedIcon';
import { createPageUrl } from '@/utils';
import { useAuthorFollow } from '../hooks/useAuthorFollow';

export default function FollowedAuthorsWidget({ currentUser, onAuthorClick }) {
  const navigate = useNavigate();
  const { followedAuthors, isLoading, toggleFollow } = useAuthorFollow(currentUser);

  if (!currentUser) return null;

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <div className="flex items-center justify-center py-4">
          <Icon.Spinner size={24} className="text-[#7CB342]" />
        </div>
      </div>
    );
  }

  if (followedAuthors.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Icon.Users size={18} />
          Tác Giả Theo Dõi
        </h3>
        <p className="text-sm text-gray-500 text-center py-4">
          Chưa theo dõi tác giả nào
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4">
      <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
        <Icon.Users size={18} />
        Tác Giả Theo Dõi ({followedAuthors.length})
      </h3>

      <div className="space-y-3">
        {followedAuthors.slice(0, 5).map((follow) => (
          <motion.div
            key={follow.id}
            whileHover={{ x: 4 }}
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => onAuthorClick?.(follow.author_email)}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7CB342] to-[#FF9800] flex items-center justify-center text-white font-bold overflow-hidden flex-shrink-0">
              {follow.author_avatar ? (
                <img src={follow.author_avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                follow.author_name?.[0]?.toUpperCase()
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-gray-900 truncate">
                {follow.author_name}
              </p>
              <p className="text-xs text-gray-500">Tác giả</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFollow({ email: follow.author_email, name: follow.author_name });
              }}
              className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
              title="Hủy theo dõi"
            >
              <Icon.X size={14} />
            </button>
          </motion.div>
        ))}
      </div>

      {followedAuthors.length > 5 && (
        <button
          onClick={() => navigate(createPageUrl('MyReadingList') + '?tab=authors')}
          className="w-full mt-3 py-2 text-sm text-[#7CB342] hover:bg-[#7CB342]/5 rounded-xl transition-colors"
        >
          Xem tất cả ({followedAuthors.length})
        </button>
      )}
    </div>
  );
}