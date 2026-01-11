/**
 * VerificationBadges - Display verification badges
 * UI Layer - Presentation only
 * 
 * @module features/ecard/ui
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@/components/ui/AnimatedIcon';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const BADGE_CONFIG = {
  email_verified: {
    icon: 'Mail',
    label: 'Email đã xác thực',
    color: 'bg-blue-100 text-blue-700 border-blue-200'
  },
  phone_verified: {
    icon: 'Phone',
    label: 'SĐT đã xác thực',
    color: 'bg-green-100 text-green-700 border-green-200'
  },
  company_verified: {
    icon: 'Building',
    label: 'Công ty đã xác thực',
    color: 'bg-purple-100 text-purple-700 border-purple-200'
  },
  identity_verified: {
    icon: 'Fingerprint',
    label: 'Danh tính đã xác thực',
    color: 'bg-amber-100 text-amber-700 border-amber-200'
  },
  admin_verified: {
    icon: 'ShieldCheck',
    label: 'Xác thực bởi Admin',
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200'
  }
};

export default function VerificationBadges({ 
  badges = [], 
  status = 'unverified',
  size = 'md',
  showLabels = false,
  compact = false,
  showRequestButton = false,
  profileId
}) {
  // Compact mode - just show verified checkmark
  if (compact && status === 'verified') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#7CB342] text-white">
              <Icon.Check size={14} />
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Tài khoản đã xác thực</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (!badges || badges.length === 0) {
    if (status === 'pending') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-yellow-100 text-yellow-700 border border-yellow-200">
          <Icon.Clock size={12} />
          Đang chờ xác thực
        </span>
      );
    }
    
    // Show request button if no badges and feature enabled
    if (showRequestButton && status === 'unverified') {
      return (
        <button 
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          onClick={() => window.dispatchEvent(new CustomEvent('open-verification-request', { detail: { profileId } }))}
        >
          <Icon.ShieldCheck size={12} />
          Yêu cầu xác thực
        </button>
      );
    }
    
    return null;
  }

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  const iconSizes = { sm: 12, md: 14, lg: 16 };

  return (
    <TooltipProvider>
      <div className="flex flex-wrap gap-1.5">
        {badges.map((badge, idx) => {
          const config = BADGE_CONFIG[badge];
          if (!config) return null;

          const IconComponent = Icon[config.icon];

          return (
            <Tooltip key={badge}>
              <TooltipTrigger asChild>
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`inline-flex items-center gap-1 rounded-full border ${config.color} ${sizeClasses[size]}`}
                >
                  {IconComponent && <IconComponent size={iconSizes[size]} />}
                  {showLabels && <span>{config.label}</span>}
                </motion.span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{config.label}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
        
        {/* Overall verified badge */}
        {status === 'verified' && (
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: badges.length * 0.1 }}
                className={`inline-flex items-center gap-1 rounded-full bg-[#7CB342]/10 text-[#558B2F] border border-[#7CB342]/30 ${sizeClasses[size]}`}
              >
                <Icon.CheckCircle size={iconSizes[size]} />
                {showLabels && <span>Đã xác thực</span>}
              </motion.span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Tài khoản đã được xác thực</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}

/**
 * Simple verified checkmark
 */
export function VerifiedBadge({ verified = false, size = 16 }) {
  if (!verified) return null;
  
  return (
    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#7CB342] text-white">
      <Icon.Check size={size - 4} />
    </span>
  );
}