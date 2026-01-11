/**
 * SocialProofBadges - ECARD-F17: Micro Social Proof
 * UI components hiển thị trust badges nhẹ nhàng, subtle
 */

import React from "react";
import { motion } from "framer-motion";

/**
 * Single badge component
 */
function SocialProofBadge({ badge, themeColor, variant = 'default' }) {
  const baseStyles = "inline-flex items-center gap-1.5 text-xs rounded-full transition-all";
  
  const variantStyles = {
    default: "px-3 py-1.5 bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-700 shadow-sm",
    subtle: "px-2.5 py-1 bg-gray-50 text-gray-600",
    highlight: "px-3 py-1.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 text-amber-800"
  };

  const styles = `${baseStyles} ${variantStyles[variant] || variantStyles.default}`;

  return (
    <motion.span
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={styles}
    >
      <span className="text-sm">{badge.icon}</span>
      <span>{badge.text}</span>
    </motion.span>
  );
}

/**
 * Badge container - hiển thị nhiều badges
 */
export function SocialProofBadges({ 
  badges = [], 
  themeColor = '#7CB342',
  variant = 'default',
  maxBadges = 2,
  layout = 'horizontal' // horizontal | vertical | wrap
}) {
  if (!badges || badges.length === 0) return null;

  // Giới hạn số badges hiển thị
  const visibleBadges = badges.slice(0, maxBadges);

  const layoutStyles = {
    horizontal: "flex items-center gap-2",
    vertical: "flex flex-col gap-2",
    wrap: "flex flex-wrap items-center gap-2 justify-center"
  };

  return (
    <motion.div 
      className={layoutStyles[layout] || layoutStyles.horizontal}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      {visibleBadges.map((badge, index) => (
        <motion.div
          key={badge.type}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <SocialProofBadge 
            badge={badge} 
            themeColor={themeColor}
            variant={badge.type === 'referral' ? 'highlight' : variant}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}

/**
 * Compact single-line badge (cho không gian hẹp)
 */
export function SocialProofCompact({ badges = [], themeColor }) {
  if (!badges || badges.length === 0) return null;

  // Lấy badge quan trọng nhất
  const primaryBadge = badges[0];
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-xs text-gray-500 flex items-center gap-1"
    >
      <span>{primaryBadge.icon}</span>
      <span>{primaryBadge.text}</span>
    </motion.div>
  );
}

/**
 * Trust banner - hiển thị dạng banner nhỏ
 */
export function SocialProofBanner({ badges = [], themeColor = '#7CB342' }) {
  if (!badges || badges.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-3"
    >
      <div className="flex items-center gap-2 text-sm text-green-800">
        <span className="text-lg">🌟</span>
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
          {badges.slice(0, 2).map((badge, index) => (
            <span key={badge.type} className="flex items-center gap-1">
              <span>{badge.icon}</span>
              <span>{badge.text}</span>
              {index < Math.min(badges.length, 2) - 1 && (
                <span className="hidden sm:inline text-green-400 mx-1">•</span>
              )}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default SocialProofBadges;