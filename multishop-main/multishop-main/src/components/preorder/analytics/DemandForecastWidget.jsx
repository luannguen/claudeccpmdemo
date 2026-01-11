/**
 * DemandForecastWidget - Dự báo nhu cầu cho lot
 * UI Layer
 */

import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, TrendingDown, Minus, 
  Target, Lightbulb, AlertTriangle, CheckCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const TREND_CONFIG = {
  increasing: {
    icon: TrendingUp,
    label: 'Tăng',
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  stable: {
    icon: Minus,
    label: 'Ổn định',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  decreasing: {
    icon: TrendingDown,
    label: 'Giảm',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50'
  }
};

const ACTION_ICONS = {
  reduce_price: AlertTriangle,
  run_promotion: Lightbulb,
  increase_capacity: Target,
  extend_deadline: Target
};

export default function DemandForecastWidget({ forecast, lotName }) {
  if (!forecast) {
    return (
      <div className="text-center py-6">
        <Target className="w-8 h-8 text-gray-300 mx-auto mb-2" />
        <p className="text-sm text-gray-500">Chưa đủ dữ liệu để dự báo</p>
      </div>
    );
  }

  const {
    current_sold = 0,
    predicted_total_orders = 0,
    capacity = 0,
    probability_min_qty_reached = 0,
    trend = 'stable',
    daily_rate = 0,
    days_until_harvest = 0,
    recommendations = []
  } = forecast;

  const trendConfig = TREND_CONFIG[trend];
  const TrendIcon = trendConfig.icon;
  const probability = parseFloat(probability_min_qty_reached) || 0;

  return (
    <div className="bg-white rounded-xl border shadow-sm p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">Dự báo nhu cầu</h3>
          {lotName && (
            <p className="text-xs text-gray-500">{lotName}</p>
          )}
        </div>
        <Badge className={`${trendConfig.bgColor} ${trendConfig.color}`}>
          <TrendIcon className="w-3 h-3 mr-1" />
          {trendConfig.label}
        </Badge>
      </div>

      {/* Main metrics */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center">
          <p className="text-xs text-gray-600">Đã bán</p>
          <p className="text-xl font-bold text-gray-900">{current_sold}</p>
        </div>
        <div className="text-center border-x">
          <p className="text-xs text-gray-600">Dự báo</p>
          <p className="text-xl font-bold text-blue-600">{predicted_total_orders}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-600">Capacity</p>
          <p className="text-xl font-bold text-gray-900">{capacity}</p>
        </div>
      </div>

      {/* Progress to capacity */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>Dự kiến đạt {probability}%</span>
          <span>{predicted_total_orders}/{capacity}</span>
        </div>
        <Progress 
          value={probability} 
          className={`h-2 ${
            probability >= 80 ? 'bg-green-200' : 
            probability >= 50 ? 'bg-blue-200' : 'bg-amber-200'
          }`}
        />
      </div>

      {/* Daily rate */}
      <div className="p-3 bg-gray-50 rounded-lg mb-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Tốc độ bán/ngày</span>
          <span className="font-semibold text-gray-900">{daily_rate}</span>
        </div>
        <div className="flex justify-between items-center mt-1">
          <span className="text-sm text-gray-600">Còn lại</span>
          <span className="text-sm text-gray-700">{days_until_harvest} ngày</span>
        </div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="border-t pt-4">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <h4 className="text-sm font-medium text-gray-700">Đề xuất hành động</h4>
          </div>
          <div className="space-y-2">
            {recommendations.map((rec, index) => {
              const ActionIcon = ACTION_ICONS[rec.action] || Lightbulb;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-2 p-2 bg-amber-50 rounded-lg"
                >
                  <ActionIcon className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-amber-900">
                      {rec.reason}
                    </p>
                    <p className="text-xs text-amber-700">
                      → {rec.impact}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Success indicator */}
      <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${
        probability >= 80 
          ? 'bg-green-50' 
          : probability >= 50 
            ? 'bg-blue-50' 
            : 'bg-amber-50'
      }`}>
        {probability >= 80 ? (
          <>
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-700 font-medium">
              Có khả năng đạt mục tiêu cao
            </span>
          </>
        ) : probability >= 50 ? (
          <>
            <Target className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-blue-700 font-medium">
              Cần theo dõi để đạt mục tiêu
            </span>
          </>
        ) : (
          <>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span className="text-sm text-amber-700 font-medium">
              Cần hành động để tăng đơn hàng
            </span>
          </>
        )}
      </div>
    </div>
  );
}