import React from "react";

export default function ProfileStats({ stats }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 mt-8 border-t-2 border-gray-100">
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 text-center">
        <p className="text-3xl sm:text-4xl font-bold text-blue-600">{stats.posts}</p>
        <p className="text-sm text-blue-700 font-medium">Bài viết</p>
      </div>
      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 text-center">
        <p className="text-3xl sm:text-4xl font-bold text-green-600">{stats.followers}</p>
        <p className="text-sm text-green-700 font-medium">Người theo dõi</p>
      </div>
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-4 text-center">
        <p className="text-3xl sm:text-4xl font-bold text-purple-600">{stats.following}</p>
        <p className="text-sm text-purple-700 font-medium">Đang theo dõi</p>
      </div>
      <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-4 text-center">
        <p className="text-3xl sm:text-4xl font-bold text-orange-600">{stats.reputation}</p>
        <p className="text-sm text-orange-700 font-medium">Uy tín</p>
      </div>
    </div>
  );
}