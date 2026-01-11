/**
 * GiftContextSelector - ECARD-F19
 * UI component để chọn ngữ cảnh quan hệ khi tặng quà
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@/components/ui/AnimatedIcon';
import { 
  GIFT_CONTEXT, 
  GIFT_CONTEXT_CONFIG, 
  getSortedContexts,
  getContextColorClasses 
} from '../domain/giftContextPolicies';

/**
 * Compact context selector - chip style
 */
export function GiftContextChips({ value, onChange, className = '' }) {
  const contexts = getSortedContexts();

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {contexts.map(context => {
        const isSelected = value === context.key;
        const colorClasses = getContextColorClasses(context.key);
        
        return (
          <button
            key={context.key}
            type="button"
            onClick={() => onChange(context.key)}
            className={`
              px-3 py-2 rounded-full border-2 transition-all duration-200
              flex items-center gap-2 text-sm font-medium
              ${isSelected 
                ? `${colorClasses} border-current shadow-sm` 
                : 'border-gray-200 hover:border-gray-300 text-gray-600 bg-white'
              }
            `}
          >
            <span>{context.emoji}</span>
            <span>{context.label}</span>
            {isSelected && <Icon.Check size={14} />}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Card-style context selector - more visual
 */
export function GiftContextCards({ value, onChange, className = '' }) {
  const contexts = getSortedContexts();

  return (
    <div className={`grid grid-cols-2 gap-3 ${className}`}>
      {contexts.map(context => {
        const isSelected = value === context.key;
        const colorClasses = getContextColorClasses(context.key);
        
        return (
          <motion.button
            key={context.key}
            type="button"
            onClick={() => onChange(context.key)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`
              p-4 rounded-xl border-2 text-left transition-all duration-200
              ${isSelected 
                ? `${colorClasses} border-current shadow-md` 
                : 'border-gray-200 hover:border-gray-300 bg-white'
              }
            `}
          >
            <div className="flex items-start justify-between mb-2">
              <span className="text-2xl">{context.emoji}</span>
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-5 h-5 rounded-full bg-current/20 flex items-center justify-center"
                >
                  <Icon.Check size={12} />
                </motion.div>
              )}
            </div>
            <p className={`font-medium mb-1 ${isSelected ? '' : 'text-gray-900'}`}>
              {context.label}
            </p>
            <p className={`text-xs ${isSelected ? 'opacity-80' : 'text-gray-500'}`}>
              {context.description}
            </p>
          </motion.button>
        );
      })}
    </div>
  );
}

/**
 * Context display badge - show selected context
 */
export function GiftContextBadge({ contextKey, size = 'md', showLabel = true }) {
  const config = GIFT_CONTEXT_CONFIG[contextKey] || GIFT_CONTEXT_CONFIG[GIFT_CONTEXT.OTHER];
  const colorClasses = getContextColorClasses(contextKey);
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <span className={`
      inline-flex items-center gap-1.5 rounded-full border
      ${colorClasses} ${sizeClasses[size]}
    `}>
      <span>{config.emoji}</span>
      {showLabel && <span className="font-medium">{config.label}</span>}
    </span>
  );
}

/**
 * Context message preview - show what receiver will see
 */
export function GiftContextPreview({ contextKey, senderName, className = '' }) {
  const config = GIFT_CONTEXT_CONFIG[contextKey] || GIFT_CONTEXT_CONFIG[GIFT_CONTEXT.OTHER];
  const colorClasses = getContextColorClasses(contextKey);

  return (
    <div className={`p-4 rounded-xl border ${colorClasses} ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{config.emoji}</span>
        <span className="font-semibold">{config.receiverLabel}</span>
      </div>
      <p className="text-sm opacity-90">
        <span className="font-medium">{senderName}</span> {config.receiverMessage}
      </p>
    </div>
  );
}

/**
 * Full context selector with preview
 */
export default function GiftContextSelector({ 
  value, 
  onChange, 
  senderName = 'Bạn',
  variant = 'chips', // chips | cards
  showPreview = true,
  className = '' 
}) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Ngữ cảnh tặng quà
      </label>
      
      {variant === 'chips' ? (
        <GiftContextChips value={value} onChange={onChange} />
      ) : (
        <GiftContextCards value={value} onChange={onChange} />
      )}

      {/* Preview what receiver will see */}
      <AnimatePresence mode="wait">
        {showPreview && value && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4"
          >
            <p className="text-xs text-gray-500 mb-2">Người nhận sẽ thấy:</p>
            <GiftContextPreview 
              contextKey={value} 
              senderName={senderName} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}