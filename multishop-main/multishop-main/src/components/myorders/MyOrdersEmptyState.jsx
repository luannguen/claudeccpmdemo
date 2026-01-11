import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ShoppingCart, ChevronRight } from "lucide-react";

export default function MyOrdersEmptyState({ hasFilters }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-8 sm:p-12 text-center">
      <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-bold text-gray-900 mb-2">
        {hasFilters ? 'Không Tìm Thấy Đơn Hàng' : 'Chưa Có Đơn Hàng'}
      </h3>
      <p className="text-sm text-gray-600 mb-6">
        {hasFilters
          ? 'Thử thay đổi bộ lọc hoặc tìm kiếm'
          : 'Bắt đầu mua sắm để xem đơn hàng tại đây'}
      </p>
      <Link
        to={createPageUrl('Services')}
        className="inline-flex items-center gap-2 bg-[#7CB342] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#FF9800] transition-colors"
      >
        Khám Phá Sản Phẩm
        <ChevronRight className="w-5 h-5" />
      </Link>
    </div>
  );
}