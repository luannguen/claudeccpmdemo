/**
 * DelayMetricsCard - Số liệu về độ trễ giao hàng
 * UI Layer
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function DelayMetricsCard({ metrics = {} }) {
  const {
    total_delivered = 0,
    on_time_delivery = 0,
    delayed_delivery = 0,
    average_delay_days = 0,
    partial_delivery = 0,
    delivery_success_rate = 0
  } = metrics;

  const onTimePercent = total_delivered > 0 
    ? ((on_time_delivery / total_delivered) * 100).toFixed(1) 
    : 0;

  const delayPercent = total_delivered > 0 
    ? ((delayed_delivery / total_delivered) * 100).toFixed(1) 
    : 0;

  const avgDelay = parseFloat(average_delay_days) || 0;

  return (
    <div className="bg-white rounded-xl border shadow-sm p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Thống kê giao hàng</h3>
            <p className="text-xs text-gray-500">{total_delivered} đơn đã giao</p>
          </div>
        </div>
        
        <Badge className={`${
          parseFloat(delivery_success_rate) >= 80 
            ? 'bg-green-100 text-green-700' 
            : parseFloat(delivery_success_rate) >= 60
              ? 'bg-amber-100 text-amber-700'
              : 'bg-red-100 text-red-700'
        }`}>
          {delivery_success_rate}% thành công
        </Badge>
      </div>

      {/* On-time vs Delayed */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-green-50 rounded-lg"
        >
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-xs text-green-700 font-medium">Đúng hẹn</span>
          </div>
          <p className="text-2xl font-bold text-green-700">{on_time_delivery}</p>
          <p className="text-xs text-green-600">{onTimePercent}%</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-3 bg-amber-50 rounded-lg"
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span className="text-xs text-amber-700 font-medium">Trễ hẹn</span>
          </div>
          <p className="text-2xl font-bold text-amber-700">{delayed_delivery}</p>
          <p className="text-xs text-amber-600">{delayPercent}%</p>
        </motion.div>
      </div>

      {/* Average delay */}
      {avgDelay > 0 && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-red-900">
                  Độ trễ trung bình
                </p>
                <p className="text-xs text-red-600">
                  Cần cải thiện để giảm khiếu nại
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-red-700">{avgDelay}</p>
              <p className="text-xs text-red-600">ngày</p>
            </div>
          </div>
        </div>
      )}

      {/* Partial delivery */}
      {partial_delivery > 0 && (
        <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
          <span className="text-sm text-purple-700">Giao một phần</span>
          <span className="font-semibold text-purple-800">{partial_delivery} đơn</span>
        </div>
      )}

      {/* Progress bar */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>Tỉ lệ giao đúng hẹn</span>
          <span>{onTimePercent}%</span>
        </div>
        <Progress 
          value={parseFloat(onTimePercent)} 
          className={`h-2 ${
            parseFloat(onTimePercent) >= 80 ? 'bg-green-200' : 
            parseFloat(onTimePercent) >= 60 ? 'bg-amber-200' : 'bg-red-200'
          }`}
        />
      </div>
    </div>
  );
}