import React from "react";
import { AlertCircle } from "lucide-react";

export default function CommunityErrorState() {
  return (
    <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 text-center mb-8">
      <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
      <p className="text-orange-700 mb-4">Không thể tải bài viết. Vui lòng thử lại sau.</p>
      <button
        onClick={() => window.location.reload()}
        className="bg-[#7CB342] text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-[#FF9800] transition-colors"
      >
        Tải Lại
      </button>
    </div>
  );
}