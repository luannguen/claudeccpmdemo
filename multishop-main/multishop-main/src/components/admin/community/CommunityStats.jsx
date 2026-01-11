import React from "react";
import { MessageSquare, CheckCircle, Flag, AlertCircle, Heart, BarChart3 } from "lucide-react";

export default function CommunityStats({ stats }) {
  return (
    <div className="grid md:grid-cols-6 gap-4 mb-8">
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <MessageSquare className="w-6 h-6 text-[#7CB342] mb-2" />
        <p className="text-2xl font-bold text-[#0F0F0F]">{stats.total}</p>
        <p className="text-xs text-gray-600">Tổng bài</p>
      </div>
      <div className="bg-green-50 rounded-xl p-4 shadow-sm border border-green-200">
        <CheckCircle className="w-6 h-6 text-green-600 mb-2" />
        <p className="text-2xl font-bold text-green-600">{stats.active}</p>
        <p className="text-xs text-green-700">Hiển thị</p>
      </div>
      <div className="bg-red-50 rounded-xl p-4 shadow-sm border border-red-200">
        <Flag className="w-6 h-6 text-red-600 mb-2" />
        <p className="text-2xl font-bold text-red-600">{stats.reported}</p>
        <p className="text-xs text-red-700">Báo cáo</p>
      </div>
      <div className="bg-yellow-50 rounded-xl p-4 shadow-sm border border-yellow-200">
        <AlertCircle className="w-6 h-6 text-yellow-600 mb-2" />
        <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        <p className="text-xs text-yellow-700">Chờ duyệt</p>
      </div>
      <div className="bg-purple-50 rounded-xl p-4 shadow-sm border border-purple-200">
        <Heart className="w-6 h-6 text-purple-600 mb-2" />
        <p className="text-2xl font-bold text-purple-600">{stats.totalReactions}</p>
        <p className="text-xs text-purple-700">Reactions</p>
      </div>
      <div className="bg-blue-50 rounded-xl p-4 shadow-sm border border-blue-200">
        <BarChart3 className="w-6 h-6 text-blue-600 mb-2" />
        <p className="text-2xl font-bold text-blue-600">{stats.avgEngagement}</p>
        <p className="text-xs text-blue-700">TB/bài</p>
      </div>
    </div>
  );
}