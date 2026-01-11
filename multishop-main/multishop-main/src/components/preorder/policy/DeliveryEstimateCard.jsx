/**
 * DeliveryEstimateCard - Hiển thị thời gian giao hàng dự kiến với buffer
 * Module 4: Transparency UI
 */

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, Truck, Clock, AlertTriangle, 
  CloudRain, Sun, CheckCircle2 
} from 'lucide-react';
import { format, addDays, differenceInDays } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function DeliveryEstimateCard({ 
  estimatedHarvestDate,
  bufferDays = 7, // Buffer mặc định 7 ngày
  shippingDays = 3, // Thời gian ship sau thu hoạch
  variant = 'default', // default, compact, timeline
  className = ''
}) {
  const harvestDate = new Date(estimatedHarvestDate);
  const today = new Date();
  const daysUntilHarvest = differenceInDays(harvestDate, today);
  
  // Calculate delivery window
  const earliestDelivery = addDays(harvestDate, shippingDays);
  const latestDelivery = addDays(harvestDate, bufferDays + shippingDays);
  
  const formatDate = (date) => format(date, 'dd/MM/yyyy', { locale: vi });
  const formatDateShort = (date) => format(date, 'dd/MM', { locale: vi });

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 text-sm ${className}`}>
        <Truck className="w-4 h-4 text-[#7CB342]" />
        <span className="text-gray-600">Giao hàng dự kiến:</span>
        <span className="font-semibold text-gray-800">
          {formatDateShort(earliestDelivery)} - {formatDateShort(latestDelivery)}
        </span>
      </div>
    );
  }

  if (variant === 'timeline') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-white border-2 border-gray-100 rounded-2xl p-5 ${className}`}
      >
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#7CB342]" />
          Lịch trình dự kiến
        </h3>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-6 bottom-6 w-0.5 bg-gradient-to-b from-[#7CB342] to-orange-400" />

          <div className="space-y-4">
            {/* Today */}
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center z-10">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800">Hôm nay</p>
                <p className="text-sm text-gray-500">Đặt hàng & thanh toán cọc</p>
              </div>
            </div>

            {/* Growing period */}
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center z-10">
                <Sun className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800">Đang chăm sóc</p>
                <p className="text-sm text-gray-500">Sản phẩm đang được nuôi trồng</p>
              </div>
            </div>

            {/* Harvest */}
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center z-10">
                <Calendar className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800">Thu hoạch dự kiến</p>
                <p className="text-sm text-gray-500">{formatDate(harvestDate)} (~{daysUntilHarvest} ngày nữa)</p>
              </div>
            </div>

            {/* Delivery */}
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center z-10">
                <Truck className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800">Giao hàng</p>
                <p className="text-sm text-gray-500">
                  {formatDate(earliestDelivery)} - {formatDate(latestDelivery)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Buffer explanation */}
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-xs text-amber-700 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>
              Thời gian giao hàng có thể thay đổi ±{bufferDays} ngày tùy thuộc vào 
              điều kiện thời tiết và quá trình thu hoạch thực tế.
            </span>
          </p>
        </div>
      </motion.div>
    );
  }

  // Default variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-100 rounded-2xl p-5 ${className}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <Truck className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800">Thời gian giao hàng</h3>
            <p className="text-sm text-gray-500">Dự kiến sau thu hoạch</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-green-600">{daysUntilHarvest}</p>
          <p className="text-xs text-gray-500">ngày nữa</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white rounded-xl p-3 text-center">
          <p className="text-xs text-gray-500 mb-1">Thu hoạch</p>
          <p className="font-semibold text-gray-800">{formatDate(harvestDate)}</p>
        </div>
        <div className="bg-white rounded-xl p-3 text-center">
          <p className="text-xs text-gray-500 mb-1">Giao hàng</p>
          <p className="font-semibold text-gray-800">
            {formatDateShort(earliestDelivery)} - {formatDateShort(latestDelivery)}
          </p>
        </div>
      </div>

      {/* Weather/condition notice */}
      <div className="flex items-center gap-2 p-2 bg-white/50 rounded-lg">
        <CloudRain className="w-4 h-4 text-gray-400" />
        <p className="text-xs text-gray-500">
          Thời gian có thể thay đổi do thời tiết
        </p>
      </div>
    </motion.div>
  );
}