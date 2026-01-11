import React from "react";

export default function MyOrdersLoadingState() {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 border-4 border-[#7CB342] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600">Đang tải đơn hàng...</p>
    </div>
  );
}