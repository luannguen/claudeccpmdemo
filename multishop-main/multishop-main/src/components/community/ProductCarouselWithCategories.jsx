import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, ChevronDown } from "lucide-react";
import ProductCarousel3D from "./ProductCarousel3D";

/**
 * ProductCarouselWithCategories - Wrapper cho ProductCarousel3D với khả năng vuốt dọc chuyển category
 * 
 * @param {Array} categories - Danh sách categories: [{ id, name, icon, products: [] }]
 * @param {Number} initialCategoryIndex - Index category khởi tạo
 * @param {Function} onProductClick - Callback khi click sản phẩm
 * @param {Function} onAddToCart - Callback khi thêm giỏ hàng
 * @param {Function} onAddToWishlist - Callback khi thêm wishlist
 * @param {Number} swipeThreshold - Ngưỡng vuốt dọc (px) - Default: 50
 * @param {Boolean} showCategoryIndicator - Hiển thị indicator category - Default: true
 */
export default function ProductCarouselWithCategories({
  categories = [],
  initialCategoryIndex = 0,
  onProductClick,
  onAddToCart,
  onAddToWishlist,
  swipeThreshold = 50,
  showCategoryIndicator = true,
  width = 900,
  height = 340,
  autoplay = false,
  interval = 3500
}) {
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(initialCategoryIndex);
  const [direction, setDirection] = useState(0); // 1: up, -1: down
  
  // Touch state for vertical swipe detection
  const touchStartRef = useRef({ x: 0, y: 0, time: 0 });
  const touchEndRef = useRef({ x: 0, y: 0 });
  const isSwipingRef = useRef(false);
  const containerRef = useRef(null);

  const currentCategory = categories[currentCategoryIndex] || {};
  const canSwipeUp = currentCategoryIndex < categories.length - 1;
  const canSwipeDown = currentCategoryIndex > 0;

  // Handle vertical swipe
  const handleTouchStart = useCallback((e) => {
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };
    touchEndRef.current = { x: touch.clientX, y: touch.clientY };
    isSwipingRef.current = false;
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!e.touches[0]) return;
    
    const touch = e.touches[0];
    touchEndRef.current = {
      x: touch.clientX,
      y: touch.clientY
    };

    const deltaX = Math.abs(touch.clientX - touchStartRef.current.x);
    const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);

    // Determine if this is a vertical swipe (prioritize vertical over horizontal)
    if (deltaY > deltaX && deltaY > 10) {
      isSwipingRef.current = true;
      // Prevent default to avoid page scroll during vertical swipe
      if (deltaY > 30) {
        e.preventDefault();
      }
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!isSwipingRef.current) {
      isSwipingRef.current = false;
      return;
    }

    const deltaX = touchEndRef.current.x - touchStartRef.current.x;
    const deltaY = touchEndRef.current.y - touchStartRef.current.y;
    const deltaTime = Date.now() - touchStartRef.current.time;

    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    // Check if it's a valid vertical swipe
    if (absY > swipeThreshold && absY > absX * 1.5 && deltaTime < 500) {
      if (deltaY < 0 && canSwipeUp) {
        // Swipe up -> next category
        setDirection(1);
        setCurrentCategoryIndex(prev => Math.min(prev + 1, categories.length - 1));
      } else if (deltaY > 0 && canSwipeDown) {
        // Swipe down -> previous category
        setDirection(-1);
        setCurrentCategoryIndex(prev => Math.max(prev - 1, 0));
      }
    }

    isSwipingRef.current = false;
  }, [canSwipeUp, canSwipeDown, categories.length, swipeThreshold]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowUp' && canSwipeDown) {
        setDirection(-1);
        setCurrentCategoryIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'ArrowDown' && canSwipeUp) {
        setDirection(1);
        setCurrentCategoryIndex(prev => Math.min(prev + 1, categories.length - 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canSwipeUp, canSwipeDown, categories.length]);

  const goToCategory = (index) => {
    if (index === currentCategoryIndex) return;
    setDirection(index > currentCategoryIndex ? 1 : -1);
    setCurrentCategoryIndex(index);
  };

  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <div 
      ref={containerRef}
      className="product-carousel-with-categories relative"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ touchAction: 'pan-x' }} // Allow horizontal pan for carousel
    >
      {/* Category Header */}
      {showCategoryIndicator && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <div className="inline-flex items-center gap-3 bg-white rounded-2xl px-6 py-3 shadow-lg border-2 border-[#7CB342]/20">
            {currentCategory.icon && (
              <span className="text-2xl">{currentCategory.icon}</span>
            )}
            <div className="flex flex-col items-start">
              <span className="text-xs text-gray-500 uppercase tracking-wide">
                Danh Mục {currentCategoryIndex + 1}/{categories.length}
              </span>
              <h3 className="text-lg font-bold text-gray-900">
                {currentCategory.name || 'Sản phẩm'}
              </h3>
            </div>
          </div>
        </motion.div>
      )}

      {/* Carousel Container with Animation */}
      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentCategoryIndex}
            custom={direction}
            initial={{ 
              y: direction > 0 ? 100 : -100,
              opacity: 0,
              scale: 0.95
            }}
            animate={{ 
              y: 0,
              opacity: 1,
              scale: 1
            }}
            exit={{ 
              y: direction > 0 ? -100 : 100,
              opacity: 0,
              scale: 0.95
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
              opacity: { duration: 0.3 }
            }}
          >
            <ProductCarousel3D
              products={currentCategory.products || []}
              onProductClick={onProductClick}
              onAddToCart={onAddToCart}
              onAddToWishlist={onAddToWishlist}
              width={width}
              height={height}
              autoplay={autoplay}
              interval={interval}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Arrows - Category switcher positioned at far right, outside carousel nav area */}
      <div className="absolute top-1/2 right-[-60px] sm:right-[-70px] transform -translate-y-1/2 flex flex-col gap-2 z-30">
        <button
          onClick={() => goToCategory(Math.max(0, currentCategoryIndex - 1))}
          disabled={!canSwipeDown}
          className={`w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center transition-all border border-gray-200 ${
            canSwipeDown 
              ? 'text-[#7CB342] hover:bg-[#7CB342] hover:text-white hover:scale-110' 
              : 'text-gray-300 cursor-not-allowed'
          }`}
          aria-label="Previous category"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
        
        <button
          onClick={() => goToCategory(Math.min(categories.length - 1, currentCategoryIndex + 1))}
          disabled={!canSwipeUp}
          className={`w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center transition-all border border-gray-200 ${
            canSwipeUp 
              ? 'text-[#7CB342] hover:bg-[#7CB342] hover:text-white hover:scale-110' 
              : 'text-gray-300 cursor-not-allowed'
          }`}
          aria-label="Next category"
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      </div>

      {/* Category Dots Indicator */}
      {showCategoryIndicator && categories.length > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {categories.map((cat, index) => (
            <button
              key={cat.id || index}
              onClick={() => goToCategory(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentCategoryIndex
                  ? 'w-8 h-2 bg-gradient-to-r from-[#7CB342] to-[#FF9800]'
                  : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to ${cat.name}`}
            />
          ))}
        </div>
      )}

      {/* Swipe Hint (show on first render) */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ delay: 3, duration: 1 }}
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center text-sm text-gray-500 pointer-events-none"
      >
        <div className="flex items-center gap-2 bg-white/90 px-4 py-2 rounded-full shadow-md">
          <ChevronUp className="w-4 h-4 animate-bounce" />
          <span>Vuốt dọc để đổi danh mục</span>
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </div>
      </motion.div>

      <style>{`
        .product-carousel-with-categories {
          position: relative;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }

        /* Prevent accidental text selection during swipe */
        .product-carousel-with-categories * {
          -webkit-user-drag: none;
          -webkit-touch-callout: none;
        }

        @media (max-width: 768px) {
          /* Hide category navigation on mobile - use swipe instead */
          .product-carousel-with-categories > div.absolute {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}