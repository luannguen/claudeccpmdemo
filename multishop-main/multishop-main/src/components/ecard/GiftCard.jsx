/**
 * @deprecated Use GiftCard from '@/components/features/gift' instead
 * This component will be removed in a future version.
 * 
 * Migration: Replace import with:
 * import { GiftCard } from '@/components/features/gift';
 * 
 * The new version has more features: redeem, swap actions
 */

import React from "react";
import { Icon } from "@/components/ui/AnimatedIcon";

/** @deprecated Use GiftCard from features/gift module */
export default function GiftCard({ gift, mode }) {
  const statusConfig = {
    sent: { label: 'Đã gửi', color: 'blue', IconComp: Icon.Send },
    redeemed: { label: 'Đã đổi', color: 'green', IconComp: Icon.CheckCircle },
    expired: { label: 'Hết hạn', color: 'red', IconComp: Icon.XCircle },
    cancelled: { label: 'Đã hủy', color: 'gray', IconComp: Icon.Ban }
  };

  const status = statusConfig[gift.status] || statusConfig.sent;

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Image */}
      {gift.item_image && (
        <img
          src={gift.item_image}
          alt={gift.item_name}
          className="w-full h-40 object-cover"
        />
      )}

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-bold text-gray-900 flex-1">{gift.item_name}</h3>
          <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${status.color}-100 text-${status.color}-700 flex items-center gap-1`}>
            {status.IconComp && <status.IconComp size={12} />}
            {status.label}
          </span>
        </div>

        <p className="text-sm text-gray-600 mb-2">
          {mode === 'received' ? `Từ: ${gift.sender_name}` : `Đến: ${gift.receiver_name}`}
        </p>

        {gift.message && (
          <p className="text-sm text-gray-500 italic mb-3">"{gift.message}"</p>
        )}

        <div className="flex items-center justify-between pt-3 border-t">
          <div className="text-sm">
            <span className="text-gray-500">Giá trị: </span>
            <span className="font-bold text-[#7CB342]">
              {gift.item_value.toLocaleString('vi-VN')}đ
            </span>
          </div>

          {mode === 'received' && gift.status === 'sent' && (
            <button className="px-3 py-1 bg-blue-500 text-white rounded-lg text-xs hover:bg-blue-600">
              Đổi quà
            </button>
          )}
        </div>

        {gift.redemption_code && (
          <div className="mt-3 p-2 bg-gray-50 rounded text-center">
            <p className="text-xs text-gray-500">Mã đổi quà</p>
            <p className="font-mono font-bold text-gray-900">{gift.redemption_code}</p>
          </div>
        )}
      </div>
    </div>
  );
}