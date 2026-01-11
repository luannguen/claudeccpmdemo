import React from 'react';
import { ShoppingBag } from 'lucide-react';

export default function CartEmptyState({ onContinueShopping }) {
  return (
    <div className="text-center py-12">
      <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <p className="text-gray-500 mb-4">Giỏ hàng trống</p>
      <button
        onClick={onContinueShopping}
        className="bg-[#7CB342] text-white px-6 py-2 rounded-xl font-medium hover:bg-[#FF9800]"
      >
        Tiếp Tục Mua Sắm
      </button>
    </div>
  );
}