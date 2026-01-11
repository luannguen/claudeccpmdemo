import React from "react";

export const CommunityInfiniteLoader = React.forwardRef(function CommunityInfiniteLoader({ hasMore }, ref) {
  if (!hasMore) return null;

  return (
    <div ref={ref} className="py-12 text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-[#7CB342] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-gray-600">Đang tải thêm bài viết...</p>
      </div>
    </div>
  );
});

export function CommunityEndOfFeed({ totalPosts }) {
  if (totalPosts <= 5) return null;

  return (
    <div className="text-center py-8 text-gray-500 text-sm">
      🎉 Bạn đã xem hết {totalPosts} bài viết
    </div>
  );
}