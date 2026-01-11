/**
 * PriceHistoryChart - Biểu đồ lịch sử giá và dự báo giá tương lai
 * UI Layer - Presentation only
 */

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Calendar, Info, ArrowRight } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart, ReferenceLine } from "recharts";
import { format, addDays, differenceInDays } from "date-fns";
import { vi } from "date-fns/locale";

export default function PriceHistoryChart({ 
  lot,
  showForecast = true,
  height = 200
}) {
  const chartData = useMemo(() => {
    if (!lot) return [];

    const data = [];
    const today = new Date();
    const harvestDate = new Date(lot.estimated_harvest_date);
    const daysUntilHarvest = differenceInDays(harvestDate, today);
    
    // Tính ngày bắt đầu (từ khi tạo lot hoặc 30 ngày trước)
    const createdDate = lot.created_date ? new Date(lot.created_date) : addDays(today, -30);
    const daysSinceCreated = differenceInDays(today, createdDate);

    // Lịch sử giá (past)
    const dailyIncrease = lot.initial_price && lot.current_price && daysSinceCreated > 0
      ? (lot.current_price - lot.initial_price) / daysSinceCreated
      : 0;

    // Thêm điểm bắt đầu
    data.push({
      date: format(createdDate, 'dd/MM'),
      price: lot.initial_price || lot.current_price,
      type: 'past',
      fullDate: createdDate
    });

    // Thêm điểm hôm nay
    data.push({
      date: 'Hôm nay',
      price: lot.current_price,
      type: 'current',
      fullDate: today
    });

    // Dự báo giá tương lai (forecast)
    if (showForecast && daysUntilHarvest > 0) {
      const forecastDays = Math.min(daysUntilHarvest, 14);
      const remainingIncrease = lot.max_price - lot.current_price;
      const dailyForecastIncrease = remainingIncrease / daysUntilHarvest;

      for (let i = 1; i <= forecastDays; i += Math.ceil(forecastDays / 5)) {
        const forecastDate = addDays(today, i);
        const forecastPrice = Math.min(
          lot.current_price + (dailyForecastIncrease * i),
          lot.max_price
        );
        data.push({
          date: format(forecastDate, 'dd/MM'),
          price: Math.round(forecastPrice),
          type: 'forecast',
          fullDate: forecastDate
        });
      }

      // Thêm điểm ngày thu hoạch
      data.push({
        date: 'Thu hoạch',
        price: lot.max_price,
        type: 'harvest',
        fullDate: harvestDate
      });
    }

    return data;
  }, [lot, showForecast]);

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.[0]) return null;
    const data = payload[0].payload;
    
    return (
      <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl p-3 shadow-lg">
        <p className="text-sm font-medium text-gray-600">{data.date}</p>
        <p className="text-lg font-bold text-[#7CB342]">
          {data.price?.toLocaleString('vi-VN')}đ
        </p>
        <p className="text-xs text-gray-500">
          {data.type === 'past' && 'Giá đã qua'}
          {data.type === 'current' && 'Giá hiện tại'}
          {data.type === 'forecast' && '📈 Dự báo'}
          {data.type === 'harvest' && '🎯 Giá trần'}
        </p>
      </div>
    );
  };

  if (!lot || chartData.length < 2) {
    return null;
  }

  const priceIncrease = lot.initial_price && lot.current_price
    ? ((lot.current_price - lot.initial_price) / lot.initial_price * 100).toFixed(1)
    : 0;

  const potentialSavings = lot.max_price - lot.current_price;
  const savingsPercent = lot.max_price > 0
    ? ((potentialSavings / lot.max_price) * 100).toFixed(0)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 rounded-2xl p-4 space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#7CB342]/10 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-[#7CB342]" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Biến động giá</h3>
            <p className="text-xs text-gray-500">Theo thời gian đến thu hoạch</p>
          </div>
        </div>

        {priceIncrease > 0 && (
          <div className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium">
            +{priceIncrease}% từ đầu
          </div>
        )}
      </div>

      {/* Chart */}
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7CB342" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#7CB342" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 11, fill: '#666' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              tick={{ fontSize: 11, fill: '#666' }}
              tickFormatter={(value) => `${(value/1000).toFixed(0)}k`}
              axisLine={false}
              tickLine={false}
              width={45}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine 
              y={lot.max_price} 
              stroke="#ef4444" 
              strokeDasharray="3 3" 
              label={{ value: 'Giá trần', fontSize: 10, fill: '#ef4444' }}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#7CB342"
              strokeWidth={2}
              fill="url(#colorPrice)"
              dot={(props) => {
                const { cx, cy, payload } = props;
                if (payload.type === 'current') {
                  return (
                    <circle 
                      cx={cx} cy={cy} r={6} 
                      fill="#7CB342" 
                      stroke="#fff" 
                      strokeWidth={2}
                    />
                  );
                }
                if (payload.type === 'forecast') {
                  return (
                    <circle 
                      cx={cx} cy={cy} r={4} 
                      fill="#f97316" 
                      stroke="#fff" 
                      strokeWidth={1}
                      strokeDasharray="2 2"
                    />
                  );
                }
                return null;
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend & Info */}
      <div className="flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-[#7CB342] rounded-full" />
          <span className="text-gray-600">Giá hiện tại</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-orange-500 rounded-full opacity-60" />
          <span className="text-gray-600">Dự báo</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-0.5 bg-red-500" style={{ borderTop: '2px dashed #ef4444' }} />
          <span className="text-gray-600">Giá trần</span>
        </div>
      </div>

      {/* Savings CTA */}
      {potentialSavings > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-800">
              Đặt ngay để tiết kiệm <strong>{potentialSavings.toLocaleString('vi-VN')}đ</strong> ({savingsPercent}%)
            </span>
          </div>
          <ArrowRight className="w-4 h-4 text-green-600" />
        </div>
      )}
    </motion.div>
  );
}