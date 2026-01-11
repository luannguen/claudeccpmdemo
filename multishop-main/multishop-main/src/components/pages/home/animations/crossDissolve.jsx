/**
 * Cross-Dissolve Animation Utilities
 * 
 * Quản lý opacity transitions giữa các frames
 */

import { useTransform } from "framer-motion";

/**
 * Tạo opacity mapping cho frame dựa trên scroll progress
 * Frame có overlap để tạo cross-dissolve effect
 * 
 * @param {MotionValue} scrollYProgress - Scroll progress 0-1
 * @param {number} frameIndex - Index của frame (0-4)
 * @param {number} overlapPercent - % overlap giữa các frames (default 5%)
 */
export function useFrameOpacity(scrollYProgress, frameIndex, overlapPercent = 0.05) {
  const frameCount = 5;
  const frameDuration = 1 / frameCount; // 0.2 (20% mỗi frame)
  
  const startFadeIn = Math.max(0, frameIndex * frameDuration - overlapPercent);
  const fullVisible = frameIndex * frameDuration;
  const startFadeOut = (frameIndex + 1) * frameDuration - overlapPercent;
  const endFadeOut = Math.min(1, (frameIndex + 1) * frameDuration);
  
  // Frame cuối không fade out
  if (frameIndex === frameCount - 1) {
    return useTransform(
      scrollYProgress,
      [startFadeIn, fullVisible, 1],
      [0, 1, 1]
    );
  }
  
  // Frame đầu không fade in
  if (frameIndex === 0) {
    return useTransform(
      scrollYProgress,
      [0, startFadeOut, endFadeOut],
      [1, 1, 0]
    );
  }
  
  return useTransform(
    scrollYProgress,
    [startFadeIn, fullVisible, startFadeOut, endFadeOut],
    [0, 1, 1, 0]
  );
}

/**
 * Tạo parallax offset cho text/elements
 * Desktop only - subtle movement
 */
export function useParallaxOffset(scrollYProgress, frameIndex, maxOffset = 50) {
  const frameDuration = 0.2;
  const frameStart = frameIndex * frameDuration;
  const frameEnd = (frameIndex + 1) * frameDuration;
  
  return useTransform(
    scrollYProgress,
    [frameStart, frameEnd],
    [maxOffset, -maxOffset]
  );
}

/**
 * Scale animation cho content entry
 */
export function useContentScale(scrollYProgress, frameIndex) {
  const frameDuration = 0.2;
  const frameStart = frameIndex * frameDuration;
  const entryPoint = frameStart + 0.02;
  
  return useTransform(
    scrollYProgress,
    [frameStart, entryPoint],
    [0.95, 1]
  );
}

export default {
  useFrameOpacity,
  useParallaxOffset,
  useContentScale
};