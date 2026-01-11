/**
 * CollectionCard - Display a book collection
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@/components/ui/AnimatedIcon';

export default function CollectionCard({
  collection,
  onView,
  onFollow,
  isFollowing = false,
  compact = false
}) {
  const { title, description, cover_image, owner_name, books_count, followers_count, is_official } = collection;

  if (compact) {
    return (
      <motion.div
        whileHover={{ y: -2 }}
        onClick={() => onView?.(collection)}
        className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 cursor-pointer hover:shadow-md transition-all"
      >
        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100 flex-shrink-0">
          {cover_image ? (
            <img src={cover_image} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Icon.Layers size={20} className="text-purple-400" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 text-sm line-clamp-1">{title}</h4>
          <p className="text-xs text-gray-500">{books_count} sách</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all"
    >
      {/* Cover */}
      <div 
        onClick={() => onView?.(collection)}
        className="aspect-[16/9] bg-gradient-to-br from-purple-100 to-pink-100 cursor-pointer relative"
      >
        {cover_image ? (
          <img src={cover_image} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Icon.Layers size={48} className="text-purple-300" />
          </div>
        )}
        {is_official && (
          <div className="absolute top-2 left-2 px-2 py-1 bg-purple-600 text-white text-xs rounded-full flex items-center gap-1">
            <Icon.Award size={12} />
            Chính thức
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 
          onClick={() => onView?.(collection)}
          className="font-bold text-gray-900 line-clamp-1 cursor-pointer hover:text-purple-600 transition-colors"
        >
          {title}
        </h3>
        {description && (
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{description}</p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Icon.FileText size={14} />
            {books_count} sách
          </span>
          <span className="flex items-center gap-1">
            <Icon.Users size={14} />
            {followers_count} theo dõi
          </span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-500">bởi {owner_name}</span>
          {onFollow && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFollow(collection.id);
              }}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                isFollowing
                  ? 'bg-purple-100 text-purple-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-purple-50 hover:text-purple-600'
              }`}
            >
              {isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}