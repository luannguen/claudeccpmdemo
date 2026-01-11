/**
 * Loyalty Tier Badge
 * UI Component - Display tier với icon và benefits tooltip
 */

import React from 'react';
import { Icon } from '@/components/ui/AnimatedIcon.jsx';
import { Badge } from '@/components/ui/badge';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { TIER_CONFIG } from '@/components/services/loyaltyCore';

export default function LoyaltyTierBadge({ tier, showBenefits = true, className = '' }) {
  const config = TIER_CONFIG[tier] || TIER_CONFIG.bronze;
  
  const badge = (
    <Badge className={`${config.color} ${className}`}>
      <Icon.Award size={14} className="mr-1" />
      {config.label}
    </Badge>
  );
  
  if (!showBenefits) return badge;
  
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        {badge}
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="space-y-3">
          <h4 className="font-bold flex items-center gap-2">
            <Icon.Star className="text-amber-500" />
            Quyền lợi hạng {config.label}
          </h4>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Tích điểm:</span>
              <span className="font-medium">x{config.pointMultiplier}</span>
            </div>
            
            {config.discountRate > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Giảm giá đặc biệt:</span>
                <span className="font-medium text-green-600">{config.discountRate}%</span>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Miễn phí ship từ:</span>
              <span className="font-medium">
                {config.freeShipThreshold === 0 
                  ? 'Luôn luôn' 
                  : `${(config.freeShipThreshold / 1000).toFixed(0)}K`}
              </span>
            </div>
          </div>
          
          <div className="pt-2 border-t text-xs text-gray-500">
            {tier === 'platinum' 
              ? 'Hạng cao nhất 👑'
              : `Cần ${config.maxPoints + 1} điểm để lên hạng tiếp theo`}
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}