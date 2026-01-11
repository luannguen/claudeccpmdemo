/**
 * SaaS Module - Usage Limit Badge Component
 * 
 * Displays usage limit status with progress bar and upgrade CTA.
 * 
 * @module features/saas/ui/usage
 */

import React from "react";
import { Icon } from "@/components/ui/AnimatedIcon";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { checkResourceLimit } from '../../domain/usageLimits';

export default function UsageLimitBadge({ type, tenant }) {
  if (!tenant?.limits || !tenant?.usage) return null;

  const tenantId = tenant.id;
  
  const configs = {
    product: {
      resource: 'products',
      label: "sản phẩm",
      color: "purple"
    },
    order: {
      resource: 'orders_per_month',
      label: "đơn hàng tháng này",
      color: "blue"
    },
    user: {
      resource: 'users',
      label: "nhân viên",
      color: "orange"
    },
    storage: {
      resource: 'storage_mb',
      label: "MB storage",
      color: "green"
    }
  };

  const config = configs[type];
  if (!config) return null;

  // Use domain function to check limit
  const limitCheck = checkResourceLimit(tenant, config.resource, 0);
  const { usage, limit, percentage, isNearLimit, isAtLimit } = limitCheck;

  return (
    <div className={`rounded-xl p-4 border-2 ${
      isAtLimit ? 'bg-red-50 border-red-200' :
      isNearLimit ? 'bg-orange-50 border-orange-200' :
      'bg-blue-50 border-blue-200'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {(isAtLimit || isNearLimit) && (
            <Icon.AlertCircle />
          )}
          <div>
            <p className={`text-sm font-medium ${
              isAtLimit ? 'text-red-900' :
              isNearLimit ? 'text-orange-900' :
              'text-blue-900'
            }`}>
              {isAtLimit ? '⚠️ Đã đạt giới hạn!' :
               isNearLimit ? '⚡ Sắp đạt giới hạn' :
               `Đang dùng ${usage}/${limit}`}
            </p>
            <p className={`text-xs ${
              isAtLimit ? 'text-red-700' :
              isNearLimit ? 'text-orange-700' :
              'text-blue-700'
            }`}>
              {config.label}
            </p>
          </div>
        </div>
        <span className={`text-lg font-bold ${
          isAtLimit ? 'text-red-600' :
          isNearLimit ? 'text-orange-600' :
          'text-blue-600'
        }`}>
          {percentage.toFixed(0)}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden mb-3">
        <div
          className={`h-full transition-all ${
            isAtLimit ? 'bg-red-500' :
            isNearLimit ? 'bg-orange-500' :
            'bg-blue-500'
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      {(isAtLimit || isNearLimit) && (
        <Link
          to={createPageUrl(`TenantBilling?tenant=${tenantId}`)}
          className={`flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-white font-medium text-sm hover:opacity-90 transition-opacity ${
            isAtLimit ? 'bg-red-600' : 'bg-orange-600'
          }`}
        >
          <Icon.TrendingUp />
          Nâng Cấp Gói
        </Link>
      )}
    </div>
  );
}