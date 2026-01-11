/**
 * Frame0Trust - "Niềm tin ngay từ giây đầu" (0-20% scroll)
 * 
 * First impression frame - Hero với trust badges
 */

import React from "react";
import { motion, useTransform } from "framer-motion";
import { Icon } from "@/components/ui/AnimatedIcon";
import CTAButton from "../CTAButton";

// Default trust badges
const DEFAULT_BADGES = [
  { icon: 'Leaf', text: '100% Organic', color: '#7CB342' },
  { icon: 'Award', text: 'Chứng nhận VietGAP', color: '#FF9800' },
  { icon: 'Users', text: '5000+ Khách hàng', color: '#4CAF50' }
];

export default function Frame0Trust({ 
  frame, 
  scrollYProgress, 
  currentFrame,
  isMobile,
  prefersReducedMotion 
}) {
  const isActive = currentFrame === 0;
  
  // Animation mappings - Frame 0 visible ngay từ đầu
  const opacity = useTransform(scrollYProgress, [0, 0.02, 0.15, 0.2], [1, 1, 1, 0]);
  const y = prefersReducedMotion ? 0 : useTransform(scrollYProgress, [0, 0.05], [0, 0]);
  const scale = prefersReducedMotion ? 1 : useTransform(scrollYProgress, [0, 0.15, 0.2], [1, 1, 0.95]);
  
  const trustBadges = frame?.content?.trust_badges || DEFAULT_BADGES;
  const title = frame?.title || "Trang trại Organic #1 Việt Nam";
  const subtitle = frame?.subtitle || "Từ trang trại đến bàn ăn – không dư lượng, chỉ có sức khỏe";
  
  // CTA from admin or default
  const ctaPrimary = frame?.cta_primary || { 
    text: 'Khám phá sản phẩm', 
    link: '/Services',
    color: '#7CB342',
    icon: 'ArrowRight'
  };
  
  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 md:px-8"
      style={{ opacity, y, scale }}
    >
      {/* Logo/Brand badge */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="inline-flex items-center gap-2 bg-[#7CB342]/20 backdrop-blur-md px-4 py-2 rounded-full border border-[#7CB342]/30">
          <Icon.Leaf size={20} className="text-[#7CB342]" />
          <span className="text-[#7CB342] font-semibold text-sm">ZERO FARM</span>
        </div>
      </motion.div>
      
      {/* Title */}
      <motion.h1
        className="font-bold text-white mb-4 md:mb-6 drop-shadow-2xl leading-tight"
        style={{
          fontSize: isMobile ? 'clamp(2rem, 9vw, 2.75rem)' : 'clamp(3.5rem, 7vw, 5.5rem)',
          lineHeight: 1.1
        }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        {title}
      </motion.h1>
      
      {/* Subtitle */}
      <motion.p
        className="text-white/90 mb-8 md:mb-10 max-w-3xl drop-shadow-lg"
        style={{
          fontSize: isMobile ? 'clamp(1rem, 4.5vw, 1.25rem)' : 'clamp(1.25rem, 2.2vw, 1.75rem)'
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        {subtitle}
      </motion.p>
      
      {/* Trust Badges */}
      <motion.div
        className="flex flex-wrap gap-3 md:gap-4 justify-center mb-8 md:mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
      >
        {trustBadges.map((badge, index) => {
          const IconComponent = Icon[badge.icon] || Icon.CheckCircle;
          
          return (
            <motion.div
              key={index}
              className="flex items-center gap-2 bg-white/15 backdrop-blur-md px-4 py-2.5 md:px-5 md:py-3 rounded-full border border-white/25 hover:bg-white/25 transition-colors"
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 1 + index * 0.15, duration: 0.5 }}
              whileHover={{ scale: 1.05 }}
            >
              <IconComponent size={isMobile ? 18 : 22} color={badge.color} />
              <span className="text-white font-medium text-sm md:text-base">
                {badge.text}
              </span>
            </motion.div>
          );
        })}
      </motion.div>
      
      {/* CTA Button - Dynamic from admin */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.2 }}
      >
        <CTAButton 
          cta={{
            ...ctaPrimary,
            style: ctaPrimary.style || 'solid',
            color: ctaPrimary.color || '#7CB342',
            text_color: ctaPrimary.text_color || '#FFFFFF',
            border_radius: ctaPrimary.border_radius || 'full',
            shadow: ctaPrimary.shadow || 'xl',
            size: ctaPrimary.size || 'lg',
            icon: ctaPrimary.icon || 'ArrowRight',
            icon_position: ctaPrimary.icon_position || 'right',
          }}
          isMobile={isMobile}
        />
      </motion.div>
    </motion.div>
  );
}