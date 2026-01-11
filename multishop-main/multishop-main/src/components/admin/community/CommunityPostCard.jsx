import React from "react";
import { motion } from "framer-motion";
import { Eye, CheckCircle, Trash2, Heart, MessageSquare, TrendingUp, Flag } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function CommunityPostCard({ post, onView, onUpdateStatus, onDelete }) {
  const data = post.data || post;
  const totalReactions = Object.values(data.reactions || {}).reduce((sum, count) => sum + count, 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-[#7CB342]/30 transition-all"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#7CB342] to-[#FF9800] flex items-center justify-center text-white font-bold flex-shrink-0">
          {data.author_name?.charAt(0)?.toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 text-sm">{data.author_name}</h3>
              <p className="text-xs text-gray-500">{formatDistanceToNow(new Date(post.created_date), { addSuffix: true, locale: vi })}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                data.status === 'active' ? 'bg-green-100 text-green-600' :
                data.status === 'reported' ? 'bg-red-100 text-red-600' :
                data.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                'bg-gray-100 text-gray-600'
              }`}>
                {data.status === 'active' ? '✓' :
                 data.status === 'reported' ? '⚠' :
                 data.status === 'pending' ? '⏳' : '✕'}
              </span>
            </div>
          </div>

          <p className="text-gray-700 text-sm mb-3 line-clamp-2">{data.content}</p>

          {data.images && data.images.length > 0 && (
            <div className="flex gap-1 mb-3">
              {data.images.slice(0, 3).map((img, idx) => (
                <img key={idx} src={img} alt="" className="w-16 h-16 object-cover rounded-lg" />
              ))}
              {data.images.length > 3 && (
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-600 font-medium">
                  +{data.images.length - 3}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
            <span className="flex items-center gap-1">
              <Heart className="w-3 h-3" />
              {totalReactions}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              {data.comments_count || 0}
            </span>
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {data.engagement_score || 0}
            </span>
            {data.report_count > 0 && (
              <span className="text-red-600 font-medium flex items-center gap-1">
                <Flag className="w-3 h-3" />
                {data.report_count}
              </span>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onView(post)}
              className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg hover:bg-blue-100 transition-colors text-xs font-medium flex items-center justify-center gap-1"
            >
              <Eye className="w-3 h-3" />
              Xem
            </button>
            {data.status !== 'active' && (
              <button
                onClick={() => onUpdateStatus(post.id, 'active')}
                className="flex-1 bg-green-50 text-green-600 py-2 rounded-lg hover:bg-green-100 transition-colors text-xs font-medium flex items-center justify-center gap-1"
              >
                <CheckCircle className="w-3 h-3" />
                Duyệt
              </button>
            )}
            {data.status !== 'hidden' && (
              <button
                onClick={() => onUpdateStatus(post.id, 'hidden')}
                className="bg-gray-100 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors text-xs font-medium"
              >
                Ẩn
              </button>
            )}
            <button
              onClick={() => {
                if (confirm('Xóa bài viết này?')) {
                  onDelete(post.id);
                }
              }}
              className="bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}