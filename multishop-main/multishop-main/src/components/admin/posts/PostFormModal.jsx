import React, { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { postCategories, postStatuses } from "@/components/hooks/useAdminPosts";

export default function PostFormModal({ post, onClose, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState({
    title: post?.title || "",
    slug: post?.slug || "",
    excerpt: post?.excerpt || "",
    content: post?.content || "",
    featured_image: post?.featured_image || "",
    category: post?.category || "tin-tuc",
    tags: post?.tags?.join(", ") || "",
    author: post?.author || "",
    status: post?.status || "draft",
    published_date: post?.published_date || new Date().toISOString().split('T')[0],
    featured: post?.featured || false,
    meta_title: post?.meta_title || "",
    meta_description: post?.meta_description || ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      tags: formData.tags.split(",").map(t => t.trim()).filter(t => t),
      slug: formData.slug || formData.title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
    };
    onSubmit(submitData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between z-10">
          <h2 className="text-2xl font-serif font-bold text-[#0F0F0F]">
            {post ? 'Sửa Bài Viết' : 'Thêm Bài Viết Mới'}
          </h2>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tiêu Đề *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
                placeholder="Tiêu đề bài viết..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Slug (URL)</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({...formData, slug: e.target.value})}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
                placeholder="slug-bai-viet"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Danh Mục *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
              >
                {postCategories.filter(c => c.value !== 'all').map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tóm Tắt</label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                rows={2}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342] resize-none"
                placeholder="Tóm tắt ngắn gọn..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Nội Dung *</label>
              <textarea
                required
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                rows={10}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342] resize-none"
                placeholder="Nội dung bài viết..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">URL Ảnh Đại Diện</label>
              <input
                type="url"
                value={formData.featured_image}
                onChange={(e) => setFormData({...formData, featured_image: e.target.value})}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tác Giả</label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData({...formData, author: e.target.value})}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
                placeholder="Tên tác giả..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags (phân cách bằng dấu phẩy)</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({...formData, tags: e.target.value})}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
                placeholder="organic, sức khỏe, dinh dưỡng"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ngày Xuất Bản</label>
              <input
                type="date"
                value={formData.published_date}
                onChange={(e) => setFormData({...formData, published_date: e.target.value})}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Trạng Thái</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
              >
                {postStatuses.filter(s => s.value !== 'all').map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="font-bold text-[#0F0F0F] mb-4">SEO</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meta Title</label>
                <input
                  type="text"
                  value={formData.meta_title}
                  onChange={(e) => setFormData({...formData, meta_title: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
                  placeholder="Tiêu đề SEO..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
                <textarea
                  value={formData.meta_description}
                  onChange={(e) => setFormData({...formData, meta_description: e.target.value})}
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342] resize-none"
                  placeholder="Mô tả SEO..."
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="featured"
              checked={formData.featured}
              onChange={(e) => setFormData({...formData, featured: e.target.checked})}
              className="w-5 h-5 text-[#7CB342] rounded focus:ring-[#7CB342]"
            />
            <label htmlFor="featured" className="text-sm font-medium text-gray-700">
              Bài viết nổi bật
            </label>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-[#7CB342] text-white rounded-xl font-medium hover:bg-[#FF9800] disabled:opacity-50"
            >
              {isSubmitting ? 'Đang lưu...' : (post ? 'Cập Nhật' : 'Tạo Mới')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}