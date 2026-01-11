/**
 * Webview Detector - Utility
 * Detect in-app browsers (Zalo, Facebook, Instagram, etc.)
 */

/**
 * Detect if running inside Zalo webview
 */
export const isZaloWebview = () => {
  const ua = navigator.userAgent || '';
  return /Zalo/i.test(ua);
};

/**
 * Detect if running inside Facebook webview
 */
export const isFacebookWebview = () => {
  const ua = navigator.userAgent || '';
  return /FBAN|FBAV|FB_IAB/i.test(ua);
};

/**
 * Detect if running inside Instagram webview
 */
export const isInstagramWebview = () => {
  const ua = navigator.userAgent || '';
  return /Instagram/i.test(ua);
};

/**
 * Detect if running inside LINE webview
 */
export const isLineWebview = () => {
  const ua = navigator.userAgent || '';
  return /Line/i.test(ua);
};

/**
 * Detect if running inside any social app webview
 */
export const isSocialWebview = () => {
  return isZaloWebview() || isFacebookWebview() || isInstagramWebview() || isLineWebview();
};

/**
 * Detect if running in standalone PWA mode
 */
export const isStandalonePWA = () => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         window.navigator.standalone === true;
};

/**
 * Check if PWA was previously installed (via localStorage marker)
 * NOTE: localStorage may not be shared between webview and browser on Android
 * This is a fallback - getInstalledRelatedApps is more reliable but async
 */
export const wasPWAInstalled = () => {
  try {
    return localStorage.getItem('pwa-installed') === 'true';
  } catch {
    return false;
  }
};

/**
 * Mark PWA as installed
 */
export const markPWAInstalled = () => {
  try {
    localStorage.setItem('pwa-installed', 'true');
  } catch {
    // Ignore
  }
};

/**
 * Check if PWA is installed using multiple detection methods
 * Works cross-context (webview can detect Chrome PWA)
 * @returns {Promise<boolean>}
 */
export const checkPWAInstalledAsync = async () => {
  try {
    // Method 1: getInstalledRelatedApps API (Chrome 80+, Android)
    if ('getInstalledRelatedApps' in navigator) {
      try {
        const relatedApps = await navigator.getInstalledRelatedApps();
        if (relatedApps && relatedApps.length > 0) {
          console.log('✅ PWA detected via getInstalledRelatedApps:', relatedApps);
          return true;
        }
      } catch (e) {
        console.warn('getInstalledRelatedApps failed:', e);
      }
    }
    
    // Method 2: Check shared storage marker
    // localStorage is shared between Chrome and Chrome Custom Tabs (used by some webviews)
    if (wasPWAInstalled()) {
      console.log('✅ PWA detected via localStorage marker');
      return true;
    }
    
    // Method 3: Check if app origin was stored (cross-context hint)
    try {
      const storedOrigin = localStorage.getItem('pwa-app-origin');
      const currentOrigin = window.location.origin;
      if (storedOrigin && storedOrigin === currentOrigin) {
        // User has visited this app in browser context before
        // If they also have pwa-install-prompted, likely installed
        const wasPrompted = localStorage.getItem('pwa-install-prompted');
        if (wasPrompted) {
          console.log('✅ PWA likely installed (origin match + prompted)');
          return true;
        }
      }
    } catch (e) {
      // Ignore storage errors
    }
    
    // Method 4: Service Worker check (if SW is active, PWA might be installed)
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration && registration.active) {
          // SW active + localStorage marker = high confidence
          const hasMarker = localStorage.getItem('pwa-installed') === 'true';
          if (hasMarker) {
            console.log('✅ PWA detected via ServiceWorker + marker');
            return true;
          }
        }
      } catch (e) {
        // Ignore SW errors
      }
    }
    
    return false;
  } catch (error) {
    console.warn('PWA detection failed:', error);
    return wasPWAInstalled();
  }
};

/**
 * Try to open app using Android Intent
 * Falls back to Chrome if intent fails
 * @param {string} url - URL to open in app
 * @returns {boolean} - true if intent was triggered
 */
