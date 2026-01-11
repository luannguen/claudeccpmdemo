/**
 * SwipeHint - Mobile swipe/scroll hint animation
 * 
 * Hiển thị ở bottom, ẩn sau khi user scroll
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";

const FRAME_LABELS = ['Giới thiệu', 'Quy trình', 'Thành tựu', 'Đặt hàng', 'Liên hệ'];

export default function SwipeHint({ currentFrame }) {
  const [dismissed, setDismissed] = useState(false);
  
  // Auto dismiss sau 5 giây hoặc khi scroll
  useEffect(() => {
    const timer = setTimeout(() => setDismissed(true), 8000);
    return () => clearTimeout(timer);
  }, []);
  
  // Show hint cho frame đầu hoặc khi chưa dismiss
  const showHint = !dismissed && currentFrame < 4;
  
  return (
    <AnimatePresence>
      {showHint && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="absolute bottom-6 left-0 right-0 z-40 flex flex-col items-center gap-3 px-4"
        >
          {/* Frame indicator */}
          <div className="flex items-center gap-2">
            {[0, 1, 2, 3, 4].map((index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentFrame 
                    ? 'bg-[#7CB342] scale-125' 
                    : index < currentFrame 
                      ? 'bg-white/60' 
                      : 'bg-white/30'
                }`}
              />
            ))}
          </div>
          
          {/* Current section label */}
          <p className="text-white/80 text-xs font-medium">
            {FRAME_LABELS[currentFrame]}
          </p>
          
          {/* Swipe hint animation */}
          <motion.div
            className="flex flex-col items-center"
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="w-6 h-6 text-white/70" />
          </motion.div>
          
          {/* Dismiss button */}
          <button
            onClick={() => setDismissed(true)}
            className="text-white/40 text-xs hover:text-white/60 transition-colors"
          >
            Ẩn
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}