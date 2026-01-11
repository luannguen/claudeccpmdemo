/**
 * BackgroundStack - Stack của N background layers với cross-dissolve
 * 
 * Dynamic: Hỗ trợ số lượng frames không giới hạn
 * Mỗi layer có opacity được control bởi scroll progress
 */

import React, { useMemo } from "react";
import { useTransform } from "framer-motion";
import BackgroundLayer from "./BackgroundLayer";

// Component wrapper để tạo opacity transform cho mỗi frame
function DynamicBackgroundLayer({ 
  frame, 
  index, 
  totalFrames, 
  scrollYProgress, 
  isMobile 
}) {
  // Tính toán scroll range cho frame này
  const frameSize = 1 / totalFrames;
  const frameStart = index * frameSize;
  const frameEnd = (index + 1) * frameSize;
  
  // Overlap cho cross-dissolve mượt
  const fadeOverlap = 0.03; // 3% overlap
  
  // Tạo opacity transform - ĐƠN GIẢN HÓA LOGIC
  // Frame 0: opacity=1 khi scroll 0→frameEnd, sau đó fade out
  // Frame 1,2,3...: opacity=0 ban đầu, fade in khi đến lượt, fade out khi hết
  // Frame cuối: opacity=0 ban đầu, fade in khi đến lượt, stay 1
  const opacity = useTransform(
    scrollYProgress,
    index === 0 
      // First frame: START với opacity=1, fade out khi scroll qua
      ? [0, frameEnd - fadeOverlap, frameEnd + fadeOverlap]
      : index === totalFrames - 1
        // Last frame: START với opacity=0, fade in khi đến, stay 1
        ? [frameStart - fadeOverlap, frameStart + fadeOverlap, 1]
        // Middle frames: START opacity=0, fade in, stay, fade out
        : [frameStart - fadeOverlap, frameStart + fadeOverlap, frameEnd - fadeOverlap, frameEnd + fadeOverlap],
    index === 0
      ? [1, 1, 0] // First: 1 → 1 → 0
      : index === totalFrames - 1
        ? [0, 1, 1] // Last: 0 → 1 → 1
        : [0, 1, 1, 0] // Middle: 0 → 1 → 1 → 0
  );
  
  const bgUrl = isMobile 
    ? (frame.background_url_mobile || frame.background_url)
    : frame.background_url;
    
  return (
    <BackgroundLayer
      key={frame.frame_id}
      opacity={opacity}
      backgroundUrl={bgUrl}
      backgroundType={frame.background_type}
      isMobile={isMobile}
    />
  );
}

export default function BackgroundStack({ 
  frames = [], 
  scrollYProgress, 
  isMobile 
}) {
  const totalFrames = frames.length;
  
  if (totalFrames === 0) return null;
  
  return (
    <div className="absolute inset-0 w-full h-full">
      {frames.map((frame, index) => (
        <DynamicBackgroundLayer
          key={frame.frame_id}
          frame={frame}
          index={index}
          totalFrames={totalFrames}
          scrollYProgress={scrollYProgress}
          isMobile={isMobile}
        />
      ))}
    </div>
  );
}