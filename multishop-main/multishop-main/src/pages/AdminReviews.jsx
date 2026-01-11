import React from "react";
import AdminLayout from "@/components/AdminLayout";
import AdminGuard from "@/components/AdminGuard";
import { Star } from 'lucide-react';

// Hooks
import {
  useAdminReviewsData,
  useReviewStats,
  useAdminReviewsState,
  useFilteredReviews
} from "@/components/hooks/useAdminReviews";

// Components
import ReviewsStats from "@/components/admin/reviews/ReviewsStats";
import ReviewsFilters from "@/components/admin/reviews/ReviewsFilters";
import AdminReviewCard from "@/components/reviews/AdminReviewCard";
import SellerResponseModal from "@/components/reviews/SellerResponseModal";

function AdminReviewsContent() {
  const { data: reviews = [], isLoading } = useAdminReviewsData();
  const stats = useReviewStats(reviews);
  const { filters, setters, selectedReview, setSelectedReview } = useAdminReviewsState();
  const filteredReviews = useFilteredReviews(reviews, filters);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-[#0F0F0F] mb-2">
          Quản Lý Đánh Giá
        </h1>
        <p className="text-gray-600 mb-6">Quản lý đánh giá và nhận xét từ khách hàng</p>
        <ReviewsStats stats={stats} />
      </div>

      <ReviewsFilters filters={filters} setters={setters} />

      {isLoading ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-[#7CB342] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải đánh giá...</p>
        </div>
      ) : filteredReviews.length > 0 ? (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <AdminReviewCard
              key={review.id}
              review={review}
              onReply={setSelectedReview}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-2xl">
          <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Không tìm thấy đánh giá nào</p>
        </div>
      )}

      {selectedReview && (
        <SellerResponseModal
          isOpen={!!selectedReview}
          onClose={() => setSelectedReview(null)}
          review={selectedReview}
        />
      )}
    </div>
  );
}

export default function AdminReviews() {
  return (
    <AdminGuard requiredModule="reviews" requiredPermission="reviews.view">
      <AdminLayout>
        <AdminReviewsContent />
      </AdminLayout>
    </AdminGuard>
  );
}