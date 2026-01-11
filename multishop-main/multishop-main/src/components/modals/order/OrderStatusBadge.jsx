import React from 'react';
import { Clock, CheckCircle, Package, Truck, XCircle, PackageX, DollarSign, Sprout, Leaf, Wallet } from 'lucide-react';

const ICONS = {
  Clock,
  CheckCircle,
  Package,
  Truck,
  XCircle,
  PackageX,
  DollarSign,
  // Pre-Order icons
  Sprout,
  Leaf,
  Wallet
};

export default function OrderStatusBadge({ status, order, onCancelClick, canCancel }) {
  const StatusIcon = ICONS[status.iconName] || Clock;
  const isPreorder = order?.has_preorder_items;
  const isPreorderStatus = ['awaiting_harvest', 'harvest_ready', 'partial_payment'].includes(order?.order_status);

  // Dynamic color classes for Tailwind
  const colorClasses = {
    yellow: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-900', icon: 'text-yellow-600' },
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-900', icon: 'text-blue-600' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-900', icon: 'text-purple-600' },
    amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-900', icon: 'text-amber-600' },
    lime: { bg: 'bg-lime-50', border: 'border-lime-200', text: 'text-lime-900', icon: 'text-lime-600' },
    orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-900', icon: 'text-orange-600' },
    indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-900', icon: 'text-indigo-600' },
    green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-900', icon: 'text-green-600' },
    red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-900', icon: 'text-red-600' }
  };

  const colors = colorClasses[status.color] || colorClasses.yellow;

  return (
    <div className={`${colors.bg} border-2 ${colors.border} rounded-2xl p-4 sm:p-6`}>
      <div className="flex items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <StatusIcon className={`w-8 h-8 sm:w-10 sm:h-10 ${colors.icon}`} />
          <div>
            <div className="flex items-center gap-2">
              <p className={`text-lg sm:text-2xl font-bold ${colors.text}`}>{status.label}</p>
              {isPreorder && (
                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full font-medium">
                  Pre-Order
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-gray-600">
              Đặt ngày {new Date(order.created_date).toLocaleDateString('vi-VN')}
            </p>
            {/* Show deposit info for preorder */}
            {isPreorder && order.remaining_amount > 0 && (
              <p className="text-xs text-orange-600 mt-1">
                💰 Còn lại: {order.remaining_amount.toLocaleString('vi-VN')}đ
              </p>
            )}
          </div>
        </div>
        
        {canCancel && (
          <button
            onClick={onCancelClick}
            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-xs sm:text-sm font-medium flex items-center gap-1"
          >
            <XCircle className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Hủy Đơn</span>
            <span className="sm:hidden">Hủy</span>
          </button>
        )}
      </div>
    </div>
  );
}