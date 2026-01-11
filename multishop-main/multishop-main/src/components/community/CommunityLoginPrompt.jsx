import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import { createPageUrl } from "@/utils";

export default function CommunityLoginPrompt({ isOpen, onClose, action }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLogin = () => {
    const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
    navigate(createPageUrl(`AdminLogin?returnUrl=${returnUrl}`));
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center"
      >
        <div className="w-16 h-16 bg-[#7CB342]/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <LogIn className="w-8 h-8 text-[#7CB342]" />
        </div>
        
        <h3 className="text-2xl font-serif font-bold text-[#0F0F0F] mb-2">
          Đăng Nhập Để {action}
        </h3>
        
        <p className="text-gray-600 mb-8">
          Bạn cần đăng nhập hoặc tạo tài khoản để có thể {action.toLowerCase()} trong cộng đồng Zero Farm.
        </p>

        <div className="space-y-3">
          <button
            onClick={handleLogin}
            className="w-full bg-[#7CB342] text-white py-4 rounded-xl font-medium hover:bg-[#FF9800] transition-all duration-300 flex items-center justify-center gap-2"
          >
            <LogIn className="w-5 h-5" />
            Đăng Nhập / Đăng Ký
          </button>
          
          <button
            onClick={onClose}
            className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors"
          >
            Để Sau
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-6">
          🌱 Tham gia cộng đồng Zero Farm để chia sẻ trải nghiệm và nhận ưu đãi đặc biệt!
        </p>
      </motion.div>
    </div>
  );
}