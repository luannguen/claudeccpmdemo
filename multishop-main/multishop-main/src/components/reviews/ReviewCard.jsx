import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Star, ThumbsUp, ThumbsDown, MessageSquare, CheckCircle, 
  Flag, Play, Shield, Award, Eye, Image as ImageIcon
} from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function ReviewCard({ review, currentUser, onLoginRequired, showProductInfo = false }) {
  const [showImages, setShowImages] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showResponse, setShowResponse] = useState(false);
  const queryClient = useQueryClient();

  const reviewData = review.data || review;
  const userEmail = currentUser?.email || '';

  // ✅ Fetch user's vote
  const { data: userVote } = useQuery({
    queryKey: ['review-vote', review.id, userEmail],
    queryFn: async () => {
      if (!userEmail) return null;
      const votes = await base44.entities.ReviewVote.list('-created_date', 500);
      return votes.find(v => v.review_id === review.id && v.user_email === userEmail);
    },
    enabled: !!userEmail && !!review.id,
    staleTime: 5 * 60 * 1000
  });

  // ✅ Fetch seller response
  const { data: sellerResponse } = useQuery({
    queryKey: ['review-response', review.id],
    queryFn: async () => {
      const responses = await base44.entities.ReviewResponse.list('-created_date', 500);
      return responses.find(r => r.review_id === review.id && r.is_public);
    },
    enabled: !!review.id && (reviewData.has_seller_response || showResponse),
    staleTime: 2 * 60 * 1000
  });

  // ✅ Vote mutation - Real-time sync
  const voteMutation = useMutation({
    mutationFn: async (voteType) => {
      if (!currentUser) {
        onLoginRequired?.('Vote Review');
        return;
      }

      let helpfulCount = reviewData.helpful_count || 0;
      let notHelpfulCount = reviewData.not_helpful_count || 0;

      // Remove old vote if exists
      if (userVote) {
        if (userVote.vote_type === 'helpful') helpfulCount--;
        else notHelpfulCount--;
        await base44.entities.ReviewVote.delete(userVote.id);
      }

      // Add new vote if different
      if (!userVote || userVote.vote_type !== voteType) {
        await base44.entities.ReviewVote.create({
          review_id: review.id,
          user_email: userEmail,
          vote_type: voteType
        });

        if (voteType === 'helpful') helpfulCount++;
        else notHelpfulCount++;
      }

      // Update review counts
      return base44.entities.Review.update(review.id, {
        helpful_count: helpfulCount,
        not_helpful_count: notHelpfulCount,
        total_votes: helpfulCount + notHelpfulCount
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['product-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['review-vote'] });
    }
  });

  const handleVote = (voteType) => {
    if (!currentUser) {
      onLoginRequired?.('Vote Review');
      return;
    }
    voteMutation.mutate(voteType);
  };

  const timeAgo = formatDistanceToNow(new Date(review.created_date), { 
    addSuffix: true, 
    locale: vi 
  });

  const hasMedia = (reviewData.images?.length > 0) || (reviewData.videos?.length > 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-all border border-gray-100"
    >
      {/* Header */}
      <div className="flex items-start gap-3 sm:gap-4 mb-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[#7CB342] to-[#FF9800] flex items-center justify-center text-white font-bold text-sm sm:text-lg flex-shrink-0 overflow-hidden">
          {reviewData.customer_avatar ? (
            <img src={reviewData.customer_avatar} alt={reviewData.customer_name} className="w-full h-full object-cover" />
          ) : (
            <span>{reviewData.customer_name?.charAt(0)?.toUpperCase()}</span>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h4 className="font-bold text-gray-900 text-sm sm:text-base">{reviewData.customer_name}</h4>
            {reviewData.verified_purchase && (
              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Đã mua
              </span>
            )}
            {reviewData.is_featured && (
              <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium flex items-center gap-1">
                <Award className="w-3 h-3" />
                Nổi bật
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 sm:w-4 sm:h-4 ${
                    i < reviewData.rating
                      ? 'text-[#FF9800] fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs sm:text-sm text-gray-500">{timeAgo}</span>
            {reviewData.ai_sentiment && (
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                reviewData.ai_sentiment === 'positive' ? 'bg-green-50 text-green-700' :
                reviewData.ai_sentiment === 'negative' ? 'bg-red-50 text-red-700' :
                'bg-gray-50 text-gray-700'
              }`}>
                {reviewData.ai_sentiment === 'positive' ? '😊 Tích cực' :
                 reviewData.ai_sentiment === 'negative' ? '😔 Tiêu cực' :
                 '😐 Trung lập'}
              </span>
            )}
          </div>

          {showProductInfo && reviewData.product_name && (
            <p className="text-xs sm:text-sm text-[#7CB342] font-medium mb-2">
              📦 {reviewData.product_name}
            </p>
          )}

          {reviewData.title && (
            <h5 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">
              {reviewData.title}
            </h5>
          )}
          
          <p className="text-gray-700 leading-relaxed text-sm sm:text-base mb-3">
            {reviewData.comment}
          </p>

          {/* ✅ Photos/Videos Media Grid */}
          {hasMedia && (
            <div className="mb-4">
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {reviewData.images?.slice(0, 4).map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedImage(idx);
                      setShowImages(true);
                    }}
                    className="relative aspect-square rounded-lg overflow-hidden group bg-gray-100"
                  >
                    <img 
                      src={img} 
                      alt={`Review ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                      <Eye className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    {idx === 3 && reviewData.images.length > 4 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-white font-bold">+{reviewData.images.length - 4}</span>
                      </div>
                    )}
                  </button>
                ))}
                
                {reviewData.videos?.slice(0, 2).map((video, idx) => (
                  <a
                    key={idx}
                    href={video}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative aspect-square rounded-lg overflow-hidden bg-gray-900 flex items-center justify-center group"
                  >
                    <Play className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
                    <div className="absolute top-1 right-1 px-1.5 py-0.5 bg-red-500 text-white rounded text-xs font-bold">
                      VIDEO
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* ✅ Action Buttons - Helpful/Not Helpful */}
          <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
            <button
              onClick={() => handleVote('helpful')}
              disabled={voteMutation.isPending}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                userVote?.vote_type === 'helpful'
                  ? 'bg-green-100 text-green-700 border-2 border-green-300'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <ThumbsUp className={`w-3 h-3 sm:w-4 sm:h-4 ${userVote?.vote_type === 'helpful' ? 'fill-current' : ''}`} />
              Hữu ích ({reviewData.helpful_count || 0})
            </button>
            
            <button
              onClick={() => handleVote('not_helpful')}
              disabled={voteMutation.isPending}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                userVote?.vote_type === 'not_helpful'
                  ? 'bg-red-100 text-red-700 border-2 border-red-300'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <ThumbsDown className={`w-3 h-3 sm:w-4 sm:h-4 ${userVote?.vote_type === 'not_helpful' ? 'fill-current' : ''}`} />
              ({reviewData.not_helpful_count || 0})
            </button>

            {reviewData.has_seller_response && (
              <button
                onClick={() => setShowResponse(!showResponse)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors border border-blue-200"
              >
                <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />
                Phản hồi từ Shop
              </button>
            )}

            {reviewData.points_awarded > 0 && (
              <span className="ml-auto text-xs text-green-600 font-medium flex items-center gap-1">
                <Star className="w-3 h-3 fill-current" />
                +{reviewData.points_awarded} điểm
              </span>
            )}
          </div>

          {/* ✅ Seller Response Section */}
          {showResponse && sellerResponse && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 pl-4 border-l-4 border-blue-500 bg-blue-50 rounded-r-xl p-4"
            >
              <div className="flex items-start gap-3 mb-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                  {sellerResponse.responder_name?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-sm text-blue-900">
                    {sellerResponse.responder_name}
                    <span className="ml-2 px-2 py-0.5 bg-blue-200 text-blue-800 rounded-full text-xs">
                      {sellerResponse.responder_role === 'admin' ? 'Admin' : 'Shop Owner'}
                    </span>
                  </p>
                  <p className="text-xs text-blue-700">
                    {formatDistanceToNow(new Date(sellerResponse.created_date), { addSuffix: true, locale: vi })}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                {sellerResponse.response_text}
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* ✅ Image Lightbox */}
      {showImages && reviewData.images && reviewData.images.length > 0 && (
        <div 
          className="fixed inset-0 bg-black/90 z-[300] flex items-center justify-center p-4"
          onClick={() => setShowImages(false)}
        >
          <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <img 
              src={reviewData.images[selectedImage]} 
              alt={`Review ${selectedImage + 1}`}
              className="w-full h-auto max-h-[80vh] object-contain rounded-xl"
            />
            <button
              onClick={() => setShowImages(false)}
              className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100"
            >
              ✕
            </button>
            {reviewData.images.length > 1 && (
              <div className="flex gap-2 mt-4 justify-center overflow-x-auto">
                {reviewData.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 ${
                      idx === selectedImage ? 'border-[#7CB342]' : 'border-white/30'
                    }`}
                  >
                    <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}