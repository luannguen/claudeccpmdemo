import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function ServicesHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center mb-4 sm:mb-6"
    >
      {/* Mobile: Compact header */}
      <div className="sm:hidden">
        <h1 className="font-medium text-xl text-[#0F0F0F] mb-1">
          Sản Phẩm Organic
        </h1>
        <p className="text-xs text-gray-500">
          100% Organic • Tươi ngon mỗi ngày
        </p>
      </div>

      {/* Desktop: Full header */}
      <div className="hidden sm:block">
        <div className="inline-flex items-center gap-2 bg-[#7CB342]/10 rounded-full px-4 py-1.5 mb-3">
          <Sparkles className="w-4 h-4 text-[#7CB342]" />
          <span className="text-sm font-medium text-[#7CB342]">Sản Phẩm Của Chúng Tôi</span>
        </div>
        
        <h1 className="font-medium text-3xl md:text-4xl text-[#0F0F0F] mb-3">
          Sản Phẩm Organic Cao Cấp
        </h1>
        
        <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto">
          Khám phá bộ sưu tập sản phẩm nông nghiệp hữu cơ cao cấp. 
          100% Organic, không dư lượng, tươi ngon mỗi ngày.
        </p>
      </div>
    </motion.div>
  );
}