import React from "react";
import { Gift, Star, Award, TrendingUp } from "lucide-react";
import { tierLabels } from "@/components/hooks/useMyProfile";

export default function ProfileLoyalty({ loyalty }) {
  const loyaltyTier = loyalty?.tier || 'bronze';

  return (
    <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl shadow-lg p-6 border-2 border-green-200">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <Gift className="w-5 h-5 text-[#7CB342]" />
        Điểm Tích Lũy Platform
      </h2>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 text-center">
          <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2 fill-current" />
          <p className="text-3xl font-bold text-[#7CB342]">{loyalty?.total_points || 0}</p>
          <p className="text-sm text-gray-600">Điểm hiện có</p>
        </div>
        <div className="bg-white rounded-xl p-4 text-center">
          <Award className="w-8 h-8 text-purple-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-purple-600">{tierLabels[loyaltyTier]}</p>
          <p className="text-sm text-gray-600">Hạng thành viên</p>
        </div>
        <div className="bg-white rounded-xl p-4 text-center">
          <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <p className="text-3xl font-bold text-blue-600">{loyalty?.total_orders_platform || 0}</p>
          <p className="text-sm text-gray-600">Đơn hàng</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4">
        <h4 className="font-bold mb-3">Quy Đổi Điểm:</h4>
        <ul className="space-y-2 text-sm">
          <li className="flex items-center gap-2"><Star className="w-4 h-4 text-yellow-500 fill-current" />1.000đ = 1 điểm</li>
          <li className="flex items-center gap-2"><Gift className="w-4 h-4 text-green-600" />100 điểm = Giảm 10.000đ</li>
          <li className="flex items-center gap-2"><Award className="w-4 h-4 text-purple-600" />Hạng Vàng: +5% điểm</li>
        </ul>
      </div>
    </div>
  );
}