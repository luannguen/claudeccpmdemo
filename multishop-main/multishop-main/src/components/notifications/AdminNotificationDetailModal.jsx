/**
 * 🔍 Admin Notification Detail Modal - Kế thừa EnhancedModal
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, Package, Users, Star, AlertCircle, DollarSign,
  ShoppingCart, TrendingDown, AlertTriangle, CreditCard,
  Calendar, Clock, ExternalLink, User, Mail, Phone
} from 'lucide-react';
import EnhancedModal from '@/components/EnhancedModal';
import { createPageUrl } from '@/utils';

const NOTIFICATION_CONFIG = {
  new_order: { icon: Package, color: 'blue', label: 'Đơn Hàng Mới' },
  payment_verification_needed: { icon: CreditCard, color: 'orange', label: 'Xác Minh Thanh Toán' },
  payment_received: { icon: DollarSign, color: 'green', label: 'Đã Thanh Toán' },
  payment_failed: { icon: AlertCircle, color: 'red', label: 'Thanh Toán Thất Bại' },
  low_stock: { icon: TrendingDown, color: 'orange', label: 'Sắp Hết Hàng' },
  out_of_stock: { icon: AlertTriangle, color: 'red', label: 'Hết Hàng' },
  new_customer: { icon: Users, color: 'green', label: 'Khách Hàng Mới' },
  new_review: { icon: Star, color: 'yellow', label: 'Đánh Giá Mới' },
  order_status_change: { icon: ShoppingCart, color: 'purple', label: 'Cập Nhật Đơn Hàng' },
  system_alert: { icon: Bell, color: 'gray', label: 'Cảnh Báo Hệ Thống' }
};

const PRIORITY_CONFIG = {
  urgent: { bg: 'bg-red-500', text: 'text-white', label: 'KHẨN CẤP', ring: 'ring-red-200' },
  high: { bg: 'bg-orange-500', text: 'text-white', label: 'CAO', ring: 'ring-orange-200' },
  normal: { bg: 'bg-blue-500', text: 'text-white', label: 'BÌNH THƯỜNG', ring: 'ring-blue-200' },
  low: { bg: 'bg-gray-400', text: 'text-white', label: 'THẤP', ring: 'ring-gray-200' }
};

export default function AdminNotificationDetailModal({ isOpen, onClose, notification, onMarkAsRead, onNavigateToOrder }) {
  const navigate = useNavigate();
  
  if (!notification) return null;

  const config = NOTIFICATION_CONFIG[notification.type] || NOTIFICATION_CONFIG.system_alert;
  const Icon = config.icon;
  const priorityConfig = PRIORITY_CONFIG[notification.priority] || PRIORITY_CONFIG.normal;

  const handleActionClick = () => {
    if (!notification.is_read && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
    
    onClose();
    
    // Smart routing based on notification type
    const orderId = notification.metadata?.order_id || notification.related_entity_id;
    
    // For order-related notifications, use callback to navigate + open modal
    if (orderId && ['new_order', 'payment_verification_needed', 'payment_received', 'order_status_change'].includes(notification.type)) {
      if (onNavigateToOrder) {
        onNavigateToOrder(orderId);
      } else {
        // Fallback: navigate with query param
        navigate(createPageUrl(`AdminOrders?orderId=${orderId}`));
      }
      return;
    }
    
    // For customer_inquiry, navigate to AdminMessages
    if (notification.type === 'customer_inquiry' && orderId) {
      navigate(createPageUrl(`AdminMessages?orderId=${orderId}`));
      return;
    }
    
    // For other notifications with link
    if (notification.link) {
      // Map legacy paths to Base44 page names
      const legacyPathMap = {
        '/admin/orders': 'AdminOrders',
        '/admin/payment-verification': 'AdminPaymentVerification',
        '/admin/customers': 'AdminCustomers',
        '/admin/products': 'AdminProducts',
        '/admin/reviews': 'AdminReviews',
        '/admin/inventory': 'AdminInventory',
        '/admin/dashboard': 'AdminDashboard',
        '/admin/settings': 'AdminSettings',
        '/admin/messages': 'AdminMessages',
      };
      
      let linkValue = notification.link;
      const basePath = linkValue.split('?')[0];
      
      if (legacyPathMap[basePath]) {
        const pageName = legacyPathMap[basePath];
        const queryParams = linkValue.includes('?') ? linkValue.substring(linkValue.indexOf('?') + 1) : '';
        const targetUrl = queryParams ? createPageUrl(`${pageName}?${queryParams}`) : createPageUrl(pageName);
        navigate(targetUrl);
      } else if (!linkValue.startsWith('/') && !linkValue.startsWith('http')) {
        navigate(createPageUrl(linkValue));
      } else {
        navigate(linkValue);
      }
    }
  };

  return (
    <EnhancedModal
      isOpen={isOpen}
      onClose={onClose}
      title="Chi Tiết Thông Báo"
      size="medium"
    >
      <div className="space-y-6">
        {/* Header Section */}
        <div className={`bg-${config.color}-50 rounded-xl p-6 border-2 border-${config.color}-200`}>
          <div className="flex items-start gap-4">
            <div className={`w-16 h-16 rounded-2xl bg-${config.color}-100 flex items-center justify-center flex-shrink-0`}>
              <Icon className={`w-8 h-8 text-${config.color}-600`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-3 py-1 ${priorityConfig.bg} ${priorityConfig.text} text-xs font-bold rounded-full uppercase`}>
                  {priorityConfig.label}
                </span>
                {notification.requires_action && (
                  <span className="px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-full uppercase">
                    CẦN XỬ LÝ
                  </span>
                )}
                {!notification.is_read && (
                  <div className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded-full">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    CHƯA ĐỌC
                  </div>
                )}
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">{notification.title}</h2>
              <p className={`text-sm px-3 py-1 bg-${config.color}-100 text-${config.color}-700 rounded-lg inline-block font-medium`}>
                {config.label}
              </p>
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Nội Dung</h3>
          <p className="text-gray-900 leading-relaxed">{notification.message}</p>
        </div>

        {/* Metadata */}
        {notification.metadata && Object.keys(notification.metadata).length > 0 && (
          <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
            <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide">Chi Tiết</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {notification.metadata.order_number && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Mã Đơn Hàng</p>
                    <p className="font-mono font-bold text-gray-900">#{notification.metadata.order_number}</p>
                  </div>
                </div>
              )}

              {notification.metadata.amount && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Số Tiền</p>
                    <p className="font-bold text-green-600">
                      {notification.metadata.amount.toLocaleString('vi-VN')}đ
                    </p>
                  </div>
                </div>
              )}

              {notification.metadata.customer_name && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Khách Hàng</p>
                    <p className="font-medium text-gray-900">{notification.metadata.customer_name}</p>
                  </div>
                </div>
              )}

              {notification.metadata.customer_email && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm text-gray-900">{notification.metadata.customer_email}</p>
                  </div>
                </div>
              )}

              {notification.metadata.product_name && (
                <div className="flex items-center gap-3 sm:col-span-2">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Sản Phẩm</p>
                    <p className="font-medium text-gray-900">{notification.metadata.product_name}</p>
                  </div>
                </div>
              )}

              {notification.metadata.stock_quantity !== undefined && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <TrendingDown className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Tồn Kho</p>
                    <p className="font-bold text-orange-600">{notification.metadata.stock_quantity} sản phẩm</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Timestamps */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>Tạo lúc: <span className="font-medium text-gray-900">
                {new Date(notification.created_date).toLocaleString('vi-VN')}
              </span></span>
            </div>
            {notification.read_date && (
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4" />
                <span>Đọc lúc: <span className="font-medium text-gray-900">
                  {new Date(notification.read_date).toLocaleString('vi-VN')}
                </span></span>
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        {notification.link && (
          <button
            onClick={handleActionClick}
            className="w-full bg-[#7CB342] text-white py-3 px-6 rounded-xl font-bold hover:bg-[#FF9800] transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
          >
            <ExternalLink className="w-5 h-5" />
            {notification.requires_action ? 'Đi Đến & Xử Lý Ngay' : 'Xem Chi Tiết'}
          </button>
        )}
      </div>
    </EnhancedModal>
  );
}