import React from "react";
import { Search } from "lucide-react";

export default function BlogEmptyState({ onReset }) {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Search className="w-8 h-8 text-gray-400" />
      </div>
      <p className="text-gray-500 mb-4">Không tìm thấy bài viết nào</p>
      <button
        onClick={onReset}
        className="text-[#7CB342] font-medium hover:underline"
      >
        Xóa bộ lọc
      </button>
    </div>
  );
}