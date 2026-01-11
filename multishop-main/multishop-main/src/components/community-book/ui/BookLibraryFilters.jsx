/**
 * BookLibraryFilters - Filters and search for book library
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@/components/ui/AnimatedIcon';
import { BOOK_CATEGORIES, BOOK_CATEGORY_LABELS } from '../types';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'popular', label: 'Phổ biến nhất' },
  { value: 'views', label: 'Xem nhiều nhất' },
  { value: 'chapters', label: 'Nhiều chương nhất' },
  { value: 'updated', label: 'Cập nhật gần đây' }
];

export default function BookLibraryFilters({
  searchQuery,
  categoryFilter,
  sortBy,
  onSearchChange,
  onCategoryChange,
  onSortChange,
  totalBooks = 0
}) {
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    { value: 'all', label: '📚 Tất cả' },
    ...Object.entries(BOOK_CATEGORY_LABELS).map(([value, label]) => ({
      value,
      label
    }))
  ];

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Icon.Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm kiếm sách, tác giả, tags..."
            className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-100 rounded-xl focus:outline-none focus:border-[#7CB342] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <Icon.X size={18} />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`p-3 rounded-xl border-2 transition-all ${
            showFilters || categoryFilter !== 'all' || sortBy !== 'newest'
              ? 'border-[#7CB342] bg-[#7CB342]/5 text-[#7CB342]'
              : 'border-gray-100 bg-white text-gray-600 hover:border-[#7CB342]/30'
          }`}
        >
          <Icon.Filter size={20} />
        </button>
      </div>

      {/* Expanded Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-4">
              {/* Categories */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Thể loại</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat.value}
                      onClick={() => onCategoryChange(cat.value)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                        categoryFilter === cat.value
                          ? 'bg-[#7CB342] text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Sắp xếp</label>
                <div className="flex flex-wrap gap-2">
                  {SORT_OPTIONS.map(option => (
                    <button
                      key={option.value}
                      onClick={() => onSortChange(option.value)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                        sortBy === option.value
                          ? 'bg-[#7CB342] text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              {(categoryFilter !== 'all' || sortBy !== 'newest' || searchQuery) && (
                <button
                  onClick={() => {
                    onSearchChange('');
                    onCategoryChange('all');
                    onSortChange('newest');
                  }}
                  className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
                >
                  <Icon.X size={14} />
                  Xóa bộ lọc
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Count */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>
          {totalBooks} sách
          {searchQuery && ` cho "${searchQuery}"`}
          {categoryFilter !== 'all' && ` trong ${BOOK_CATEGORY_LABELS[categoryFilter]}`}
        </span>
      </div>
    </div>
  );
}