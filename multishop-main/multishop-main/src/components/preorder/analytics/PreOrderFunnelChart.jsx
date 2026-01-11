/**
 * PreOrderFunnelChart - Biểu đồ funnel cho preorder
 * UI Layer
 */

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Eye, ShoppingCart, CreditCard, CheckCircle, 
  Truck, TrendingUp, TrendingDown
} from 'lucide-react';

const FUNNEL_STAGES = [
  { key: 'page_views', label: 'Xem trang', icon: Eye, color: 'bg-blue-500' },
  { key: 'add_to_cart', label: 'Thêm giỏ', icon: ShoppingCart, color: 'bg-cyan-500' },
  { key: 'deposit_paid', label: 'Đặt cọc', icon: CreditCard, color: 'bg-purple-500' },
  { key: 'final_payment_paid', label: 'Thanh toán đủ', icon: CheckCircle, color: 'bg-green-500' },
  { key: 'fulfilled', label: 'Đã giao', icon: Truck, color: 'bg-emerald-500' }
];

export default function PreOrderFunnelChart({ 
  funnel = {}, 
  conversions = {},
  variant = 'default' // default | compact
}) {
  const maxValue = Math.max(
    funnel.page_views || 0,
    funnel.add_to_cart || 0,
    funnel.deposit_paid || 0,
    funnel.final_payment_paid || 0,
    funnel.fulfilled || 0,
    1
  );

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-1">
        {FUNNEL_STAGES.slice(2).map((stage, index) => {
          const value = funnel[stage.key] || 0;
          const Icon = stage.icon;
          
          return (
            <React.Fragment key={stage.key}>
              <div className="flex items-center gap-1 text-xs">
                <Icon className="w-3 h-3 text-gray-500" />
                <span className="font-medium">{value}</span>
              </div>
              {index < 2 && (
                <span className="text-gray-300">→</span>
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Funnel bars */}
      <div className="space-y-3">
        {FUNNEL_STAGES.map((stage, index) => {
          const value = funnel[stage.key] || 0;
          const prevValue = index > 0 ? (funnel[FUNNEL_STAGES[index - 1].key] || 0) : value;
          const percentage = prevValue > 0 ? ((value / prevValue) * 100).toFixed(1) : 0;
          const widthPercent = maxValue > 0 ? (value / maxValue) * 100 : 0;
          const Icon = stage.icon;

          // Skip if no data
          if (value === 0 && index > 0) return null;

          return (
            <div key={stage.key}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">{stage.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">
                    {value.toLocaleString()}
                  </span>
                  {index > 0 && (
                    <span className={`text-xs ${
                      parseFloat(percentage) >= 50 ? 'text-green-600' : 'text-amber-600'
                    }`}>
                      ({percentage}%)
                    </span>
                  )}
                </div>
              </div>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${widthPercent}%` }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`h-8 ${stage.color} rounded-lg relative overflow-hidden`}
                style={{ minWidth: value > 0 ? '20px' : '0' }}
              >
                <div className="absolute inset-0 bg-white/20" />
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* Conversion rates */}
      {Object.keys(conversions).length > 0 && (
        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Tỷ lệ chuyển đổi</h4>
          <div className="grid grid-cols-2 gap-3">
            <ConversionCard
              label="Giỏ → Cọc"
              value={conversions.checkout_to_deposit || 0}
            />
            <ConversionCard
              label="Cọc → Thanh toán"
              value={conversions.deposit_to_final || 0}
            />
            <ConversionCard
              label="Thanh toán → Giao"
              value={conversions.final_to_fulfilled || 0}
            />
            <ConversionCard
              label="Tổng chuyển đổi"
              value={conversions.overall_conversion || 0}
              highlight
            />
          </div>
        </div>
      )}
    </div>
  );
}

function ConversionCard({ label, value, highlight = false }) {
  const numValue = parseFloat(value) || 0;
  const isGood = numValue >= 50;

  return (
    <div className={`p-3 rounded-lg ${
      highlight ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
    }`}>
      <p className="text-xs text-gray-600 mb-1">{label}</p>
      <div className="flex items-center gap-1">
        {isGood ? (
          <TrendingUp className="w-4 h-4 text-green-500" />
        ) : (
          <TrendingDown className="w-4 h-4 text-amber-500" />
        )}
        <span className={`text-lg font-bold ${
          highlight ? 'text-blue-700' : isGood ? 'text-green-600' : 'text-amber-600'
        }`}>
          {value}%
        </span>
      </div>
    </div>
  );
}