/**
 * Loyalty Progress Card
 * UI Component - Hiển thị tiến độ tier
 */

import React from 'react';
import { Icon } from '@/components/ui/AnimatedIcon.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import LoyaltyTierBadge from './LoyaltyTierBadge';

export default function LoyaltyProgressCard({ account }) {
  if (!account) return null;
  
  return (
    <Card className="border-violet-200">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon.Trophy size={20} className="text-violet-600" />
            Hạng Thành Viên
          </div>
          <LoyaltyTierBadge tier={account.tier} />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Points */}
        <div className="text-center p-4 bg-gradient-to-br from-violet-100 to-purple-100 rounded-xl">
          <p className="text-4xl font-bold text-violet-600">{account.total_points || 0}</p>
          <p className="text-sm text-gray-600">Điểm hiện có</p>
        </div>
        
        {/* Progress to next tier */}
        {account.tier !== 'platinum' && (
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Tiến độ lên hạng:</span>
              <span className="font-medium">{account.tier_progress || 0}%</span>
            </div>
            <Progress value={account.tier_progress || 0} className="h-2" />
            <p className="text-xs text-gray-500 mt-2 text-center">
              Còn {account.points_to_next_tier || 0} điểm để lên hạng tiếp theo
            </p>
          </div>
        )}
        
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t">
          <div className="text-center">
            <p className="text-lg font-bold text-gray-700">{account.lifetime_points || 0}</p>
            <p className="text-xs text-gray-500">Tổng tích lũy</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-gray-700">{account.points_used || 0}</p>
            <p className="text-xs text-gray-500">Đã dùng</p>
          </div>
        </div>
        
        {/* Expiring Warning */}
        {account.points_expiring_soon > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
            <Icon.AlertTriangle size={16} className="text-amber-600 mt-0.5" />
            <div className="flex-1 text-xs">
              <p className="font-medium text-amber-700">
                {account.points_expiring_soon} điểm sắp hết hạn
              </p>
              <p className="text-amber-600">
                Hạn: {new Date(account.next_expiration_date).toLocaleDateString('vi-VN')}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}