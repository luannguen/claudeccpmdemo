/**
 * ReferralTooltip - Tooltip minh bạch cho referral
 * ECARD-F20: Transparency tooltip - giải thích referral một cách tử tế
 * 
 * Features:
 * - Hover/tap để hiển thị
 * - Nội dung neutral, không promotional
 * - Accessible cho cả desktop và mobile
 * - Không block user flow
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Icon } from "@/components/ui/AnimatedIcon";

/**
 * ReferralTooltip - Tooltip giải thích referral minh bạch
 * @param {Object} props
 * @param {string} props.referrerName - Tên người giới thiệu
 * @param {string} props.themeColor - Màu chủ đạo
 * @param {React.ReactNode} props.children - Trigger element (badge)
 * @param {boolean} props.showIcon - Hiển thị icon info bên cạnh
 */
export default function ReferralTooltip({ 
  referrerName, 
  themeColor = '#7CB342',
  children,
  showIcon = false,
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(false);

  // Tooltip content - neutral, không promotional
  const tooltipContent = (
    <div className="max-w-[280px] text-center">
      <div className="flex items-center justify-center gap-1.5 mb-1.5">
        <Icon.Info size={14} className="text-gray-400" />
        <span className="font-medium text-gray-700 text-sm">Về đơn hàng này</span>
      </div>
      <p className="text-xs text-gray-600 leading-relaxed">
        Đơn hàng này giúp <strong className="font-semibold">{referrerName}</strong> nhận 
        hoa hồng giới thiệu từ chương trình referral. 
        <span className="block mt-1 text-gray-500">
          Giá sản phẩm không bị ảnh hưởng.
        </span>
      </p>
    </div>
  );

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip open={isOpen} onOpenChange={setIsOpen}>
        <TooltipTrigger asChild>
          <button 
            type="button"
            className={`inline-flex items-center gap-1 cursor-help ${className}`}
            onClick={(e) => {
              // Mobile: toggle on tap
              e.preventDefault();
              setIsOpen(!isOpen);
            }}
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
            aria-label={`Thông tin referral: Đơn hàng này giúp ${referrerName} nhận hoa hồng`}
          >
            {children}
            {showIcon && (
              <Icon.HelpCircle 
                size={12} 
                className="opacity-60 hover:opacity-100 transition-opacity"
                style={{ color: themeColor }}
              />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent 
          side="top" 
          align="center"
          className="bg-white border border-gray-200 shadow-lg rounded-xl p-3 z-50"
          sideOffset={8}
        >
          {tooltipContent}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * ReferralBadgeWithTooltip - Badge referral kèm tooltip
 * Component tiện lợi kết hợp badge + tooltip
 */
export function ReferralBadgeWithTooltip({ 
  referrerName, 
  themeColor = '#7CB342',
  variant = 'subtle', // 'subtle' | 'prominent'
  className = ''
}) {
  const badgeStyles = {
    subtle: {
      container: `text-xs py-1.5 px-3 rounded-lg`,
      background: `${themeColor}10`,
      text: themeColor
    },
    prominent: {
      container: `text-sm py-2 px-4 rounded-xl font-medium`,
      background: `${themeColor}15`,
      text: themeColor
    }
  };

  const style = badgeStyles[variant];

  return (
    <ReferralTooltip 
      referrerName={referrerName} 
      themeColor={themeColor}
      showIcon={true}
      className={className}
    >
      <span 
        className={`inline-flex items-center gap-1.5 ${style.container}`}
        style={{ backgroundColor: style.background, color: style.text }}
      >
        <Icon.Gift size={variant === 'subtle' ? 12 : 14} />
        <span>Mua qua giới thiệu của {referrerName}</span>
      </span>
    </ReferralTooltip>
  );
}

/**
 * ReferralInfoIcon - Icon nhỏ với tooltip cho các vị trí compact
 */
export function ReferralInfoIcon({ 
  referrerName, 
  themeColor = '#7CB342',
  size = 14,
  className = ''
}) {
  return (
    <ReferralTooltip 
      referrerName={referrerName} 
      themeColor={themeColor}
      className={className}
    >
      <span 
        className="inline-flex items-center justify-center w-5 h-5 rounded-full hover:bg-gray-100 transition-colors"
        style={{ color: themeColor }}
      >
        <Icon.Info size={size} />
      </span>
    </ReferralTooltip>
  );
}