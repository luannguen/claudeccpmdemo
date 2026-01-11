import React from "react";
import { motion } from "framer-motion";
import { Calendar, User, Eye, Tag, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { blogCategories, getCategoryColor, getCategoryBgClass } from "@/components/hooks/useBlog";

export default function BlogPostCard({ post, index, isFeatured = false }) {
  const color = getCategoryColor(post.category);
  const bgClass = getCategoryBgClass(color);

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: index * 0.1 }}
    >
      <Link
        to={`${createPageUrl("BlogDetail")}?id=${post.id}`}
        className="block group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
      >
        {/* Image */}
        <div className={`relative ${isFeatured ? 'h-64' : 'h-48'} overflow-hidden`}>
          <img
            src={post.featured_image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=90'}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute top-4 left-4">
            <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${bgClass}`}>
              {blogCategories.find(c => c.value === post.category)?.label}
            </span>
          </div>
          {isFeatured && (
            <div className="absolute top-4 right-4 bg-[#FF9800] text-white px-3 py-1 rounded-full text-xs font-bold">
              NỔI BẬT
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className={`font-serif ${isFeatured ? 'text-xl' : 'text-lg'} font-bold text-[#0F0F0F] mb-3 group-hover:text-[#7CB342] transition-colors line-clamp-2`}>
            {post.title}
          </h3>
          
          <p className={`text-gray-600 text-sm leading-relaxed mb-4 ${isFeatured ? 'line-clamp-3' : 'line-clamp-2'}`}>
            {post.excerpt || post.content?.substring(0, isFeatured ? 120 : 100) + '...'}
          </p>

          <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(post.published_date).toLocaleDateString('vi-VN')}
            </span>
            {isFeatured && post.author && (
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {post.author}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {post.views || 0}
            </span>
          </div>

          {!isFeatured && post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.slice(0, 3).map((tag, i) => (
                <span key={i} className="flex items-center gap-1 bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                  <Tag className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="text-[#7CB342] font-medium text-sm flex items-center gap-2 group-hover:gap-3 transition-all">
            Đọc tiếp <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}