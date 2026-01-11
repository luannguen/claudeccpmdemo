import React from 'react';
import { Star } from 'lucide-react';

export default function OrderSummaryCard({ order }) {
  return (
    <div className="bg-gradient-to-br from-[#7CB342] to-[#5a8f31] text-white rounded-2xl p-4 sm:p-6">
      <h4 className="font-bold mb-3 sm:mb-4 text-base sm:text-lg">Tóm Tắt Đơn Hàng</h4>
      <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
        <div className="flex justify-between">
          <span className="opacity-90">Tạm tính:</span>
          <span className="font-bold">{(order.subtotal || 0).toLocaleString('vi-VN')}đ</span>
        </div>
        <div className="flex justify-between">
          <span className="opacity-90">Phí ship:</span>
          <span className="font-bold">{(order.shipping_fee || 0).toLocaleString('vi-VN')}đ</span>
        </div>
        {order.discount_amount > 0 && (
          <div className="flex justify-between text-yellow-300">
            <span className="opacity-90">Giảm giá:</span>
            <span className="font-bold">-{order.discount_amount.toLocaleString('vi-VN')}đ</span>
          </div>
        )}
        <div className="flex justify-between pt-2 sm:pt-3 border-t border-white/30 text-base sm:text-lg">
          <span>Tổng cộng:</span>
          <span className="font-bold">{(order.total_amount || 0).toLocaleString('vi-VN')}đ</span>
        </div>
      </div>

      <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-white/30 flex items-center justify-between">
        <span className="text-xs sm:text-sm opacity-90">Điểm tích lũy:</span>
        <span className="flex items-center gap-1 font-bold text-yellow-300 text-sm sm:text-base">
          <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-current" />
          +{Math.floor((order.total_amount || 0) / 1000)} điểm
        </span>
      </div>
    </div>
  );
}