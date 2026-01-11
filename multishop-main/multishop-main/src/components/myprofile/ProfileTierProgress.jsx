import React from "react";
import { tierColors, tierLabels, getTierProgress, getTierThreshold } from "@/components/hooks/useMyProfile";

export default function ProfileTierProgress({ loyalty }) {
  const loyaltyTier = loyalty?.tier || 'bronze';
  const totalOrders = loyalty?.total_orders_platform || 0;
  const progress = getTierProgress(loyaltyTier, totalOrders);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="font-bold mb-4">Tiến Độ Hạng Thành Viên</h3>
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">{tierLabels[loyaltyTier]}</span>
          <span className="text-sm text-gray-600">
            {totalOrders} / {getTierThreshold(loyaltyTier)} đơn
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div 
            className={`h-full bg-gradient-to-r ${tierColors[loyaltyTier]} transition-all`} 
            style={{ width: `${progress}%` }} 
          />
        </div>
      </div>

      <div className="space-y-2 text-sm">
        {['bronze', 'silver', 'gold', 'platinum'].map((tier) => (
          <div key={tier} className={`flex items-center justify-between p-3 rounded-lg ${tier === loyaltyTier ? 'bg-green-50' : 'bg-gray-50'}`}>
            <span>
              {tier === 'bronze' && '🥉 Đồng (0-1 đơn)'}
              {tier === 'silver' && '🥈 Bạc (2-4 đơn)'}
              {tier === 'gold' && '🥇 Vàng (5-9 đơn) • +5%'}
              {tier === 'platinum' && '💎 Bạch Kim (10+ đơn) • +10%'}
            </span>
            <span className="font-bold">{tier === loyaltyTier ? '✓ Hiện tại' : ''}</span>
          </div>
        ))}
      </div>
    </div>
  );
}