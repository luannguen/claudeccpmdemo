/**
 * ShopRatingWidget.jsx
 * Widget hiển thị ratings của shop
 * 
 * Phase 5 - Task 5.6 of SaaS Upgrade Plan
 * Created: 2025-01-19
 */

import React from 'react';
import { Star, ThumbsUp, MessageSquare, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

// ========== RATING BREAKDOWN ==========

function RatingBreakdown({ distribution = {} }) {
  const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);
  
  return (
    <div className="space-y-2">
      {[5, 4, 3, 2, 1].map(star => {
        const count = distribution[star] || 0;
        const percentage = total > 0 ? (count / total) * 100 : 0;
        
        return (
          <div key={star} className="flex items-center gap-2">
            <span className="text-sm text-gray-600 w-6">{star}</span>
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <Progress value={percentage} className="flex-1 h-2" />
            <span className="text-sm text-gray-500 w-12 text-right">{count}</span>
          </div>
        );
      })}
    </div>
  );
}

// ========== MAIN COMPONENT ==========

export default function ShopRatingWidget({ 
  shop, 
  showBreakdown = true,
  variant = 'default' 
}) {
  const rating = shop?.average_rating || 0;
  const reviewCount = shop?.review_count || 0;
  const distribution = shop?.rating_distribution || {};
  
  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map(star => (
            <Star
              key={star}
              className={`w-4 h-4 ${
                star <= Math.round(rating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          ))}
        </div>
        <span className="font-bold text-gray-900">{rating.toFixed(1)}</span>
        <span className="text-sm text-gray-500">({reviewCount})</span>
      </div>
    );
  }
  
  if (variant === 'inline') {
    return (
      <div className="inline-flex items-center gap-1.5 bg-yellow-50 px-2 py-1 rounded-lg">
        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        <span className="font-bold text-yellow-700">{rating.toFixed(1)}</span>
        <span className="text-sm text-yellow-600">({reviewCount} đánh giá)</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-100">
      <h3 className="font-bold text-gray-900 mb-4">Đánh giá cửa hàng</h3>
      
      {/* Overall Rating */}
      <div className="flex items-center gap-6 mb-6">
        <div className="text-center">
          <div className="text-5xl font-bold text-gray-900">{rating.toFixed(1)}</div>
          <div className="flex items-center justify-center gap-1 my-2">
            {[1, 2, 3, 4, 5].map(star => (
              <Star
                key={star}
                className={`w-5 h-5 ${
                  star <= Math.round(rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <div className="text-sm text-gray-500">{reviewCount} đánh giá</div>
        </div>
        
        {showBreakdown && (
          <div className="flex-1">
            <RatingBreakdown distribution={distribution} />
          </div>
        )}
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
            <ThumbsUp className="w-4 h-4" />
            <span className="font-bold">{shop?.satisfaction_rate || 95}%</span>
          </div>
          <div className="text-xs text-gray-500">Hài lòng</div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
            <MessageSquare className="w-4 h-4" />
            <span className="font-bold">{shop?.response_rate || 98}%</span>
          </div>
          <div className="text-xs text-gray-500">Phản hồi</div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-orange-600 mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="font-bold">{shop?.ontime_rate || 96}%</span>
          </div>
          <div className="text-xs text-gray-500">Giao đúng hẹn</div>
        </div>
      </div>
    </div>
  );
}