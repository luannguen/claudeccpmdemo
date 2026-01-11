import React from "react";
import { base44 } from "@/api/base44Client";

/**
 * ShopCheckoutActions - Nút đặt hàng và gợi ý đăng nhập
 */
export default function ShopCheckoutActions({ 
  isProcessing, 
  cartEmpty, 
  total, 
  currentUser, 
  primaryColor 
}) {
  return (
    <>
      {/* Submit Button */}
      <button
        type="submit"
        disabled={isProcessing || cartEmpty}
        className="w-full py-4 rounded-xl font-bold text-white text-lg transition-colors disabled:opacity-50"
        style={{ backgroundColor: primaryColor }}
      >
        {isProcessing ? 'Đang xử lý...' : `Đặt Hàng - ${total.toLocaleString('vi-VN')}đ`}
      </button>

      {/* Guest login prompt */}
      {!currentUser && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="text-sm text-yellow-800 mb-2">
            💡 <strong>Mẹo:</strong> Đăng nhập để lưu thông tin và theo dõi đơn hàng dễ dàng hơn!
          </p>
          <button
            type="button"
            onClick={() => base44.auth.redirectToLogin(window.location.href)}
            className="text-sm text-[#7CB342] font-medium hover:underline"
          >
            Đăng nhập ngay →
          </button>
        </div>
      )}
    </>
  );
}