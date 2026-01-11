/**
 * BookReviewsSection - Display book reviews with stats
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@/components/ui/AnimatedIcon';
import { useBookReviews } from '../hooks/useBookReviews';
import BookReviewCard, { StarRating } from './BookReviewCard';
import BookReviewForm from './BookReviewForm';
import { useConfirmDialog } from '@/components/hooks/useConfirmDialog';

function RatingStats({ stats }) {
  const maxCount = Math.max(...Object.values(stats.distribution), 1);

  return (
    <div className="bg-gray-50 rounded-2xl p-4">
      <div className="flex items-center gap-4 mb-4">
        <div className="text-center">
          <p className="text-4xl font-bold text-gray-900">{stats.average || 0}</p>
          <StarRating rating={Math.round(stats.average)} size={16} />
          <p className="text-xs text-gray-500 mt-1">{stats.count} đánh giá</p>
        </div>
        <div className="flex-1 space-y-1">
          {[5, 4, 3, 2, 1].map(star => (
            <div key={star} className="flex items-center gap-2">
              <span className="text-xs text-gray-500 w-3">{star}</span>
              <Icon.Star size={12} className="text-amber-400" />
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all"
                  style={{ width: `${(stats.distribution[star] / maxCount) * 100}%` }}
                />
              </div>
              <span className="text-xs text-gray-400 w-6">{stats.distribution[star]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function BookReviewsSection({ bookId, currentUser }) {
  const [showForm, setShowForm] = useState(false);
  const { showConfirm } = useConfirmDialog();

  const {
    reviews,
    stats,
    myReview,
    isLoading,
    isVerifiedReader,
    canReview,
    isLiked,
    submitReview,
    deleteReview,
    toggleLike,
    isSubmitting
  } = useBookReviews(bookId, currentUser);

  const handleSubmit = async (data) => {
    await submitReview(data);
    setShowForm(false);
  };

  const handleDelete = async (reviewId) => {
    const confirmed = await showConfirm({
      title: 'Xóa đánh giá',
      message: 'Bạn có chắc muốn xóa đánh giá này?',
      type: 'danger',
      confirmText: 'Xóa'
    });
    if (confirmed) {
      await deleteReview(reviewId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Icon.Star size={24} className="text-amber-400" />
          Đánh Giá ({stats.count})
        </h3>
        {canReview && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-[#7CB342] text-white rounded-xl font-medium hover:bg-[#558B2F] transition-colors flex items-center gap-2"
          >
            <Icon.Edit size={18} />
            Viết đánh giá
          </button>
        )}
      </div>

      {/* Rating Stats */}
      {stats.count > 0 && <RatingStats stats={stats} />}

      {/* Review Form */}
      <AnimatePresence>
        {(showForm || myReview) && currentUser && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            {myReview && !showForm ? (
              <div className="bg-[#7CB342]/5 rounded-2xl p-4 border border-[#7CB342]/20">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-[#7CB342]">Đánh giá của bạn</p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="text-sm text-[#7CB342] hover:underline"
                  >
                    Chỉnh sửa
                  </button>
                </div>
                <BookReviewCard
                  review={myReview}
                  onDelete={handleDelete}
                  canDelete
                />
              </div>
            ) : (
              <BookReviewForm
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                isVerifiedReader={isVerifiedReader}
                existingReview={myReview}
              />
            )}
            {showForm && (
              <button
                onClick={() => setShowForm(false)}
                className="mt-2 text-sm text-gray-500 hover:text-gray-700"
              >
                Hủy
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Not logged in prompt */}
      {!currentUser && (
        <div className="bg-gray-50 rounded-2xl p-6 text-center">
          <Icon.User size={32} className="text-gray-300 mx-auto mb-2" />
          <p className="text-gray-600 mb-3">Đăng nhập để viết đánh giá</p>
          <button
            onClick={() => base44.auth.redirectToLogin(window.location.href)}
            className="px-4 py-2 bg-[#7CB342] text-white rounded-xl text-sm font-medium"
          >
            Đăng nhập
          </button>
        </div>
      )}

      {/* Reviews List */}
      {isLoading ? (
        <div className="text-center py-8">
          <Icon.Spinner size={32} className="text-[#7CB342] mx-auto" />
        </div>
      ) : reviews.filter(r => r.id !== myReview?.id).length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Icon.MessageCircle size={32} className="mx-auto mb-2 opacity-50" />
          <p>Chưa có đánh giá nào từ người khác</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {reviews
              .filter(r => r.id !== myReview?.id)
              .map(review => (
                <BookReviewCard
                  key={review.id}
                  review={review}
                  onLike={toggleLike}
                  isLiked={isLiked(review)}
                />
              ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}