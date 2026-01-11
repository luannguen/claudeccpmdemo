import React from "react";
import { motion } from "framer-motion";
import { 
  Search, X, Package, SlidersHorizontal, 
  Grid3x3, List, LayoutGrid, Table2, Layers3 
} from "lucide-react";

export default function ServicesSearchBar({
  searchTerm,
  setSearchTerm,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
  showFilters,
  setShowFilters,
  filteredCount,
  displayedCount,
  onEnterFlipMode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 mb-4"
    >
      {/* Mobile: Compact layout */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-8 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#7CB342] text-sm"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Toggle - Mobile */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`sm:hidden p-2 rounded-lg transition-colors ${
            showFilters ? 'bg-[#7CB342] text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>

        {/* Sort - Compact on mobile */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="hidden sm:block px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#7CB342] bg-white text-sm cursor-pointer"
        >
          <option value="featured">⭐ Nổi bật</option>
          <option value="price-low">💰 Giá thấp → cao</option>
          <option value="price-high">💎 Giá cao → thấp</option>
          <option value="name">🔤 Tên A-Z</option>
          <option value="newest">🆕 Mới nhất</option>
          <option value="popular">🔥 Bán chạy</option>
        </select>

        {/* View Mode - Desktop only */}
        <div className="hidden sm:flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-md transition-all ${
              viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
            }`}
          >
            <Grid3x3 className={`w-4 h-4 ${viewMode === 'grid' ? 'text-[#7CB342]' : 'text-gray-600'}`} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-md transition-all ${
              viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
            }`}
          >
            <List className={`w-4 h-4 ${viewMode === 'list' ? 'text-[#7CB342]' : 'text-gray-600'}`} />
          </button>
          <button
            onClick={() => setViewMode('compact')}
            className={`p-1.5 rounded-md transition-all ${
              viewMode === 'compact' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
            }`}
          >
            <LayoutGrid className={`w-4 h-4 ${viewMode === 'compact' ? 'text-[#7CB342]' : 'text-gray-600'}`} />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`hidden lg:block p-1.5 rounded-md transition-all ${
              viewMode === 'table' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
            }`}
          >
            <Table2 className={`w-4 h-4 ${viewMode === 'table' ? 'text-[#7CB342]' : 'text-gray-600'}`} />
          </button>
        </div>

        {/* Flip Mode - Desktop */}
        <button
          onClick={onEnterFlipMode}
          className="hidden sm:flex bg-gradient-to-r from-purple-500 to-purple-600 text-white px-3 py-2 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all items-center gap-2 text-sm font-medium"
        >
          <Layers3 className="w-4 h-4" />
          <span className="hidden md:inline">Flip</span>
        </button>
      </div>

      {/* Results count - Below search on mobile */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 sm:border-0 sm:pt-0 sm:mt-0">
        <div className="text-xs sm:text-sm text-gray-500 flex items-center gap-1.5">
          <Package className="w-3.5 h-3.5 text-[#7CB342]" />
          <span>
            <strong className="text-[#7CB342]">{filteredCount}</strong> sản phẩm
            {displayedCount < filteredCount && (
              <span className="text-gray-400"> • Hiện {displayedCount}</span>
            )}
          </span>
        </div>

        {/* Mobile Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="sm:hidden px-2 py-1 border border-gray-200 rounded-md text-xs bg-white cursor-pointer"
        >
          <option value="featured">Nổi bật</option>
          <option value="price-low">Giá ↑</option>
          <option value="price-high">Giá ↓</option>
          <option value="newest">Mới nhất</option>
        </select>
      </div>
    </motion.div>
  );
}