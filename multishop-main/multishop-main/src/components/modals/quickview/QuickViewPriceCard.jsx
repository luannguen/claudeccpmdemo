import React from "react";
import { Award } from "lucide-react";

/**
 * QuickViewPriceCard - Hiển thị giá sản phẩm
 * 
 * Props:
 * - displayPrice: number
 * - originalPrice: number
 * - unit: string
 * - hasDiscount: boolean
 * - shopCount: number
 */
export default function QuickViewPriceCard({ 
  displayPrice, 
  originalPrice, 
  unit, 
  hasDiscount, 
  shopCount 
}) {
  return (
    <div className="bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-3 sm:mb-4 shadow-md border border-[#7CB342]/20">
      {/* Price Display */}
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-[#7CB342] to-[#5a8f31] bg-clip-text text-transparent">
          {displayPrice.toLocaleString('vi-VN')}đ
        </span>
        {hasDiscount && (
          <span className="text-base sm:text-lg text-gray-400 line-through">
            {originalPrice.toLocaleString('vi-VN')}đ
          </span>
        )}
        <span className="text-sm sm:text-base text-gray-600 font-medium">/{unit}</span>
      </div>

      {/* Shop Count */}
      {shopCount > 0 && (
        <div className="flex items-center gap-2 text-xs text-gray-600 bg-white/50 rounded-full px-3 py-1 w-fit">
          <Award className="w-3 h-3 text-[#7CB342]" />
          <span>{shopCount} shops đang bán</span>
        </div>
      )}
    </div>
  );
}