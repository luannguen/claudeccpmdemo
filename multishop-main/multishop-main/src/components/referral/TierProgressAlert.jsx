/**
 * TierProgressAlert - Banner thông báo sắp lên tier
 * UI Layer - Presentation only
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@/components/ui/AnimatedIcon.jsx';
import { Progress } from '@/components/ui/progress';

export default function TierProgressAlert({ member, settings }) {
  if (!member || !settings?.commission_tiers) return null;

  const tiers = settings.commission_tiers;
  const currentRevenue = member.current_month_revenue || 0;

  // Find current & next tier
  let currentTier = null;
  let nextTier = null;
  
  for (let i = 0; i < tiers.length; i++) {
    const tier = tiers[i];
    const maxRevenue = tier.max_revenue || Infinity;
    
    if (currentRevenue >= tier.min_revenue && currentRevenue < maxRevenue) {
      currentTier = tier;
      nextTier = tiers[i + 1] || null;
      break;
    }
  }

  if (!currentTier || !nextTier) return null;

  const remaining = nextTier.min_revenue - currentRevenue;
  const progress = ((currentRevenue - currentTier.min_revenue) / (nextTier.min_revenue - currentTier.min_revenue)) * 100;

  // Chỉ show nếu >= 60%
  if (progress < 60) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl p-4 mb-6"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
          <Icon.Target size={20} className="text-white" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-amber-900">
              🎯 Bạn sắp lên Tier {nextTier.rate}%!
            </h3>
            <Badge className="bg-amber-500 text-white">
              {Math.round(progress)}%
            </Badge>
          </div>
          
          <p className="text-sm text-amber-700 mb-3">
            Chỉ cần thêm <strong className="text-amber-900">{remaining.toLocaleString('vi-VN')}đ</strong> nữa 
            để nhận hoa hồng <strong>{nextTier.rate}%</strong> (hiện tại {currentTier.rate}%)
          </p>
          
          <Progress value={progress} className="h-2 bg-amber-200" />
          
          <div className="flex items-center justify-between mt-2 text-xs text-amber-600">
            <span>{currentTier.rate}%</span>
            <span>{nextTier.rate}%</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}