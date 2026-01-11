/**
 * useScrollProgress - Hook theo dõi tiến trình scroll của stage
 * 
 * Trả về:
 * - scrollYProgress: 0-1 (0% - 100%)
 * - currentFrame: 0-4 (frame index hiện tại)
 */

import React from "react";
import { useScroll, useTransform } from "framer-motion";

// Frame ranges - critical cho tất cả animations
export const FRAME_RANGES = [
  { id: 0, start: 0, end: 0.2, name: 'trust' },
  { id: 1, start: 0.2, end: 0.4, name: 'process' },
  { id: 2, start: 0.4, end: 0.6, name: 'social' },
  { id: 3, start: 0.6, end: 0.8, name: 'cta' },
  { id: 4, start: 0.8, end: 1, name: 'exit' }
];

export function useScrollProgress(stageRef) {
  const { scrollYProgress } = useScroll({
    target: stageRef,
    offset: ["start start", "end end"]
  });
  
  const [currentFrame, setCurrentFrame] = React.useState(0);
  
  // Update currentFrame khi scroll changes
  React.useEffect(() => {
    return scrollYProgress.on("change", (progress) => {
      const frame = FRAME_RANGES.findIndex(f => progress >= f.start && progress < f.end);
      setCurrentFrame(frame === -1 ? 4 : frame);
    });
  }, [scrollYProgress]);
  
  return { scrollYProgress, currentFrame };
}