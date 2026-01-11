import React from 'react';
import { Icon } from '@/components/ui/AnimatedIcon';

export default function CommentReplyPreview({ replyingTo, onCancel }) {
  if (!replyingTo) return null;

  const commentData = replyingTo.data || replyingTo;

  return (
    <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-3 rounded-r-lg">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Icon.CornerDownRight size={16} className="text-blue-600" />
            <span className="text-xs text-blue-600 font-medium">
              Đang trả lời {commentData.author_name}
            </span>
          </div>
          <p className="text-sm text-gray-700 line-clamp-2">
            {commentData.content}
          </p>
        </div>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 flex-shrink-0"
        >
          <Icon.X size={16} />
        </button>
      </div>
    </div>
  );
}