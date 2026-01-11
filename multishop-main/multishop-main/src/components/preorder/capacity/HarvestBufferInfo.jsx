/**
 * HarvestBufferInfo - Hiển thị thông tin buffer time cho harvest date
 * Module 5: Capacity Management
 */

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, Clock, CloudRain, Sun, 
  AlertTriangle, Info, Shield
} from 'lucide-react';
import { format, addDays, differenceInDays } from 'date-fns';
import { vi } from 'date-fns/locale';

const DEFAULT_BUFFER_DAYS = 7;

const BUFFER_REASONS = [
  {
    icon: CloudRain,
    label: 'Thời tiết',
    description: 'Mưa bão có thể ảnh hưởng thu hoạch'
  },
  {
    icon: Sun,
    label: 'Độ chín',
    description: 'Chờ sản phẩm đạt độ chín tối ưu'
  },
  {
    icon: Clock,
    label: 'Vận chuyển',
    description: 'Thời gian đóng gói và logistics'
  }
];

export default function HarvestBufferInfo({
  estimatedHarvestDate,
  bufferDays = DEFAULT_BUFFER_DAYS,
  actualHarvestDate, // If already harvested
  variant = 'default', // default, compact, tooltip
  className = ''
}) {
  const harvestDate = new Date(estimatedHarvestDate);
  const today = new Date();
  const daysUntilHarvest = differenceInDays(harvestDate, today);
  
  const earliestDate = harvestDate;
  const latestDate = addDays(harvestDate, bufferDays);
  
  const isHarvested = actualHarvestDate && new Date(actualHarvestDate) <= today;

  if (variant === 'compact') {
    return (
      <div className={`flex items-center justify-between p-3 bg-blue-50 rounded-xl text-sm ${className}`}>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-600" />
          <span className="text-gray-700">
            {isHarvested ? 'Đã thu hoạch' : 'Dự kiến thu hoạch'}
          </span>
        </div>
        <span className="font-medium text-blue-700">
          {isHarvested 
            ? format(new Date(actualHarvestDate), 'dd/MM/yyyy', { locale: vi })
            : `${format(earliestDate, 'dd/MM', { locale: vi })} - ${format(latestDate, 'dd/MM', { locale: vi })}`
          }
        </span>
      </div>
    );
  }

  if (variant === 'tooltip') {
    return (
      <div className={`p-3 bg-white border border-gray-200 rounded-xl shadow-lg max-w-xs ${className}`}>
        <div className="flex items-center gap-2 mb-2">
          <Info className="w-4 h-4 text-blue-500" />
          <span className="font-medium text-gray-800">Về thời gian thu hoạch</span>
        </div>
        <p className="text-xs text-gray-600">
          Ngày thu hoạch có thể thay đổi ±{bufferDays} ngày tùy thuộc vào 
          điều kiện thời tiết và độ chín của sản phẩm.
        </p>
        <div className="mt-2 pt-2 border-t text-xs text-gray-500">
          Khoảng: {format(earliestDate, 'dd/MM', { locale: vi })} - {format(latestDate, 'dd/MM', { locale: vi })}
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-100 rounded-2xl p-5 ${className}`}
    >
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <Calendar className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="font-bold text-gray-800">Thời gian thu hoạch</h3>
          <p className="text-sm text-gray-500">
            {isHarvested 
              ? 'Sản phẩm đã được thu hoạch'
              : `Dự kiến trong ${daysUntilHarvest} ngày nữa`
            }
          </p>
        </div>
      </div>

      {/* Date range */}
      {!isHarvested && (
        <div className="bg-white rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Sớm nhất</p>
              <p className="font-bold text-gray-800">
                {format(earliestDate, 'dd/MM', { locale: vi })}
              </p>
            </div>
            
            <div className="flex-1 mx-4">
              <div className="h-1 bg-gradient-to-r from-blue-300 via-blue-500 to-blue-300 rounded-full" />
              <p className="text-center text-xs text-gray-400 mt-1">±{bufferDays} ngày</p>
            </div>
            
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Muộn nhất</p>
              <p className="font-bold text-gray-800">
                {format(latestDate, 'dd/MM', { locale: vi })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* If harvested */}
      {isHarvested && (
        <div className="bg-green-100 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-3">
            <Sun className="w-6 h-6 text-green-600" />
            <div>
              <p className="font-bold text-green-800">Đã thu hoạch</p>
              <p className="text-sm text-green-600">
                {format(new Date(actualHarvestDate), 'EEEE, dd/MM/yyyy', { locale: vi })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Buffer reasons */}
      {!isHarvested && (
        <>
          <p className="text-xs text-gray-500 mb-3">Lý do có khoảng thời gian:</p>
          <div className="space-y-2">
            {BUFFER_REASONS.map((reason, index) => {
              const Icon = reason.icon;
              return (
                <div key={index} className="flex items-center gap-3 text-sm">
                  <Icon className="w-4 h-4 text-blue-500" />
                  <span className="text-gray-600">{reason.description}</span>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Guarantee badge */}
      <div className="mt-4 p-3 bg-white/50 rounded-xl flex items-center gap-2">
        <Shield className="w-5 h-5 text-green-600" />
        <p className="text-xs text-gray-600">
          Hoàn tiền 100% nếu không giao được hàng trong vòng {bufferDays * 4} ngày
        </p>
      </div>
    </motion.div>
  );
}