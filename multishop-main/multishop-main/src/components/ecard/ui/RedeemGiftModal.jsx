/**
 * RedeemGiftModal - Modal đổi quà tặng
 * Kế thừa EnhancedModal
 */

import React, { useState } from "react";
import { Icon } from "@/components/ui/AnimatedIcon";
import EnhancedModal from "@/components/EnhancedModal";
import { useGifts } from "@/components/ecard";

export default function RedeemGiftModal({ isOpen, onClose }) {
  const [code, setCode] = useState('');
  const { redeemGift, isRedeeming } = useGifts();

  const handleSubmit = (e) => {
    e.preventDefault();
    redeemGift(code);
  };

  return (
    <EnhancedModal
      isOpen={isOpen}
      onClose={onClose}
      title="Đổi quà tặng"
      maxWidth="md"
      showControls={false}
      enableDrag={false}
      positionKey="redeem-gift"
    >
      <form id="redeem-form" onSubmit={handleSubmit} className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mã đổi quà
          </label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="GIFT-XXXXXXXX"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#7CB342] font-mono"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Nhập mã đổi quà bạn nhận được từ người gửi
          </p>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <button
            type="submit"
            form="redeem-form"
            disabled={isRedeeming || !code}
            className="w-full px-4 py-3 bg-[#7CB342] text-white rounded-xl hover:bg-[#689F38] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isRedeeming ? (
              <>
                <Icon.Spinner size={20} />
                Đang xử lý...
              </>
            ) : (
              <>
                <Icon.Gift size={20} />
                Đổi quà ngay
              </>
            )}
          </button>
        </div>
      </form>
    </EnhancedModal>
  );
}