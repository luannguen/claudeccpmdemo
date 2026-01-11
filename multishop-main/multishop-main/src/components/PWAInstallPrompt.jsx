import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone, Share, CheckCircle } from 'lucide-react';
import { 
  isSocialWebview, 
  getWebviewType, 
  markPWAInstalled,
  wasPWAInstalled,
  isStandalonePWA
} from '@/components/ecard/utils/webviewDetector';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [isAlreadyInstalled, setIsAlreadyInstalled] = useState(false);

  useEffect(() => {
    // Store app origin for cross-context detection
    try {
      localStorage.setItem('pwa-app-origin', window.location.origin);
    } catch (e) {}

    // Check if already installed (standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('✅ App already installed (standalone mode)');
      markPWAInstalled();
      setIsAlreadyInstalled(true);
      return;
    }

    // Also mark as installed if navigator.standalone is true (iOS)
    if (window.navigator.standalone === true) {
      console.log('✅ App already installed (iOS standalone)');
      markPWAInstalled();
      setIsAlreadyInstalled(true);
      return;
    }

    // Check if in social webview - don't show install prompt (they need to open browser first)
    if (isSocialWebview()) {
      const webviewType = getWebviewType();
      console.log(`📱 Running in ${webviewType} webview - skipping install prompt`);
      return;
    }

    // Check if dismissed recently
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        console.log('⏰ PWA prompt dismissed recently');
        return;
      }
    }

    // Detect iOS - Check for Safari on iOS
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
    
    if (isIOS) {
      // Show iOS instructions after 3 seconds (only in real Safari, not webview)
      setTimeout(() => {
        setShowIOSInstructions(true);
      }, 3000);
    } else {
      // Android/Desktop - use beforeinstallprompt
      const handleBeforeInstall = (e) => {
        e.preventDefault();
        console.log('📱 PWA install prompt available');
        setDeferredPrompt(e);
        
        // Mark that user was prompted (helps with cross-context detection)
        try {
          localStorage.setItem('pwa-install-prompted', 'true');
        } catch (e) {}
        
        // Show prompt after 5 seconds
        setTimeout(() => {
          setShowPrompt(true);
        }, 5000);
      };

      // Listen for appinstalled event to mark as installed
      const handleAppInstalled = () => {
        console.log('✅ PWA was installed');
        markPWAInstalled();
        setShowPrompt(false);
        setDeferredPrompt(null);
        setIsAlreadyInstalled(true);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstall);
      window.addEventListener('appinstalled', handleAppInstalled);

      // Check if already installed but not in standalone mode
      // (This can happen if user visits in browser after installing)
      const checkAlreadyInstalled = async () => {
        // Method 1: Check getInstalledRelatedApps (Chrome 80+)
        if ('getInstalledRelatedApps' in navigator) {
          try {
            const relatedApps = await navigator.getInstalledRelatedApps();
            if (relatedApps && relatedApps.length > 0) {
              console.log('✅ PWA detected via getInstalledRelatedApps');
              markPWAInstalled();
              setIsAlreadyInstalled(true);
              return;
            }
          } catch (e) {
            console.warn('getInstalledRelatedApps failed:', e);
          }
        }

        // Method 2: Check localStorage marker
        if (wasPWAInstalled()) {
          console.log('✅ PWA detected via localStorage marker');
          setIsAlreadyInstalled(true);
        }
      };

      checkAlreadyInstalled();

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
        window.removeEventListener('appinstalled', handleAppInstalled);
      };
    }
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log(`PWA install outcome: ${outcome}`);
    
    if (outcome === 'accepted') {
      console.log('✅ User accepted PWA install');
      // Mark PWA as installed for future reference (suggest open in PWA from webview)
      markPWAInstalled();
    } else {
      console.log('❌ User dismissed PWA install');
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setShowIOSInstructions(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // Android/Desktop Prompt
  if (showPrompt && deferredPrompt) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-20 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-24 sm:w-96 bg-white rounded-2xl shadow-2xl border-2 border-[#7CB342] z-[200] overflow-hidden"
        >
          <div className="bg-gradient-to-r from-[#7CB342] to-[#5a8f31] text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Cài Đặt Zero Farm</h3>
                <p className="text-xs opacity-90">Truy cập nhanh hơn</p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4">
            <p className="text-sm text-gray-700 mb-4">
              Cài đặt ứng dụng để truy cập nhanh hơn, offline mode và trải nghiệm tốt hơn! 📱
            </p>

            <div className="space-y-2">
              <button
                onClick={handleInstall}
                className="w-full bg-[#7CB342] text-white py-3 rounded-xl font-medium hover:bg-[#FF9800] transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Cài Đặt Ngay
              </button>
              <button
                onClick={handleDismiss}
                className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Để Sau
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // iOS Prompt
  if (showIOSInstructions) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-20 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-24 sm:w-96 bg-white rounded-2xl shadow-2xl border-2 border-blue-500 z-[200] overflow-hidden"
        >
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Cài Đặt trên iOS</h3>
                <p className="text-xs opacity-90">Safari → Share → Add to Home</p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4">
            <p className="text-sm text-gray-700 mb-3">
              Để cài đặt Zero Farm trên iPhone/iPad:
            </p>

            <ol className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="font-bold min-w-6">1.</span>
                <span>Nhấn nút <strong>Share</strong> <Share className="w-4 h-4 inline text-blue-500" /> ở thanh dưới</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold min-w-6">2.</span>
                <span>Chọn <strong>"Add to Home Screen"</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold min-w-6">3.</span>
                <span>Nhấn <strong>"Add"</strong></span>
              </li>
            </ol>

            <button
              onClick={() => {
                markPWAInstalled(); // Mark as installed when user confirms
                handleDismiss();
              }}
              className="w-full mt-4 bg-blue-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
            >
              Đã Cài Đặt Xong ✓
            </button>
            <button
              onClick={handleDismiss}
              className="w-full mt-2 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              Để Sau
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Show "Already Installed" badge briefly (optional - can be removed)
  // This helps confirm to user that they have the app
  
  return null;
}