import React from "react";
import { Sparkles, Plus } from "lucide-react";

export default function CommunityEmptyState({ filter, onCreatePost }) {
  return (
    <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
      <div className="w-16 h-16 bg-[#7CB342]/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <Sparkles className="w-8 h-8 text-[#7CB342]" />
      </div>
      <h3 className="text-lg font-serif font-bold text-gray-800 mb-2">
        Chưa Có Bài Viết
      </h3>
      <p className="text-gray-600 mb-6 text-sm">
        {filter === 'my-posts' 
          ? 'Bạn chưa có bài viết nào. Hãy chia sẻ điều gì đó!' 
          : 'Hãy là người đầu tiên chia sẻ!'}
      </p>
      <button
        onClick={onCreatePost}
        className="bg-[#7CB342] text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-[#FF9800] transition-all duration-300 inline-flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Tạo Bài Viết
      </button>
    </div>
  );
}