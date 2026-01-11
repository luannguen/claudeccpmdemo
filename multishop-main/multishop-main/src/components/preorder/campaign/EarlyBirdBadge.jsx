/**
 * EarlyBirdBadge - Badge hiển thị early bird tier
 * UI Layer
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function EarlyBirdBadge({ campaign, variant = 'default' }) {
  if (!campaign?.early_bird_config) return null;

  const config = campaign.early_bird_config;
  const currentTier = config.current_tier || 1;
  const ordersInTier = config.orders_in_current_tier || 0;

  // Get current tier config
  let tierQuantity = 0;
  let tierDiscount = 0;
  let nextTierDiscount = 0;

  if (currentTier === 1) {
    tierQuantity = config.tier_1_quantity;
    tierDiscount = config.tier_1_discount;
    nextTierDiscount = config.tier_2_discount;
  } else if (currentTier === 2) {
    tierQuantity = config.tier_2_quantity;
    tierDiscount = config.tier_2_discount;
    nextTierDiscount = config.tier_3_discount;
  } else if (currentTier === 3) {
    tierQuantity = config.tier_3_quantity;
    tierDiscount = config.tier_3_discount;
  }

  const remaining = Math.max(0, tierQuantity - ordersInTier);
  const hasNextTier = currentTier < 3;

  // Compact variant
  if (variant === 'compact') {
    return (
      <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
        <Zap className="w-3 h-3 mr-1" />
        Early Bird -{tierDiscount}%
      </Badge>
    );
  }

  // Default variant
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-100 via-orange-100 to-red-100 border-2 border-yellow-400 p-4"
    >
      {/* Glow effect */}
      <div className="absolute top-0 left-0 w-full h-full opacity-30">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 2,
            repeat: Infinity
          }}
          className="w-full h-full bg-yellow-400 blur-2xl"
        />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-yellow-500 rounded-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-yellow-900">Early Bird Tier {currentTier}</h3>
              <p className="text-xs text-yellow-800">Đặt sớm - Giảm nhiều</p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-3xl font-black text-yellow-700">
              -{tierDiscount}%
            </p>
          </div>
        </div>

        {/* Remaining slots */}
        {remaining > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-orange-600" />
            <span className="font-semibold text-orange-900">
              Chỉ còn {remaining} suất ở tier này!
            </span>
          </div>
        )}

        {/* Next tier preview */}
        {hasNextTier && nextTierDiscount > 0 && (
          <div className="mt-3 p-2 bg-white/60 rounded-lg">
            <p className="text-xs text-gray-700">
              <span className="font-medium">Tier {currentTier + 1}:</span> Giảm {nextTierDiscount}%
              {remaining > 0 && ` (sau ${remaining} đơn nữa)`}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}