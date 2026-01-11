/**
 * Order Card Renderer for Chatbot
 * 
 * Renders order status cards
 */

import React, { memo } from 'react';
import { Package, Truck, CheckCircle, Clock, XCircle, ChevronRight } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

const STATUS_CONFIG = {
  pending: { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50', label: 'Chờ xác nhận' },
  confirmed: { icon: CheckCircle, color: 'text-blue-500', bg: 'bg-blue-50', label: 'Đã xác nhận' },
  processing: { icon: Package, color: 'text-indigo-500', bg: 'bg-indigo-50', label: 'Đang xử lý' },
  shipping: { icon: Truck, color: 'text-purple-500', bg: 'bg-purple-50', label: 'Đang giao' },
  delivered: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50', label: 'Đã giao' },
  cancelled: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', label: 'Đã hủy' }
};

function OrderCard({ order, onViewDetail }) {
  const formatPrice = (price) => {
    if (!price) return '0đ';
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const status = order.status || order.order_status || 'pending';
  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const StatusIcon = statusConfig.icon;
  const orderNumber = order.orderNumber || order.order_number;
  const totalAmount = order.totalAmount || order.total_amount;
  const itemCount = order.itemCount || order.items?.length || 0;
  const date = order.date || order.created_date;

  // Handle click - open order detail modal or navigate
  const handleClick = (e) => {
    e.preventDefault();
    
    // Dispatch event to open order detail modal
    window.dispatchEvent(new CustomEvent('open-order-detail', {
      detail: { 
        orderId: order.id,
        orderNumber: orderNumber,
        order: order // Pass full order data
      }
    }));
  };

  return (
    <button
      onClick={handleClick}
      className="block w-full text-left bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md hover:border-[#7CB342] transition-all"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-700">#{orderNumber}</span>
        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${statusConfig.bg} ${statusConfig.color}`}>
          <StatusIcon className="w-3 h-3" />
          {statusConfig.label}
        </div>
      </div>

      {/* First item preview */}
      {order.firstItemName && (
        <p className="text-xs text-gray-600 truncate mb-1">{order.firstItemName}</p>
      )}

      {/* Info */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-[#7CB342]">{formatPrice(totalAmount)}</p>
          <p className="text-xs text-gray-500">{itemCount} sản phẩm • {formatDate(date)}</p>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-400" />
      </div>
    </button>
  );
}

function OrderDetailCard({ order }) {
  const formatPrice = (price) => {
    if (!price) return '0đ';
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };

  const status = order.status || order.order_status || 'pending';
  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const StatusIcon = statusConfig.icon;
  const orderNumber = order.orderNumber || order.order_number;
  const totalAmount = order.totalAmount || order.total_amount;
  const trackingNumber = order.trackingNumber || order.tracking_number;

  // Handle view full detail
  const handleViewDetail = () => {
    window.dispatchEvent(new CustomEvent('open-order-detail', {
      detail: { orderId: order.id, orderNumber, order }
    }));
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className={`p-3 ${statusConfig.bg}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StatusIcon className={`w-5 h-5 ${statusConfig.color}`} />
            <div>
              <p className={`font-medium ${statusConfig.color}`}>{statusConfig.label}</p>
              <p className="text-xs text-gray-500">Đơn hàng #{orderNumber}</p>
            </div>
          </div>
          <button 
            onClick={handleViewDetail}
            className="text-xs text-gray-500 hover:text-[#7CB342] underline"
          >
            Chi tiết →
          </button>
        </div>
      </div>

      {/* Items */}
      {order.items?.length > 0 && (
        <div className="p-3 border-t border-gray-100">
          <p className="text-xs text-gray-500 mb-2">Sản phẩm:</p>
          <div className="space-y-1">
            {order.items.slice(0, 3).map((item, i) => (
              <div key={i} className="flex justify-between text-xs">
                <span className="text-gray-700 truncate flex-1 mr-2">
                  {item.name || item.product_name} x{item.quantity}
                </span>
                <span className="text-gray-900 flex-shrink-0">{formatPrice(item.subtotal)}</span>
              </div>
            ))}
            {order.items.length > 3 && (
              <p className="text-xs text-gray-400">+{order.items.length - 3} sản phẩm khác</p>
            )}
          </div>
        </div>
      )}

      {/* Total */}
      <div className="p-3 border-t border-gray-100 bg-gray-50">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Tổng cộng:</span>
          <span className="font-bold text-[#7CB342]">{formatPrice(totalAmount)}</span>
        </div>
      </div>

      {/* Tracking */}
      {trackingNumber && (
        <div className="p-3 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Mã vận đơn: <span className="font-medium text-gray-700">{trackingNumber}</span>
          </p>
        </div>
      )}

      {/* Shipping Address */}
      {(order.shippingAddress || order.shipping_address) && (
        <div className="p-3 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Giao đến: <span className="text-gray-700">{order.shippingAddress || order.shipping_address}</span>
          </p>
        </div>
      )}
    </div>
  );
}

function OrderCardRenderer({ data, type = 'list' }) {
  const { title, message, orders, order, actions } = data;

  // Single order detail
  if (type === 'detail' || order) {
    return (
      <div className="space-y-3">
        {message && <p className="text-sm text-gray-700">{message}</p>}
        <OrderDetailCard order={order} />
        {actions?.length > 0 && (
          <div className="flex gap-2">
            {actions.map((action, i) => (
              <Link
                key={i}
                to={createPageUrl('MyOrders')}
                className="flex-1 text-center py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                {action.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Order list
  if (!orders?.length) return null;

  return (
    <div className="space-y-3">
      {title && <p className="text-sm font-medium text-gray-700">{title}</p>}
      
      <div className="space-y-2">
        {orders.slice(0, 3).map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>

      {orders.length > 3 && (
        <Link
          to={createPageUrl('MyOrders')}
          className="block text-center py-2 text-xs text-[#7CB342] hover:underline"
        >
          Xem tất cả {orders.length} đơn hàng →
        </Link>
      )}

      {actions?.length > 0 && (
        <div className="flex gap-2">
          {actions.map((action, i) => (
            <Link
              key={i}
              to={action.url || createPageUrl('MyOrders')}
              className="flex-1 text-center py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors font-medium"
            >
              {action.label}
            </Link>
          ))}
        </div>
      )}

      {/* Summary stats */}
      {data.summary && (
        <div className="flex gap-2 text-xs text-gray-500">
          {data.summary.pendingCount > 0 && (
            <span className="text-amber-600">⏳ {data.summary.pendingCount} chờ xác nhận</span>
          )}
          {data.summary.shippingCount > 0 && (
            <span className="text-purple-600">🚚 {data.summary.shippingCount} đang giao</span>
          )}
        </div>
      )}
    </div>
  );
}

export default memo(OrderCardRenderer);