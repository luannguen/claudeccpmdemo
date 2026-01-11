/**
 * CTAButton - Render CTA button với đầy đủ tùy chỉnh từ admin
 * Hỗ trợ: màu sắc, bo góc, đổ bóng, opacity, icon, hiệu ứng
 */

import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { createPageUrl } from "@/utils";
import {
  ArrowRight, ArrowLeft, ShoppingCart, Phone, Mail, Heart, Star, Zap,
  Gift, Leaf, Award, CheckCircle, Info, ExternalLink, Download, Play
} from "lucide-react";

// Icon mapping
const iconMap = {
  ArrowRight, ArrowLeft, ShoppingCart, Phone, Mail, Heart, Star, Zap,
  Gift, Leaf, Award, CheckCircle, Info, ExternalLink, Download, Play
};

// Animation variants
const animationVariants = {
  none: {},
  pulse: {
    scale: [1, 1.05, 1],
    transition: { duration: 1.5, repeat: Infinity }
  },
  bounce: {
    y: [0, -8, 0],
    transition: { duration: 0.6, repeat: Infinity }
  },
  shake: {
    x: [0, -3, 3, -3, 3, 0],
    transition: { duration: 0.5, repeat: Infinity, repeatDelay: 2 }
  },
  glow: {
    boxShadow: [
      "0 0 5px rgba(124, 179, 66, 0.5)",
      "0 0 20px rgba(124, 179, 66, 0.8)",
      "0 0 5px rgba(124, 179, 66, 0.5)"
    ],
    transition: { duration: 2, repeat: Infinity }
  }
};

export default function CTAButton({ cta, className = "", isMobile = false }) {
  if (!cta?.text) return null;

  const IconComponent = cta.icon ? iconMap[cta.icon] : null;

  // Build styles
  const getStyles = () => {
    const styles = {
      backgroundColor: cta.style === 'solid' ? (cta.color || '#7CB342') : 'transparent',
      color: cta.text_color || '#FFFFFF',
      border: cta.style === 'outline' ? `2px solid ${cta.color || '#FFFFFF'}` : 'none',
      opacity: (cta.opacity ?? 100) / 100,
    };

    // Border radius
    const radiusMap = {
      none: '0px',
      sm: '4px',
      md: '8px',
      lg: '12px',
      xl: '16px',
      full: '9999px',
    };
    styles.borderRadius = radiusMap[cta.border_radius || 'lg'];

    // Shadow
    const shadowMap = {
      none: 'none',
      sm: '0 1px 2px rgba(0,0,0,0.05)',
      md: '0 4px 6px rgba(0,0,0,0.1)',
      lg: '0 10px 15px rgba(0,0,0,0.1)',
      xl: '0 20px 25px rgba(0,0,0,0.15)',
    };
    styles.boxShadow = shadowMap[cta.shadow || 'md'];

    // Size
    const sizeMap = {
      sm: { padding: isMobile ? '10px 20px' : '8px 16px', fontSize: isMobile ? '14px' : '14px' },
      md: { padding: isMobile ? '12px 24px' : '10px 20px', fontSize: isMobile ? '15px' : '15px' },
      lg: { padding: isMobile ? '14px 28px' : '12px 24px', fontSize: isMobile ? '16px' : '16px' },
      xl: { padding: isMobile ? '16px 32px' : '16px 32px', fontSize: isMobile ? '17px' : '18px' },
    };
    const sizeStyles = sizeMap[cta.size || 'lg'];
    styles.padding = sizeStyles.padding;
    styles.fontSize = sizeStyles.fontSize;

    return styles;
  };

  // Determine link type
  const isExternalLink = cta.link?.startsWith('http') || cta.link?.startsWith('//');
  const isPageLink = cta.link?.startsWith('/');
  
  const href = isExternalLink 
    ? cta.link 
    : isPageLink 
      ? cta.link 
      : createPageUrl(cta.link);

  const buttonContent = (
    <>
      {cta.icon && cta.icon_position === 'left' && IconComponent && (
        <IconComponent size={isMobile ? 18 : 20} className="shrink-0" />
      )}
      <span>{cta.text}</span>
      {cta.icon && cta.icon_position !== 'left' && IconComponent && (
        <IconComponent size={isMobile ? 18 : 20} className="shrink-0" />
      )}
    </>
  );

  const animationProps = cta.animation && cta.animation !== 'none' 
    ? { animate: animationVariants[cta.animation]?.scale || animationVariants[cta.animation]?.y || animationVariants[cta.animation]?.x ? animationVariants[cta.animation] : undefined }
    : {};

  const buttonClasses = `inline-flex items-center justify-center gap-2 font-semibold transition-all duration-300 hover:scale-105 hover:brightness-110 ${className}`;

  if (isExternalLink) {
    return (
      <motion.a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonClasses}
        style={getStyles()}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
        {...animationProps}
      >
        {buttonContent}
      </motion.a>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      {...animationProps}
    >
      <Link
        to={href}
        className={buttonClasses}
        style={getStyles()}
      >
        {buttonContent}
      </Link>
    </motion.div>
  );
}