/**
 * BookReviewForm - Form to submit a book review
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@/components/ui/AnimatedIcon';

function StarRatingInput({ value, onChange }) {
  const [hoverValue, setHoverValue] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHoverValue(star)}
          onMouseLeave={() => setHoverValue(0)}
          onClick={() => onChange(star)}
          className="p-1 transition-transform hover:scale-110"
        >
          <Icon.Star
            size={28}
            className={`transition-colors ${
              star <= (hoverValue || value)
                ? 'text-amber-400 fill-amber-400'
                : 'text-gray-200'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export default function BookReviewForm({
  onSubmit,
  isSubmitting = false,
  isVerifiedReader = false,
  existingReview = null
}) {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [title, setTitle] = useState(existingReview?.title || '');
  const [content, setContent] = useState(existingReview?.content || '');
  const [wouldRecommend, setWouldRecommend] = useState(existingReview?.would_recommend !== false);
  const [pros, setPros] = useState(existingReview?.pros?.join('\n') || '');
  const [cons, setCons] = useState(existingReview?.cons?.join('\n') || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0 || !content.trim()) return;

    onSubmit({
      rating,
      title: title.trim(),
      content: content.trim(),
      would_recommend: wouldRecommend,
      pros: pros.split('\n').filter(p => p.trim()),
      cons: cons.split('\n').filter(c => c.trim())
    });
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl border border-gray-200 p-6"
    >
      <h3 className="text-lg font-bold text-gray-900 mb-4">
        {existingReview ? 'Chỉnh sửa đánh giá' : 'Viết đánh giá'}
      </h3>

      {isVerifiedReader && (
        <div className="mb-4 p-3 bg-green-50 rounded-xl flex items-center gap-2 text-green-700 text-sm">
          <Icon.CheckCircle size={18} />
          Bạn đã đọc xong sách này! Đánh giá của bạn sẽ được đánh dấu "Đã đọc xong".
        </div>
      )}

      {/* Rating */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Đánh giá của bạn *
        </label>
        <StarRatingInput value={rating} onChange={setRating} />
        {rating > 0 && (
          <p className="text-sm text-amber-600 mt-1">
            {rating === 5 ? '⭐ Xuất sắc!' : 
             rating === 4 ? '👍 Rất hay' :
             rating === 3 ? '😊 Khá ổn' :
             rating === 2 ? '😐 Tạm được' : '😞 Không hay'}
          </p>
        )}
      </div>

      {/* Title */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tiêu đề (tùy chọn)
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Tóm tắt đánh giá của bạn..."
          className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7CB342]/50"
        />
      </div>

      {/* Content */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nội dung đánh giá *
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Chia sẻ cảm nhận của bạn về cuốn sách này..."
          rows={4}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7CB342]/50 resize-none"
        />
      </div>

      {/* Pros & Cons */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-green-600 mb-2">
            Điểm mạnh (mỗi dòng 1 điểm)
          </label>
          <textarea
            value={pros}
            onChange={(e) => setPros(e.target.value)}
            placeholder="Nội dung hay&#10;Dễ hiểu&#10;Nhiều ví dụ"
            rows={3}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 resize-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-red-600 mb-2">
            Điểm yếu (mỗi dòng 1 điểm)
          </label>
          <textarea
            value={cons}
            onChange={(e) => setCons(e.target.value)}
            placeholder="Hơi dài&#10;Thiếu hình ảnh"
            rows={3}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-none"
          />
        </div>
      </div>

      {/* Recommend */}
      <div className="mb-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={wouldRecommend}
            onChange={(e) => setWouldRecommend(e.target.checked)}
            className="w-5 h-5 rounded border-gray-300 text-[#7CB342] focus:ring-[#7CB342]"
          />
          <span className="text-sm text-gray-700">Tôi khuyên mọi người nên đọc sách này</span>
        </label>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={rating === 0 || !content.trim() || isSubmitting}
        className="w-full py-3 bg-[#7CB342] text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#558B2F] transition-colors flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <Icon.Spinner size={20} />
        ) : (
          <>
            <Icon.Send size={18} />
            {existingReview ? 'Cập nhật đánh giá' : 'Gửi đánh giá'}
          </>
        )}
      </button>
    </motion.form>
  );
}