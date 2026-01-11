/**
 * WebviewBlocker - Block login trong social webview
 * Hiện hướng dẫn mở trong browser thật để Google Auth hoạt động
 */

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Icon } from "@/components/ui/AnimatedIcon";
import { Button } from "@/components/ui/button";
import { 
  getWebviewType, 
  isZaloWebview,
  wasPWAInstalled,
  isStandalonePWA,
  checkPWAInstalledAsync,
  tryOpenInInstalledPWA
} from "./utils/webviewDetector";

/**
 * Get current full URL for sharing
 */
const getCurrentUrl = () => {
  return window.location.href;
};

/**
 * Copy URL to clipboard
 */
const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const result = document.execCommand('copy');
    document.body.removeChild(textarea);
    return result;
  }
};

/**
 * Try to open URL in external browser
 */
const openInExternalBrowser = (url) => {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);
  
  if (isAndroid) {
    // Android Chrome Intent
    const intentUrl = `intent://${url.replace(/^https?:\/\//, '')}#Intent;scheme=https;package=com.android.chrome;end`;
    window.location.href = intentUrl;
  } else if (isIOS) {
    // iOS: Try to open in Safari using x-safari scheme (may not work in all cases)
    // Fallback: just navigate directly
    window.location.href = url;
  } else {
    window.open(url, '_blank');
  }
};

