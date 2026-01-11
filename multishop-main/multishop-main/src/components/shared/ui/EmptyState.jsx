/**
 * Empty State Component
 * Consistent empty state display across the app
 */

import React from 'react';
import { Inbox, Search, FileX, ShoppingCart, Users, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * @typedef {Object} EmptyStateProps
 * @property {string} [title] - Title text
 * @property {string} [message] - Description message
 * @property {string} [icon] - Icon name
 * @property {React.ReactNode} [action] - Action button/element
 * @property {string} [className] - Additional classes
 */

const iconMap = {
  default: Inbox,
  search: Search,
  file: FileX,
  cart: ShoppingCart,
  users: Users,
  product: Package
};

export function EmptyState({ 
  title = 'Không có dữ liệu',
  message = 'Chưa có dữ liệu nào để hiển thị',
  icon = 'default',
  action,
  className = ''
}) {
  const Icon = iconMap[icon] || iconMap.default;

  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 max-w-sm mb-6">{message}</p>
      {action}
    </div>
  );
}

/**
 * Empty search results
 */
export function EmptySearchResults({ 
  searchTerm = '',
  onClear
}) {
  return (
    <EmptyState
      icon="search"
      title="Không tìm thấy kết quả"
      message={searchTerm 
        ? `Không tìm thấy kết quả phù hợp với "${searchTerm}"`
        : 'Hãy thử tìm kiếm với từ khóa khác'
      }
      action={onClear && (
        <Button variant="outline" onClick={onClear}>
          Xóa tìm kiếm
        </Button>
      )}
    />
  );
}

/**
 * Empty list with action
 */
export function EmptyListWithAction({
  title = 'Chưa có dữ liệu',
  message = 'Bắt đầu bằng cách thêm mới',
  actionLabel = 'Thêm mới',
  onAction,
  icon = 'default'
}) {
  return (
    <EmptyState
      icon={icon}
      title={title}
      message={message}
      action={onAction && (
        <Button onClick={onAction} className="bg-green-600 hover:bg-green-700">
          {actionLabel}
        </Button>
      )}
    />
  );
}

/**
 * Empty cart
 */
export function EmptyCart({ onShop }) {
  return (
    <EmptyState
      icon="cart"
      title="Giỏ hàng trống"
      message="Chưa có sản phẩm nào trong giỏ hàng"
      action={onShop && (
        <Button onClick={onShop} className="bg-green-600 hover:bg-green-700">
          Tiếp tục mua sắm
        </Button>
      )}
    />
  );
}

export default EmptyState;