/**
 * useResponsiveFrameConfig - Detect device và trả về config phù hợp
 * 
 * Responsive breakpoints:
 * - Mobile: <768px
 * - Tablet: 768-1279px
 * - Desktop: >=1280px
 */

import { useState, useEffect } from "react";

export function useResponsiveFrameConfig() {
  const [device, setDevice] = useState('desktop');
  
  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setDevice('mobile');
      } else if (width < 1280) {
        setDevice('tablet');
      } else {
        setDevice('desktop');
      }
    };
    
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);
  
  const isMobile = device === 'mobile';
  const isTablet = device === 'tablet';
  const isDesktop = device === 'desktop';
  
  // Animation complexity based on device
  const animationComplexity = isMobile ? 'minimal' : isTablet ? 'simplified' : 'full';
  
  return {
    isMobile,
    isTablet,
    isDesktop,
    device,
    animationComplexity
  };
}