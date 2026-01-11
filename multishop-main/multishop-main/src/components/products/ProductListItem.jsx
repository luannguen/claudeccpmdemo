import React, { useState, useEffect, useCallback, memo } from "react";
import { Star, Heart, Eye, Plus } from "lucide-react";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";

function ProductListItem({ product, index }) {
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    const wishlist = JSON.parse(localStorage.getItem('zerofarm-wishlist') || '[]');
    setIsWishlisted(wishlist.includes(product.id));
  }, [product.id]);

  const toggleWishlist = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const wishlist = JSON.parse(localStorage.getItem('zerofarm-wishlist') || '[]');
    const newState = !isWishlisted;
    
    if (newState) {
      if (!wishlist.includes(product.id)) wishlist.push(product.id);
    } else {
      const idx = wishlist.indexOf(product.id);
      if (idx > -1) wishlist.splice(idx, 1);
    }
    
    localStorage.setItem('zerofarm-wishlist', JSON.stringify(wishlist));
    setIsWishlisted(newState);
    window.dispatchEvent(new Event('wishlist-updated'));
  }, [isWishlisted, product.id]);

  const handleQuickView = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent('quick-view-product', { detail: { product } }));
  }, [product]);

  const handleAddToCart = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    window.dispatchEvent(new CustomEvent('add-to-cart', { 
      detail: { 
        id: product.id,
        name: product.name,
        price: product.sale_price || product.price,
        unit: product.unit,
        image_url: product.image_url,
        quantity: 1
      } 
    }));
  }, [product]);

  const displayPrice = product.sale_price || product.price;
  const hasDiscount = product.sale_price && product.sale_price < product.price;
  const discountPercent = hasDiscount 
    ? Math.round(((product.price - product.sale_price) / product.price) * 100) 
    : 0;

  return (
    <Link to={createPageUrl(`ProductDetail?id=${product.id}`)}>
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden flex gap-3 p-2.5 sm:p-3 group">
        {/* Image - Compact square */}
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gradient-to-br from-green-50 to-green-100">
              <Star className="w-6 h-6" />
            </div>
          )}
          
          {hasDiscount && (
            <span className="absolute top-1 left-1 bg-red-500 text-white px-1 py-0.5 rounded text-[9px] font-bold">
              -{discountPercent}%
            </span>
          )}

          {/* Quick Actions - Always visible on mobile */}
          <div className="absolute top-1 right-1 flex flex-col gap-1">
            <button 
              onClick={toggleWishlist}
              className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center shadow transition-colors ${
                isWishlisted ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-600'
              }`}
            >
              <Heart className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${isWishlisted ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Info - Compact layout */}
        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
          <div>
            <h3 className="font-medium text-sm sm:text-base text-gray-900 line-clamp-2 group-hover:text-[#7CB342] transition-colors">
              {product.name}
            </h3>

            <div className="flex items-center gap-1.5 mt-1">
              <div className="flex items-center gap-0.5">
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                <span className="text-xs text-gray-500">{product.rating_average || 5}</span>
              </div>
              <span className="text-xs text-gray-400">• {product.total_sold || 0} bán</span>
            </div>
          </div>

          <div className="flex items-end justify-between mt-1.5">
            <div>
              <span className="text-base sm:text-lg font-bold text-[#7CB342]">
                {displayPrice.toLocaleString('vi-VN')}đ
              </span>
              {hasDiscount && (
                <span className="text-[10px] text-gray-400 line-through ml-1">
                  {product.price.toLocaleString('vi-VN')}đ
                </span>
              )}
            </div>

            <button
              onClick={handleAddToCart}
              className="bg-[#7CB342] text-white px-2.5 py-1.5 rounded-lg text-xs font-medium hover:bg-[#6aa336] active:scale-95 transition-all flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span className="hidden sm:inline">Thêm</span>
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default memo(ProductListItem);