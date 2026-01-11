import React from "react";
import { Calendar, User, Eye } from "lucide-react";

export default function BlogDetailMeta({ post }) {
  return (
    <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-8 pb-8 border-b border-gray-200">
      {post.author && (
        <div className="flex items-center gap-2">
          <User className="w-5 h-5" />
          <span className="font-medium">{post.author}</span>
        </div>
      )}
      <div className="flex items-center gap-2">
        <Calendar className="w-5 h-5" />
        <span>{new Date(post.published_date).toLocaleDateString('vi-VN', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</span>
      </div>
      <div className="flex items-center gap-2">
        <Eye className="w-5 h-5" />
        <span>{post.views || 0} lượt xem</span>
      </div>
    </div>
  );
}