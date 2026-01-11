import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, Leaf } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import ProductListItem from "@/components/products/ProductListItem";
import ProductCompactCard from "@/components/products/ProductCompactCard";
import ProductTable from "@/components/products/ProductTable";

export default function ServicesProductGrid({
  viewMode,
  displayedProducts,
  filteredProducts,
  isLoading,
  isError,
  hasMore,
  displayCount,
  setDisplayCount,
  searchTerm,
  activeFilter,
  onClearFilters
}) {
  const loadMoreRef = useRef(null);

  // Infinite Scroll Observer
  useEffect(() => {
    if (!loadMoreRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setDisplayCount(prev => Math.min(prev + 12, filteredProducts.length));
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [displayCount, filteredProducts.length, hasMore, setDisplayCount]);

  if (isError) {
    return (
      <div className="text-center py-12 bg-orange-50 rounded-3xl border-2 border-orange-200 mb-8">
        <p className="text-orange-700 mb-4">
          Không thể tải sản phẩm. Vui lòng thử lại sau.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-[#7CB342] text-white px-6 py-3 rounded-full font-medium hover:bg-[#FF9800] transition-colors"
        >
          Tải Lại Trang
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 border-3 border-[#7CB342] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-gray-500 text-sm">Đang tải...</p>
      </div>
    );
  }

  if (filteredProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <Leaf className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 text-sm mb-3">
          {searchTerm ? `Không tìm thấy "${searchTerm}"` : 'Không có sản phẩm'}
        </p>
        {(searchTerm || activeFilter !== 'all') && (
          <button
            onClick={onClearFilters}
            className="text-[#7CB342] font-medium hover:underline text-sm"
          >
            Xóa bộ lọc
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      {/* GRID VIEW - Default: 2 cols mobile, 3 cols tablet, 4 cols desktop */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-5">
          {displayedProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.3) }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      )}

      {/* LIST VIEW - Detailed */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {displayedProducts.map((product, index) => (
            <ProductListItem key={product.id} product={product} index={index} />
          ))}
        </div>
      )}

      {/* COMPACT VIEW - More columns */}
      {viewMode === 'compact' && (
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
          {displayedProducts.map((product, index) => (
            <ProductCompactCard key={product.id} product={product} index={index} />
          ))}
        </div>
      )}

      {/* TABLE VIEW - All devices with horizontal scroll on mobile */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
          <ProductTable products={displayedProducts} />
        </div>
      )}

      {/* Infinite Scroll Trigger */}
      {hasMore && (
        <div ref={loadMoreRef} className="py-8 text-center">
          <Loader2 className="w-6 h-6 text-[#7CB342] animate-spin mx-auto" />
        </div>
      )}
    </>
  );
}