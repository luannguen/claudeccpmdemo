import React, { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { 
  Search, X, Package, SlidersHorizontal, 
  Grid3x3, List, LayoutGrid, Table2, Layers3 
} from "lucide-react";
import { useDebouncedCallback } from "@/components/shared/utils/debounce";

export default function StickySearchBar({
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
  onEnterFlipMode,
  categories,
  activeFilter,
  setActiveFilter,
  priceRanges = [],
  priceRange = 'all',
  setPriceRange
}) {
  const [isSticky, setIsSticky] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);
  const searchBarRef = useRef(null);
  const originalTop = useRef(0);

  // ✅ AI Tracking: Search query (debounced)
  const trackSearchDebounced = useCallback((query) => {
    if (query && query.length > 2) {
      window.dispatchEvent(new CustomEvent('ai-track-search', { 
        detail: { query, resultsCount: filteredCount } 
      }));
    }
  }, [filteredCount]);

  // Track search when user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      trackSearchDebounced(searchTerm);
    }, 1000);
    return () => clearTimeout(timer);
  }, [searchTerm, trackSearchDebounced]);

  // ✅ AI Tracking: Category browse
  useEffect(() => {
    if (activeFilter && activeFilter !== 'all') {
      const category = categories?.find(c => c.key === activeFilter);
      window.dispatchEvent(new CustomEvent('ai-track-category', { 
        detail: { 
          category: activeFilter, 
          categoryName: category?.name || activeFilter 
        } 
      }));
    }
  }, [activeFilter, categories]);

  useEffect(() => {
    if (searchBarRef.current) {
      originalTop.current = searchBarRef.current.getBoundingClientRect().top + window.scrollY;
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDirection = currentScrollY > lastScrollY.current ? 'down' : 'up';
      
      // Check if should be sticky (passed original position)
      const shouldStick = currentScrollY > originalTop.current - 60;
      setIsSticky(shouldStick);
      
      // Show/hide header based on scroll direction
      if (scrollDirection === 'down' && currentScrollY > 100) {
        setShowHeader(false);
      } else if (scrollDirection === 'up') {
        setShowHeader(true);
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Desktop: always show filters
  const shouldShowCategories = typeof window !== 'undefined' ? (showFilters || window.innerWidth >= 640) : true;

  return (
    <>
      {/* Placeholder to prevent layout shift */}
      <div ref={searchBarRef} className={isSticky ? 'h-[88px] sm:h-[100px]' : ''} />
      
      {/* Sticky Search Container */}
      <div
        className={`
          ${isSticky 
            ? 'fixed left-0 right-0 px-3 sm:px-6 lg:px-8' 
            : ''
          }
          transition-all duration-300
        `}
        style={{
          top: isSticky ? (showHeader ? '80px' : '0px') : 'auto',
          zIndex: isSticky ? 40 : 'auto',
          pointerEvents: 'auto',
        }}
      >
        <div className={`
          ${isSticky ? 'max-w-7xl mx-auto' : ''}
        `}>
          {/* Search Bar */}
          <div 
            className={`
              bg-white/95 backdrop-blur-md rounded-lg shadow-sm border border-gray-100/80
              ${isSticky ? 'p-2 sm:p-3' : 'p-3 sm:p-4 mb-4'}
              transition-all duration-200
            `}
            style={{ pointerEvents: 'auto' }}
          >
            {/* Main Search Row */}
            <div className="flex items-center gap-2">
              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`
                    w-full pl-8 pr-7 border border-gray-200 rounded-md focus:outline-none focus:border-[#7CB342] text-sm bg-white/80
                    ${isSticky ? 'py-1.5' : 'py-2'}
                  `}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Filter Toggle - Mobile */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowFilters(!showFilters);
                }}
                className={`sm:hidden p-2.5 rounded-lg transition-colors z-10 min-w-[40px] min-h-[40px] flex items-center justify-center ${
                  showFilters ? 'bg-[#7CB342] text-white' : 'bg-gray-100 text-gray-600 active:bg-gray-200'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>

              {/* View Mode - Mobile (now includes table and flip) */}
              <div className="sm:hidden flex items-center gap-0.5 bg-gray-100 rounded-lg p-0.5">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === 'grid' ? 'bg-white shadow-sm' : ''
                  }`}
                  title="Lưới"
                >
                  <Grid3x3 className={`w-4 h-4 ${viewMode === 'grid' ? 'text-[#7CB342]' : 'text-gray-500'}`} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === 'list' ? 'bg-white shadow-sm' : ''
                  }`}
                  title="Danh sách"
                >
                  <List className={`w-4 h-4 ${viewMode === 'list' ? 'text-[#7CB342]' : 'text-gray-500'}`} />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === 'table' ? 'bg-white shadow-sm' : ''
                  }`}
                  title="Bảng"
                >
                  <Table2 className={`w-4 h-4 ${viewMode === 'table' ? 'text-[#7CB342]' : 'text-gray-500'}`} />
                </button>
                <button
                  onClick={onEnterFlipMode}
                  className="p-2 rounded-md transition-all bg-purple-100"
                  title="FlipMode 3D"
                >
                  <Layers3 className="w-4 h-4 text-purple-500" />
                </button>
              </div>

              {/* Sort - Desktop */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`
                  hidden sm:block px-2 border border-gray-200 rounded-md focus:outline-none focus:border-[#7CB342] bg-white text-xs cursor-pointer
                  ${isSticky ? 'py-1.5' : 'py-2'}
                `}
              >
                <option value="featured">⭐ Nổi bật</option>
                <option value="price-low">💰 Giá thấp</option>
                <option value="price-high">💎 Giá cao</option>
                <option value="name">🔤 Tên A-Z</option>
                <option value="newest">🆕 Mới nhất</option>
              </select>

              {/* View Mode - Desktop */}
              <div className="hidden sm:flex items-center gap-0.5 bg-gray-100 rounded-md p-0.5">
                {[
                  { mode: 'grid', icon: Grid3x3 },
                  { mode: 'list', icon: List },
                  { mode: 'compact', icon: LayoutGrid },
                ].map(({ mode, icon: Icon }) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`p-1 rounded transition-all ${
                      viewMode === mode ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${viewMode === mode ? 'text-[#7CB342]' : 'text-gray-500'}`} />
                  </button>
                ))}
                <button
                  onClick={() => setViewMode('table')}
                  className={`hidden lg:block p-1 rounded transition-all ${
                    viewMode === 'table' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                  }`}
                >
                  <Table2 className={`w-3.5 h-3.5 ${viewMode === 'table' ? 'text-[#7CB342]' : 'text-gray-500'}`} />
                </button>
              </div>

              {/* Flip Mode - Desktop */}
              <button
                onClick={onEnterFlipMode}
                className="hidden sm:flex bg-purple-500 text-white px-2 py-1.5 rounded-md hover:bg-purple-600 transition-all items-center gap-1 text-xs font-medium"
              >
                <Layers3 className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Flip</span>
              </button>
            </div>

            {/* Results + Mobile Sort Row */}
            <div className={`
              flex items-center justify-between
              ${isSticky ? 'mt-1 pt-1' : 'mt-2 pt-2'} 
              border-t border-gray-100/60 sm:border-0 sm:pt-0 sm:mt-0
            `}>
              <div className="text-[10px] sm:text-xs text-gray-500 flex items-center gap-1">
                <Package className="w-3 h-3 text-[#7CB342]" />
                <span>
                  <strong className="text-[#7CB342]">{filteredCount}</strong> sản phẩm
                  {displayedCount < filteredCount && (
                    <span className="text-gray-400 hidden xs:inline"> • Hiện {displayedCount}</span>
                  )}
                </span>
              </div>

              {/* Mobile Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sm:hidden px-1.5 py-0.5 border border-gray-200 rounded text-[10px] bg-white cursor-pointer"
              >
                <option value="featured">Nổi bật</option>
                <option value="price-low">Giá ↑</option>
                <option value="price-high">Giá ↓</option>
                <option value="newest">Mới</option>
              </select>
            </div>
          </div>

          {/* Category Filter - Only show when sticky or when toggled */}
          <AnimatePresence>
            {shouldShowCategories && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className={`
                  overflow-hidden
                  ${isSticky ? 'bg-white/90 backdrop-blur-md rounded-lg shadow-sm mt-1 p-2' : 'mb-4'}
                `}
              >
                {/* Mobile: Horizontal scroll */}
                <div className="sm:hidden overflow-x-auto -mx-2 px-2 scrollbar-hide">
                  <div className="flex gap-1.5 w-max">
                    {categories.map((category) => (
                      <button
                        key={category.key}
                        onClick={() => setActiveFilter(category.key)}
                        className={`flex-shrink-0 px-2 py-1 rounded-full text-[10px] font-medium transition-all whitespace-nowrap ${
                          activeFilter === category.key
                            ? 'bg-[#7CB342] text-white'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        <span className="mr-0.5">{category.icon}</span>
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Desktop: Flex wrap */}
                <div className="hidden sm:flex flex-wrap justify-center gap-1.5">
                  {categories.map((category) => (
                    <button
                      key={category.key}
                      onClick={() => setActiveFilter(category.key)}
                      className={`px-3 py-1.5 rounded-lg font-medium transition-all text-xs flex items-center gap-1 ${
                        activeFilter === category.key
                          ? 'bg-[#7CB342] text-white shadow-sm'
                          : 'bg-white text-gray-600 hover:bg-[#7CB342]/10 border border-gray-200'
                      }`}
                    >
                      <span>{category.icon}</span>
                      <span>{category.name}</span>
                    </button>
                  ))}
                </div>

                {/* Price Range Filter */}
                {priceRanges && priceRanges.length > 0 && setPriceRange && (
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    {/* Mobile: Horizontal scroll */}
                    <div className="sm:hidden overflow-x-auto -mx-2 px-2 scrollbar-hide">
                      <div className="flex gap-1.5 w-max">
                        {priceRanges.map((range) => (
                          <button
                            key={range.key}
                            onClick={() => setPriceRange(range.key)}
                            className={`flex-shrink-0 px-2 py-1 rounded-full text-[10px] font-medium transition-all whitespace-nowrap ${
                              priceRange === range.key
                                ? 'bg-amber-500 text-white'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            <span className="mr-0.5">{range.icon}</span>
                            {range.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Desktop: Flex wrap */}
                    <div className="hidden sm:flex flex-wrap justify-center gap-1.5">
                      {priceRanges.map((range) => (
                        <button
                          key={range.key}
                          onClick={() => setPriceRange(range.key)}
                          className={`px-3 py-1.5 rounded-lg font-medium transition-all text-xs flex items-center gap-1 ${
                            priceRange === range.key
                              ? 'bg-amber-500 text-white shadow-sm'
                              : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                          }`}
                        >
                          <span>{range.icon}</span>
                          <span>{range.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  );
}