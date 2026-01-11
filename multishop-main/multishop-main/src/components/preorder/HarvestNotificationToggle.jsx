/**
 * HarvestNotificationToggle - Component đăng ký nhận thông báo thu hoạch
 * UI Layer - Presentation only
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, BellOff, Check, Mail, Phone, Calendar } from "lucide-react";
import { useToast } from "@/components/NotificationToast";

export default function HarvestNotificationToggle({
  lotId,
  lotName,
  harvestDate,
  variant = "default"
}) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [notifyMethod, setNotifyMethod] = useState('email'); // 'email' | 'sms' | 'both'
  const { addToast } = useToast();

  // Check subscription status from localStorage
  useEffect(() => {
    const subscriptions = JSON.parse(localStorage.getItem('harvest-notifications') || '{}');
    setIsSubscribed(!!subscriptions[lotId]);
    if (subscriptions[lotId]) {
      setNotifyMethod(subscriptions[lotId].method || 'email');
    }
  }, [lotId]);

  const handleToggle = () => {
    if (isSubscribed) {
      // Unsubscribe
      const subscriptions = JSON.parse(localStorage.getItem('harvest-notifications') || '{}');
      delete subscriptions[lotId];
      localStorage.setItem('harvest-notifications', JSON.stringify(subscriptions));
      setIsSubscribed(false);
      addToast('Đã hủy đăng ký thông báo', 'info');
    } else {
      // Show options first
      setShowOptions(true);
    }
  };

  const handleSubscribe = (method) => {
    const subscriptions = JSON.parse(localStorage.getItem('harvest-notifications') || '{}');
    subscriptions[lotId] = {
      lotName,
      harvestDate,
      method,
      subscribedAt: new Date().toISOString()
    };
    localStorage.setItem('harvest-notifications', JSON.stringify(subscriptions));
    setIsSubscribed(true);
    setNotifyMethod(method);
    setShowOptions(false);
    
    const methodText = method === 'both' ? 'Email & SMS' : method === 'sms' ? 'SMS' : 'Email';
    addToast(`Đã đăng ký nhận thông báo qua ${methodText}`, 'success');
  };

  // Compact variant
  if (variant === "compact") {
    return (
      <button
        onClick={handleToggle}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
          isSubscribed 
            ? 'bg-green-100 text-green-700 hover:bg-green-200'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        {isSubscribed ? (
          <>
            <Check className="w-4 h-4" />
            Đã đăng ký
          </>
        ) : (
          <>
            <Bell className="w-4 h-4" />
            Nhắc tôi
          </>
        )}
      </button>
    );
  }

  // Inline variant - minimal toggle
  if (variant === "inline") {
    return (
      <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-purple-600" />
          <span className="text-sm text-purple-800">Nhắc khi gần thu hoạch</span>
        </div>
        <button
          onClick={handleToggle}
          className={`relative w-12 h-6 rounded-full transition-colors ${
            isSubscribed ? 'bg-green-500' : 'bg-gray-300'
          }`}
        >
          <motion.div
            animate={{ x: isSubscribed ? 26 : 2 }}
            className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
          />
        </button>
      </div>
    );
  }

  // Card variant
  if (variant === "card") {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900">Nhận thông báo thu hoạch</h4>
              <p className="text-xs text-gray-500">Chúng tôi sẽ nhắc bạn trước khi thu hoạch</p>
            </div>
          </div>
        </div>

        {/* Harvest Date Preview */}
        {harvestDate && (
          <div className="flex items-center gap-2 bg-white/60 rounded-xl p-2">
            <Calendar className="w-4 h-4 text-purple-600" />
            <span className="text-sm text-gray-700">
              Dự kiến: {new Date(harvestDate).toLocaleDateString('vi-VN', {
                weekday: 'short',
                day: 'numeric',
                month: 'short'
              })}
            </span>
          </div>
        )}

        {isSubscribed ? (
          <div className="flex items-center justify-between bg-green-100 rounded-xl p-3">
            <div className="flex items-center gap-2 text-green-700">
              <Check className="w-5 h-5" />
              <span className="font-medium">Đã đăng ký ({notifyMethod === 'both' ? 'Email & SMS' : notifyMethod})</span>
            </div>
            <button
              onClick={handleToggle}
              className="text-sm text-gray-500 hover:text-red-600"
            >
              Hủy
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleSubscribe('email')}
              className="flex flex-col items-center gap-1 p-3 bg-white rounded-xl border-2 border-transparent hover:border-purple-300 transition-all"
            >
              <Mail className="w-5 h-5 text-purple-600" />
              <span className="text-xs font-medium">Email</span>
            </button>
            <button
              onClick={() => handleSubscribe('sms')}
              className="flex flex-col items-center gap-1 p-3 bg-white rounded-xl border-2 border-transparent hover:border-purple-300 transition-all"
            >
              <Phone className="w-5 h-5 text-purple-600" />
              <span className="text-xs font-medium">SMS</span>
            </button>
            <button
              onClick={() => handleSubscribe('both')}
              className="flex flex-col items-center gap-1 p-3 bg-white rounded-xl border-2 border-transparent hover:border-purple-300 transition-all"
            >
              <Bell className="w-5 h-5 text-purple-600" />
              <span className="text-xs font-medium">Cả hai</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleToggle}
        className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
          isSubscribed 
            ? 'bg-green-100 text-green-700 hover:bg-green-200'
            : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
        }`}
      >
        {isSubscribed ? (
          <>
            <Check className="w-5 h-5" />
            Đã đăng ký thông báo ({notifyMethod === 'both' ? 'Email & SMS' : notifyMethod})
          </>
        ) : (
          <>
            <Bell className="w-5 h-5" />
            Nhận thông báo khi thu hoạch
          </>
        )}
      </motion.button>

      {/* Options Popup */}
      <AnimatePresence>
        {showOptions && !isSubscribed && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-40"
              onClick={() => setShowOptions(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-xl border p-4 z-50"
            >
              <p className="text-sm font-medium text-gray-700 mb-3">Chọn cách nhận thông báo:</p>
              <div className="space-y-2">
                <button
                  onClick={() => handleSubscribe('email')}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <Mail className="w-5 h-5 text-purple-600" />
                  <div className="text-left">
                    <p className="font-medium">Email</p>
                    <p className="text-xs text-gray-500">Nhận email trước 3 ngày thu hoạch</p>
                  </div>
                </button>
                <button
                  onClick={() => handleSubscribe('sms')}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <Phone className="w-5 h-5 text-purple-600" />
                  <div className="text-left">
                    <p className="font-medium">SMS</p>
                    <p className="text-xs text-gray-500">Nhận SMS trước 1 ngày thu hoạch</p>
                  </div>
                </button>
                <button
                  onClick={() => handleSubscribe('both')}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-purple-50 hover:bg-purple-100 transition-colors"
                >
                  <Bell className="w-5 h-5 text-purple-600" />
                  <div className="text-left">
                    <p className="font-medium text-purple-700">Cả Email & SMS</p>
                    <p className="text-xs text-purple-600">Đảm bảo không bỏ lỡ</p>
                  </div>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}