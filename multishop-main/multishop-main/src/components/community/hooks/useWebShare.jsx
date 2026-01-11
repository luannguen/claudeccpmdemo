import { useCallback } from 'react';

/**
 * useWebShare Hook
 * Native Web Share API integration
 */
export function useWebShare() {
  const canShare = 'share' in navigator;

  const share = useCallback(async ({ title, text, url }) => {
    if (!canShare) {
      console.warn('Web Share API not supported');
      return { success: false, fallback: true };
    }

    try {
      await navigator.share({
        title,
        text,
        url
      });
      return { success: true };
    } catch (error) {
      if (error.name === 'AbortError') {
        // User cancelled, not an error
        return { success: false, cancelled: true };
      }
      console.error('Share failed:', error);
      return { success: false, error };
    }
  }, [canShare]);

  return { canShare, share };
}