/**
 * InviteSuccessState - Success state after connection
 * 
 * Shows success message + PWA install prompt for conversion
 */

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Icon, AnimatedIcon } from "@/components/ui/AnimatedIcon";
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";
import { 
  isStandalonePWA, 
  wasPWAInstalled,
  markPWAInstalled 
} from "../utils/webviewDetector";

export default function InviteSuccessState({ 
  inviterProfile,
  isNewConnection = true 
}) {
  const navigate = useNavigate();
  const [showPWAPrompt, setShowPWAPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  
  // Check if should show PWA install prompt
  useEffect(() => {
    const ua = navigator.userAgent || '';
    const iOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
    setIsIOS(iOS);
    
    // Don't show if already installed
    if (isStandalonePWA() || wasPWAInstalled()) {
      return;
    }
    
    // Android: listen for beforeinstallprompt
    if (!iOS) {
      const handleBeforeInstall = (e) => {
        e.preventDefault();
        setDeferredPrompt(e);
        // Show prompt after a short delay
        setTimeout(() => setShowPWAPrompt(true), 1500);
      };
      
      window.addEventListener('beforeinstallprompt', handleBeforeInstall);
      
      // Check if prompt already captured
      if (window._deferredPrompt) {
        setDeferredPrompt(window._deferredPrompt);
        setTimeout(() => setShowPWAPrompt(true), 1500);
      }
      
      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      };
    } else {
      // iOS: Show install instructions after delay
      setTimeout(() => setShowPWAPrompt(true), 2000);
    }
  }, []);
  
  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        markPWAInstalled();
      }
      setDeferredPrompt(null);
      setShowPWAPrompt(false);
    }
  };
  
  const handleIOSInstallConfirm = () => {
    markPWAInstalled();
    setShowPWAPrompt(false);
  };

  const handleViewProfile = () => {
    if (inviterProfile?.public_url_slug) {
      navigate(createPageUrl(`EcardView?slug=${inviterProfile.public_url_slug}`));
    }
  };

  const handleGoToMyEcard = () => {
    navigate(createPageUrl("MyEcard"));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <Icon.CheckCircle size={48} className="text-green-500" />
        </motion.div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {isNewConnection ? 'Kết nối thành công!' : 'Đã kết nối trước đó'}
        </h1>
        <p className="text-gray-600 mb-6">
          {isNewConnection 
            ? `Bạn đã kết nối với ${inviterProfile?.display_name}`
            : `Bạn và ${inviterProfile?.display_name} đã là bạn bè`
          }
        </p>

        {/* Inviter info card */}
        {inviterProfile && (
          <div className="bg-gray-50 rounded-xl p-4 mb-6 flex items-center gap-4">
            {inviterProfile.profile_image_url ? (
              <img
                src={inviterProfile.profile_image_url}
                alt={inviterProfile.display_name}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 bg-[#7CB342] rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {inviterProfile.display_name?.charAt(0)}
              </div>
            )}
            <div className="text-left">
              <p className="font-semibold text-gray-900">{inviterProfile.display_name}</p>
              {inviterProfile.title_profession && (
                <p className="text-sm text-gray-600">{inviterProfile.title_profession}</p>
              )}
              {inviterProfile.company_name && (
                <p className="text-sm text-gray-500">{inviterProfile.company_name}</p>
              )}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleViewProfile}
            className="w-full bg-[#7CB342] hover:bg-[#689F38]"
          >
            <Icon.User size={18} className="mr-2" />
            Xem thông tin chi tiết
          </Button>
          <Button
            onClick={handleGoToMyEcard}
            variant="outline"
            className="w-full"
          >
            <Icon.Users size={18} className="mr-2" />
            Xem danh bạ của tôi
          </Button>
        </div>

        {/* PWA Install Prompt - Phase 2: Optimize Conversion */}
        {showPWAPrompt && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon.Smartphone size={20} className="text-blue-600" />
              </div>
              <div className="text-left flex-1">
                <h3 className="font-semibold text-gray-900 text-sm mb-1">
                  Cài đặt ứng dụng
                </h3>
                <p className="text-xs text-gray-600 mb-3">
                  Quét QR nhanh hơn, lưu danh thiếp offline và nhận thông báo kết nối mới!
                </p>
                
                {isIOS ? (
                  // iOS: Show instructions
                  <div className="space-y-2">
                    <ol className="text-xs text-gray-600 space-y-1">
                      <li>1. Nhấn nút Share ở thanh dưới</li>
                      <li>2. Chọn "Add to Home Screen"</li>
                      <li>3. Nhấn "Add"</li>
                    </ol>
                    <Button
                      size="sm"
                      onClick={handleIOSInstallConfirm}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-xs h-8"
                    >
                      Đã cài xong ✓
                    </Button>
                  </div>
                ) : deferredPrompt ? (
                  // Android: Show install button
                  <Button
                    size="sm"
                    onClick={handleInstallPWA}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-xs h-8"
                  >
                    <Icon.Download size={14} className="mr-1" />
                    Cài đặt ngay
                  </Button>
                ) : (
                  // Fallback: Generic instructions
                  <p className="text-xs text-gray-500 italic">
                    Sử dụng menu trình duyệt → "Cài đặt ứng dụng"
                  </p>
                )}
              </div>
              
              {/* Dismiss button */}
              <button
                onClick={() => setShowPWAPrompt(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <Icon.X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}