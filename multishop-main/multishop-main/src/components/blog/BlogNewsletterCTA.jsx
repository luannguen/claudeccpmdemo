import React from "react";
import { motion } from "framer-motion";

export default function BlogNewsletterCTA() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.4 }}
      className="text-center mt-16 bg-white rounded-3xl p-12 shadow-lg"
    >
      <h2 className="font-serif text-3xl font-bold text-[#0F0F0F] mb-4">
        Muốn Nhận Tin Tức Mới Nhất?
      </h2>
      <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
        Đăng ký nhận bản tin của chúng tôi để cập nhật những bài viết mới, 
        mẹo vặt hữu ích và ưu đãi đặc biệt.
      </p>
      <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
        <input
          type="email"
          placeholder="Email của bạn"
          className="flex-1 px-6 py-4 border-2 border-gray-200 rounded-full focus:outline-none focus:border-[#7CB342]"
          required
        />
        <button
          type="submit"
          className="bg-[#7CB342] text-white px-8 py-4 rounded-full font-medium hover:bg-[#FF9800] transition-all duration-300 hover:scale-105 shadow-lg"
        >
          Đăng Ký
        </button>
      </form>
    </motion.div>
  );
}