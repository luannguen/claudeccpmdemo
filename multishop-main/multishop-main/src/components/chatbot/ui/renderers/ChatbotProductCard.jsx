/**
 * Chatbot Product Card - AI First Design
 * 
 * Architecture: UI Layer
 * - Product cards designed for chatbot context
 * - All actions handled within chatbot (no navigation away)
 * - In-chat quick view, add to cart, wishlist
 * 
 * @see AI-CODING-RULES.jsx - Section 2: UI Layer
 */

import React, { memo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, Eye, Star, Heart, Plus, Package, 
  X, Minus, ArrowRight, ChevronLeft, ChevronRight
} from 'lucide-react';
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';

// ========== HELPER FUNCTIONS ==========

const formatPrice = (price) => {
  if (!price) return '0đ';
  return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
};

const showToast = (message, type = 'success') => {
  const existing = document.querySelector('.chatbot-product-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `chatbot-product-toast fixed bottom-32 left-1/2 -translate-x-1/2 ${
    type === 'error' ? 'bg-red-600' : 'bg-gray-900'
  } text-white px-4 py-2 rounded-lg shadow-lg z-[9999] text-sm whitespace-nowrap`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
};

// ========== IN-CHAT QUICK VIEW MODAL ==========

function InChatQuickView({ product, isOpen, onClose, onNavigate }) {
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!isOpen || !product) return null;

  const {
    id,
    name = 'Sản phẩm',
    price = 0,
    sale_price,
    unit = 'sản phẩm',
    image_url = '',
    gallery = [],
    description = '',
    rating_average = 5,
    total_sold = 0,
    stock_quantity = 100,
    category = ''
  } = product;

  const hasDiscount = sale_price && sale_price < price;
  const displayPrice = sale_price || price;
  const isOutOfStock = stock_quantity === 0;
  
  const allImages = [image_url, ...(gallery || [])].filter(Boolean);
  const currentImage = allImages[currentImageIndex] || '';

  const handleAddToCart = () => {
    window.dispatchEvent(new CustomEvent('add-to-cart', {
      detail: { id, name, price: displayPrice, unit, image_url, quantity, original_price: price, category }
    }));
    showToast(`✅ Đã thêm ${quantity} ${name} vào giỏ`);
    onClose();
  };

  const handleViewFullDetail = () => {
    onClose(); // Close modal first
    onNavigate?.(id); // Navigate in same tab
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b bg-gradient-to-r from-[#7CB342] to-[#5a8f31]">
          <h3 className="font-bold text-white text-sm truncate flex-1">{name}</h3>
          <button onClick={onClose} className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Image */}
        <div className="relative h-56 bg-gray-100">
          {currentImage ? (
            <img src={currentImage} alt={name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
              <Package className="w-16 h-16 text-green-300" />
              <span className="text-green-600 mt-2">{name}</span>
            </div>
          )}

          {allImages.length > 1 && (
            <>
              <button
                onClick={() => setCurrentImageIndex(i => (i > 0 ? i - 1 : allImages.length - 1))}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow hover:bg-white"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentImageIndex(i => (i < allImages.length - 1 ? i + 1 : 0))}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow hover:bg-white"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {hasDiscount && (
            <span className="absolute top-2 left-2 bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">
              -{Math.round((1 - sale_price / price) * 100)}%
            </span>
          )}
        </div>

        {/* Info */}
        <div className="p-4 space-y-3 overflow-y-auto max-h-[40vh]">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span>{Number(rating_average).toFixed(1)}</span>
            {total_sold > 0 && <span>• {total_sold} đã bán</span>}
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#7CB342]">{formatPrice(displayPrice)}</span>
            <span className="text-gray-500">/{unit}</span>
            {hasDiscount && <span className="text-sm text-gray-400 line-through">{formatPrice(price)}</span>}
          </div>

          {description && <p className="text-sm text-gray-600 line-clamp-3">{description}</p>}

          {!isOutOfStock && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">Số lượng:</span>
              <div className="flex items-center border rounded-lg">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="p-2 hover:bg-gray-100">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 py-2 font-medium min-w-[50px] text-center">{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(stock_quantity, q + 1))} className="p-2 hover:bg-gray-100">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 border-t bg-gray-50 space-y-2">
          {isOutOfStock ? (
            <div className="text-center py-3 text-red-500 font-medium">Hết hàng</div>
          ) : (
            <button
              onClick={handleAddToCart}
              className="w-full py-3 bg-[#7CB342] hover:bg-[#5a8f31] text-white font-bold rounded-xl flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              Thêm vào giỏ - {formatPrice(displayPrice * quantity)}
            </button>
          )}
          <button
            onClick={handleViewFullDetail}
            className="w-full py-2 border border-gray-300 text-gray-700 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-100 text-sm"
          >
            <ArrowRight className="w-4 h-4" />
            Xem chi tiết đầy đủ
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ========== PRODUCT CARD COMPONENT ==========

function ChatbotProductCard({ product, onQuickView }) {
  const [isWishlisted, setIsWishlisted] = useState(() => {
    if (!product?.id) return false;
    try {
      const wishlist = JSON.parse(localStorage.getItem('zerofarm-wishlist') || '[]');
      return wishlist.includes(product.id);
    } catch { return false; }
  });

  if (!product) return null;

  const {
    id,
    name = 'Sản phẩm',
    price = 0,
    sale_price,
    unit = 'sản phẩm',
    image_url = '',
    rating_average = 5,
    total_sold = 0,
    featured = false,
    stock_quantity = 100
  } = product;

  const hasDiscount = sale_price && sale_price < price;
  const displayPrice = sale_price || price;
  const discountPercent = hasDiscount ? Math.round((1 - sale_price / price) * 100) : 0;
  const isOutOfStock = stock_quantity === 0;

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickView?.(product);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    
    window.dispatchEvent(new CustomEvent('add-to-cart', {
      detail: { id, name, price: displayPrice, unit, image_url, quantity: 1, original_price: price, category: product.category }
    }));
    showToast(`✅ Đã thêm "${name}"`);
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const wishlist = JSON.parse(localStorage.getItem('zerofarm-wishlist') || '[]');
      const newState = !isWishlisted;
      
      if (newState) {
        if (!wishlist.includes(id)) wishlist.push(id);
        showToast('❤️ Đã thêm yêu thích');
      } else {
        const idx = wishlist.indexOf(id);
        if (idx > -1) wishlist.splice(idx, 1);
        showToast('Đã xóa khỏi yêu thích');
      }
      
      localStorage.setItem('zerofarm-wishlist', JSON.stringify(wishlist));
      setIsWishlisted(newState);
      window.dispatchEvent(new Event('wishlist-updated'));
    } catch {}
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 group w-full">
      {/* Image Section - SIMPLIFIED: Direct img rendering */}
      <div className="relative h-32 cursor-pointer" onClick={handleQuickView}>
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-green-100" />
        
        {/* Image - Direct render, no complex state */}
        {image_url && (
          <img
            src={image_url}
            alt={name}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        )}
        
        {/* Placeholder only if no image_url */}
        {!image_url && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Package className="w-10 h-10 text-green-300" />
            <span className="text-[10px] text-green-600 mt-1">{name.slice(0, 15)}...</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-1.5 left-1.5 flex flex-col gap-1 z-10">
          {featured && (
            <span className="bg-orange-500 text-white px-1.5 py-0.5 rounded text-[9px] font-bold shadow">HOT</span>
          )}
          {hasDiscount && (
            <span className="bg-red-500 text-white px-1.5 py-0.5 rounded text-[9px] font-bold shadow">-{discountPercent}%</span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={handleWishlistToggle}
          className={`absolute top-1.5 right-1.5 w-7 h-7 rounded-full flex items-center justify-center shadow-md z-10 ${
            isWishlisted ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-500 hover:bg-red-50 hover:text-red-500'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Out of Stock */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
            <span className="text-white text-xs font-medium bg-gray-900 px-2 py-1 rounded">Hết hàng</span>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="p-2.5">
        <h4
          className="font-medium text-xs text-gray-900 line-clamp-2 mb-1.5 hover:text-[#7CB342] cursor-pointer leading-snug min-h-[32px]"
          onClick={handleQuickView}
        >
          {name}
        </h4>

        <div className="flex items-center gap-1 mb-1.5">
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          <span className="text-[10px] text-gray-500">
            {Number(rating_average).toFixed(1)}
            {total_sold > 0 && ` • ${total_sold} bán`}
          </span>
        </div>

        <div className="flex items-baseline gap-1 mb-2 flex-wrap">
          <span className="text-sm font-bold text-[#7CB342]">{formatPrice(displayPrice)}</span>
          <span className="text-[10px] text-gray-400">/{unit}</span>
          {hasDiscount && <span className="text-[10px] text-gray-400 line-through">{formatPrice(price)}</span>}
        </div>

        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={handleQuickView}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 text-[10px] font-medium border border-gray-200 rounded-lg hover:bg-[#7CB342] hover:text-white hover:border-[#7CB342] transition-all"
          >
            <Eye className="w-3 h-3" />
            Xem
          </button>

          {!isOutOfStock && (
            <button
              type="button"
              onClick={handleAddToCart}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 text-[10px] font-medium bg-[#7CB342] text-white rounded-lg hover:bg-[#5a8f31] transition-all"
            >
              <Plus className="w-3 h-3" />
              Thêm
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ========== PRODUCT LIST COMPONENT ==========

function ChatbotProductList({ data, onViewAllProducts }) {
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const navigate = useNavigate();
  const { title, products = [] } = data || {};

  // Navigate to product detail in same tab
  const handleNavigateToProduct = useCallback((productId) => {
    navigate(createPageUrl('ProductDetail') + `?id=${productId}`);
  }, [navigate]);

  // "Xem tất cả" -> dispatch event để chatbot load thêm sản phẩm
  const handleViewAll = () => {
    if (onViewAllProducts) {
      onViewAllProducts();
    } else {
      // Fallback: dispatch custom event for chatbot to handle
      window.dispatchEvent(new CustomEvent('chatbot-view-all-products'));
    }
  };

  if (!products?.length) {
    return (
      <div className="text-sm text-gray-600 py-3 text-center">
        <Package className="w-8 h-8 mx-auto text-gray-300 mb-2" />
        Không tìm thấy sản phẩm phù hợp.
      </div>
    );
  }

  const displayProducts = products.slice(0, 6);
  const hasMore = products.length > 6;

  return (
    <>
      <div className="space-y-2.5 max-w-full">
        {title && <p className="text-xs font-medium text-gray-700">{title}</p>}

        <div className={`grid gap-2 ${displayProducts.length === 1 ? 'grid-cols-1 max-w-[200px]' : 'grid-cols-2'}`}>
          {displayProducts.map((product) => (
            <ChatbotProductCard 
              key={product.id} 
              product={product} 
              onQuickView={setQuickViewProduct}
            />
          ))}
        </div>

        {hasMore && (
          <button
            type="button"
            onClick={handleViewAll}
            className="block w-full text-center py-2.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
          >
            Xem thêm {products.length - 6} sản phẩm khác →
          </button>
        )}
      </div>

      <AnimatePresence>
        {quickViewProduct && (
          <InChatQuickView
            product={quickViewProduct}
            isOpen={!!quickViewProduct}
            onClose={() => setQuickViewProduct(null)}
            onNavigate={handleNavigateToProduct}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ========== EXPORTS ==========

export { ChatbotProductCard, ChatbotProductList, InChatQuickView, showToast };
export default memo(ChatbotProductList);