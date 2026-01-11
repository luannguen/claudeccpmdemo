/**
 * SaaS Module - Upgrade Prompt Modal
 * 
 * Modal prompting users to upgrade when limits reached.
 * 
 * @module features/saas/ui/usage
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@/components/ui/AnimatedIcon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PLAN_LIMITS, PLAN_PRICES } from '../../types';
import { comparePlans } from '../../domain/pricingTiers';

// ========== PLAN DISPLAY ==========

const PLAN_DISPLAY = {
  free: { name: 'Free', color: 'bg-gray-100 text-gray-700' },
  starter: { name: 'Starter', color: 'bg-blue-100 text-blue-700' },
  pro: { name: 'Pro', color: 'bg-purple-100 text-purple-700' },
  enterprise: { name: 'Enterprise', color: 'bg-orange-100 text-orange-700' }
};

// ========== COMPONENT ==========

export default function UpgradePromptModal({ 
  isOpen, 
  onClose, 
  currentPlan = 'free',
  suggestedPlan = 'starter',
  limitReached = null,
  onUpgrade 
}) {
  if (!isOpen) return null;
  
  const currentDisplay = PLAN_DISPLAY[currentPlan];
  const suggestedDisplay = PLAN_DISPLAY[suggestedPlan];
  
  // Use domain function for comparison
  const comparison = comparePlans(currentPlan, suggestedPlan);
  const currentLimits = PLAN_LIMITS[currentPlan];
  const suggestedLimits = PLAN_LIMITS[suggestedPlan];
  
  const priceDiff = PLAN_PRICES[suggestedPlan].monthly - PLAN_PRICES[currentPlan].monthly;
  
  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#7CB342] to-[#558B2F] p-6 text-white relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
            >
              <Icon.X />
            </button>
            
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Icon.TrendingUp />
              </div>
              <div>
                <h2 className="text-xl font-bold">Nâng Cấp Gói</h2>
                <p className="text-white/80 text-sm">Mở khóa thêm tính năng</p>
              </div>
            </div>
            
            {limitReached && (
              <div className="bg-white/20 rounded-xl p-3 mt-4">
                <p className="text-sm">
                  ⚠️ Bạn đã đạt giới hạn <strong>{limitReached.resource}</strong>: 
                  {' '}{limitReached.usage}/{limitReached.limit}
                </p>
              </div>
            )}
          </div>
          
          {/* Content */}
          <div className="p-6">
            {/* Plan Comparison */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* Current Plan */}
              <div className="border border-gray-200 rounded-xl p-4">
                <Badge className={currentDisplay.color + ' mb-2'}>
                  Hiện tại
                </Badge>
                <h3 className="font-bold text-lg text-gray-900">{currentDisplay.name}</h3>
                <p className="text-2xl font-bold text-gray-400 mb-3">
                  {PLAN_PRICES[currentPlan].monthly > 0 
                    ? `${(PLAN_PRICES[currentPlan].monthly / 1000).toFixed(0)}K/tháng`
                    : 'Miễn phí'
                  }
                </p>
                
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <Icon.Package />
                    {currentLimits.max_products === -1 ? 'Không giới hạn' : currentLimits.max_products} sản phẩm
                  </li>
                  <li className="flex items-center gap-2">
                    <Icon.ShoppingCart />
                    {currentLimits.max_orders_per_month === -1 ? 'Không giới hạn' : currentLimits.max_orders_per_month} đơn/tháng
                  </li>
                  <li className="flex items-center gap-2">
                    <Icon.Users />
                    {currentLimits.max_customers === -1 ? 'Không giới hạn' : currentLimits.max_customers} khách hàng
                  </li>
                </ul>
              </div>
              
              {/* Suggested Plan */}
              <div className="border-2 border-[#7CB342] rounded-xl p-4 relative bg-green-50/30">
                <div className="absolute -top-3 right-3">
                  <Badge className="bg-[#7CB342] text-white">
                    Đề xuất
                  </Badge>
                </div>
                
                <Badge className={suggestedDisplay.color + ' mb-2'}>
                  {suggestedDisplay.name}
                </Badge>
                <h3 className="font-bold text-lg text-gray-900">{suggestedDisplay.name}</h3>
                <p className="text-2xl font-bold text-[#7CB342] mb-3">
                  {PLAN_PRICES[suggestedPlan].monthly > 0 
                    ? `${(PLAN_PRICES[suggestedPlan].monthly / 1000).toFixed(0)}K/tháng`
                    : 'Miễn phí'
                  }
                </p>
                
                <ul className="space-y-2 text-sm text-gray-900">
                  <li className="flex items-center gap-2">
                    <Icon.Package />
                    <span className="font-medium">
                      {suggestedLimits.max_products === -1 ? 'Không giới hạn' : suggestedLimits.max_products}
                    </span> sản phẩm
                  </li>
                  <li className="flex items-center gap-2">
                    <Icon.ShoppingCart />
                    <span className="font-medium">
                      {suggestedLimits.max_orders_per_month === -1 ? 'Không giới hạn' : suggestedLimits.max_orders_per_month}
                    </span> đơn/tháng
                  </li>
                  <li className="flex items-center gap-2">
                    <Icon.Users />
                    <span className="font-medium">
                      {suggestedLimits.max_customers === -1 ? 'Không giới hạn' : suggestedLimits.max_customers}
                    </span> khách hàng
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Features Upgrade */}
            {comparison.features_added.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h4 className="font-medium text-gray-900 mb-3">
                  ✨ Tính năng thêm với {suggestedDisplay.name}
                </h4>
                <ul className="space-y-2">
                  {comparison.features_added.map(feature => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-gray-700">
                      <Icon.Check />
                      {formatFeatureName(feature)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={onClose}
              >
                Để sau
              </Button>
              <Button
                className="flex-1 bg-[#7CB342] hover:bg-[#558B2F]"
                onClick={() => onUpgrade?.(suggestedPlan)}
              >
                Nâng cấp ngay
              </Button>
            </div>
            
            {priceDiff > 0 && (
              <p className="text-center text-sm text-gray-500 mt-3">
                Chỉ thêm {(priceDiff / 1000).toFixed(0)}K/tháng
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// ========== HELPERS ==========

function formatFeatureName(feature) {
  const featureNames = {
    'basic_reports': 'Báo cáo cơ bản',
    'advanced_reports': 'Báo cáo nâng cao',
    'email_support': 'Hỗ trợ email',
    'priority_support': 'Hỗ trợ ưu tiên',
    'custom_domain': 'Tên miền riêng',
    'api_access': 'Truy cập API',
    'white_label': 'White label',
    'dedicated_support': 'Hỗ trợ chuyên biệt',
    'sla': 'SLA cam kết'
  };
  
  return featureNames[feature] || feature;
}