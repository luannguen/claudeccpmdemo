import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ShoppingCart, Eye, Package, Play } from 'lucide-react';

/**
 * ✨ PRODUCT CAROUSEL FOR COMMUNITY POSTS
 * 
 * Features:
 * - Horizontal scroll/swipe on mobile
 * - Arrow navigation on desktop
 * - Snap to item
 * - Touch gestures
 * - Responsive sizing
 */

export default function ProductCarousel({ 
  products = [], 
  onProductClick, 
  onAddToCart 
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const scrollContainerRef = useRef(null);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);

  const itemWidth = 200; // Width of each product card
  const gap = 8; // Gap between items

  const canScrollLeft = currentIndex > 0;
  const canScrollRight = currentIndex < products.length - 1;

  // ✅ Handle scroll to index
  const scrollToIndex = (index) => {
    if (!scrollContainerRef.current) return;
    
    const newIndex = Math.max(0, Math.min(index, products.length - 1));
    setCurrentIndex(newIndex);
    
    const scrollLeft = newIndex * (itemWidth + gap);
    scrollContainerRef.current.scrollTo({
      left: scrollLeft,
      behavior: 'smooth'
    });
  };

  // ✅ Touch/Mouse drag handlers
  const handleDragStart = (e) => {
    setIsDragging(true);
    const pageX = e.type === 'touchstart' ? e.touches[0].pageX : e.pageX;
    startXRef.current = pageX;
    scrollLeftRef.current = scrollContainerRef.current.scrollLeft;
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    
    const pageX = e.type === 'touchmove' ? e.touches[0].pageX : e.pageX;
    const deltaX = pageX - startXRef.current;
    
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = scrollLeftRef.current - deltaX;
    }
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    // Snap to nearest item
    if (scrollContainerRef.current) {
      const scrollLeft = scrollContainerRef.current.scrollLeft;
      const newIndex = Math.round(scrollLeft / (itemWidth + gap));
      scrollToIndex(newIndex);
    }
  };

  // ✅ Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') scrollToIndex(currentIndex - 1);
      if (e.key === 'ArrowRight') scrollToIndex(currentIndex + 1);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex]);

  if (!products || products.length === 0) return null;

  return (
    <div className="relative mb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <p className="text-sm font-bold text-gray-700 flex items-center gap-2">
          <Package className="w-4 h-4 text-[#7CB342]" />
          {products.length} sản phẩm được đề xuất
        </p>
        {products.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">
              {currentIndex + 1}/{products.length}
            </span>
          </div>
        )}
      </div>

      <div className="relative">
        {/* ✅ Arrow Buttons - Desktop Only */}
        {products.length > 1 && (
          <>
            <button
              onClick={() => scrollToIndex(currentIndex - 1)}
              disabled={!canScrollLeft}
              className={`hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 bg-white rounded-full items-center justify-center shadow-lg transition-all ${
                canScrollLeft 
                  ? 'hover:bg-[#7CB342] hover:text-white hover:scale-110' 
                  : 'opacity-30 cursor-not-allowed'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => scrollToIndex(currentIndex + 1)}
              disabled={!canScrollRight}
              className={`hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 bg-white rounded-full items-center justify-center shadow-lg transition-all ${
                canScrollRight 
                  ? 'hover:bg-[#7CB342] hover:text-white hover:scale-110' 
                  : 'opacity-30 cursor-not-allowed'
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* ✅ Scrollable Container */}
        <div
          ref={scrollContainerRef}
          onMouseDown={handleDragStart}
          onMouseMove={handleDragMove}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          onTouchStart={handleDragStart}
          onTouchMove={handleDragMove}
          onTouchEnd={handleDragEnd}
          className="overflow-x-auto overflow-y-hidden scrollbar-hide cursor-grab active:cursor-grabbing"
          style={{
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          <div className="flex gap-2" style={{ width: 'max-content' }}>
            {products.map((productLink, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={(e) => {
                  if (!isDragging) {
                    onProductClick(productLink);
                  }
                }}
                className="bg-white rounded-xl border-2 border-gray-200 hover:border-[#7CB342] transition-all duration-300 shadow-sm hover:shadow-lg cursor-pointer overflow-hidden group"
                style={{ 
                  width: itemWidth,
                  scrollSnapAlign: 'start',
                  flexShrink: 0
                }}
              >
                {/* Product Image */}
                <div className="relative aspect-square bg-gray-100 overflow-hidden">
                  {productLink.product_image ? (
                    <img 
                      src={productLink.product_image} 
                      alt={productLink.product_name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      draggable={false}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-12 h-12 text-gray-300" />
                    </div>
                  )}
                  
                  {/* Eye Icon - Hover Only (Desktop) */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center transition-all pointer-events-none">
                    <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                  </div>
                  
                  {/* Video Badge */}
                  {productLink.product_video && (
                    <div className="absolute top-2 right-2 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                      <Play className="w-3.5 h-3.5 text-white fill-current" />
                    </div>
                  )}

                  {/* Cart Button - Bottom Right */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToCart(e, productLink);
                    }}
                    className="absolute bottom-2 right-2 w-10 h-10 bg-[#7CB342] text-white rounded-lg flex items-center justify-center hover:bg-[#FF9800] transition-all shadow-lg hover:shadow-xl hover:scale-110 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 z-10"
                    title="Thêm vào giỏ"
                  >
                    <ShoppingCart className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Product Info */}
                <div className="p-3 bg-gradient-to-br from-white to-gray-50">
                  <p className="font-serif font-medium text-sm truncate mb-1 group-hover:text-[#7CB342] transition-colors">
                    {productLink.product_name}
                  </p>
                  <p className="text-[#7CB342] font-bold text-base">
                    {productLink.product_price?.toLocaleString('vi-VN')}đ
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ✅ Scroll Indicator Dots - Mobile */}
        {products.length > 1 && (
          <div className="flex justify-center gap-1.5 mt-3 sm:hidden">
            {products.map((_, idx) => (
              <button
                key={idx}
                onClick={() => scrollToIndex(idx)}
                className={`transition-all ${
                  idx === currentIndex 
                    ? 'w-6 h-2 bg-[#7CB342] rounded-full' 
                    : 'w-2 h-2 bg-gray-300 rounded-full hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}