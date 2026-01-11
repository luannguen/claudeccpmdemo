import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function CommunityHeader({ stats }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="text-center mb-8"
    >
      <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#7CB342]/10 to-[#FF9800]/10 rounded-full px-4 py-2 mb-4">
        <Sparkles className="w-4 h-4 text-[#7CB342]" />
        <span className="text-sm font-medium text-gray-700">Cộng Đồng Zero Farm</span>
      </div>
      
      <h1 className="font-medium text-4xl md:text-5xl text-[#0F0F0F] mb-4 leading-tight">
        Kết Nối & Chia Sẻ
      </h1>
      
      <p className="text-lg text-gray-600 max-w-2xl mx-auto">
        {stats.total} bài viết • {stats.totalEngagement} tương tác
      </p>
    </motion.div>
  );
}