import React, { useState } from 'react';
import { X, Send, Loader2, MessageSquare, AlertCircle, Star } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import EnhancedModal from '../EnhancedModal';

export default function SellerResponseModal({ isOpen, onClose, review }) {
  const [responseText, setResponseText] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const queryClient = useQueryClient();

  const reviewData = review?.data || review;

  const createResponseMutation = useMutation({
    mutationFn: async () => {
      const user = await base44.auth.me();
      
      const response = await base44.entities.ReviewResponse.create({
        review_id: review.id,
        responder_name: user.full_name,
        responder_email: user.email,
        responder_role: user.role === 'admin' || user.role === 'super_admin' ? 'admin' : 'shop_owner',
        response_text: responseText.trim(),
        is_public: isPublic
      });

      // Update review
      await base44.entities.Review.update(review.id, {
        has_seller_response: true,
        seller_response_date: new Date().toISOString()
      });

      // ✅ Create notification for reviewer
      await base44.entities.Notification.create({
        recipient_email: reviewData.customer_email,
        type: 'reply',
        actor_email: user.email,
        actor_name: user.full_name,
        message: 'đã phản hồi đánh giá của bạn',
        link: `/services?product=${reviewData.product_id}#reviews`
      });

      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['review-response'] });
      queryClient.invalidateQueries({ queryKey: ['admin-review-response'] });
      
      const toast = document.createElement('div');
      toast.className = 'fixed bottom-24 right-6 bg-green-600 text-white px-6 py-4 rounded-2xl shadow-2xl z-[200] animate-slide-up';
      toast.innerHTML = '<span class="font-medium">✅ Đã gửi phản hồi!</span>';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
      
      onClose();
      setResponseText('');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!responseText.trim()) {
      alert('Vui lòng nhập nội dung phản hồi');
      return;
    }
    createResponseMutation.mutate();
  };

  return (
    <EnhancedModal
      isOpen={isOpen}
      onClose={onClose}
      title="Phản Hồi Đánh Giá"
      maxWidth="2xl"
      persistPosition={true}
      positionKey="seller-response-modal"
    >
      <div className="p-4 sm:p-6 space-y-4">
        {/* Review Preview */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7CB342] to-[#FF9800] flex items-center justify-center text-white font-bold flex-shrink-0">
              {reviewData?.customer_name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm">{reviewData?.customer_name}</p>
              <div className="flex gap-0.5 my-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < reviewData?.rating ? 'text-[#FF9800] fill-current' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              {reviewData?.title && (
                <p className="font-semibold text-sm mb-1">{reviewData.title}</p>
              )}
              <p className="text-sm text-gray-700">{reviewData?.comment}</p>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
          <p className="text-sm text-blue-900">
            <strong>💡 Mẹo phản hồi hiệu quả:</strong>
          </p>
          <ul className="text-xs text-blue-800 mt-2 space-y-1 ml-4 list-disc">
            <li>Cảm ơn khách hàng đã đánh giá</li>
            <li>Giải thích hoặc cam kết cải thiện (nếu có vấn đề)</li>
            <li>Mời khách quay lại hoặc liên hệ hỗ trợ</li>
            <li>Giữ thái độ chuyên nghiệp và thân thiện</li>
          </ul>
        </div>

        {/* Response Textarea */}
        <div>
          <label className="block text-sm font-medium mb-2">Nội dung phản hồi: *</label>
          <textarea
            value={responseText}
            onChange={(e) => setResponseText(e.target.value)}
            required
            rows={5}
            placeholder="VD: Cảm ơn bạn đã đánh giá! Chúng tôi rất vui khi sản phẩm làm bạn hài lòng. Hy vọng được phục vụ bạn lần sau..."
            maxLength={500}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342] resize-none text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">{responseText.length}/500 ký tự</p>
        </div>

        {/* Public Toggle */}
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-[#7CB342] focus:ring-[#7CB342]"
          />
          <span className="text-gray-700">
            Hiển thị công khai (khách hàng và mọi người đều thấy)
          </span>
        </label>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose}
            className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors">
            Hủy
          </button>
          <button onClick={handleSubmit} disabled={!responseText.trim() || createResponseMutation.isPending}
            className="flex-1 bg-[#7CB342] text-white py-3 rounded-xl font-bold hover:bg-[#FF9800] disabled:opacity-50 transition-all shadow-lg flex items-center justify-center gap-2">
            {createResponseMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Đang gửi...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Gửi Phản Hồi
              </>
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
      `}</style>
    </EnhancedModal>
  );
}