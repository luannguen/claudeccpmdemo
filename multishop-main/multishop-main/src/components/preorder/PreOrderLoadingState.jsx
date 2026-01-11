import React from "react";

export default function PreOrderLoadingState() {
  return (
    <div className="text-center py-20">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#7CB342] mx-auto mb-4"></div>
      <p className="text-gray-600">Đang tải...</p>
    </div>
  );
}