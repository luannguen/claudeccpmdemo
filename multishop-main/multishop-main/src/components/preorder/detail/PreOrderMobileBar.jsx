/**
 * PreOrderMobileBar - Sticky bottom bar cho mobile
 * Chỉ hiển thị giá + CTA buttons
 */

import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Zap, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PreOrderMobileBar({ 
  lot, 
  quantity,
  isInWishlist,
  onToggleWishlist,
  onAddToCart,
  onBuyNow,
  className = ''
}) {
  const totalPrice = (lot?.current_price || 0) * quantity;
  const depositAmount = Math.round(totalPrice * (lot?.deposit_percentage || 100) / 100);

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className={`fixed bottom-0 left-0 right-0 bg-white border-t shadow-2xl z-50 px-4 py-3 lg:hidden ${className}`}
    >
      <div className="flex items-center gap-3">
        {/* Price summary */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-[#7CB342]">
              {totalPrice.toLocaleString('vi-VN')}đ
            </span>
            {lot?.deposit_percentage < 100 && (
              <span className="text-xs text-gray-500">
                (cọc {depositAmount.toLocaleString('vi-VN')}đ)
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 truncate">{quantity} kg</p>
        </div>

        {/* Wishlist button */}
        <button
          onClick={onToggleWishlist}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
            isInWishlist 
              ? 'bg-red-100 text-red-500' 
              : 'bg-gray-100 text-gray-400'
          }`}
        >
          <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} />
        </button>

        {/* Add to cart */}
        <Button
          onClick={onAddToCart}
          variant="outline"
          className="h-10 px-3 border-[#7CB342] text-[#7CB342]"
        >
          <ShoppingCart className="w-4 h-4" />
        </Button>

        {/* Buy now */}
        <Button
          onClick={onBuyNow}
          className="h-10 px-5 bg-[#7CB342] hover:bg-[#558B2F] text-white"
        >
          <Zap className="w-4 h-4 mr-1" />
          Đặt ngay
        </Button>
      </div>
    </motion.div>
  );
}