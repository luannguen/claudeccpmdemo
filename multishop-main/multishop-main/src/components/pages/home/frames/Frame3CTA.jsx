/**
 * Frame3CTA - "Sản phẩm & Hành động" (60-80% scroll)
 * 
 * CTA conversion-focused
 */

import React from "react";
import { motion, useTransform } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/AnimatedIcon";
import CTAButton from "../CTAButton";

export default function Frame3CTA({ 
  frame, 
  scrollYProgress,
  currentFrame,
  isMobile,
  prefersReducedMotion 
}) {
  const isActive = currentFrame === 3;
  const opacity = useTransform(scrollYProgress, [0.58, 0.62, 0.76, 0.8], [0, 1, 1, 0]);
  const scale = prefersReducedMotion ? 1 : useTransform(scrollYProgress, [0.58, 0.65], [0.95, 1]);
  
  const ctaPrimary = frame?.cta_primary || { text: 'Đặt hàng ngay', link: '/Services', color: '#7CB342' };
  const ctaSecondary = frame?.cta_secondary || { text: 'Xem sản phẩm', link: '/Services' };
  const promoBadge = frame?.content?.promo_badge || 'Giảm 10% đơn đầu tiên';
  const title = frame?.title || "Sẵn sàng cho bữa ăn lành mạnh?";
  const subtitle = frame?.subtitle || "Giao hàng tận nơi, tươi mới mỗi ngày";
  
  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center px-4 md:px-8"
      style={{ opacity, scale }}
    >
      {/* Promo Badge với animation */}
      {promoBadge && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={isActive ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <Badge className="bg-gradient-to-r from-[#FF9800] to-[#F57C00] text-white mb-6 text-sm md:text-base px-5 py-2.5 rounded-full shadow-lg">
            <Icon.Sparkles size={16} className="mr-2 inline" />
            {promoBadge}
          </Badge>
        </motion.div>
      )}
      
      {/* Title */}
      <motion.h2 
        className="text-3xl md:text-4xl lg:text-6xl font-bold text-white mb-4 md:mb-5 text-center drop-shadow-2xl leading-tight"
        initial={{ opacity: 0, y: 20 }}
        animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0 }}
        transition={{ delay: 0.3 }}
      >
        {title}
      </motion.h2>
      
      {/* Subtitle */}
      <motion.p 
        className="text-base md:text-lg lg:text-xl text-white/90 mb-8 md:mb-10 text-center max-w-2xl drop-shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0 }}
        transition={{ delay: 0.4 }}
      >
        {subtitle}
      </motion.p>
      
      {/* CTA Buttons - Using dynamic CTAButton component */}
      <motion.div
        className={`flex gap-4 ${isMobile ? 'flex-col w-full max-w-sm items-center' : 'flex-row'}`}
        initial={{ opacity: 0, y: 20 }}
        animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0 }}
        transition={{ delay: 0.5 }}
      >
        {/* Primary CTA with full customization */}
        <CTAButton 
          cta={{
            ...ctaPrimary,
            // Default values if not set in admin
            style: ctaPrimary.style || 'solid',
            color: ctaPrimary.color || '#7CB342',
            text_color: ctaPrimary.text_color || '#FFFFFF',
            border_radius: ctaPrimary.border_radius || 'full',
            shadow: ctaPrimary.shadow || 'lg',
            size: ctaPrimary.size || 'lg',
            icon: ctaPrimary.icon || 'ArrowRight',
            icon_position: ctaPrimary.icon_position || 'right',
          }}
          isMobile={isMobile}
          className={isMobile ? 'w-full justify-center' : ''}
        />
        
        {/* Secondary CTA with full customization */}
        {ctaSecondary?.text && (
          <CTAButton 
            cta={{
              ...ctaSecondary,
              // Default values for secondary button
              style: ctaSecondary.style || 'outline',
              color: ctaSecondary.color || '#FFFFFF',
              text_color: ctaSecondary.text_color || '#FFFFFF',
              border_radius: ctaSecondary.border_radius || 'full',
              shadow: ctaSecondary.shadow || 'none',
              size: ctaSecondary.size || 'lg',
            }}
            isMobile={isMobile}
            className={isMobile ? 'w-full justify-center' : ''}
          />
        )}
      </motion.div>
      
      {/* Trust indicators */}
      <motion.div 
        className="mt-8 flex items-center gap-6 text-white/60 text-sm"
        initial={{ opacity: 0 }}
        animate={isActive ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: 0.7 }}
      >
        <div className="flex items-center gap-2">
          <Icon.Package size={16} />
          <span>Giao hàng nhanh</span>
        </div>
        <div className="flex items-center gap-2">
          <Icon.ShieldCheck size={16} />
          <span>Đổi trả miễn phí</span>
        </div>
        {!isMobile && (
          <div className="flex items-center gap-2">
            <Icon.Phone size={16} />
            <span>Hỗ trợ 24/7</span>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}