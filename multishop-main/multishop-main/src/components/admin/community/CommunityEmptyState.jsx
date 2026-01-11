import React from "react";
import { MessageSquare } from "lucide-react";

export default function CommunityEmptyState() {
  return (
    <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
      <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
      <p className="text-gray-500 text-sm">Không tìm thấy bài viết</p>
    </div>
  );
}