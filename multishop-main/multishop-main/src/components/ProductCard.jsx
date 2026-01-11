import React, { useState, useEffect, useCallback, memo } from "react";
import { Heart, Eye, Star, Plus, Sparkles } from "lucide-react";
import { createPageUrl } from "@/utils";
import { Link, useNavigate } from "react-router-dom";

// ✅ Shared utility functions
const showToast = (message, type = 'success') => {
  const toast = document.createElement('div');
  toast.className = `fixed bottom-20 right-4 ${type === 'success' ? 'bg-green-600' : 'bg-gray-800'} text-white px-4 py-2 rounded-lg shadow-lg z-[200] text-sm animate-slide-up`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2000);
};

function ProductCard({ product }) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const wishlist = JSON.parse(localStorage.getItem('zerofarm-wishlist') || '[]');
    setIsWishlisted(wishlist.includes(product.id));
  }, [product.id]);

  const handleCardClick = useCallback((e) => {
    e.preventDefault();
    // Scroll to top immediately before navigation
    window.scrollTo(0, 0);
    navigate(createPageUrl(`ProductDetail?id=${product.id}`));
  }, [product.id, navigate]);

  const handleWishlistToggle = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const wishlist = JSON.parse(localStorage.getItem('zerofarm-wishlist') || '[]');
    const newState = !isWishlisted;
    
    if (newState) {
      if (!wishlist.includes(product.id)) wishlist.push(product.id);
      showToast('❤️ Đã thêm yêu thích');
    } else {
      const idx = wishlist.indexOf(product.id);
      if (idx > -1) wishlist.splice(idx, 1);
      showToast('Đã xóa khỏi yêu thích', 'neutral');
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
    <div onClick={handleCardClick} className="block cursor-pointer">
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden group">
        {/* Image Section */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          {/* Product image - always render, let browser handle loading */}
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gradient-to-br from-green-50 to-green-100">
              <Sparkles className="w-8 h-8 mb-1" />
              <span className="text-xs text-center px-2">{product.name?.slice(0, 15)}</span>
            </div>
          )}

          {/* Badges - Compact */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.featured && (
              <span className="bg-orange-500 text-white px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5" />
                HOT
              </span>
            )}
            {hasDiscount && (
              <span className="bg-red-500 text-white px-1.5 py-0.5 rounded text-[10px] font-bold">
                -{discountPercent}%
              </span>
            )}
          </div>

          {/* Quick Actions - Mobile touch-friendly */}
          <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleWishlistToggle}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shadow transition-colors ${
                isWishlisted ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-600'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isWishlisted ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={handleQuickView}
              className="w-7 h-7 sm:w-8 sm:h-8 bg-white/90 rounded-full flex items-center justify-center shadow text-gray-600 hover:bg-blue-500 hover:text-white transition-colors"
            >
              <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>

          {/* Out of stock overlay */}
          {product.status === 'out_of_stock' && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-gray-900 text-white px-2 py-1 rounded text-xs font-bold">
                HẾT HÀNG
              </span>
            </div>
          )}
        </div>

        {/* Info Section - Compact */}
        <div className="p-2.5 sm:p-3">
          <h3 className="font-medium text-sm sm:text-base text-gray-900 line-clamp-2 mb-1 group-hover:text-[#7CB342] transition-colors min-h-[2.5rem] sm:min-h-[3rem]">
            {product.name}
          </h3>

          {/* Rating - Compact */}
          <div className="flex items-center gap-1 mb-1.5">
            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
            <span className="text-xs text-gray-600">{product.rating_average || 5}</span>
            <span className="text-xs text-gray-400">• {product.total_sold || 0} bán</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-1.5 mb-2">
            <span className="text-base sm:text-lg font-bold text-[#7CB342]">
              {displayPrice.toLocaleString('vi-VN')}đ
            </span>
            {hasDiscount && (
              <span className="text-xs text-gray-400 line-through">
                {product.price.toLocaleString('vi-VN')}đ
              </span>
            )}
          </div>

          {/* Add to cart button - Compact */}
          <button
            onClick={handleAddToCart}
            disabled={product.status === 'out_of_stock'}
            className="w-full bg-[#7CB342] text-white py-1.5 sm:py-2 rounded-md text-xs font-medium hover:bg-[#6aa336] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
          >
            <Plus className="w-3 h-3" />
            <span>Thêm vào giỏ</span>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up { animation: slide-up 0.2s ease-out; }
      `}</style>
    </div>
  );
}

export default memo(ProductCard);