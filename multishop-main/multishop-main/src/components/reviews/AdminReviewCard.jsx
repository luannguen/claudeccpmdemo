import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Star, CheckCircle, XCircle, Clock, Trash2, Eye, MessageSquare,
  Shield, Image as ImageIcon, Video, ThumbsUp, Award, Flag, Sparkles
} from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function AdminReviewCard({ review, onReply }) {
  const [showImages, setShowImages] = useState(false);
  const [showResponse, setShowResponse] = useState(false);
  const queryClient = useQueryClient();

  const reviewData = review.data || review;

  // ✅ Fetch seller response
  const { data: sellerResponse } = useQuery({
    queryKey: ['admin-review-response', review.id],
    queryFn: async () => {
      const responses = await base44.entities.ReviewResponse.list('-created_date', 500);
      return responses.find(r => r.review_id === review.id && r.is_public);
    },
    enabled: !!review.id && (reviewData.has_seller_response || showResponse),
    staleTime: 2 * 60 * 1000
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Review.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['product-reviews'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Review.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    }
  });

  const toggleFeaturedMutation = useMutation({
    mutationFn: () => base44.entities.Review.update(review.id, {
      is_featured: !reviewData.is_featured
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    }
  });

  const timeAgo = formatDistanceToNow(new Date(review.created_date), { 
    addSuffix: true, 
    locale: vi 
  });

  const hasMedia = (reviewData.images?.length > 0) || (reviewData.videos?.length > 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4 gap-4">
        <div className="flex items-start gap-3 sm:gap-4 flex-1">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[#7CB342] to-[#FF9800] flex items-center justify-center text-white font-bold text-sm sm:text-lg flex-shrink-0 overflow-hidden">
            {reviewData.customer_avatar ? (
              <img src={reviewData.customer_avatar} alt={reviewData.customer_name} className="w-full h-full object-cover" />
            ) : (
              <span>{reviewData.customer_name?.charAt(0)?.toUpperCase()}</span>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="font-bold text-gray-900 text-sm sm:text-base">{reviewData.customer_name}</h3>
              {reviewData.verified_purchase && (
                <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Đã mua
                </span>
              )}
              {reviewData.is_featured && (
                <span className="px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full text-xs font-bold flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  Nổi bật
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2 mb-2 flex-wrap text-xs sm:text-sm">
              <span className="text-gray-500">{reviewData.customer_email}</span>
              <span className="text-gray-300">•</span>
              <span className="text-gray-500">{timeAgo}</span>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 sm:w-5 sm:h-5 ${
                      i < reviewData.rating
                        ? 'text-[#FF9800] fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              {reviewData.ai_sentiment && (
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  reviewData.ai_sentiment === 'positive' ? 'bg-green-50 text-green-700' :
                  reviewData.ai_sentiment === 'negative' ? 'bg-red-50 text-red-700' :
                  'bg-gray-50 text-gray-700'
                }`}>
                  {reviewData.ai_sentiment === 'positive' ? '😊' :
                   reviewData.ai_sentiment === 'negative' ? '😔' : '😐'}
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-[#7CB342] font-medium mb-2">
              📦 {reviewData.product_name}
            </p>

            {reviewData.title && (
              <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">
                {reviewData.title}
              </h4>
            )}
            
            <p className="text-gray-700 leading-relaxed text-sm sm:text-base mb-3">
              {reviewData.comment}
            </p>

            {/* Media Preview */}
            {hasMedia && (
              <div className="flex items-center gap-3 mb-3 flex-wrap text-xs">
                {reviewData.images?.length > 0 && (
                  <span className="flex items-center gap-1 text-blue-700 bg-blue-50 px-2 py-1 rounded-full">
                    <ImageIcon className="w-3 h-3" />
                    {reviewData.images.length} ảnh
                  </span>
                )}
                {reviewData.videos?.length > 0 && (
                  <span className="flex items-center gap-1 text-purple-700 bg-purple-50 px-2 py-1 rounded-full">
                    <Video className="w-3 h-3" />
                    {reviewData.videos.length} video
                  </span>
                )}
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center gap-4 text-xs sm:text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <ThumbsUp className="w-3 h-3 sm:w-4 sm:h-4" />
                {reviewData.helpful_count || 0} hữu ích
              </span>
              {reviewData.total_votes > 0 && (
                <span>
                  ({((reviewData.helpful_count || 0) / reviewData.total_votes * 100).toFixed(0)}%)
                </span>
              )}
              {reviewData.points_awarded > 0 && (
                <span className="flex items-center gap-1 text-green-600 font-medium">
                  <Star className="w-3 h-3 fill-current" />
                  +{reviewData.points_awarded} điểm
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center justify-end">
          <span className={`px-4 py-2 rounded-xl text-sm font-medium ${
            reviewData.status === 'approved' ? 'bg-green-100 text-green-700' :
            reviewData.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
            'bg-red-100 text-red-700'
          }`}>
            {reviewData.status === 'approved' ? '✅ Đã duyệt' :
             reviewData.status === 'pending' ? '⏳ Chờ duyệt' : '❌ Từ chối'}
          </span>
        </div>
      </div>

      {/* ✅ Seller Response Preview */}
      {reviewData.has_seller_response && sellerResponse && (
        <div className="mt-4 pl-4 border-l-4 border-blue-500 bg-blue-50 rounded-r-xl p-4">
          <div className="flex items-start gap-2 mb-2">
            <MessageSquare className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm text-blue-900">
                {sellerResponse.responder_name}
                <span className="ml-2 text-xs text-blue-700">({sellerResponse.responder_role})</span>
              </p>
              <p className="text-xs text-blue-700 mt-1">{sellerResponse.response_text}</p>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Action Buttons */}
      <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100 mt-4">
        {reviewData.status !== 'approved' && (
          <button
            onClick={() => updateStatusMutation.mutate({ id: review.id, status: 'approved' })}
            className="flex-1 sm:flex-none px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
          >
            <CheckCircle className="w-4 h-4" />
            Duyệt
          </button>
        )}
        
        {reviewData.status !== 'rejected' && (
          <button
            onClick={() => updateStatusMutation.mutate({ id: review.id, status: 'rejected' })}
            className="flex-1 sm:flex-none px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
          >
            <XCircle className="w-4 h-4" />
            Từ chối
          </button>
        )}

        <button
          onClick={() => toggleFeaturedMutation.mutate()}
          className={`flex-1 sm:flex-none px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-medium ${
            reviewData.is_featured
              ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Award className="w-4 h-4" />
          {reviewData.is_featured ? 'Bỏ nổi bật' : 'Nổi bật'}
        </button>

        <button
          onClick={() => onReply(review)}
          className="flex-1 sm:flex-none px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
        >
          <MessageSquare className="w-4 h-4" />
          Phản hồi
        </button>

        <button
          onClick={() => {
            if (confirm('Xóa đánh giá này?')) {
              deleteMutation.mutate(review.id);
            }
          }}
          className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}