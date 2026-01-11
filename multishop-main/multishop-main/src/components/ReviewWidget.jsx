import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

const reviews = [
  {
    id: 1,
    name: "Chị Lan Anh",
    rating: 5,
    text: "Rau củ Zero Farm tươi ngon quá! Gia đình tôi rất yên tâm.",
    service: "Combo Rau Củ Tuần",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80"
  },
  {
    id: 2,
    name: "Anh Minh",
    rating: 5,
    text: "Giao hàng nhanh, đóng gói cẩn thận. Sẽ ủng hộ dài dài!",
    service: "Dâu Tây Đà Lạt",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80"
  },
  {
    id: 3,
    name: "Chị Hương",
    rating: 5,
    text: "Sản phẩm organic thực sự, con em ăn rất ngon!",
    service: "Combo Ăn Dặm",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80"
  },
  {
    id: 4,
    name: "Anh Tuấn",
    rating: 4,
    text: "Chất lượng tốt, giá hợp lý. Đáng tiền!",
    service: "Gạo Lứt Huyết Rồng",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80"
  },
  {
    id: 5,
    name: "Chị Mai",
    rating: 5,
    text: "Zero Farm là lựa chọn số 1 cho gia đình tôi!",
    service: "Combo Trái Cây",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80"
  },
  {
    id: 6,
    name: "Anh Đức",
    rating: 5,
    text: "Rau sạch, không hóa chất. Tuyệt vời!",
    service: "Rau Xà Lách Xoăn",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80"
  }
];

export default function ReviewWidget() {
  const [currentReview, setCurrentReview] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [imageErrors, setImageErrors] = useState({});
  const [viewCount, setViewCount] = useState(() => {
    const count = sessionStorage.getItem('reviewWidgetViewCount');
    return count ? parseInt(count) : 0;
  });
  
  const [isManuallyDismissed, setIsManuallyDismissed] = useState(
    () => sessionStorage.getItem('reviewWidgetDismissed') === 'true'
  );

  // ✅ Fetch config từ PlatformConfig (optimized - filter instead of list)
  const { data: config } = useQuery({
    queryKey: ['review-widget-config'],
    queryFn: async () => {
      try {
        const configs = await base44.entities.PlatformConfig.filter(
          { config_key: 'review_widget_settings' },
          '-created_date',
          1
        );
        const widgetConfig = configs[0];
        
        if (widgetConfig) {
          return JSON.parse(widgetConfig.config_value);
        }
        
        // Default config
        return {
          enabled: true,
          initial_delay: 5000,      // 5s delay trước khi hiện lần đầu
          display_duration: 4000,   // Hiện 4s
          interval: 12000,          // Hiện lại sau 12s
          max_views_per_session: 3, // Tối đa 3 lần/session
          position: 'bottom-left',  // bottom-left, bottom-right, top-left, top-right
          auto_dismiss: true        // Tự động đóng sau display_duration
        };
      } catch (error) {
        // Silent fail on rate limit to avoid console spam
        return {
          enabled: true,
          initial_delay: 5000,
          display_duration: 4000,
          interval: 12000,
          max_views_per_session: 3,
          position: 'bottom-left',
          auto_dismiss: true
        };
      }
    },
    staleTime: 10 * 60 * 1000, // Cache 10 phút
    gcTime: 15 * 60 * 1000,
    retry: false
  });

  useEffect(() => {
    if (!config || !config.enabled || isManuallyDismissed) return;
    
    // ✅ Kiểm tra số lần hiển thị
    if (viewCount >= config.max_views_per_session) {
      return;
    }

    const showWidget = () => {
      setIsVisible(true);
      const newCount = viewCount + 1;
      setViewCount(newCount);
      sessionStorage.setItem('reviewWidgetViewCount', newCount.toString());
      
      // ✅ Auto dismiss nếu enabled
      if (config.auto_dismiss) {
        setTimeout(() => {
          setIsVisible(false);
        }, config.display_duration);
      }
    };

    // ✅ Initial delay
    const initialTimer = setTimeout(() => {
      showWidget();
    }, config.initial_delay);

    // ✅ Interval với kiểm tra số lần hiển thị
    const interval = setInterval(() => {
      if (viewCount < config.max_views_per_session - 1) {
        setCurrentReview((prev) => (prev + 1) % reviews.length);
        showWidget();
      }
    }, config.interval);

    return () => {
      clearInterval(interval);
      clearTimeout(initialTimer);
    };
  }, [config, isManuallyDismissed, viewCount]);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsManuallyDismissed(true);
    sessionStorage.setItem('reviewWidgetDismissed', 'true');
  };

  // ✅ Click outside to close
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setIsVisible(false);
    }
  };

  const handleImageError = (reviewId) => {
    setImageErrors(prev => ({ ...prev, [reviewId]: true }));
  };

  if (!config || !config.enabled) return null;

  const review = reviews[currentReview];

  // ✅ Position mapping
  const positionClasses = {
    'bottom-left': 'bottom-2 left-2',
    'bottom-right': 'bottom-2 right-2',
    'top-left': 'top-20 left-2',
    'top-right': 'top-20 right-2'
  };

  return (
    <AnimatePresence>
      {!isManuallyDismissed && isVisible && (
        <motion.div
          initial={{ opacity: 0, x: config.position.includes('left') ? -100 : 100, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: config.position.includes('left') ? -100 : 100, scale: 0.8 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          onClick={handleBackdropClick}
          className={`fixed ${positionClasses[config.position] || positionClasses['bottom-left']} z-50 w-56 xs:w-60 sm:w-64 md:w-72`}
        >
          <div className="bg-white rounded-xl shadow-2xl border border-gray-100 p-3 sm:p-4 relative overflow-hidden">
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#7CB342]/5 via-white to-[#FF9800]/5" />
            
            {/* Close Button */}
            <button
              onClick={handleDismiss}
              className="absolute top-1 right-1 w-5 h-5 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors duration-200 z-10"
              aria-label="Đóng"
            >
              <X className="w-3 h-3 text-gray-500" />
            </button>

            {/* Content */}
            <div className="relative">
              {/* Header */}
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-[#7CB342]/20 flex-shrink-0 bg-gray-100">
                  {imageErrors[review.id] ? (
                    <div className="w-full h-full bg-gradient-to-br from-[#7CB342] to-[#FF9800] flex items-center justify-center">
                      <span className="text-white font-semibold text-xs">{review.name.charAt(0)}</span>
                    </div>
                  ) : (
                    <img
                      src={review.avatar}
                      alt={review.name}
                      className="w-full h-full object-cover"
                      onError={() => handleImageError(review.id)}
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-serif text-sm font-semibold text-[#0F0F0F] truncate">
                    {review.name}
                  </p>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < review.rating
                            ? 'text-[#FF9800] fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Review Text */}
              <p className="font-sans text-xs sm:text-sm text-gray-600 leading-tight mb-2 line-clamp-2 pr-4">
                "{review.text}"
              </p>

              {/* Service */}
              <div className="inline-block bg-[#7CB342]/10 text-[#7CB342] px-2 py-1 rounded-full text-xs font-medium">
                {review.service}
              </div>
            </div>

            {/* Pulse Animation Border */}
            <div className="absolute inset-0 rounded-xl border-2 border-[#7CB342]/30 animate-pulse pointer-events-none" />
          </div>

          {/* ZERO FARM Badge */}
          <div className="absolute -top-1 -right-1 bg-[#7CB342] text-white px-2 py-0.5 rounded-full text-xs font-medium shadow-lg">
            ZERO FARM
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}