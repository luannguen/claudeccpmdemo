import React from 'react';

export default function SkeletonPostCard() {
  return (
    <div className="bg-white rounded-3xl shadow-lg overflow-hidden border-2 border-gray-100 animate-pulse">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gray-200 rounded-full" />
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-24" />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
          <div className="h-4 bg-gray-200 rounded w-4/6" />
        </div>

        {/* Image placeholder */}
        <div className="h-64 bg-gray-200 rounded-xl mb-4" />
      </div>

      {/* Stats */}
      <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between">
        <div className="h-4 bg-gray-200 rounded w-20" />
        <div className="h-4 bg-gray-200 rounded w-32" />
      </div>

      {/* Actions */}
      <div className="px-6 py-3 border-t border-gray-100 flex gap-2">
        <div className="flex-1 h-10 bg-gray-200 rounded-xl" />
        <div className="flex-1 h-10 bg-gray-200 rounded-xl" />
        <div className="h-10 w-10 bg-gray-200 rounded-xl" />
      </div>
    </div>
  );
}