import React from "react";
import { Link } from "react-router-dom";
import { Edit, Settings, UserPlus, UserCheck, BookOpen } from "lucide-react";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";

export default function ProfileActions({ 
  isOwnProfile, 
  currentUser, 
  isFollowing, 
  followMutation, 
  onEdit 
}) {
  if (isOwnProfile) {
    return (
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onEdit}
          className="px-6 py-3 bg-gradient-to-r from-[#7CB342] to-[#5a8f31] text-white rounded-xl font-bold hover:from-[#FF9800] hover:to-[#ff6b00] transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <Edit className="w-5 h-5" />
          Chỉnh Sửa Profile
        </button>
        <Link
          to={createPageUrl('Guide')}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-bold hover:from-blue-600 hover:to-indigo-600 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <BookOpen className="w-5 h-5" />
          Hướng Dẫn
        </Link>
        <Link
          to={createPageUrl('MyProfile')}
          className="px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 hover:border-[#7CB342] transition-all shadow-md flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <Settings className="w-5 h-5" />
          Cài Đặt
        </Link>
      </div>
    );
  }

  if (currentUser) {
    return (
      <button
        onClick={() => followMutation.mutate()}
        disabled={followMutation.isPending}
        className={`px-8 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 ${
          isFollowing
            ? 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50'
            : 'bg-gradient-to-r from-[#7CB342] to-[#5a8f31] text-white hover:from-[#FF9800] hover:to-[#ff6b00]'
        }`}
      >
        {followMutation.isPending ? (
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : isFollowing ? (
          <>
            <UserCheck className="w-5 h-5" />
            Đang Theo Dõi
          </>
        ) : (
          <>
            <UserPlus className="w-5 h-5" />
            Theo Dõi
          </>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={() => base44.auth.redirectToLogin(window.location.href)}
      className="px-8 py-3 bg-gradient-to-r from-[#7CB342] to-[#5a8f31] text-white rounded-xl font-bold hover:from-[#FF9800] hover:to-[#ff6b00] transition-all shadow-lg flex items-center gap-2"
    >
      <UserPlus className="w-5 h-5" />
      Đăng Nhập Để Theo Dõi
    </button>
  );
}