import React from "react";
import { AlertCircle, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function UsageLimitBadge({ type, tenant }) {
  if (!tenant?.limits || !tenant?.usage) return null;

  const tenantId = tenant.id;
  const limits = tenant.limits;
  const usage = tenant.usage;
  const plan = tenant.subscription_plan;

  const configs = {
    product: {
      current: usage.products_count || 0,
      max: limits.max_products || 10,
      label: "sản phẩm",
      color: "purple"
    },
    order: {
      current: usage.orders_this_month || 0,
      max: limits.max_orders_per_month || 50,
      label: "đơn hàng tháng này",
      color: "blue"
    },
    user: {
      current: usage.users_count || 1,
      max: limits.max_users || 2,
      label: "nhân viên",
      color: "orange"
    },
    storage: {
      current: usage.storage_used_mb || 0,
      max: limits.max_storage_mb || 100,
      label: "MB storage",
      color: "green"
    }
  };

  const config = configs[type];
  if (!config) return null;

  const percentage = (config.current / config.max) * 100;
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;

  return (
    <div className={`rounded-xl p-4 border-2 ${
      isAtLimit ? 'bg-red-50 border-red-200' :
      isNearLimit ? 'bg-orange-50 border-orange-200' :
      'bg-blue-50 border-blue-200'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {(isAtLimit || isNearLimit) && (
            <AlertCircle className={`w-5 h-5 ${
              isAtLimit ? 'text-red-600' : 'text-orange-600'
            }`} />
          )}
          <div>
            <p className={`text-sm font-medium ${
              isAtLimit ? 'text-red-900' :
              isNearLimit ? 'text-orange-900' :
              'text-blue-900'
            }`}>
              {isAtLimit ? '⚠️ Đã đạt giới hạn!' :
               isNearLimit ? '⚡ Sắp đạt giới hạn' :
               `Đang dùng ${config.current}/${config.max}`}
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
          <TrendingUp className="w-4 h-4" />
          Nâng Cấp Gói {plan?.toUpperCase() === 'FREE' ? 'Starter' : 'Pro'}
        </Link>
      )}
    </div>
  );
}