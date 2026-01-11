import React from 'react';
import { RefreshCw } from 'lucide-react';

export default function CartFooter({ total, isValidating, onCheckout }) {
  return (
    <div className="border-t pt-4">
      <div className="flex items-center justify-between text-lg font-bold mb-4">
        <span>Tổng:</span>
        <span className="text-[#7CB342]">{total.toLocaleString('vi-VN')}đ</span>
      </div>
      <button 
        onClick={onCheckout}
        disabled={isValidating}
        className="w-full bg-[#7CB342] text-white py-4 rounded-full font-medium hover:bg-[#FF9800] transition-all hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isValidating ? (
          <>
            <RefreshCw className="w-5 h-5 animate-spin" />
            Đang kiểm tra...
          </>
        ) : (
          'Đặt Hàng Ngay'
        )}
      </button>
      <p className="text-xs text-gray-500 text-center mt-3">
        Miễn phí ship từ 200k
      </p>
    </div>
  );
}