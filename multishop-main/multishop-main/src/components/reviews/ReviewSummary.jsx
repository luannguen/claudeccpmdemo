import React from 'react';
import { motion } from 'framer-motion';
import { Star, Shield, Image, Video, TrendingUp, Sparkles, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function ReviewSummary({ stats, productId }) {
  // ✅ Fetch AI summary
  const { data: aiSummary, isLoading: loadingAI } = useQuery({
    queryKey: ['review-ai-summary', productId],
    queryFn: async () => {
      // Get all reviews for this product
      const reviews = await base44.entities.Review.list('-created_date', 500);
      const productReviews = reviews.filter(r => 
        r.product_id === productId && 
        (r.data?.status === 'approved' || r.status === 'approved')
      );

      if (productReviews.length < 3) return null;

      // Get text from reviews
      const reviewTexts = productReviews
        .slice(0, 20) // Top 20 reviews
        .map(r => {
          const data = r.data || r;
          return `⭐${data.rating}/5: ${data.comment}`;
        })
        .join('\n\n');

      try {
        const result = await base44.integrations.Core.InvokeLLM({
          prompt: `Phân tích và tóm tắt các đánh giá sản phẩm sau đây bằng tiếng Việt (3-4 câu ngắn gọn, nêu điểm mạnh/yếu):

${reviewTexts}

Tóm tắt theo format:
- Điểm mạnh: ...
- Điểm yếu (nếu có): ...
- Kết luận: ...`,
          add_context_from_internet: false
        });

        return result;
      } catch (error) {
        console.error('AI summary error:', error);
        return null;
      }
    },
    enabled: !!productId && stats.total >= 3,
    staleTime: 30 * 60 * 1000 // Cache 30 phút
  });

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl border-2 border-gray-100">
      <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
        <Star className="w-5 h-5 sm:w-6 sm:h-6 text-[#FF9800] fill-current" />
        Đánh Giá Từ Khách Hàng
      </h3>

      <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
        {/* ✅ Rating Overview */}
        <div className="text-center md:text-left">
          <div className="flex items-end justify-center md:justify-start gap-3 mb-4">
            <span className="text-5xl sm:text-6xl font-bold text-[#0F0F0F]">
              {stats.avgRating}
            </span>
            <div className="flex flex-col items-start">
              <div className="flex gap-0.5 mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 sm:w-6 sm:h-6 ${
                      i < Math.round(stats.avgRating)
                        ? 'text-[#FF9800] fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-gray-600">
                {stats.total} đánh giá
              </p>
            </div>
          </div>

          {/* ✅ Stats Icons */}
          <div className="flex flex-wrap justify-center md:justify-start gap-3 text-xs sm:text-sm">
            <span className="flex items-center gap-1 text-green-700 bg-green-50 px-3 py-1.5 rounded-full font-medium">
              <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
              {stats.verifiedCount} đã mua
            </span>
            {stats.withPhotos > 0 && (
              <span className="flex items-center gap-1 text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full font-medium">
                <Image className="w-3 h-3 sm:w-4 sm:h-4" />
                {stats.withPhotos} có ảnh
              </span>
            )}
            {stats.withVideos > 0 && (
              <span className="flex items-center gap-1 text-purple-700 bg-purple-50 px-3 py-1.5 rounded-full font-medium">
                <Video className="w-3 h-3 sm:w-4 sm:h-4" />
                {stats.withVideos} có video
              </span>
            )}
          </div>
        </div>

        {/* ✅ Rating Distribution Bars */}
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map(rating => {
            const count = stats.distribution[rating] || 0;
            const percentage = stats.total > 0 ? (count / stats.total * 100).toFixed(0) : 0;
            
            return (
              <div key={rating} className="flex items-center gap-3">
                <span className="text-xs sm:text-sm font-medium text-gray-700 w-6">
                  {rating}⭐
                </span>
                <div className="flex-1 h-2 sm:h-3 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, delay: rating * 0.05 }}
                    className={`h-full rounded-full ${
                      rating >= 4 ? 'bg-green-500' :
                      rating === 3 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                  />
                </div>
                <span className="text-xs sm:text-sm text-gray-600 w-12 sm:w-16 text-right">
                  {count} ({percentage}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ✅ AI Summary */}
      {loadingAI ? (
        <div className="mt-6 bg-purple-50 border-2 border-purple-200 rounded-xl p-4 flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-purple-600 animate-spin flex-shrink-0" />
          <p className="text-sm text-purple-700">
            🤖 AI đang phân tích {stats.total} đánh giá...
          </p>
        </div>
      ) : aiSummary && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl sm:rounded-2xl p-4 sm:p-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h4 className="font-bold text-purple-900 text-sm sm:text-base">
              🤖 Tóm Tắt Bằng AI
            </h4>
          </div>
          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-line">
            {aiSummary}
          </p>
          <p className="text-xs text-purple-600 mt-2">
            ✨ Phân tích từ {stats.total} đánh giá thực tế
          </p>
        </motion.div>
      )}
    </div>
  );
}