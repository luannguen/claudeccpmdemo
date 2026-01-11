/**
 * ScrollIndicator - 5 dots indicator hiển thị frame hiện tại
 * 
 * Click vào dot → scroll to frame tương ứng
 */

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const FRAME_LABELS = [
  'Giới thiệu',
  'Quy trình',
  'Thành tựu',
  'Đặt hàng',
  'Liên hệ'
];

export default function ScrollIndicator({ currentFrame, totalFrames = 5, onFrameClick }) {
  const frames = Array.from({ length: totalFrames }, (_, i) => i);
  
  return (
    <div className="absolute right-6 lg:right-8 top-1/2 -translate-y-1/2 z-50 hidden md:flex flex-col gap-3">
      {frames.map((index) => (
        <button
          key={index}
          onClick={() => onFrameClick?.(index)}
          className="group relative flex items-center justify-end"
          aria-label={FRAME_LABELS[index] || `Frame ${index + 1}`}
        >
          {/* Tooltip - shows on hover */}
          <motion.div 
            className="absolute right-5 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-medium text-gray-800 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none shadow-lg"
            initial={{ x: 10, opacity: 0 }}
            whileHover={{ x: 0, opacity: 1 }}
          >
            {FRAME_LABELS[index] || `Frame ${index + 1}`}
          </motion.div>
          
          {/* Dot */}
          <motion.div
            className={cn(
              "w-2.5 h-2.5 rounded-full transition-all duration-300 border border-white/50",
              currentFrame === index 
                ? "bg-white scale-125 shadow-[0_0_10px_rgba(255,255,255,0.5)]" 
                : "bg-white/30 group-hover:bg-white/60"
            )}
            whileHover={{ scale: 1.4 }}
            whileTap={{ scale: 0.9 }}
          />
        </button>
      ))}
    </div>
  );
}