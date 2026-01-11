import React from 'react';

export default function PostCardSkeleton() {
  return (
    <div className="bg-white rounded-3xl shadow-lg border-2 border-gray-100 p-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-24"></div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 rounded w-4/6"></div>
      </div>

      {/* Image placeholder */}
      <div className="bg-gray-200 rounded-2xl aspect-video mb-4"></div>

      {/* Action buttons */}
      <div className="flex gap-4">
        <div className="h-10 bg-gray-200 rounded-xl flex-1"></div>
        <div className="h-10 bg-gray-200 rounded-xl flex-1"></div>
        <div className="h-10 bg-gray-200 rounded-xl flex-1"></div>
      </div>
    </div>
  );
}