export const tryOpenInInstalledPWA = (url) => {
  const isAndroid = /Android/i.test(navigator.userAgent);
  const origin = window.location.origin;
  
  if (isAndroid) {
    // Use Android Intent to open in Chrome (which will use PWA if installed)
    // Intent format: intent://HOST/PATH#Intent;scheme=https;package=com.android.chrome;end
    const urlWithoutProtocol = url.replace(/^https?:\/\//, '');
    const intentUrl = `intent://${urlWithoutProtocol}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(url)};end`;
    
    window.location.href = intentUrl;
    return true;
  }
  
  // iOS: Just open the URL (iOS will handle PWA scope automatically)
  window.location.href = url;
  return true;
};

/**
 * Generate PWA-compatible deep link URL
 * Preserves the current path with a marker for PWA detection
 * @param {string} path - Optional path to append
 * @returns {string}
 */
export const getPWADeepLink = (path = '') => {
  const origin = window.location.origin;
  const fullPath = path || window.location.pathname + window.location.search;
  return `${origin}${fullPath}`;
};

/**
 * Check if user can potentially open in installed PWA
 * Returns true if: PWA is installed AND currently in webview
 */
export const canSuggestPWAOpen = () => {
  return wasPWAInstalled() && isSocialWebview() && !isStandalonePWA();
};

/**
 * Async version - more reliable on Android webview
 * @returns {Promise<boolean>}
 */
export const canSuggestPWAOpenAsync = async () => {
  if (!isSocialWebview() || isStandalonePWA()) {
    return false;
  }
  return await checkPWAInstalledAsync();
};

/**
 * Detect iOS Safari
 */
export const isIOSSafari = () => {
  const ua = navigator.userAgent || '';
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
  const isSafari = /Safari/i.test(ua) && !/CriOS|FxiOS|Chrome/i.test(ua);
  return isIOS && isSafari && !isSocialWebview();
};

/**
 * Detect Android Chrome
 */
export const isAndroidChrome = () => {
  const ua = navigator.userAgent || '';
  return /Android/i.test(ua) && /Chrome/i.test(ua) && !isSocialWebview();
};

/**
 * Get webview type if in webview
 * @returns {string|null} 'zalo' | 'facebook' | 'instagram' | 'line' | null
 */
export const getWebviewType = () => {
  if (isZaloWebview()) return 'zalo';
  if (isFacebookWebview()) return 'facebook';
  if (isInstagramWebview()) return 'instagram';
  if (isLineWebview()) return 'line';
  return null;
};

/**
 * Get instructions for opening in native browser
 * @returns {Object} Instructions for current platform
 */
export const getOpenInBrowserInstructions = () => {
  const webviewType = getWebviewType();
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  
  if (webviewType === 'zalo') {
    return {
      platform: 'zalo',
      title: 'Mở bằng trình duyệt',
      steps: isIOS ? [
        'Nhấn vào nút "⋯" ở góc trên bên phải',
        'Chọn "Mở trong Safari"'
      ] : [
        'Nhấn vào nút "⋮" ở góc trên bên phải',
        'Chọn "Mở trong trình duyệt"'
      ],
      canOpenDirectly: false
    };
  }
  
  if (webviewType === 'facebook') {
    return {
      platform: 'facebook',
      title: 'Mở bằng trình duyệt',
      steps: isIOS ? [
        'Nhấn vào nút "⋯" ở góc dưới bên phải',
        'Chọn "Open in Safari"'
      ] : [
        'Nhấn vào nút "⋮" ở góc trên bên phải',
        'Chọn "Open in Chrome" hoặc "Open in Browser"'
      ],
      canOpenDirectly: false
    };
  }
  
  if (webviewType === 'instagram') {
    return {
      platform: 'instagram',
      title: 'Mở bằng trình duyệt',
      steps: [
        'Nhấn vào nút "⋯" ở góc trên',
        'Chọn "Open in Browser"'
      ],
      canOpenDirectly: false
    };
  }
  
  return null;
};

/**
 * Attempt to open URL in native browser (may not work in all webviews)
 * @param {string} url - URL to open
 */
export const tryOpenInBrowser = (url) => {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  
  if (isIOS) {
    // Try Safari
    window.location.href = url;
  } else {
    // Try Chrome intent on Android
    const chromeIntent = `intent://${url.replace(/^https?:\/\//, '')}#Intent;scheme=https;package=com.android.chrome;end`;
    window.location.href = chromeIntent;
  }
};

export default {
  isZaloWebview,
  isFacebookWebview,
  isInstagramWebview,
  isLineWebview,
  isSocialWebview,
  isStandalonePWA,
  wasPWAInstalled,
  markPWAInstalled,
  checkPWAInstalledAsync,
  canSuggestPWAOpen,
  canSuggestPWAOpenAsync,
  isIOSSafari,
  isAndroidChrome,
  getWebviewType,
  getOpenInBrowserInstructions,
  tryOpenInBrowser,
  tryOpenInInstalledPWA,
  getPWADeepLink
};