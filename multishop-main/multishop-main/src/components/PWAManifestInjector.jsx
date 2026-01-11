/**
 * PWAManifestInjector - Dynamically inject manifest with related_applications
 * This enables getInstalledRelatedApps API to detect PWA from webviews
 */

import { useEffect } from 'react';

export default function PWAManifestInjector() {
  useEffect(() => {
    // Get current app URL dynamically
    const appUrl = window.location.origin;
    const manifestUrl = `${appUrl}/manifest.json`;
    
    // Create dynamic manifest with related_applications
    const dynamicManifest = {
      related_applications: [
        {
          platform: "webapp",
          url: manifestUrl
        }
      ],
      prefer_related_applications: false
    };
    
    // Check if there's already a manifest link
    const existingManifest = document.querySelector('link[rel="manifest"]');
    
    if (existingManifest) {
      // Manifest exists - we can't modify it, but we can try to register service worker
      // with the scope that enables getInstalledRelatedApps
      console.log('📱 Manifest exists at:', existingManifest.href);
    } else {
      // No manifest - create a blob manifest and inject it
      const blob = new Blob([JSON.stringify(dynamicManifest)], { type: 'application/json' });
      const blobUrl = URL.createObjectURL(blob);
      
      const link = document.createElement('link');
      link.rel = 'manifest';
      link.href = blobUrl;
      document.head.appendChild(link);
      
      console.log('📱 Dynamic manifest injected for PWA detection');
    }
    
    // Store app URL for cross-context detection
    try {
      localStorage.setItem('pwa-app-origin', appUrl);
    } catch (e) {
      // Ignore storage errors
    }
  }, []);
  
  return null;
}

/**
 * Get the app's origin URL (useful for PWA detection)
 */
export const getAppOrigin = () => {
  try {
    // First try localStorage (works if user visited in browser before)
    const stored = localStorage.getItem('pwa-app-origin');
    if (stored) return stored;
  } catch (e) {
    // Ignore
  }
  // Fallback to current origin
  return window.location.origin;
};