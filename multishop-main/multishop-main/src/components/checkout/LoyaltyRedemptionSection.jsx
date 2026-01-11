/**
 * Loyalty Redemption Section
 * UI Component - Dùng điểm loyalty khi checkout
 */

import React, { useState, useMemo } from 'react';
import { Icon } from '@/components/ui/AnimatedIcon.jsx';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { useMyLoyaltyAccount } from '@/components/hooks/useLoyalty';
import { POINTS_CONFIG } from '@/components/services/loyaltyCore';

export default function LoyaltyRedemptionSection({ orderAmount, onApplyPoints, disabled }) {
  const [pointsToUse, setPointsToUse] = useState(0);
  const { data: account } = useMyLoyaltyAccount();
  
  const maxUsablePoints = useMemo(() => {
    if (!account || !orderAmount) return 0;
    
    const maxByAmount = Math.floor(orderAmount * (POINTS_CONFIG.maxRedeemPercent / 100) / POINTS_CONFIG.redeemRate);
    const maxByBalance = account.total_points;
    
    return Math.min(maxByAmount, maxByBalance);
  }, [account, orderAmount]);
  
  const discountAmount = useMemo(() => {
    return pointsToUse * POINTS_CONFIG.redeemRate;
  }, [pointsToUse]);
  
  const handleApply = () => {
    if (pointsToUse >= POINTS_CONFIG.minRedeemPoints) {
      onApplyPoints(pointsToUse, discountAmount);
    }
  };
  
  if (!account || account.total_points < POINTS_CONFIG.minRedeemPoints) {
    return null;
  }
  
  return (
    <Card className="border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50">
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon.Star size={20} className="text-violet-600" />
            <p className="font-medium">Dùng Điểm Loyalty</p>
          </div>
          <Badge className="bg-violet-100 text-violet-700">
            {account.total_points} điểm
          </Badge>
        </div>
        
        {/* Slider */}
        <div>
          <div className="flex justify-between mb-2 text-sm">
            <span className="text-gray-600">Số điểm dùng:</span>
            <span className="font-bold text-violet-600">{pointsToUse} điểm</span>
          </div>
          <Slider
            value={[pointsToUse]}
            onValueChange={([value]) => setPointsToUse(value)}
            max={maxUsablePoints}
            step={10}
            disabled={disabled}
            className="mb-2"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>0</span>
            <span>{maxUsablePoints} điểm tối đa</span>
          </div>
        </div>
        
        {/* Quick Select */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPointsToUse(POINTS_CONFIG.minRedeemPoints)}
            disabled={disabled || maxUsablePoints < POINTS_CONFIG.minRedeemPoints}
          >
            {POINTS_CONFIG.minRedeemPoints}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPointsToUse(Math.floor(maxUsablePoints / 2))}
            disabled={disabled}
          >
            50%
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPointsToUse(maxUsablePoints)}
            disabled={disabled}
          >
            Tối đa
          </Button>
        </div>
        
        {/* Summary */}
        {pointsToUse > 0 && (
          <div className="bg-white rounded-lg p-3 border border-violet-200">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Giảm giá:</span>
              <span className="font-bold text-green-600">-{discountAmount.toLocaleString('vi-VN')}đ</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Điểm còn lại:</span>
              <span className="font-medium">{account.total_points - pointsToUse}</span>
            </div>
          </div>
        )}
        
        {/* Apply Button */}
        <Button
          onClick={handleApply}
          disabled={disabled || pointsToUse < POINTS_CONFIG.minRedeemPoints}
          className="w-full bg-violet-600 hover:bg-violet-700"
        >
          <Icon.CheckCircle size={18} className="mr-2" />
          Áp dụng {pointsToUse} điểm
        </Button>
        
        {pointsToUse < POINTS_CONFIG.minRedeemPoints && pointsToUse > 0 && (
          <p className="text-xs text-amber-600 text-center">
            Tối thiểu {POINTS_CONFIG.minRedeemPoints} điểm
          </p>
        )}
      </CardContent>
    </Card>
  );
}