import React from "react";
import { AnimatePresence } from "framer-motion";
import { User } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ProfileEditModal from "@/components/ProfileEditModal";

export default function ProfileNotFound({ isOwnProfile, currentUser, isEditModalOpen, setIsEditModalOpen }) {
  return (
    <div className="pt-32 pb-24 min-h-screen flex items-center justify-center bg-gradient-to-b from-[#F5F9F3] to-white">
      <div className="text-center bg-white rounded-3xl shadow-2xl p-12 max-w-md">
        <User className="w-20 h-20 text-gray-300 mx-auto mb-6" />
        <h2 className="text-2xl font-serif font-bold text-gray-800 mb-3">
          Không Tìm Thấy Profile
        </h2>
        <p className="text-gray-600 mb-6">
          Người dùng này chưa tạo profile cộng đồng.
        </p>
        {isOwnProfile && currentUser && (
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="bg-gradient-to-r from-[#7CB342] to-[#5a8f31] text-white px-8 py-3 rounded-xl font-bold hover:from-[#FF9800] hover:to-[#ff6b00] transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
          >
            Tạo Profile Ngay
          </button>
        )}
        {!currentUser && (
          <button
            onClick={() => base44.auth.redirectToLogin(window.location.href)}
            className="bg-gradient-to-r from-[#7CB342] to-[#5a8f31] text-white px-8 py-3 rounded-xl font-bold hover:from-[#FF9800] hover:to-[#ff6b00] transition-all shadow-lg"
          >
            Đăng Nhập Để Tạo Profile
          </button>
        )}
      </div>
      
      <AnimatePresence>
        {isEditModalOpen && currentUser && (
          <ProfileEditModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            profile={null}
            currentUser={currentUser}
          />
        )}
      </AnimatePresence>
    </div>
  );
}