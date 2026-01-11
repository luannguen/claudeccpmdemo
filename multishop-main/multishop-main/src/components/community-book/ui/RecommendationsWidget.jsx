/**
 * RecommendationsWidget - Display book recommendations
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@/components/ui/AnimatedIcon';
import { createPageUrl } from '@/utils';
import { useBookRecommendations } from '../hooks/useBookRecommendations';

function MiniBookCard({ book, onClick }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={() => onClick(book)}
      className="flex-shrink-0 w-28 cursor-pointer"
    >
      <div className="aspect-[3/4] rounded-lg overflow-hidden bg-gradient-to-br from-[#7CB342]/20 to-[#FF9800]/20 shadow-sm">
        {book.cover_image ? (
          <img src={book.cover_image} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Icon.FileText size={24} className="text-[#7CB342]/60" />
          </div>
        )}
      </div>
      <h4 className="text-xs font-medium text-gray-900 mt-2 line-clamp-2">{book.title}</h4>
      <p className="text-xs text-gray-500 line-clamp-1">{book.author_name}</p>
    </motion.div>
  );
}

function HorizontalScroll({ title, icon, books, onBookClick, emptyMessage }) {
  if (books.length === 0) return null;

  return (
    <div className="mb-6">
      <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
        {icon}
        {title}
      </h3>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {books.map(book => (
          <MiniBookCard key={book.id} book={book} onClick={onBookClick} />
        ))}
      </div>
    </div>
  );
}

export default function RecommendationsWidget({ 
  currentUser, 
  currentBookId = null,
  showSimilar = true,
  showForYou = true,
  showPopular = true,
  showNew = false,
  compact = false
}) {
  const navigate = useNavigate();
  const { forYou, similar, popular, newReleases, isLoading } = useBookRecommendations(currentUser, currentBookId);

  const handleBookClick = (book) => {
    navigate(createPageUrl('BookDetail') + `?id=${book.id}`);
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <Icon.Spinner size={24} className="text-[#7CB342] mx-auto" />
      </div>
    );
  }

  if (compact) {
    // Compact mode - only show similar books inline
    if (similar.length === 0) return null;
    
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Icon.Sparkles size={18} className="text-purple-500" />
          Sách Tương Tự
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {similar.slice(0, 3).map(book => (
            <MiniBookCard key={book.id} book={book} onClick={handleBookClick} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {showSimilar && similar.length > 0 && (
        <HorizontalScroll
          title="Sách Tương Tự"
          icon={<Icon.Sparkles size={20} className="text-purple-500" />}
          books={similar}
          onBookClick={handleBookClick}
        />
      )}

      {showForYou && forYou.length > 0 && (
        <HorizontalScroll
          title="Dành Cho Bạn"
          icon={<Icon.Heart size={20} className="text-red-500" />}
          books={forYou}
          onBookClick={handleBookClick}
        />
      )}

      {showPopular && popular.length > 0 && (
        <HorizontalScroll
          title="Phổ Biến"
          icon={<Icon.TrendingUp size={20} className="text-blue-500" />}
          books={popular}
          onBookClick={handleBookClick}
        />
      )}

      {showNew && newReleases.length > 0 && (
        <HorizontalScroll
          title="Mới Nhất"
          icon={<Icon.Sparkles size={20} className="text-green-500" />}
          books={newReleases}
          onBookClick={handleBookClick}
        />
      )}

      {forYou.length === 0 && popular.length === 0 && similar.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Icon.FileText size={32} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm">Chưa có gợi ý sách</p>
        </div>
      )}
    </div>
  );
}