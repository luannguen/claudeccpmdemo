import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, X } from "lucide-react";

/**
 * UndoToast - Toast hiển thị chức năng Undo sau khi thực hiện hành động
 * 
 * @param {Boolean} isVisible - Hiển thị toast
 * @param {String} message - Nội dung thông báo
 * @param {Function} onUndo - Callback khi nhấn Undo
 * @param {Function} onDismiss - Callback khi đóng toast
 * @param {Number} duration - Thời gian hiển thị (ms) - Default: 5000
 */
export default function UndoToast({ 
  isVisible, 
  message = "Đã thêm vào giỏ hàng",
  onUndo, 
  onDismiss,
  duration = 3000 
}) {
  useEffect(() => {
    if (!isVisible) return;

    const timer = setTimeout(() => {
      onDismiss?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [isVisible, duration, onDismiss]);

  // Listen for shake gesture
  useEffect(() => {
    if (!isVisible) return;

    let lastX = 0;
    let lastY = 0;
    let lastZ = 0;
    let shakeCount = 0;

    const handleMotion = (e) => {
      const acceleration = e.accelerationIncludingGravity;
      if (!acceleration) return;

      const { x, y, z } = acceleration;
      const deltaX = Math.abs(x - lastX);
      const deltaY = Math.abs(y - lastY);
      const deltaZ = Math.abs(z - lastZ);

      // Detect significant movement
      if (deltaX + deltaY + deltaZ > 30) {
        shakeCount++;
        if (shakeCount > 2) {
          // Shake detected
          onUndo?.();
          shakeCount = 0;
        }
      }

      lastX = x;
      lastY = y;
      lastZ = z;
    };

    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [isVisible, onUndo]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 100, opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[180] w-[calc(100%-2rem)] max-w-sm sm:left-auto sm:right-6 sm:translate-x-0"
        >
          <div className="bg-gray-900/95 backdrop-blur-md text-white rounded-xl shadow-2xl overflow-hidden">
            {/* Progress bar */}
            <motion.div
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: duration / 1000, ease: "linear" }}
              className="h-0.5 bg-gradient-to-r from-[#7CB342] to-[#FF9800]"
            />

            <div className="px-3 py-2.5 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-xs leading-tight truncate">{message}</p>
                </div>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={onUndo}
                  className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 active:bg-white/30 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors whitespace-nowrap"
                  aria-label="Undo"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span className="hidden xs:inline">Hoàn tác</span>
                </button>

                <button
                  onClick={onDismiss}
                  className="w-7 h-7 hover:bg-white/10 active:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
                  aria-label="Close"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}