import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, Clock, TrendingUp, Star } from "lucide-react";

export default function CommunityFilters({
  filter,
  setFilter,
  sortBy,
  setSortBy,
  showFilters,
  setShowFilters,
  currentUser
}) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {currentUser && (
            <>
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === 'all'
                    ? 'bg-[#7CB342] text-white shadow-sm'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                Tất Cả
              </button>
              <button
                onClick={() => setFilter('my-posts')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === 'my-posts'
                    ? 'bg-[#7CB342] text-white shadow-sm'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                Của Tôi
              </button>
            </>
          )}
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Filter className="w-4 h-4" />
          Sắp xếp
        </button>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-xl border border-gray-200 p-4 mb-4 shadow-sm"
          >
            <p className="text-xs font-medium text-gray-500 mb-3">SẮP XẾP THEO</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  setSortBy('recent');
                  setShowFilters(false);
                }}
                className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-all ${
                  sortBy === 'recent'
                    ? 'bg-blue-50 border-2 border-blue-500'
                    : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                <Clock className={`w-5 h-5 ${sortBy === 'recent' ? 'text-blue-600' : 'text-gray-600'}`} />
                <span className={`text-xs font-medium ${sortBy === 'recent' ? 'text-blue-600' : 'text-gray-700'}`}>
                  Mới nhất
                </span>
              </button>
              <button
                onClick={() => {
                  setSortBy('trending');
                  setShowFilters(false);
                }}
                className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-all ${
                  sortBy === 'trending'
                    ? 'bg-orange-50 border-2 border-orange-500'
                    : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                <TrendingUp className={`w-5 h-5 ${sortBy === 'trending' ? 'text-orange-600' : 'text-gray-600'}`} />
                <span className={`text-xs font-medium ${sortBy === 'trending' ? 'text-orange-600' : 'text-gray-700'}`}>
                  Nổi bật
                </span>
              </button>
              <button
                onClick={() => {
                  setSortBy('popular');
                  setShowFilters(false);
                }}
                className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-all ${
                  sortBy === 'popular'
                    ? 'bg-purple-50 border-2 border-purple-500'
                    : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                <Star className={`w-5 h-5 ${sortBy === 'popular' ? 'text-purple-600' : 'text-gray-600'}`} />
                <span className={`text-xs font-medium ${sortBy === 'popular' ? 'text-purple-600' : 'text-gray-700'}`}>
                  Phổ biến
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}