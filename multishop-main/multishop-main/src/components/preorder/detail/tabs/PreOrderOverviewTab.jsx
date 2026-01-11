/**
 * PreOrderOverviewTab - Tab tổng quan (hiển thị đầu tiên)
 * Chỉ hiện info quan trọng nhất
 */

import React from 'react';
import { Clock, TrendingUp, Package, Users } from 'lucide-react';
import CountdownTimer from '@/components/preorder/CountdownTimer';
import SoldProgressBar from '@/components/preorder/SoldProgressBar';

export default function PreOrderOverviewTab({ lot, preOrder, daysUntilHarvest, priceIncrease }) {
  return (
    <div className="space-y-5">
      {/* Countdown - Most important for preorder */}
      {daysUntilHarvest > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Thời gian còn lại
          </h4>
          <CountdownTimer 
            targetDate={lot.estimated_harvest_date} 
            variant="compact" 
            showUrgency={true}
          />
        </div>
      )}

      {/* Stock status */}
      <div>
        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
          <Package className="w-4 h-4" />
          Tình trạng
        </h4>
        <SoldProgressBar 
          soldQuantity={lot.sold_quantity || 0}
          totalQuantity={lot.total_yield}
          availableQuantity={lot.available_quantity}
          variant="default"
          showSocialProof={true}
        />
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3">
        {/* Price trend */}
        {priceIncrease > 0 && (
          <div className="bg-orange-50 rounded-xl p-4 text-center">
            <TrendingUp className="w-5 h-5 text-orange-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-orange-600">+{priceIncrease}%</p>
            <p className="text-xs text-orange-700">So với giá khởi điểm</p>
          </div>
        )}

        {/* MOQ info */}
        <div className="bg-blue-50 rounded-xl p-4 text-center">
          <Users className="w-5 h-5 text-blue-500 mx-auto mb-1" />
          <p className="text-lg font-bold text-blue-600">{lot.moq || 1} kg</p>
          <p className="text-xs text-blue-700">Đặt tối thiểu</p>
        </div>

        {/* Total sold */}
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <Package className="w-5 h-5 text-green-500 mx-auto mb-1" />
          <p className="text-lg font-bold text-green-600">{lot.sold_quantity || 0}</p>
          <p className="text-xs text-green-700">Đã đặt mua</p>
        </div>

        {/* Available */}
        <div className="bg-purple-50 rounded-xl p-4 text-center">
          <Package className="w-5 h-5 text-purple-500 mx-auto mb-1" />
          <p className="text-lg font-bold text-purple-600">{lot.available_quantity}</p>
          <p className="text-xs text-purple-700">Còn lại</p>
        </div>
      </div>
    </div>
  );
}