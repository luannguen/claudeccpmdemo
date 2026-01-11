import React from "react";
import { motion } from "framer-motion";
import { Edit, Trash2, Calendar, Eye } from "lucide-react";
import { postCategories, postStatuses } from "@/components/hooks/useAdminPosts";

export default function PostCard({ post, onEdit, onDelete }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
    >
      <div className="flex gap-6">
        {post.featured_image && (
          <div className="w-48 h-32 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
            <img
              src={post.featured_image}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-serif text-xl font-bold text-[#0F0F0F]">
                  {post.title}
                </h3>
                {post.featured && (
                  <span className="bg-[#FF9800] text-white px-2 py-0.5 rounded-full text-xs font-medium">
                    Nổi bật
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                {post.excerpt || post.content?.substring(0, 150) + '...'}
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {post.published_date ? new Date(post.published_date).toLocaleDateString('vi-VN') : 'Chưa xuất bản'}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  post.status === 'published' ? 'bg-green-100 text-green-600' :
                  post.status === 'draft' ? 'bg-yellow-100 text-yellow-600' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {postStatuses.find(s => s.value === post.status)?.label}
                </span>
                <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-medium">
                  {postCategories.find(c => c.value === post.category)?.label}
                </span>
                {post.author && <span>Bởi: {post.author}</span>}
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {post.views || 0} lượt xem
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={() => onEdit(post)}
              className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Sửa
            </button>
            <button
              onClick={() => onDelete(post.id)}
              className="px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Xóa
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}