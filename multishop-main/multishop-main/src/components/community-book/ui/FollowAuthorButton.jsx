/**
 * FollowAuthorButton - Button to follow/unfollow an author
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@/components/ui/AnimatedIcon';
import { useAuthorFollow, useAuthorFollowStatus } from '../hooks/useAuthorFollow';

export default function FollowAuthorButton({
  author,
  currentUser,
  variant = 'default', // 'default', 'compact', 'icon'
  showCount = false,
  className = ''
}) {
  const { toggleFollow, isFollowing: checkFollowing, isToggling } = useAuthorFollow(currentUser);
  const { isFollowing, followerCount } = useAuthorFollowStatus(author?.email, currentUser);

  // Don't show button for own profile
  if (currentUser?.email === author?.email) return null;

  const handleClick = (e) => {
    e.stopPropagation();
    toggleFollow({
      email: author.email,
      name: author.name || author.author_name,
      full_name: author.full_name || author.author_name,
      avatar: author.avatar || author.author_avatar
    });
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={handleClick}
        disabled={isToggling}
        className={`p-2 rounded-full transition-colors ${
          isFollowing
            ? 'bg-[#7CB342] text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-[#7CB342]/10 hover:text-[#7CB342]'
        } ${className}`}
        title={isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
      >
        {isToggling ? (
          <Icon.Spinner size={18} />
        ) : isFollowing ? (
          <Icon.UserCheck size={18} />
        ) : (
          <Icon.UserPlus size={18} />
        )}
      </button>
    );
  }

  if (variant === 'compact') {
    return (
      <button
        onClick={handleClick}
        disabled={isToggling}
        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
          isFollowing
            ? 'bg-[#7CB342]/10 text-[#7CB342] border border-[#7CB342]/30'
            : 'bg-gray-100 text-gray-600 hover:bg-[#7CB342]/10 hover:text-[#7CB342]'
        } ${className}`}
      >
        {isToggling ? (
          <Icon.Spinner size={12} className="inline" />
        ) : isFollowing ? (
          'Đang theo dõi'
        ) : (
          '+ Theo dõi'
        )}
      </button>
    );
  }

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      disabled={isToggling}
      className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${
        isFollowing
          ? 'bg-[#7CB342] text-white hover:bg-[#558B2F]'
          : 'bg-gray-100 text-gray-700 hover:bg-[#7CB342]/10 hover:text-[#7CB342] border border-gray-200'
      } ${className}`}
    >
      {isToggling ? (
        <Icon.Spinner size={18} />
      ) : isFollowing ? (
        <>
          <Icon.UserCheck size={18} />
          Đang theo dõi
        </>
      ) : (
        <>
          <Icon.UserPlus size={18} />
          Theo dõi
        </>
      )}
      {showCount && followerCount > 0 && (
        <span className="text-xs opacity-70">({followerCount})</span>
      )}
    </motion.button>
  );
}