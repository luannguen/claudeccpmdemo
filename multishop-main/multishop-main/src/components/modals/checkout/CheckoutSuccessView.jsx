import React from 'react';
import { CheckCircle, Eye, ArrowLeft, User, MapPin, Wallet, Calendar, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function CheckoutSuccessView({ 
  orderNumber, 
  createdOrder,
  showOrderDetail,
  setShowOrderDetail,
  onClose 
}) {
  const navigate = useNavigate();

  // Check if this is a preorder with deposit
  const hasDeposit = createdOrder?.deposit_status === 'pending' && createdOrder?.remaining_amount > 0;
  const hasPreorderItems = createdOrder?.has_preorder_items;

  if (showOrderDetail && createdOrder) {
    return (
      <OrderDetailView 
        orderNumber={orderNumber}
        order={createdOrder}
        onBack={() => setShowOrderDetail(false)}
        onClose={onClose}
        navigate={navigate}
      />
    );
  }

  return (
    <div className="text-center py-8">
      <div className={`w-20 h-20 ${hasDeposit ? 'bg-amber-100' : 'bg-green-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
        {hasDeposit ? (
          <Wallet className="w-12 h-12 text-amber-600" />
        ) : (
          <CheckCircle className="w-12 h-12 text-green-600" />
        )}
      </div>
      <h3 className="text-2xl sm:text-3xl font-bold mb-3 text-[#0F0F0F]">
        {hasDeposit ? '💰 Đặt Cọc Thành Công!' : '🎉 Đặt Hàng Thành Công!'}
      </h3>
      <p className="text-base sm:text-lg text-gray-600 mb-1">Mã đơn hàng:</p>
      <p className="text-xl sm:text-2xl font-bold text-[#7CB342] mb-4">#{orderNumber}</p>
      
      {/* Deposit Info */}
      {hasDeposit && (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 mb-4 text-left max-w-md mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-5 h-5 text-amber-600" />
            <span className="font-bold text-amber-800">Thông tin đặt cọc</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Đã cọc:</span>
              <span className="font-bold text-amber-600">
                {(createdOrder?.deposit_amount || 0).toLocaleString('vi-VN')}đ
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Còn lại khi nhận:</span>
              <span className="font-bold text-gray-700">
                {(createdOrder?.remaining_amount || 0).toLocaleString('vi-VN')}đ
              </span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-amber-200 flex items-center gap-2 text-xs text-amber-700">
            <Clock className="w-4 h-4" />
            <span>Chúng tôi sẽ liên hệ bạn khi hàng sẵn sàng giao</span>
          </div>
        </div>
      )}

      {/* Pre-Order Note */}
      {hasPreorderItems && !hasDeposit && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4 text-left max-w-md mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-green-600" />
            <span className="font-bold text-green-800">Đơn hàng Pre-Order</span>
          </div>
          <p className="text-sm text-gray-600">
            Sản phẩm sẽ được giao khi thu hoạch. Chúng tôi sẽ thông báo trước ngày giao hàng.
          </p>
        </div>
      )}

      {/* Regular Order Info */}
      {!hasPreorderItems && (
        <div className="bg-blue-50 rounded-xl p-4 mb-6 text-left max-w-md mx-auto">
          <p className="text-sm text-gray-700 mb-2">✅ Đơn hàng đang chờ xử lý</p>
          <p className="text-xs text-gray-600">
            Bạn có thể theo dõi và quản lý đơn hàng tại trang "Đơn Hàng Của Tôi"
          </p>
        </div>
      )}

      <div className="flex gap-3 justify-center">
        <button onClick={onClose}
          className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors">
          Đóng
        </button>
        <button 
          onClick={() => setShowOrderDetail(true)}
          className="bg-gradient-to-r from-[#7CB342] to-[#5a8f31] text-white px-6 py-3 rounded-xl font-medium hover:from-[#FF9800] hover:to-[#ff6b00] transition-all shadow-lg flex items-center gap-2">
          <Eye className="w-5 h-5" />
          Xem Đơn Hàng
        </button>
      </div>
    </div>
  );
}

function OrderDetailView({ orderNumber, order, onBack, onClose, navigate }) {
  return (
    <div className="space-y-4">
      <button onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-[#7CB342] transition-colors mb-4">
        <ArrowLeft className="w-4 h-4" />
        Quay lại
      </button>

      <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-6 border-2 border-green-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
            <CheckCircle className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-green-900">Đơn Hàng Đã Tạo</h3>
            <p className="text-sm text-green-700">#{orderNumber}</p>
          </div>
        </div>
      </div>

      {/* Customer Info */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <h4 className="font-bold mb-3 flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-[#7CB342]" />
            Thông Tin Khách Hàng
          </h4>
          <div className="space-y-2 text-sm">
            <p><strong>Tên:</strong> {order.customer_name}</p>
            <p><strong>SĐT:</strong> {order.customer_phone}</p>
            <p><strong>Email:</strong> {order.customer_email}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <h4 className="font-bold mb-3 flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-[#7CB342]" />
            Địa Chỉ Giao Hàng
          </h4>
          <p className="text-sm text-gray-700">
            {order.shipping_address}
            {order.shipping_ward && `, ${order.shipping_ward}`}
            {order.shipping_district && `, ${order.shipping_district}`}
            {order.shipping_city && `, ${order.shipping_city}`}
          </p>
        </div>
      </div>

      {/* Products */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <h4 className="font-bold p-4 bg-gray-50 border-b text-sm">Sản Phẩm</h4>
        <div className="divide-y">
          {(order.items || []).map((item, idx) => (
            <div key={idx} className="p-4 flex justify-between items-center">
              <div>
                <p className="font-medium text-sm">{item.product_name}</p>
                <p className="text-xs text-gray-600">x{item.quantity}</p>
              </div>
              <p className="font-bold text-[#7CB342]">{(item.subtotal || 0).toLocaleString('vi-VN')}đ</p>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className={`${order.deposit_status === 'pending' && order.remaining_amount > 0 ? 'bg-gradient-to-br from-amber-500 to-orange-500' : 'bg-gradient-to-br from-[#7CB342] to-[#5a8f31]'} text-white rounded-xl p-4`}>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Tạm tính:</span>
            <span className="font-bold">{(order.subtotal || 0).toLocaleString('vi-VN')}đ</span>
          </div>
          <div className="flex justify-between">
            <span>Phí ship:</span>
            <span className="font-bold">{(order.shipping_fee || 0).toLocaleString('vi-VN')}đ</span>
          </div>
          {order.discount_amount > 0 && (
            <div className="flex justify-between text-yellow-300">
              <span>Giảm giá:</span>
              <span className="font-bold">-{order.discount_amount.toLocaleString('vi-VN')}đ</span>
            </div>
          )}
          <div className="flex justify-between pt-2 border-t border-white/30">
            <span>Tổng đơn hàng:</span>
            <span className="font-bold">{(order.total_amount || 0).toLocaleString('vi-VN')}đ</span>
          </div>
          
          {/* Deposit Info */}
          {order.deposit_status === 'pending' && order.remaining_amount > 0 && (
            <>
              <div className="flex justify-between pt-2 border-t border-white/20">
                <span className="flex items-center gap-1">
                  <Wallet className="w-4 h-4" />
                  Đã đặt cọc:
                </span>
                <span className="font-bold">{(order.deposit_amount || 0).toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="flex justify-between opacity-80">
                <span>Còn lại khi nhận:</span>
                <span className="font-bold">{(order.remaining_amount || 0).toLocaleString('vi-VN')}đ</span>
              </div>
            </>
          )}
          
          {/* Full payment display */}
          {(!order.remaining_amount || order.remaining_amount === 0) && (
            <div className="flex justify-between text-lg font-bold">
              <span>Đã thanh toán:</span>
              <span>{(order.total_amount || 0).toLocaleString('vi-VN')}đ</span>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button onClick={onClose}
          className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors">
          Đóng
        </button>
        <button
          onClick={() => {
            onClose();
            setTimeout(() => navigate(createPageUrl('MyOrders')), 100);
          }}
          className="flex-1 bg-blue-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-600 transition-colors">
          Đến Đơn Hàng Của Tôi
        </button>
      </div>
    </div>
  );
}