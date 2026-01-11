import React from "react";
import { ShoppingCart, Eye } from "lucide-react";

/**
 * QuickViewActions - Nút hành động (Thêm giỏ, Mua ngay, Xem chi tiết)
 * 
 * Props:
 * - onAddToCart: function
 * - onBuyNow: function
 * - onViewDetail: function
 */
export default function QuickViewActions({ onAddToCart, onBuyNow, onViewDetail }) {
  return (
    <>
      {/* Main Buttons */}
      <div className="flex gap-2 mb-3 sm:mb-4">
        <ActionButton 
          onClick={onAddToCart} 
          variant="secondary"
          icon={<ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />}
          label="Thêm Giỏ"
          labelMobile="Giỏ"
        />
        <ActionButton 
          onClick={onBuyNow} 
          variant="primary"
          icon={<ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />}
          label="Mua Ngay"
        />
      </div>

      {/* View Detail Link */}
      <button 
        onClick={onViewDetail}
        className="w-full text-center text-[#7CB342] hover:text-[#FF9800] font-medium text-sm underline flex items-center justify-center gap-2 py-2 hover:bg-green-50 rounded-xl transition-all"
      >
        <Eye className="w-4 h-4" />
        Xem Chi Tiết Đầy Đủ →
      </button>
    </>
  );
}

function ActionButton({ onClick, variant, icon, label, labelMobile }) {
  const isPrimary = variant === 'primary';
  
  const className = isPrimary
    ? "flex-1 bg-gradient-to-r from-[#7CB342] to-[#5a8f31] text-white py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm hover:from-[#FF9800] hover:to-[#ff6b00] transition-all flex items-center justify-center gap-1 sm:gap-2 shadow-lg min-h-[44px] touch-manipulation"
    : "flex-1 bg-white text-[#7CB342] py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm border-2 border-[#7CB342] hover:bg-[#7CB342] hover:text-white transition-all flex items-center justify-center gap-1 sm:gap-2 shadow-md min-h-[44px] touch-manipulation";

  return (
    <button onClick={onClick} className={className}>
      {icon}
      {labelMobile ? (
        <>
          <span className="hidden sm:inline">{label}</span>
          <span className="sm:hidden">{labelMobile}</span>
        </>
      ) : (
        label
      )}
    </button>
  );
}