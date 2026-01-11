/**
 * useTrackEcardView - Hook to track E-Card profile views
 * Call this when EcardPublicView is rendered
 * 
 * @module features/ecard/hooks
 */

import { useEffect, useRef } from 'react';
import { analyticsRepository } from '../data/analyticsRepository';

/**
 * Detect source from URL params
 */
function detectSource() {
  if (typeof window === 'undefined') return 'direct_link';
  
  const params = new URLSearchParams(window.location.search);
  const utmSource = params.get('utm_source');
  const source = params.get('source');
  
  if (utmSource === 'qr' || source === 'qr') return 'qr';
  if (utmSource === 'search' || source === 'search') return 'search';
  if (utmSource === 'referral' || source === 'referral' || params.get('ref')) return 'referral';
  
  // Check referrer
  const referrer = document.referrer;
  if (referrer && !referrer.includes(window.location.host)) {
    return 'referral';
  }
  
  return 'direct_link';
}

/**
 * Hook to track profile views
 * @param {string} profileUserId - User ID of the profile being viewed
 * @param {string} profileUserEmail - Email of the profile owner
 * @param {boolean} enabled - Whether tracking is enabled
 */
export function useTrackEcardView(profileUserId, profileUserEmail, enabled = true) {
  const tracked = useRef(false);
  const source = useRef(detectSource());

  useEffect(() => {
    if (!profileUserId || !profileUserEmail || tracked.current || !enabled) return;
    
    const track = async () => {
      try {
        await analyticsRepository.trackView(
          profileUserId,
          profileUserEmail,
          source.current
        );
        tracked.current = true;
      } catch (err) {
        console.error('Failed to track view:', err);
      }
    };
    
    // Debounce to avoid duplicate tracking
    const timeoutId = setTimeout(track, 1000);
    
    return () => clearTimeout(timeoutId);
  }, [profileUserId, profileUserEmail, enabled]);

  return {
    source: source.current,
    tracked: tracked.current
  };
}

/**
 * Track share event (call when user shares)
 */
export async function trackShare(userId, userEmail) {
  try {
    await analyticsRepository.trackShare(userId, userEmail);
  } catch (err) {
    console.error('Failed to track share:', err);
  }
}

/**
 * Track connection event (call when new connection is made)
 */
export async function trackConnection(userId, userEmail) {
  try {
    await analyticsRepository.trackConnection(userId, userEmail);
  } catch (err) {
    console.error('Failed to track connection:', err);
  }
}