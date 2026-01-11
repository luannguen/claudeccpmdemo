/**
 * Frame2Social - "Bằng chứng xã hội" (40-60% scroll)
 * 
 * Counters + certifications
 */

import React, { useState, useEffect } from "react";
import { motion, useTransform } from "framer-motion";
import { Icon } from "@/components/ui/AnimatedIcon";

// Default stats
const DEFAULT_STATS = [
  { value: 5000, suffix: '+', label: 'Khách hàng', icon: 'Users' },
  { value: 3, suffix: '', label: 'Trang trại', icon: 'MapPin' },
  { value: 100, suffix: '%', label: 'Organic', icon: 'Leaf' },
  { value: 5, suffix: '+', label: 'Năm kinh nghiệm', icon: 'Award' }
];

const DEFAULT_CERTS = [
  { name: 'VietGAP' },
  { name: 'OCOP 4 sao' },
  { name: 'An toàn thực phẩm' }
];

// Animated counter component
function AnimatedCounter({ value, suffix = "", label, icon, isActive, index, isMobile }) {
  const [count, setCount] = useState(0);
  const IconComponent = Icon[icon] || Icon.Star;
  
  useEffect(() => {
    if (isActive && !isMobile) {
      // Animate counting
      const duration = 1500;
      const steps = 30;
      const increment = value / steps;
      let current = 0;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          setCount(value);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);
      
      return () => clearInterval(timer);
    } else if (isActive) {
      setCount(value);
    }
  }, [isActive, value, isMobile]);
  
  return (
    <motion.div 
      className="flex flex-col items-center text-center p-4 md:p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10"
      initial={{ opacity: 0, y: 20 }}
      animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
      whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
    >
      <div className="mb-3 p-3 rounded-full bg-[#7CB342]/20">
        <IconComponent size={isMobile ? 28 : 36} className="text-[#7CB342]" />
      </div>
      <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-1">
        <span>{isActive ? count : 0}</span>
        <span className="text-[#7CB342]">{suffix}</span>
      </div>
      <p className="text-xs md:text-sm text-white/70 font-medium">{label}</p>
    </motion.div>
  );
}

export default function Frame2Social({ 
  frame, 
  scrollYProgress,
  currentFrame,
  isMobile,
  prefersReducedMotion 
}) {
  const isActive = currentFrame === 2;
  const opacity = useTransform(scrollYProgress, [0.38, 0.42, 0.56, 0.6], [0, 1, 1, 0]);
  const scale = prefersReducedMotion ? 1 : useTransform(scrollYProgress, [0.38, 0.45], [0.95, 1]);
  
  const stats = frame?.content?.stats || DEFAULT_STATS;
  const certifications = frame?.content?.certifications || DEFAULT_CERTS;
  const title = frame?.title || "Con số nói lên tất cả";
  const subtitle = frame?.subtitle || "Được tin tưởng bởi hàng ngàn gia đình Việt";
  
  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center px-4 md:px-8"
      style={{ opacity, scale }}
    >
      {/* Section badge */}
      <motion.div 
        className="mb-4"
        initial={{ opacity: 0, y: -10 }}
        animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0 }}
        transition={{ delay: 0.1 }}
      >
        <span className="text-[#7CB342] text-sm font-semibold tracking-wider uppercase">
          Thành tựu
        </span>
      </motion.div>
      
      {/* Title */}
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 md:mb-4 text-center drop-shadow-2xl">
        {title}
      </h2>
      
      {/* Subtitle */}
      <p className="text-base md:text-lg lg:text-xl text-white/90 mb-8 md:mb-10 text-center max-w-2xl drop-shadow-lg">
        {subtitle}
      </p>
      
      {/* Stats Grid */}
      <div className={`grid gap-4 md:gap-6 mb-8 md:mb-10 w-full max-w-4xl ${
        isMobile ? 'grid-cols-2' : 'grid-cols-4'
      }`}>
        {stats.map((stat, index) => (
          <AnimatedCounter
            key={index}
            value={stat.value}
            suffix={stat.suffix}
            label={stat.label}
            icon={stat.icon}
            isActive={isActive}
            index={index}
            isMobile={isMobile}
          />
        ))}
      </div>
      
      {/* Certifications */}
      {certifications.length > 0 && (
        <motion.div 
          className="flex flex-wrap gap-3 justify-center"
          initial={{ opacity: 0 }}
          animate={isActive ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 0.6 }}
        >
          <span className="text-white/60 text-sm mr-2 self-center">Chứng nhận:</span>
          {certifications.map((cert, index) => (
            <motion.div
              key={index}
              className="bg-white/15 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 hover:bg-white/25 transition-colors"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isActive ? { opacity: 1, scale: 1 } : { opacity: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
            >
              <p className="text-white font-medium text-sm">{cert.name}</p>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}