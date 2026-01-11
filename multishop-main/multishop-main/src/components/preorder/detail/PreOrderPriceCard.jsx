/**
 * PreOrderPriceCard - Card giá và CTA chính
 * Compact, sticky trên mobile
 */

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Tag, Percent, Shield } from 'lucide-react';

export default function PreOrderPriceCard({ 
  lot, 
  priceIncrease,
  discountPercent,
  className = '' 
}) {
  const hasDiscount = discountPercent > 0;
  const hasIncrease = priceIncrease > 0;

  return (
    <div className={`bg-gradient-to-br from-[#7CB342]/5 to-[#558B2F]/10 rounded-2xl p-5 border-2 border-[#7CB342]/20 ${className}`}>
      {/* Price badges */}
      <div className="flex flex-wrap gap-2 mb-3">
        {hasDiscount && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">
            <Percent className="w-3 h-3" />
            Tiết kiệm {discountPercent}%
          </span>
        )}
        {hasIncrease && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
            <TrendingUp className="w-3 h-3" />
            +{priceIncrease}%
          </span>
        )}
      </div>

      {/* Main price */}
      <div className="flex items-baseline gap-3 mb-2">
        <span className="text-4xl md:text-5xl font-bold text-[#558B2F]">
          {lot.current_price?.toLocaleString('vi-VN')}
        </span>
        <span className="text-xl text-[#7CB342]">đ/kg</span>
      </div>

      {/* Original price if different */}
      {lot.initial_price !== lot.current_price && (
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
          <span className="line-through">{lot.initial_price?.toLocaleString('vi-VN')}đ</span>
          <span>•</span>
          <span>Giá khởi điểm</span>
        </div>
      )}

      {/* Price ceiling */}
      <div className="flex items-center justify-between text-sm bg-white/60 rounded-xl px-3 py-2 mb-3">
        <span className="text-gray-600">Giá trần:</span>
        <span className="font-bold text-gray-800">{lot.max_price?.toLocaleString('vi-VN')}đ</span>
      </div>

      {/* Deposit info */}
      {lot.deposit_percentage < 100 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-amber-600" />
            <span className="text-sm text-amber-800">Đặt cọc</span>
          </div>
          <span className="font-bold text-amber-700">{lot.deposit_percentage}%</span>
        </div>
      )}

      {/* Trust badge */}
      <div className="mt-4 pt-3 border-t border-[#7CB342]/20 flex items-center gap-2 text-xs text-gray-500">
        <Shield className="w-4 h-4 text-green-600" />
        <span>Bảo vệ người mua • Hoàn tiền nếu không giao được</span>
      </div>
    </div>
  );
}