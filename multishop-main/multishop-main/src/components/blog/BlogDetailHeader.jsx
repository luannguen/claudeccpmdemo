import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { getCategoryLabel } from "@/components/hooks/useBlog";

export default function BlogDetailHeader({ post }) {
  return (
    <>
      {post.featured_image && (
        <div className="relative h-96 overflow-hidden">
          <img
            src={post.featured_image}
            alt={post.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          {/* Category Badge */}
          <div className="absolute top-6 left-6">
            <span className="px-4 py-2 bg-[#7CB342] text-white rounded-full text-sm font-medium">
              {getCategoryLabel(post.category)}
            </span>
          </div>

          {post.featured && (
            <div className="absolute top-6 right-6">
              <span className="flex items-center gap-2 px-4 py-2 bg-[#FF9800] text-white rounded-full text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                Nổi Bật
              </span>
            </div>
          )}
        </div>
      )}
    </>
  );
}