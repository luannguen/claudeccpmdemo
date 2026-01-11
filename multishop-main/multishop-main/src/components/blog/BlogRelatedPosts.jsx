import React from "react";
import { motion } from "framer-motion";
import { Calendar, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function BlogRelatedPosts({ posts }) {
  if (posts.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="mt-16"
    >
      <h2 className="text-3xl font-serif font-bold text-[#0F0F0F] mb-8">
        Bài Viết Liên Quan
      </h2>
      <div className="grid md:grid-cols-3 gap-8">
        {posts.map((relatedPost) => (
          <Link
            key={relatedPost.id}
            to={`${createPageUrl("BlogDetail")}?id=${relatedPost.id}`}
            className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="relative h-48 overflow-hidden">
              <img
                src={relatedPost.featured_image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=90'}
                alt={relatedPost.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
            </div>
            <div className="p-6">
              <h3 className="font-serif text-lg font-bold text-[#0F0F0F] mb-2 line-clamp-2 group-hover:text-[#7CB342] transition-colors">
                {relatedPost.title}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                {relatedPost.excerpt || relatedPost.content?.substring(0, 100) + '...'}
              </p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(relatedPost.published_date).toLocaleDateString('vi-VN')}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {relatedPost.views || 0}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}