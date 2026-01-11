import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function BlogHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="text-center mb-16"
    >
      <div className="inline-flex items-center gap-2 bg-[#7CB342]/10 rounded-full px-4 py-2 mb-6">
        <Sparkles className="w-4 h-4 text-[#7CB342]" />
        <span className="text-sm font-medium text-[#7CB342]">Blog & Tin Tức</span>
      </div>
      
      <h1 className="font-medium text-[length:var(--font-h1)] text-[#0F0F0F] mb-6 leading-tight">
        Kiến Thức Organic
      </h1>
      
      <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-[1.618]">
        Khám phá thế giới nông nghiệp hữu cơ, mẹo vặt sức khỏe và 
        công thức chế biến món ngon từ Zero Farm.
      </p>
    </motion.div>
  );
}