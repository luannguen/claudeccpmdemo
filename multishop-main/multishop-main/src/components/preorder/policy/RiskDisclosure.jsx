/**
 * RiskDisclosure - Component hiển thị các rủi ro của bán trước
 * Module 4: Transparency UI
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, ChevronDown, ChevronUp, 
  CloudRain, TrendingUp, Scale, Clock, Info
} from 'lucide-react';

const DEFAULT_RISKS = [
  {
    icon: Clock,
    title: 'Thời gian giao hàng',
    description: 'Ngày giao có thể thay đổi do điều kiện thu hoạch thực tế',
    level: 'medium'
  },
  {
    icon: Scale,
    title: 'Sản lượng',
    description: 'Số lượng thực tế có thể chênh lệch ±10% so với dự kiến',
    level: 'low'
  },
  {
    icon: TrendingUp,
    title: 'Biến động giá',
    description: 'Giá có thể tăng theo thời gian gần ngày thu hoạch',
    level: 'low'
  },
  {
    icon: CloudRain,
    title: 'Yếu tố thiên nhiên',
    description: 'Thời tiết xấu có thể ảnh hưởng đến chất lượng và thời gian',
    level: 'medium'
  }
];

const RISK_COLORS = {
  low: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: 'text-blue-500' },
  medium: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', icon: 'text-amber-500' },
  high: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: 'text-red-500' }
};

function RiskItem({ risk, isExpanded }) {
  const colors = RISK_COLORS[risk.level] || RISK_COLORS.medium;
  const Icon = risk.icon || AlertTriangle;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-start gap-3 p-3 ${colors.bg} ${colors.border} border rounded-xl`}
    >
      <Icon className={`w-5 h-5 ${colors.icon} flex-shrink-0 mt-0.5`} />
      <div>
        <p className={`font-medium ${colors.text}`}>{risk.title}</p>
        {isExpanded && (
          <p className="text-sm text-gray-600 mt-1">{risk.description}</p>
        )}
      </div>
    </motion.div>
  );
}

export default function RiskDisclosure({ 
  risks = DEFAULT_RISKS,
  variant = 'default', // default, compact, expandable, list
  showHeader = true,
  className = ''
}) {
  const [isExpanded, setIsExpanded] = useState(variant !== 'expandable');

  // List variant - simple bullet list
  if (variant === 'list') {
    return (
      <ul className={`space-y-2 text-sm text-gray-600 ${className}`}>
        {risks.map((risk, index) => (
          <li key={index} className="flex items-start gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
            <span>{risk.description}</span>
          </li>
        ))}
      </ul>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`p-3 bg-amber-50 border border-amber-200 rounded-xl ${className}`}>
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-700">
            <span className="font-medium">Lưu ý:</span> Sản phẩm bán trước có thể có thay đổi về 
            thời gian giao và sản lượng do các yếu tố tự nhiên.
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'expandable') {
    return (
      <div className={`border-2 border-amber-200 rounded-2xl overflow-hidden ${className}`}>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-4 bg-amber-50 hover:bg-amber-100 transition-colors"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span className="font-semibold text-amber-800">Lưu ý rủi ro khi đặt trước</span>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-amber-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-amber-600" />
          )}
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="p-4 space-y-3"
            >
              {risks.map((risk, index) => (
                <RiskItem key={index} risk={risk} isExpanded={true} />
              ))}
              
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl">
                <p className="text-sm text-green-700 flex items-start gap-2">
                  <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>
                    Chúng tôi cam kết thông báo kịp thời mọi thay đổi và hỗ trợ 
                    hoàn tiền nếu không thể giao hàng đúng hẹn.
                  </span>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Default variant
  return (
    <div className={`bg-amber-50 border-2 border-amber-200 rounded-2xl p-5 ${className}`}>
      {showHeader && (
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <h3 className="font-bold text-amber-800">Lưu ý trước khi đặt hàng</h3>
        </div>
      )}

      <div className="space-y-3">
        {risks.map((risk, index) => (
          <RiskItem key={index} risk={risk} isExpanded={true} />
        ))}
      </div>

      <div className="mt-4 p-3 bg-white/50 rounded-xl">
        <p className="text-xs text-amber-700 leading-relaxed">
          Bằng việc đặt hàng, bạn xác nhận đã đọc và hiểu các rủi ro tiềm ẩn 
          của việc mua sản phẩm bán trước. Chúng tôi sẽ cập nhật thông tin 
          thường xuyên qua email và thông báo trên ứng dụng.
        </p>
      </div>
    </div>
  );
}