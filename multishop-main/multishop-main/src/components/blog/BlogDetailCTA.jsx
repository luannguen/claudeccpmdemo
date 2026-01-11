import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function BlogDetailCTA() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.4 }}
      className="mt-16 bg-white rounded-3xl p-12 shadow-lg text-center"
    >
      <h2 className="font-serif text-3xl font-bold text-[#0F0F0F] mb-4">
        Khám Phá Thêm Bài Viết
      </h2>
      <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
        Tìm hiểu thêm về nông nghiệp organic, công thức nấu ăn và mẹo vặt cuộc sống.
      </p>
      <Link
        to={createPageUrl("Blog")}
        className="inline-block bg-[#7CB342] text-white px-8 py-4 rounded-full font-medium hover:bg-[#FF9800] transition-all duration-300 hover:scale-105 shadow-lg"
      >
        Xem Tất Cả Bài Viết
      </Link>
    </motion.div>
  );
}