/**
 * Counter Animation Utilities
 * 
 * Animated counters cho social proof section
 */

import { useTransform, useSpring, useMotionValue } from "framer-motion";
import { useEffect } from "react";

/**
 * Hook để animate counter từ 0 đến target value
 * 
 * @param {MotionValue} scrollYProgress - Scroll progress
 * @param {number} targetValue - Giá trị đích
 * @param {number} frameStart - Scroll % bắt đầu animate (vd: 0.4)
 * @param {number} frameEnd - Scroll % kết thúc animate (vd: 0.6)
 * @param {boolean} enabled - Enable animation (desktop only)
 */
export function useAnimatedCounter(scrollYProgress, targetValue, frameStart, frameEnd, enabled = true) {
  if (!enabled) {
    return targetValue;
  }
  
  const rawValue = useTransform(
    scrollYProgress,
    [frameStart, frameEnd],
    [0, targetValue]
  );
  
  // Smooth spring for natural feel
  const springValue = useSpring(rawValue, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });
  
  return springValue;
}

/**
 * Hook để animate progress bar fill
 */
export function useProgressFill(scrollYProgress, targetPercent, frameStart, frameEnd, enabled = true) {
  if (!enabled) {
    return targetPercent;
  }
  
  return useTransform(
    scrollYProgress,
    [frameStart, frameEnd],
    [0, targetPercent]
  );
}

/**
 * Format number với thousand separators
 */
export function formatNumber(value, locale = 'vi-VN') {
  if (typeof value === 'object' && value.get) {
    // MotionValue
    return Math.round(value.get()).toLocaleString(locale);
  }
  return Math.round(value).toLocaleString(locale);
}

/**
 * Hook để display formatted counter
 */
export function useFormattedCounter(scrollYProgress, targetValue, frameStart, frameEnd, enabled = true) {
  const animated = useAnimatedCounter(scrollYProgress, targetValue, frameStart, frameEnd, enabled);
  
  return useTransform(animated, (v) => Math.round(v).toLocaleString('vi-VN'));
}

export default {
  useAnimatedCounter,
  useProgressFill,
  formatNumber,
  useFormattedCounter
};