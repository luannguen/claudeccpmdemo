/**
 * CountdownTimer - Đếm ngược đến ngày thu hoạch
 * UI Layer - Presentation only
 */

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, Zap } from "lucide-react";

export default function CountdownTimer({ 
  targetDate, 
  variant = "default", // "default" | "compact" | "badge"
  showUrgency = true 
}) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const difference = new Date(targetDate) - new Date();
    
    if (difference <= 0) {
      return { expired: true };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      expired: false
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (timeLeft.expired) {
    return (
      <div className="bg-green-100 text-green-800 px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5">
        <Zap className="w-4 h-4" />
        Đã thu hoạch - Sẵn sàng giao!
      </div>
    );
  }

  const isUrgent = timeLeft.days <= 3;
  const isVeryUrgent = timeLeft.days <= 1;

  // Badge variant - nhỏ gọn
  if (variant === "badge") {
    return (
      <motion.div
        animate={isVeryUrgent ? { scale: [1, 1.05, 1] } : {}}
        transition={{ repeat: Infinity, duration: 1 }}
        className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
          isVeryUrgent 
            ? 'bg-red-500 text-white animate-pulse' 
            : isUrgent 
              ? 'bg-orange-500 text-white'
              : 'bg-gray-100 text-gray-700'
        }`}
      >
        <Clock className="w-3 h-3" />
        {timeLeft.days}d {timeLeft.hours}h
      </motion.div>
    );
  }

  // Compact variant - vừa
  if (variant === "compact") {
    return (
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm ${
        isVeryUrgent 
          ? 'bg-red-100 text-red-700' 
          : isUrgent 
            ? 'bg-orange-100 text-orange-700'
            : 'bg-gray-100 text-gray-700'
      }`}>
        <Clock className="w-4 h-4" />
        <span className="font-medium">
          {timeLeft.days > 0 && `${timeLeft.days}d `}
          {timeLeft.hours}h {timeLeft.minutes}m
        </span>
        {showUrgency && isUrgent && (
          <span className="text-xs font-bold ml-1">
            {isVeryUrgent ? '⚡ KHẨN CẤP' : '🔥 SẮP ĐẾN'}
          </span>
        )}
      </div>
    );
  }

  // Default variant - đầy đủ
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl p-4 ${
        isVeryUrgent 
          ? 'bg-gradient-to-r from-red-500 to-red-600 text-white' 
          : isUrgent 
            ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
            : 'bg-gradient-to-r from-[#7CB342] to-[#5a8f31] text-white'
      }`}
    >
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-5 h-5" />
        <span className="font-medium">
          {isVeryUrgent ? '⚡ Chỉ còn ít thời gian!' : isUrgent ? '🔥 Sắp thu hoạch!' : '⏰ Đếm ngược thu hoạch'}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2 text-center">
        <TimeUnit value={timeLeft.days} label="Ngày" isUrgent={isUrgent} />
        <TimeUnit value={timeLeft.hours} label="Giờ" isUrgent={isUrgent} />
        <TimeUnit value={timeLeft.minutes} label="Phút" isUrgent={isUrgent} />
        <TimeUnit value={timeLeft.seconds} label="Giây" isUrgent={isUrgent} animate />
      </div>

      {showUrgency && isUrgent && (
        <motion.p 
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-center mt-3 text-sm font-medium"
        >
          {isVeryUrgent 
            ? '🚨 Đặt ngay để được giá tốt nhất!' 
            : '💡 Giá sẽ tăng khi gần ngày thu hoạch'}
        </motion.p>
      )}
    </motion.div>
  );
}

function TimeUnit({ value, label, isUrgent, animate }) {
  return (
    <motion.div 
      animate={animate ? { scale: [1, 1.05, 1] } : {}}
      transition={{ repeat: Infinity, duration: 1 }}
      className="bg-white/20 backdrop-blur-sm rounded-xl py-2 px-1"
    >
      <p className="text-2xl font-bold">{String(value).padStart(2, '0')}</p>
      <p className="text-xs opacity-80">{label}</p>
    </motion.div>
  );
}