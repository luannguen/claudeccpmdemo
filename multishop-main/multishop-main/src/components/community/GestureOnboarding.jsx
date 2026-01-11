import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Heart, ShoppingCart, Eye, Hand } from "lucide-react";

/**
 * GestureOnboarding - Hướng dẫn cử chỉ tương tác cho lần đầu sử dụng
 * 
 * @param {Boolean} forceShow - Bắt buộc hiển thị (dùng cho testing)
 * @param {Function} onComplete - Callback khi hoàn thành
 */
export default function GestureOnboarding({ forceShow = false, onComplete }) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  
  const STORAGE_KEY = 'zerofarm-gesture-onboarding-seen';

  useEffect(() => {
    // Check if user has seen onboarding
    const hasSeen = localStorage.getItem(STORAGE_KEY);
    if (!hasSeen || forceShow) {
      // Show after a small delay for better UX
      setTimeout(() => setIsVisible(true), 800);
    }
  }, [forceShow]);

  const handleComplete = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsVisible(false);
    onComplete?.();
  };

  const handleSkip = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsVisible(false);
    onComplete?.();
  };

  const steps = [
    {
      icon: Eye,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      title: 'Chạm để Xem',
      description: 'Chạm vào sản phẩm để xem chi tiết nhanh',
      gesture: (
        <motion.div
          animate={{ scale: [1, 0.9, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="relative w-20 h-20 mx-auto"
        >
          <Hand className="w-20 h-20 text-blue-600" />
          <motion.div
            animate={{ scale: [0, 1.5], opacity: [0.5, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="absolute inset-0 rounded-full bg-blue-400"
          />
        </motion.div>
      )
    },
    {
      icon: ShoppingCart,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      title: 'Giữ để Mua',
      description: 'Giữ lâu sản phẩm để thêm vào giỏ hàng',
      gesture: (
        <div className="relative w-20 h-20 mx-auto">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <Hand className="w-20 h-20 text-green-600" />
          </motion.div>
          <motion.div
            animate={{ scale: [0, 1] }}
            transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
            className="absolute -top-2 -right-2"
          >
            <ShoppingCart className="w-8 h-8 text-green-600" />
          </motion.div>
        </div>
      )
    },
    {
      icon: Heart,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      title: 'Giữ + Vuốt Lên',
      description: 'Giữ lâu rồi vuốt lên để thêm vào yêu thích',
      gesture: (
        <div className="relative w-20 h-20 mx-auto">
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <Hand className="w-20 h-20 text-pink-600" />
          </motion.div>
          <motion.div
            animate={{ y: [20, -40], opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute top-0 left-1/2 transform -translate-x-1/2"
          >
            <ArrowUp className="w-8 h-8 text-pink-600" />
          </motion.div>
          <motion.div
            animate={{ scale: [0, 1] }}
            transition={{ repeat: Infinity, duration: 2, delay: 1 }}
            className="absolute -top-2 -right-2"
          >
            <Heart className="w-8 h-8 text-pink-600 fill-pink-600" />
          </motion.div>
        </div>
      )
    },
    {
      icon: ArrowLeft,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      title: 'Vuốt Ngang',
      description: 'Vuốt trái/phải để xem sản phẩm khác',
      gesture: (
        <div className="flex items-center justify-center gap-4 h-20">
          <motion.div
            animate={{ x: [-20, 20, -20] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <ArrowLeft className="w-10 h-10 text-orange-600" />
          </motion.div>
          <div className="w-12 h-16 bg-orange-200 rounded-lg"></div>
          <motion.div
            animate={{ x: [20, -20, 20] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <ArrowRight className="w-10 h-10 text-orange-600" />
          </motion.div>
        </div>
      )
    },
    {
      icon: ArrowUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      title: 'Vuốt Dọc',
      description: 'Vuốt lên/xuống để chuyển danh mục',
      gesture: (
        <div className="flex flex-col items-center justify-center gap-4 h-20">
          <motion.div
            animate={{ y: [-20, 20, -20] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <ArrowUp className="w-10 h-10 text-purple-600" />
          </motion.div>
          <div className="w-16 h-12 bg-purple-200 rounded-lg"></div>
          <motion.div
            animate={{ y: [20, -20, 20] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <ArrowDown className="w-10 h-10 text-purple-600" />
          </motion.div>
        </div>
      )
    }
  ];

  const currentStepData = steps[currentStep];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-md z-[200] flex items-center justify-center p-6"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
          >
            {/* Header */}
            <div className={`${currentStepData.bgColor} p-6 text-center relative`}>
              <button
                onClick={handleSkip}
                className="absolute top-4 right-4 w-8 h-8 bg-white/50 hover:bg-white rounded-full flex items-center justify-center transition-colors"
                aria-label="Skip"
              >
                <X className="w-4 h-4" />
              </button>
              
              <div className="mb-4">
                {currentStepData.gesture}
              </div>
              
              <h2 className={`text-2xl font-bold ${currentStepData.color} mb-2`}>
                {currentStepData.title}
              </h2>
              
              <p className="text-gray-700 text-sm">
                {currentStepData.description}
              </p>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Progress Dots */}
              <div className="flex items-center justify-center gap-2 mb-6">
                {steps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentStep(index)}
                    className={`transition-all duration-300 rounded-full ${
                      index === currentStep
                        ? 'w-8 h-2 bg-gradient-to-r from-[#7CB342] to-[#FF9800]'
                        : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`Go to step ${index + 1}`}
                  />
                ))}
              </div>

              {/* Navigation */}
              <div className="flex gap-3">
                {currentStep > 0 && (
                  <button
                    onClick={() => setCurrentStep(prev => prev - 1)}
                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                  >
                    Trước
                  </button>
                )}
                
                {currentStep < steps.length - 1 ? (
                  <button
                    onClick={() => setCurrentStep(prev => prev + 1)}
                    className="flex-1 px-6 py-3 bg-[#7CB342] text-white rounded-xl font-medium hover:bg-[#FF9800] transition-colors"
                  >
                    Tiếp
                  </button>
                ) : (
                  <button
                    onClick={handleComplete}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-[#7CB342] to-[#FF9800] text-white rounded-xl font-medium hover:shadow-lg transition-all"
                  >
                    Bắt Đầu! 🎉
                  </button>
                )}
              </div>

              {/* Skip button at bottom */}
              {currentStep < steps.length - 1 && (
                <button
                  onClick={handleSkip}
                  className="w-full mt-3 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Bỏ qua hướng dẫn
                </button>
              )}
            </div>
          </motion.div>

          {/* Decorative elements */}
          <div className="absolute top-10 left-10 w-20 h-20 bg-[#7CB342]/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-32 h-32 bg-[#FF9800]/20 rounded-full blur-3xl"></div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}