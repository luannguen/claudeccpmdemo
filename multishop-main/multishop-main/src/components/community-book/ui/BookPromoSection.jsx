/**
 * BookPromoSection - Promotion banner for Community Book feature
 * Shows featured books and CTA to explore book library
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Icon } from '@/components/ui/AnimatedIcon';
import { createPageUrl } from '@/utils';
import { bookRepository } from '../data/bookRepository';

export default function BookPromoSection({ currentUser, compact = false }) {
  const navigate = useNavigate();

  const { data: featuredBooks = [] } = useQuery({
    queryKey: ['community-books-featured-promo'],
    queryFn: () => bookRepository.listFeatured(3),
    staleTime: 5 * 60 * 1000
  });

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-[#7CB342]/10 to-[#FF9800]/10 rounded-2xl p-4 mb-6 border border-[#7CB342]/20"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#7CB342] rounded-xl flex items-center justify-center">
              <span className="text-xl">📚</span>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Sách Cộng Đồng</h3>
              <p className="text-xs text-gray-600">{featuredBooks.length}+ sách hay</p>
            </div>
          </div>
          <button
            onClick={() => navigate(createPageUrl('BookLibrary'))}
            className="px-3 py-1.5 bg-[#7CB342] text-white rounded-lg text-sm font-medium hover:bg-[#558B2F] transition-colors flex items-center gap-1"
          >
            Khám phá
            <Icon.ChevronRight size={14} />
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-[#7CB342]/5 via-white to-[#FF9800]/5 rounded-3xl p-6 mb-8 border-2 border-[#7CB342]/20 overflow-hidden relative"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-4 right-4 text-6xl">📚</div>
        <div className="absolute bottom-4 left-4 text-4xl">✨</div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              📚 Thư Viện Sách Cộng Đồng
              <span className="px-2 py-0.5 bg-[#7CB342] text-white text-xs rounded-full">Mới</span>
            </h2>
            <p className="text-gray-600 mt-1">
              Đọc và viết sách cùng cộng đồng. Chia sẻ kiến thức, kinh nghiệm của bạn!
            </p>
          </div>
        </div>

        {/* Featured Books */}
        {featuredBooks.length > 0 && (
          <div className="flex gap-3 mb-4 overflow-x-auto pb-2 -mx-2 px-2">
            {featuredBooks.map((book, index) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => navigate(createPageUrl('BookDetail') + `?id=${book.id}`)}
                className="flex-shrink-0 w-32 cursor-pointer group"
              >
                <div className="aspect-[3/4] rounded-xl overflow-hidden bg-gradient-to-br from-[#7CB342]/20 to-[#FF9800]/20 mb-2 shadow-md group-hover:shadow-lg transition-shadow">
                  {book.cover_image ? (
                    <img 
                      src={book.cover_image} 
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Icon.FileText size={32} className="text-[#7CB342]/60" />
                    </div>
                  )}
                </div>
                <p className="text-xs font-medium text-gray-900 line-clamp-2 group-hover:text-[#7CB342] transition-colors">
                  {book.title}
                </p>
                <p className="text-xs text-gray-500">{book.author_name}</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* CTA Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => navigate(createPageUrl('BookLibrary'))}
            className="px-4 py-2 bg-[#7CB342] text-white rounded-xl font-medium hover:bg-[#558B2F] transition-colors flex items-center gap-2"
          >
            <Icon.FileText size={18} />
            Khám Phá Thư Viện
          </button>
          {currentUser && (
            <button
              onClick={() => navigate(createPageUrl('BookLibrary') + '?create=true')}
              className="px-4 py-2 border-2 border-[#7CB342] text-[#7CB342] rounded-xl font-medium hover:bg-[#7CB342]/5 transition-colors flex items-center gap-2"
            >
              <Icon.Plus size={18} />
              Viết Sách
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
          <div className="text-center">
            <p className="text-lg font-bold text-[#7CB342]">{featuredBooks.length}+</p>
            <p className="text-xs text-gray-500">Sách</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-[#FF9800]">50+</p>
            <p className="text-xs text-gray-500">Tác giả</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-blue-600">1000+</p>
            <p className="text-xs text-gray-500">Lượt đọc</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}