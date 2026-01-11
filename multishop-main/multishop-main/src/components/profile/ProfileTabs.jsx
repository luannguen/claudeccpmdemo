import React from "react";
import { Grid, Bookmark } from "lucide-react";

export default function ProfileTabs({ activeTab, setActiveTab, postsCount, savedPostsCount, isOwnProfile }) {
  return (
    <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
      <button
        onClick={() => setActiveTab('posts')}
        className={`px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
          activeTab === 'posts'
            ? 'bg-[#7CB342] text-white shadow-lg scale-105'
            : 'bg-white text-gray-600 hover:bg-gray-50 shadow-md'
        }`}
      >
        <Grid className="w-5 h-5" />
        Bài viết ({postsCount})
      </button>
      
      {isOwnProfile && (
        <button
          onClick={() => setActiveTab('saved')}
          className={`px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'saved'
              ? 'bg-[#7CB342] text-white shadow-lg scale-105'
              : 'bg-white text-gray-600 hover:bg-gray-50 shadow-md'
          }`}
        >
          <Bookmark className="w-5 h-5" />
          Đã lưu ({savedPostsCount})
        </button>
      )}
    </div>
  );
}