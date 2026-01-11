import React from "react";
import { motion } from "framer-motion";
import { X, CheckCircle, XCircle, Trash2, Flag, Hash, Image as ImageIcon } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function CommunityPostDetailModal({ post, onClose, onUpdateStatus, onDelete }) {
  if (!post) return null;
  
  const postData = post.data || post;
  const totalReactions = Object.values(postData.reactions || {}).reduce((sum, count) => sum + count, 0);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between z-10">
          <h2 className="text-2xl font-serif font-bold text-[#0F0F0F]">
            Chi Tiết Bài Viết
          </h2>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Author Info */}
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-[#7CB342] to-[#FF9800] rounded-full flex items-center justify-center text-white font-bold text-2xl">
              {postData.author_name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900">{postData.author_name}</h3>
              <p className="text-sm text-gray-500">{post.created_by}</p>
              <p className="text-xs text-gray-400 mt-1">
                {formatDistanceToNow(new Date(post.created_date), { addSuffix: true, locale: vi })}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  postData.status === 'active' ? 'bg-green-100 text-green-600' :
                  postData.status === 'reported' ? 'bg-red-100 text-red-600' :
                  postData.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {postData.status === 'active' ? 'Đang hiển thị' :
                   postData.status === 'reported' ? 'Bị báo cáo' :
                   postData.status === 'pending' ? 'Chờ duyệt' : 'Đã ẩn'}
                </span>
                {postData.is_edited && (
                  <span className="text-xs text-gray-500">(đã chỉnh sửa)</span>
                )}
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-blue-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-blue-600">{totalReactions}</p>
              <p className="text-xs text-blue-700">Reactions</p>
            </div>
            <div className="bg-green-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-green-600">{postData.comments_count || 0}</p>
              <p className="text-xs text-green-700">Bình luận</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-purple-600">{postData.shares_count || 0}</p>
              <p className="text-xs text-purple-700">Chia sẻ</p>
            </div>
            <div className="bg-orange-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-orange-600">{postData.engagement_score || 0}</p>
              <p className="text-xs text-orange-700">Điểm TB</p>
            </div>
          </div>

          {/* Content */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-bold text-gray-900 mb-3 text-sm">NỘI DUNG BÀI VIẾT</h4>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{postData.content}</p>
          </div>

          {/* Images */}
          {postData.images && postData.images.length > 0 && (
            <div>
              <h4 className="font-bold text-gray-900 mb-3 text-sm flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                HÌNH ẢNH ({postData.images.length})
              </h4>
              <div className="grid grid-cols-3 gap-2">
                {postData.images.map((img, idx) => (
                  <img key={idx} src={img} alt="" className="w-full h-32 object-cover rounded-lg" />
                ))}
              </div>
            </div>
          )}

          {/* Hashtags */}
          {postData.hashtags && postData.hashtags.length > 0 && (
            <div>
              <h4 className="font-bold text-gray-900 mb-2 text-sm flex items-center gap-2">
                <Hash className="w-4 h-4" />
                HASHTAGS
              </h4>
              <div className="flex flex-wrap gap-2">
                {postData.hashtags.map((tag, idx) => (
                  <span key={idx} className="px-3 py-1 bg-[#7CB342]/10 text-[#7CB342] rounded-full text-xs font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Product Links */}
          {postData.product_links && postData.product_links.length > 0 && (
            <div>
              <h4 className="font-bold text-gray-900 mb-2 text-sm">SẢN PHẨM ĐƯỢC GẮN</h4>
              <div className="space-y-2">
                {postData.product_links.map((p, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <img src={p.product_image} alt={p.product_name} className="w-12 h-12 object-cover rounded" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{p.product_name}</p>
                      <p className="text-xs text-[#7CB342] font-bold">{p.product_price?.toLocaleString('vi-VN')}đ</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Report Info */}
          {postData.report_count > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-2 text-red-700 mb-2">
                <Flag className="w-5 h-5" />
                <h4 className="font-bold text-sm">BÁO CÁO ({postData.report_count})</h4>
              </div>
              <p className="text-xs text-red-600">
                Đã có {postData.report_count} người báo cáo bài viết này
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            {postData.status !== 'active' && (
              <button
                onClick={() => {
                  onUpdateStatus(post.id, 'active');
                  onClose();
                }}
                className="flex-1 bg-green-500 text-white py-3 rounded-xl hover:bg-green-600 transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <CheckCircle className="w-5 h-5" />
                Duyệt Bài
              </button>
            )}
            {postData.status !== 'hidden' && (
              <button
                onClick={() => {
                  onUpdateStatus(post.id, 'hidden');
                  onClose();
                }}
                className="flex-1 bg-gray-500 text-white py-3 rounded-xl hover:bg-gray-600 transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <XCircle className="w-5 h-5" />
                Ẩn Bài
              </button>
            )}
            <button
              onClick={() => {
                if (confirm('Xóa vĩnh viễn bài viết này?')) {
                  onDelete(post.id);
                  onClose();
                }
              }}
              className="bg-red-500 text-white px-6 py-3 rounded-xl hover:bg-red-600 transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <Trash2 className="w-5 h-5" />
              Xóa
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}