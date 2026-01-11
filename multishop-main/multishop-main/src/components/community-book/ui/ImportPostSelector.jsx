/**
 * ImportPostSelector - Select user posts to import as chapters
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@/components/ui/AnimatedIcon';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function ImportPostSelector({
  posts = [],
  onImport,
  isImporting = false,
  existingSourceIds = []
}) {
  const [selectedPosts, setSelectedPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter already imported posts
  const availablePosts = posts.filter(
    post => !existingSourceIds.includes(post.id)
  );

  // Filter by search
  const filteredPosts = availablePosts.filter(post =>
    post.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSelect = (postId) => {
    setSelectedPosts(prev =>
      prev.includes(postId)
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
  };

  const handleImportSelected = () => {
    const postsToImport = posts.filter(p => selectedPosts.includes(p.id));
    postsToImport.forEach(post => onImport(post));
    setSelectedPosts([]);
  };

  if (posts.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-2xl">
        <Icon.FileText size={48} className="text-gray-300 mx-auto mb-4" />
        <h3 className="font-bold text-gray-700 mb-2">Chưa có bài viết</h3>
        <p className="text-gray-500 text-sm">
          Bạn chưa có bài viết nào để import. Hãy tạo bài viết trong cộng đồng trước.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-900">Import từ bài viết</h3>
        {selectedPosts.length > 0 && (
          <button
            onClick={handleImportSelected}
            disabled={isImporting}
            className="px-4 py-2 bg-[#7CB342] text-white rounded-xl text-sm font-medium hover:bg-[#558B2F] transition-colors flex items-center gap-2"
          >
            {isImporting ? (
              <Icon.Spinner size={16} />
            ) : (
              <Icon.Download size={16} />
            )}
            Import {selectedPosts.length} bài
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Icon.Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Tìm bài viết..."
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7CB342]/50"
        />
      </div>

      {/* Posts list */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {availablePosts.length === 0 
              ? 'Tất cả bài viết đã được import'
              : 'Không tìm thấy bài viết phù hợp'
            }
          </div>
        ) : (
          <AnimatePresence>
            {filteredPosts.map((post) => {
              const isSelected = selectedPosts.includes(post.id);
              const timeAgo = formatDistanceToNow(new Date(post.created_date), {
                addSuffix: true,
                locale: vi
              });

              return (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  onClick={() => toggleSelect(post.id)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-[#7CB342] bg-[#7CB342]/5'
                      : 'border-gray-100 hover:border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      isSelected ? 'bg-[#7CB342]' : 'border-2 border-gray-300'
                    }`}>
                      {isSelected && <Icon.Check size={14} className="text-white" />}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 line-clamp-2">
                        {post.content?.substring(0, 150)}...
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                        <span>{timeAgo}</span>
                        {post.images?.length > 0 && (
                          <span className="flex items-center gap-1">
                            <Icon.Image size={12} />
                            {post.images.length} ảnh
                          </span>
                        )}
                        {post.video_url && (
                          <span className="flex items-center gap-1">
                            <Icon.Video size={12} />
                            Video
                          </span>
                        )}
                        <span>{post.likes_count || 0} thích</span>
                      </div>
                    </div>

                    {/* Thumbnail */}
                    {post.images?.[0] && (
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <img
                          src={post.images[0]}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Info */}
      <div className="text-xs text-gray-500 bg-gray-50 rounded-xl p-3">
        <Icon.Info size={14} className="inline mr-1" />
        Bài viết đã import sẽ trở thành chương trong sách. Bạn có thể chỉnh sửa nội dung sau khi import.
      </div>
    </div>
  );
}