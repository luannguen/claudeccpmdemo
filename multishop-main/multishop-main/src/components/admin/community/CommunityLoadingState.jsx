import React from "react";

export default function CommunityLoadingState() {
  return (
    <div className="text-center py-12">
      <div className="w-12 h-12 border-4 border-[#7CB342] border-t-transparent rounded-full animate-spin mx-auto"></div>
      <p className="mt-4 text-sm text-gray-600">Đang tải...</p>
    </div>
  );
}