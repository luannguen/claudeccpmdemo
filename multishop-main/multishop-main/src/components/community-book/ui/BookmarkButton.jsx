/**
 * BookmarkButton - Toggle bookmark for book/chapter
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@/components/ui/AnimatedIcon';
import { cn } from '@/lib/utils';

export default function BookmarkButton({
  isBookmarked,
  onToggle,
  size = 'md',
  showLabel = false,
  variant = 'default',
  className
}) {
  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-2.5'
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24
  };

  const variantClasses = {
    default: isBookmarked
      ? 'bg-amber-100 text-amber-600 border-amber-200'
      : 'bg-gray-100 text-gray-500 hover:bg-amber-50 hover:text-amber-500 border-gray-200',
    ghost: isBookmarked
      ? 'text-amber-500'
      : 'text-gray-400 hover:text-amber-500',
    outline: isBookmarked
      ? 'border-2 border-amber-500 text-amber-500 bg-amber-50'
      : 'border-2 border-gray-200 text-gray-400 hover:border-amber-500 hover:text-amber-500'
  };

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onToggle}
      className={cn(
        'rounded-lg transition-colors flex items-center gap-1.5',
        sizeClasses[size],
        variantClasses[variant],
        variant === 'outline' ? '' : 'border',
        className
      )}
      title={isBookmarked ? 'Bỏ đánh dấu' : 'Đánh dấu'}
    >
      <motion.div
        initial={false}
        animate={isBookmarked ? { 
          scale: [1, 1.3, 1],
          rotate: [0, 10, -10, 0]
        } : {}}
        transition={{ duration: 0.3 }}
      >
        <Icon.Bookmark 
          size={iconSizes[size]} 
          className={isBookmarked ? 'fill-current' : ''}
        />
      </motion.div>
      {showLabel && (
        <span className="text-sm font-medium">
          {isBookmarked ? 'Đã lưu' : 'Lưu'}
        </span>
      )}
    </motion.button>
  );
}