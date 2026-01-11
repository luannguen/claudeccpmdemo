import React from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";

export default function CommunityCreateButton({ currentUser, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="mb-6"
    >
      <button
        onClick={onClick}
        className="w-full bg-white rounded-2xl p-4 border-2 border-gray-100 hover:border-[#7CB342] shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-4 group"
      >
        <div className="w-10 h-10 bg-gradient-to-br from-[#7CB342] to-[#5a8f31] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
          <Plus className="w-5 h-5 text-white" />
        </div>
        <span className="text-gray-500 text-left flex-1 text-sm">
          {currentUser ? `${currentUser.full_name} ơi, bạn đang nghĩ gì?` : 'Đăng nhập để chia sẻ...'}
        </span>
      </button>
    </motion.div>
  );
}