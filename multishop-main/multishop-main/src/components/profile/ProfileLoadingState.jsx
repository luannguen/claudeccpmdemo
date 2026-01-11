import React from "react";

export default function ProfileLoadingState() {
  return (
    <div className="pt-32 pb-24 min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#7CB342] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Đang tải profile...</p>
      </div>
    </div>
  );
}