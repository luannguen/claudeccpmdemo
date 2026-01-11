import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Star, Upload, X, Send, Loader2, Image as ImageIcon, 
  Video, AlertCircle, CheckCircle, Camera, Play
} from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const MAX_IMAGES = 5;
const MAX_VIDEOS = 2;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

export default function ReviewForm({ 
  product, 
  currentUser, 
  onSuccess, 
  onCancel,
  existingReview = null 
}) {
  const [rating, setRating] = useState(existingReview?.rating || 5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [title, setTitle] = useState(existingReview?.title || '');
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [uploadedImages, setUploadedImages] = useState(existingReview?.images || []);
  const [videoLinks, setVideoLinks] = useState((existingReview?.videos || []).join('\n'));
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState({});

  const imageInputRef = useRef(null);
  const queryClient = useQueryClient();

  // ✅ Check if user bought this product
  const { data: hasPurchased, isLoading: checkingPurchase } = useQuery({
    queryKey: ['user-purchased', product?.id, currentUser?.email],
    queryFn: async () => {
      if (!currentUser?.email || !product?.id) return false;
      const orders = await base44.entities.Order.list('-created_date', 500);
      return orders.some(o => 
        o.customer_email === currentUser.email &&
        o.order_status === 'delivered' &&
        o.items?.some(item => item.product_id === product.id)
      );
    },
    enabled: !!currentUser?.email && !!product?.id,
    staleTime: 10 * 60 * 1000
  });

  // ✅ Get order_id for verified purchase
  const { data: orderWithProduct } = useQuery({
    queryKey: ['order-with-product', product?.id, currentUser?.email],
    queryFn: async () => {
      if (!currentUser?.email || !product?.id) return null;
      const orders = await base44.entities.Order.list('-created_date', 500);
      return orders.find(o => 
        o.customer_email === currentUser.email &&
        o.order_status === 'delivered' &&
        o.items?.some(item => item.product_id === product.id)
      );
    },
    enabled: !!hasPurchased,
    staleTime: 10 * 60 * 1000
  });

  const validateImage = (file) => {
    if (!file.type.startsWith('image/')) {
      return 'File không phải ảnh';
    }
    if (file.size > MAX_IMAGE_SIZE) {
      return 'Ảnh quá lớn (tối đa 5MB)';
    }
    return null;
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setErrors({ ...errors, images: null });

    if (uploadedImages.length + files.length > MAX_IMAGES) {
      setErrors({ ...errors, images: `Tối đa ${MAX_IMAGES} ảnh` });
      return;
    }

    // Validate all files
    for (const file of files) {
      const error = validateImage(file);
      if (error) {
        setErrors({ ...errors, images: error });
        return;
      }
    }

    setIsUploading(true);
    try {
      const uploadPromises = files.map(file => 
        base44.integrations.Core.UploadFile({ file })
      );
      const results = await Promise.all(uploadPromises);
      const imageUrls = results.map(r => r.file_url);
      setUploadedImages(prev => [...prev, ...imageUrls]);
    } catch (error) {
      setErrors({ ...errors, images: 'Lỗi upload. Thử lại.' });
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const validateVideoUrl = (url) => {
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const vimeoRegex = /vimeo\.com\/\d+/;
    return youtubeRegex.test(url) || vimeoRegex.test(url);
  };

  const createReviewMutation = useMutation({
    mutationFn: async (reviewData) => {
      const review = await base44.entities.Review.create(reviewData);
      
      // ✅ Award points for review (with photos/videos = more points)
      let pointsToAward = 10; // Base points
      if (uploadedImages.length > 0) pointsToAward += 5;
      if (videoLinks.trim()) pointsToAward += 10;
      
      if (pointsToAward > 0) {
        try {
          const loyaltyAccounts = await base44.entities.LoyaltyAccount.list('-created_date', 500);
          const account = loyaltyAccounts.find(la => la.user_email === currentUser.email);
          
          if (account) {
            await base44.entities.LoyaltyAccount.update(account.id, {
              total_points: (account.total_points || 0) + pointsToAward,
              points_earned_reviews: (account.points_earned_reviews || 0) + pointsToAward
            });
          }
          
          await base44.entities.Review.update(review.id, {
            points_awarded: pointsToAward
          });
        } catch (error) {
          console.log('Points award failed:', error);
        }
      }
      
      return review;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['product-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      onSuccess?.();
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!comment.trim()) {
      setErrors({ ...errors, comment: 'Vui lòng nhập nhận xét' });
      return;
    }

    // Validate videos
    const videoUrls = videoLinks
      .split('\n')
      .map(v => v.trim())
      .filter(v => v.length > 0);
    
    if (videoUrls.length > MAX_VIDEOS) {
      setErrors({ ...errors, videos: `Tối đa ${MAX_VIDEOS} video` });
      return;
    }

    for (const url of videoUrls) {
      if (!validateVideoUrl(url)) {
        setErrors({ ...errors, videos: 'Chỉ chấp nhận YouTube hoặc Vimeo' });
        return;
      }
    }

    // ✅ Get user profile for avatar
    const profiles = await base44.entities.UserProfile.list('-created_date', 500);
    const userProfile = profiles.find(p => p.user_email === currentUser.email);

    const reviewData = {
      product_id: product.id,
      product_name: product.name,
      order_id: orderWithProduct?.id || null,
      customer_name: currentUser.full_name,
      customer_email: currentUser.email,
      customer_avatar: userProfile?.avatar_url || null,
      rating,
      title: title.trim(),
      comment: comment.trim(),
      images: uploadedImages,
      videos: videoUrls,
      verified_purchase: !!hasPurchased,
      purchase_verified_date: hasPurchased ? new Date().toISOString() : null,
      status: 'approved', // Auto-approve for now
      helpful_count: 0,
      not_helpful_count: 0,
      total_votes: 0
    };

    createReviewMutation.mutate(reviewData);
  };

  const ratingLabels = {
    1: 'Rất tệ 😞',
    2: 'Tệ 😕',
    3: 'Bình thường 😐',
    4: 'Tốt 😊',
    5: 'Tuyệt vời! 🤩'
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      {/* ✅ Verified Purchase Badge */}
      {checkingPurchase ? (
        <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
          <span className="text-sm text-gray-600">Đang kiểm tra lịch sử mua hàng...</span>
        </div>
      ) : hasPurchased ? (
        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-green-900 text-sm">✅ Khách hàng đã mua hàng</p>
            <p className="text-xs text-green-700">
              Review của bạn sẽ được đánh dấu "Đã mua" và được ưu tiên hiển thị!
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-blue-900 text-sm">ℹ️ Bạn chưa mua sản phẩm này</p>
            <p className="text-xs text-blue-700">
              Review vẫn được chấp nhận nhưng không có badge "Đã mua"
            </p>
          </div>
        </div>
      )}

      {/* Product Info */}
      <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-xl">
        <img src={product.image_url} alt={product.name}
          className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-lg flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm sm:text-base truncate">{product.name}</h3>
          <p className="text-xs sm:text-sm text-gray-600">
            {(product.price || 0).toLocaleString('vi-VN')}đ / {product.unit}
          </p>
        </div>
      </div>

      {/* Rating Stars */}
      <div>
        <label className="block text-sm font-bold mb-3">
          Đánh giá sản phẩm: <span className="text-[#FF9800]">{ratingLabels[rating]}</span>
        </label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button key={star} type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="transition-transform hover:scale-110 active:scale-95">
              <Star className={`w-8 h-8 sm:w-10 sm:h-10 ${
                star <= (hoveredRating || rating) ? 'text-[#FF9800] fill-current' : 'text-gray-300'
              }`} />
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium mb-2">Tiêu đề (tùy chọn)</label>
        <input type="text" value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="VD: Sản phẩm tuyệt vời!"
          maxLength={100}
          className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342] text-sm sm:text-base" />
        <p className="text-xs text-gray-500 mt-1">{title.length}/100 ký tự</p>
      </div>

      {/* Comment */}
      <div>
        <label className="block text-sm font-medium mb-2">Nhận xét *</label>
        <textarea value={comment}
          onChange={(e) => {
            setComment(e.target.value);
            setErrors({ ...errors, comment: null });
          }}
          required rows={4}
          placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này...&#10;&#10;💡 Mẹo: Review chi tiết, có ảnh/video sẽ được +20 điểm thưởng!"
          maxLength={1000}
          className={`w-full px-3 sm:px-4 py-2 sm:py-3 border-2 rounded-xl focus:outline-none resize-none text-sm sm:text-base ${
            errors.comment ? 'border-red-400' : 'border-gray-200 focus:border-[#7CB342]'
          }`} />
        {errors.comment && (
          <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {errors.comment}
          </p>
        )}
        <p className="text-xs text-gray-500 mt-1">{comment.length}/1000 ký tự</p>
      </div>

      {/* ✅ Image Upload */}
      <div>
        <label className="block text-sm font-medium mb-2 flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-[#7CB342]" />
          Thêm Ảnh ({uploadedImages.length}/{MAX_IMAGES})
        </label>

        {errors.images && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{errors.images}</span>
          </div>
        )}

        {uploadedImages.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-3">
            {uploadedImages.map((img, idx) => (
              <div key={idx} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group">
                <img src={img} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <label className={`w-full border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all ${
          isUploading || uploadedImages.length >= MAX_IMAGES
            ? 'opacity-50 cursor-not-allowed border-gray-200'
            : 'border-gray-300 hover:border-[#7CB342] hover:bg-[#7CB342]/5'
        }`}>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            multiple
            onChange={handleImageUpload}
            disabled={isUploading || uploadedImages.length >= MAX_IMAGES}
            className="hidden"
          />
          {isUploading ? (
            <>
              <Loader2 className="w-6 h-6 text-[#7CB342] animate-spin mb-2" />
              <p className="text-sm text-gray-600">Đang tải lên...</p>
            </>
          ) : (
            <>
              <Camera className="w-6 h-6 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 mb-1">📸 Thêm ảnh thực tế</p>
              <p className="text-xs text-gray-400">JPG, PNG, WEBP • Max 5MB/ảnh • +5 điểm</p>
            </>
          )}
        </label>
      </div>

      {/* ✅ Video Links */}
      <div>
        <label className="block text-sm font-medium mb-2 flex items-center gap-2">
          <Video className="w-4 h-4 text-[#7CB342]" />
          Video Review ({videoLinks.split('\n').filter(v => v.trim()).length}/{MAX_VIDEOS})
        </label>

        {errors.videos && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{errors.videos}</span>
          </div>
        )}

        <textarea
          value={videoLinks}
          onChange={(e) => {
            setVideoLinks(e.target.value);
            setErrors({ ...errors, videos: null });
          }}
          rows={2}
          placeholder="https://www.youtube.com/watch?v=...&#10;https://vimeo.com/123456&#10;&#10;Mỗi link một dòng • +10 điểm"
          className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342] resize-none text-sm"
        />
        <p className="text-xs text-gray-500 mt-1">
          ✅ Hỗ trợ: YouTube, Vimeo
        </p>
      </div>

      {/* ✅ Points Incentive */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl p-4">
        <h4 className="font-bold text-yellow-900 mb-2 flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-600 fill-current" />
          Điểm Thưởng Review
        </h4>
        <div className="space-y-1.5 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-700">📝 Review cơ bản:</span>
            <span className="font-bold text-yellow-700">+10 điểm</span>
          </div>
          {uploadedImages.length > 0 && (
            <div className="flex items-center justify-between text-green-700">
              <span>📸 Có ảnh ({uploadedImages.length}):</span>
              <span className="font-bold">+5 điểm</span>
            </div>
          )}
          {videoLinks.trim() && (
            <div className="flex items-center justify-between text-blue-700">
              <span>🎥 Có video:</span>
              <span className="font-bold">+10 điểm</span>
            </div>
          )}
          <div className="flex items-center justify-between pt-2 border-t-2 border-yellow-300">
            <span className="font-bold text-gray-900">Tổng điểm nhận:</span>
            <span className="text-xl font-bold text-[#7CB342]">
              +{10 + (uploadedImages.length > 0 ? 5 : 0) + (videoLinks.trim() ? 10 : 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        {onCancel && (
          <button type="button" onClick={onCancel}
            className="flex-1 border-2 border-gray-300 text-gray-700 py-2.5 sm:py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors text-sm sm:text-base">
            Hủy
          </button>
        )}
        <button type="submit" disabled={!comment.trim() || createReviewMutation.isPending}
          className="flex-1 bg-gradient-to-r from-[#7CB342] to-[#5a8f31] text-white py-2.5 sm:py-3 rounded-xl font-bold hover:from-[#FF9800] hover:to-[#ff6b00] disabled:opacity-50 transition-all shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base">
          {createReviewMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
              Đang gửi...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 sm:w-5 sm:h-5" />
              Gửi Đánh Giá
            </>
          )}
        </button>
      </div>
    </form>
  );
}