export default function WebviewBlocker({ 
  inviterProfile,
  inviteCode,
  onContinueAnyway 
}) {
  const [copied, setCopied] = useState(false);
  const [hasPWAInstalled, setHasPWAInstalled] = useState(false);
  const [checkingPWA, setCheckingPWA] = useState(true);
  
  const webviewType = getWebviewType();
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const currentUrl = getCurrentUrl();
  
  // CRITICAL: Zalo iOS = hard block, no "continue anyway"
  const isZaloIOS = webviewType === 'zalo' && isIOS;
  
  // Check if user has PWA installed - use async API for Android webview
  useEffect(() => {
    const checkPWA = async () => {
      setCheckingPWA(true);
      try {
        // First try sync check (localStorage)
        const syncCheck = wasPWAInstalled() && !isStandalonePWA();
        if (syncCheck) {
          setHasPWAInstalled(true);
          setCheckingPWA(false);
          return;
        }
        
        // Then try async API (getInstalledRelatedApps - works in Android webview)
        const asyncCheck = await checkPWAInstalledAsync();
        setHasPWAInstalled(asyncCheck && !isStandalonePWA());
      } catch (error) {
        console.warn('PWA check failed:', error);
        setHasPWAInstalled(false);
      } finally {
        setCheckingPWA(false);
      }
    };
    
    checkPWA();
  }, []);

  const handleCopyLink = async () => {
    const success = await copyToClipboard(currentUrl);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleOpenBrowser = () => {
    openInExternalBrowser(currentUrl);
  };

  const handleOpenInPWA = () => {
    tryOpenInInstalledPWA(currentUrl);
  };

  // Get webview-specific instructions
  const getInstructions = () => {
    if (webviewType === 'zalo') {
      return {
        appName: 'Zalo',
        icon: '💬',
        steps: isIOS ? [
          'Nhấn nút "⋯" (3 chấm) góc trên bên phải',
          'Chọn "Mở trong Safari"',
          'Đăng nhập Google sẽ hoạt động bình thường'
        ] : [
          'Nhấn nút "⋮" (3 chấm) góc trên bên phải',  
          'Chọn "Mở trong trình duyệt"',
          'Đăng nhập Google sẽ hoạt động bình thường'
        ]
      };
    }
    
    if (webviewType === 'facebook') {
      return {
        appName: 'Facebook',
        icon: '📘',
        steps: isIOS ? [
          'Nhấn nút "⋯" góc dưới bên phải',
          'Chọn "Open in Safari"',
          'Đăng nhập sẽ hoạt động bình thường'
        ] : [
          'Nhấn nút "⋮" góc trên bên phải',
          'Chọn "Open in Chrome"',
          'Đăng nhập sẽ hoạt động bình thường'
        ]
      };
    }

    return {
      appName: 'ứng dụng này',
      icon: '📱',
      steps: [
        'Sao chép link bên dưới',
        `Mở ${isIOS ? 'Safari' : 'Chrome'}`,
        'Dán link và truy cập'
      ]
    };
  };

  const instructions = getInstructions();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 p-4 flex items-center justify-center">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden"
      >
        {/* Header with warning - PWA installed vs not */}
        <div className={`p-6 text-white text-center ${hasPWAInstalled 
          ? 'bg-gradient-to-r from-[#7CB342] to-[#558B2F]' 
          : 'bg-gradient-to-r from-amber-500 to-orange-500'
        }`}>
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            {hasPWAInstalled ? <Icon.Rocket size={32} /> : <Icon.AlertTriangle size={32} />}
          </div>
          <h1 className="text-xl font-bold mb-2">
            {hasPWAInstalled ? 'Mở trong ứng dụng?' : 'Cần mở trong trình duyệt'}
          </h1>
          <p className="text-white/90 text-sm">
            {hasPWAInstalled 
              ? 'Bạn đã cài đặt ứng dụng - hãy mở link này trong app!' 
              : `${instructions.appName} không hỗ trợ đăng nhập Google`
            }
          </p>
        </div>

        {/* Inviter preview (if available) */}
        {inviterProfile && (
          <div className="p-4 bg-gray-50 border-b">
            <div className="flex items-center gap-3">
              {inviterProfile.profile_image_url ? (
                <img
                  src={inviterProfile.profile_image_url}
                  alt={inviterProfile.display_name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-[#7CB342] rounded-full flex items-center justify-center text-white font-bold">
                  {inviterProfile.display_name?.charAt(0)}
                </div>
              )}
              <div>
                <p className="font-semibold text-gray-900">{inviterProfile.display_name}</p>
                <p className="text-sm text-gray-600">muốn kết nối với bạn</p>
              </div>
            </div>
          </div>
        )}

        {/* Instructions - Different for PWA installed users */}
        <div className="p-6">
          {hasPWAInstalled ? (
            <>
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-xl">📲</span>
                Mở trong ứng dụng đã cài:
              </h2>
              
              <ol className="space-y-3 mb-6">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-[#7CB342] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
                  <span className="text-gray-700 text-sm">Sao chép link bên dưới</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-[#7CB342] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
                  <span className="text-gray-700 text-sm">Mở ứng dụng <strong>Zero Farm</strong> trên màn hình chính</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-[#7CB342] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
                  <span className="text-gray-700 text-sm">Dán link vào thanh địa chỉ hoặc truy cập trực tiếp</span>
                </li>
              </ol>
            </>
          ) : (
            <>
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-xl">{instructions.icon}</span>
                Hướng dẫn mở trong trình duyệt:
              </h2>
              
              <ol className="space-y-3 mb-6">
                {instructions.steps.map((step, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-gray-700 text-sm">{step}</span>
                  </li>
                ))}
              </ol>
            </>
          )}

          {/* Quick action buttons */}
          <div className="space-y-3">
            {/* Zalo iOS: Only show copy link - NO browser open button (won't work) */}
            {isZaloIOS ? (
              <>
                {/* Primary action for Zalo iOS: Copy link */}
                <Button
                  onClick={handleCopyLink}
                  className="w-full bg-[#7CB342] hover:bg-[#689F38] h-12"
                >
                  {copied ? (
                    <>
                      <Icon.CheckCircle size={20} className="mr-2" />
                      Đã sao chép! Mở Safari để dán
                    </>
                  ) : (
                    <>
                      <Icon.Copy size={20} className="mr-2" />
                      Sao chép link
                    </>
                  )}
                </Button>
                
                {/* Visual instruction for iOS */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
                  <p className="text-amber-800 text-sm font-medium mb-2">
                    📋 Sau khi sao chép:
                  </p>
                  <p className="text-amber-700 text-xs">
                    1. Mở ứng dụng <strong>Safari</strong><br/>
                    2. Dán link vào thanh địa chỉ<br/>
                    3. Đăng nhập Google như bình thường
                  </p>
                </div>
              </>
            ) : (
              <>
                {/* Show different buttons based on PWA installed status */}
                {hasPWAInstalled ? (
                  <>
                    {/* PWA installed - Show "Open in App" as primary */}
                    <Button
                      onClick={handleOpenInPWA}
                      className="w-full bg-[#7CB342] hover:bg-[#689F38] h-12"
                    >
                      <Icon.Rocket size={20} className="mr-2" />
                      Mở trong ứng dụng Zero Farm
                    </Button>

                    {/* Copy link as backup */}
                    <Button
                      onClick={handleCopyLink}
                      variant="outline"
                      className="w-full h-10"
                    >
                      {copied ? (
                        <>
                          <Icon.CheckCircle size={18} className="mr-2 text-green-500" />
                          Đã sao chép!
                        </>
                      ) : (
                        <>
                          <Icon.Copy size={18} className="mr-2" />
                          Sao chép link (nếu không tự mở)
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <>
                    {/* PWA not installed - Show "Open in Chrome" */}
                    <Button
                      onClick={handleOpenBrowser}
                      className="w-full bg-[#7CB342] hover:bg-[#689F38] h-12"
                    >
                      <Icon.Globe size={20} className="mr-2" />
                      Mở bằng Chrome
                    </Button>

                    {/* Copy link as backup */}
                    <Button
                      onClick={handleCopyLink}
                      variant="outline"
                      className="w-full h-10"
                    >
                      {copied ? (
                        <>
                          <Icon.CheckCircle size={18} className="mr-2 text-green-500" />
                          Đã sao chép!
                        </>
                      ) : (
                        <>
                          <Icon.Copy size={18} className="mr-2" />
                          Sao chép link
                        </>
                      )}
                    </Button>
                  </>
                )}
              </>
            )}

            {/* Link display */}
            <div className="bg-gray-100 rounded-lg p-3 text-xs text-gray-600 break-all font-mono">
              {currentUrl}
            </div>
          </div>
        </div>

        {/* Footer note */}
        <div className="px-6 pb-6">
          <div className={`rounded-lg p-4 ${hasPWAInstalled ? 'bg-green-50' : 'bg-blue-50'}`}>
            <p className={`text-xs leading-relaxed ${hasPWAInstalled ? 'text-green-700' : 'text-blue-700'}`}>
              {hasPWAInstalled ? (
                <>
                  <strong>💡 Mẹo:</strong> Trong ứng dụng đã cài, bạn đã đăng nhập sẵn! 
                  Chỉ cần mở app và truy cập lại link này, kết nối sẽ được tự động tạo.
                </>
              ) : (
                <>
                  <strong>Tại sao cần làm điều này?</strong><br />
                  Google chặn đăng nhập từ các trình duyệt nhúng trong ứng dụng để bảo vệ tài khoản của bạn. 
                  Sau khi mở trong {isIOS ? 'Safari' : 'Chrome'}, bạn có thể đăng nhập bình thường và kết nối sẽ tự động hoàn tất.
                </>
              )}
            </p>
          </div>
        </div>

        {/* Optional: Continue anyway (view only, no login) - NOT for Zalo iOS */}
        {onContinueAnyway && !isZaloIOS && (
          <div className="border-t px-6 py-4">
            <button
              onClick={onContinueAnyway}
              className="w-full text-sm text-gray-500 hover:text-gray-700"
            >
              Tiếp tục xem mà không đăng nhập →
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}