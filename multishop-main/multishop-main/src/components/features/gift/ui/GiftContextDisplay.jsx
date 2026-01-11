/**
 * GiftContextDisplay - ECARD-F19
 * Hiển thị ngữ cảnh quan hệ cho người nhận quà
 * Mục tiêu: Quà có ý nghĩa hơn, thể hiện được tâm ý
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@/components/ui/AnimatedIcon';
import { 
  getReceiverDisplayInfo, 
  getContextColorClasses,
  GIFT_CONTEXT_CONFIG 
} from '../domain/giftContextPolicies';

/**
 * Inline context display - minimal
 */
export function GiftContextInline({ gift }) {
  if (!gift) return null;
  
  const { emoji, contextLabel } = getReceiverDisplayInfo(gift);
  const colorClasses = getContextColorClasses(gift.gift_context || 'other');

  return (
    <span className={`
      inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs
      ${colorClasses}
    `}>
      <span>{emoji}</span>
      <span>{contextLabel}</span>
    </span>
  );
}

/**
 * Context banner - prominent display for receiver
 */
export function GiftContextBanner({ gift, className = '' }) {
  if (!gift) return null;
  
  const { emoji, contextLabel, contextMessage, color } = getReceiverDisplayInfo(gift);
  
  const bgGradients = {
    emerald: 'from-emerald-50 to-emerald-100/50',
    amber: 'from-amber-50 to-amber-100/50',
    pink: 'from-pink-50 to-pink-100/50',
    green: 'from-green-50 to-green-100/50',
    violet: 'from-violet-50 to-violet-100/50',
    rose: 'from-rose-50 to-rose-100/50',
    gray: 'from-gray-50 to-gray-100/50'
  };

  const borderColors = {
    emerald: 'border-emerald-200',
    amber: 'border-amber-200',
    pink: 'border-pink-200',
    green: 'border-green-200',
    violet: 'border-violet-200',
    rose: 'border-rose-200',
    gray: 'border-gray-200'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        bg-gradient-to-r ${bgGradients[color]} 
        border ${borderColors[color]}
        rounded-xl p-4 ${className}
      `}
    >
      <div className="flex items-center gap-3">
        <motion.span 
          className="text-3xl"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 0.5, repeat: 2 }}
        >
          {emoji}
        </motion.span>
        <div>
          <p className="font-semibold text-gray-900">{contextLabel}</p>
          <p className="text-sm text-gray-600">{contextMessage}</p>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Context card - detailed view with sender info
 */
export function GiftContextCard({ gift, className = '' }) {
  if (!gift) return null;
  
  const { emoji, contextLabel, contextMessage, color } = getReceiverDisplayInfo(gift);
  const colorClasses = getContextColorClasses(gift.gift_context || 'other');

  return (
    <div className={`rounded-xl border overflow-hidden ${className}`}>
      {/* Header */}
      <div className={`px-4 py-3 ${colorClasses.replace('text-', 'text-').replace('bg-', 'bg-')}`}>
        <div className="flex items-center gap-2">
          <span className="text-xl">{emoji}</span>
          <span className="font-semibold">{contextLabel}</span>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4 bg-white">
        <p className="text-gray-700 mb-3">{contextMessage}</p>
        
        {/* Sender */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Icon.User size={14} />
          <span>Từ: <span className="font-medium text-gray-700">{gift.sender_name}</span></span>
        </div>
        
        {/* Message */}
        {gift.message && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 italic">"{gift.message}"</p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Compact context tag for lists
 */
export function GiftContextTag({ contextKey, size = 'sm' }) {
  const config = GIFT_CONTEXT_CONFIG[contextKey] || GIFT_CONTEXT_CONFIG.other;
  const colorClasses = getContextColorClasses(contextKey);
  
  const sizes = {
    xs: 'text-xs px-1.5 py-0.5',
    sm: 'text-sm px-2 py-1',
    md: 'text-base px-3 py-1.5'
  };

  return (
    <span className={`
      inline-flex items-center gap-1 rounded-full
      ${colorClasses} ${sizes[size]}
    `}>
      <span>{config.emoji}</span>
      {size !== 'xs' && <span>{config.label}</span>}
    </span>
  );
}

export default GiftContextBanner;