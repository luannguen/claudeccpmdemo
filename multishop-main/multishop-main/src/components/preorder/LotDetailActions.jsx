import React from "react";
import { Heart, ShoppingCart } from "lucide-react";

export default function LotDetailActions({ 
  lot, 
  isInWishlist, 
  onToggleWishlist, 
  onAddToCart, 
  onBuyNow 
}) {
  return (
    <div className="flex gap-3">
      <button onClick={onToggleWishlist}
        className={`px-6 py-4 rounded-xl font-semibold transition-all flex items-center gap-2 ${
          isInWishlist ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}>
        <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} />
        {isInWishlist ? 'Đã lưu' : 'Yêu thích'}
      </button>
      
      <button onClick={onAddToCart}
        disabled={lot.available_quantity <= 0}
        className="flex-1 bg-white text-[#7CB342] py-4 rounded-xl font-bold hover:bg-[#7CB342] hover:text-white transition-all border-2 border-[#7CB342] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
        <ShoppingCart className="w-5 h-5" />Thêm Giỏ
      </button>
      
      <button onClick={onBuyNow}
        disabled={lot.available_quantity <= 0}
        className="flex-1 bg-gradient-to-r from-[#7CB342] to-[#5a8f31] text-white py-4 rounded-xl font-bold hover:from-[#FF9800] hover:to-[#ff6b00] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg">
        Mua Ngay
      </button>
    </div>
  );
}