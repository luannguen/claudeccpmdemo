import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Star, Filter, TrendingUp, Clock, Award, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import ReviewCard from './ReviewCard';
import ReviewSummary from './ReviewSummary';

export default function ReviewsList({ 
  productId, 
  currentUser, 
  onLoginRequired,
  showSummary = true 
}) {
  const [sortBy, setSortBy] = useState('recent'); // recent, helpful, rating_high, rating_low
  const [filterRating, setFilterRating] = useState('all');
  const [filterVerified, setFilterVerified] = useState(false);
  const [displayCount, setDisplayCount] = useState(10);

  // ✅ Fetch reviews - Real-time
  const { data: allReviews = [], isLoading } = useQuery({
    queryKey: ['product-reviews', productId],
    queryFn: async () => {
      const reviews = await base44.entities.Review.list('-created_date', 500);
      return reviews.filter(r => 
        r.product_id === productId && 
        (r.data?.status === 'approved' || r.status === 'approved')
      );
    },
    enabled: !!productId,
    staleTime: 0, // ✅ Always fresh
    refetchOnWindowFocus: true
  });

  // ✅ Filter & Sort
  const processedReviews = useMemo(() => {
    let filtered = [...allReviews];

    // Filter by rating
    if (filterRating !== 'all') {
      filtered = filtered.filter(r => (r.data?.rating || r.rating) === parseInt(filterRating));
    }

    // Filter by verified purchase
    if (filterVerified) {
      filtered = filtered.filter(r => (r.data?.verified_purchase || r.verified_purchase));
    }

    // Sort
    filtered.sort((a, b) => {
      const aData = a.data || a;
      const bData = b.data || b;

      if (sortBy === 'recent') {
        return new Date(b.created_date) - new Date(a.created_date);
      } else if (sortBy === 'helpful') {
        return (bData.helpful_count || 0) - (aData.helpful_count || 0);
      } else if (sortBy === 'rating_high') {
        return (bData.rating || 0) - (aData.rating || 0);
      } else if (sortBy === 'rating_low') {
        return (aData.rating || 0) - (bData.rating || 0);
      }
      return 0;
    });

    return filtered;
  }, [allReviews, sortBy, filterRating, filterVerified]);

  const displayedReviews = processedReviews.slice(0, displayCount);
  const hasMore = displayCount < processedReviews.length;

  // ✅ Calculate stats
  const stats = useMemo(() => {
    const total = allReviews.length;
    const avgRating = total > 0
      ? allReviews.reduce((sum, r) => sum + ((r.data?.rating || r.rating) || 0), 0) / total
      : 0;
    
    const distribution = {
      5: allReviews.filter(r => (r.data?.rating || r.rating) === 5).length,
      4: allReviews.filter(r => (r.data?.rating || r.rating) === 4).length,
      3: allReviews.filter(r => (r.data?.rating || r.rating) === 3).length,
      2: allReviews.filter(r => (r.data?.rating || r.rating) === 2).length,
      1: allReviews.filter(r => (r.data?.rating || r.rating) === 1).length
    };

    const verifiedCount = allReviews.filter(r => (r.data?.verified_purchase || r.verified_purchase)).length;
    const withPhotos = allReviews.filter(r => (r.data?.images?.length || r.images?.length) > 0).length;
    const withVideos = allReviews.filter(r => (r.data?.videos?.length || r.videos?.length) > 0).length;

    return {
      total,
      avgRating: avgRating.toFixed(1),
      distribution,
      verifiedCount,
      withPhotos,
      withVideos
    };
  }, [allReviews]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* ✅ Summary Section */}
      {showSummary && stats.total > 0 && (
        <ReviewSummary stats={stats} productId={productId} />
      )}

      {/* ✅ Filters & Sorting */}
      {stats.total > 0 && (
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-md">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-600 mb-2">Sắp xếp:</label>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7CB342] text-sm"
              >
                <option value="recent">🕐 Mới nhất</option>
                <option value="helpful">👍 Hữu ích nhất</option>
                <option value="rating_high">⭐ Đánh giá cao</option>
                <option value="rating_low">⭐ Đánh giá thấp</option>
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-600 mb-2">Lọc sao:</label>
              <select 
                value={filterRating}
                onChange={(e) => setFilterRating(e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7CB342] text-sm"
              >
                <option value="all">Tất cả ({stats.total})</option>
                {[5, 4, 3, 2, 1].map(rating => (
                  <option key={rating} value={rating}>
                    {rating} ⭐ ({stats.distribution[rating]})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input 
              type="checkbox"
              checked={filterVerified}
              onChange={(e) => setFilterVerified(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-[#7CB342] focus:ring-[#7CB342]"
            />
            <span className="text-gray-700">
              ✅ Chỉ hiện đã mua ({stats.verifiedCount})
            </span>
          </label>
        </div>
      )}

      {/* ✅ Reviews List */}
      {isLoading ? (
        <div className="text-center py-12">
          <Loader2 className="w-12 h-12 text-[#7CB342] animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Đang tải đánh giá...</p>
        </div>
      ) : processedReviews.length > 0 ? (
        <>
          <div className="space-y-3 sm:space-y-4">
            {displayedReviews.map((review, idx) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <ReviewCard
                  review={review}
                  currentUser={currentUser}
                  onLoginRequired={onLoginRequired}
                  showProductInfo={false}
                />
              </motion.div>
            ))}
          </div>

          {hasMore && (
            <div className="text-center pt-4">
              <button
                onClick={() => setDisplayCount(prev => prev + 10)}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors text-sm"
              >
                Xem thêm {Math.min(10, processedReviews.length - displayCount)} đánh giá
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 bg-white rounded-2xl shadow-md">
          <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            {filterRating !== 'all' || filterVerified 
              ? 'Không tìm thấy đánh giá phù hợp'
              : 'Chưa Có Đánh Giá'}
          </h3>
          <p className="text-sm text-gray-600">
            {filterRating !== 'all' || filterVerified
              ? 'Thử thay đổi bộ lọc'
              : 'Hãy là người đầu tiên đánh giá sản phẩm này!'}
          </p>
        </div>
      )}
    </div>
  );
}