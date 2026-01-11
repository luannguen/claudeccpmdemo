import React from 'react';
import { Leaf } from 'lucide-react';

export default function OrderPrintTemplate({ order, ref }) {
  if (!order) return null;

  const productData = order?.data || order;

  return (
    <div ref={ref} className="p-8 bg-white" style={{ width: '210mm', minHeight: '297mm' }}>
      {/* Header */}
      <div className="border-b-2 border-gray-300 pb-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-[#7CB342] rounded-xl flex items-center justify-center">
              <Leaf className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-serif font-bold text-[#0F0F0F]">FARMER SMART</h1>
              <p className="text-sm text-gray-600">100% Organic Products</p>
              <p className="text-xs text-gray-500 mt-1">
                📍 Đường Trần Hưng Đạo, P.10, Đà Lạt<br/>
                📞 098 765 4321 | 📧 info@farmersmart.vn
              </p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold text-[#7CB342]">ĐơN HÀNG</h2>
            <p className="text-sm font-mono font-bold mt-1">#{order.order_number || order.id?.slice(-8)}</p>
            <p className="text-xs text-gray-500 mt-1">
              Ngày: {new Date(order.created_date).toLocaleString('vi-VN')}
            </p>
          </div>
        </div>
      </div>

      {/* Customer Info */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="font-bold text-sm text-gray-600 mb-2">THÔNG TIN KHÁCH HÀNG</h3>
          <div className="space-y-1 text-sm">
            <p><strong>Họ tên:</strong> {order.customer_name}</p>
            <p><strong>Email:</strong> {order.customer_email}</p>
            <p><strong>Điện thoại:</strong> {order.customer_phone}</p>
          </div>
        </div>
        <div>
          <h3 className="font-bold text-sm text-gray-600 mb-2">ĐỊA CHỈ GIAO HÀNG</h3>
          <p className="text-sm">
            {order.shipping_address}
            {order.shipping_ward && `, ${order.shipping_ward}`}
            {order.shipping_district && `, ${order.shipping_district}`}
            {order.shipping_city && `, ${order.shipping_city}`}
          </p>
        </div>
      </div>

      {/* Products Table */}
      <table className="w-full mb-6 border-collapse">
        <thead>
          <tr className="bg-gray-100 border-b-2 border-gray-300">
            <th className="text-left p-3 text-sm font-bold">STT</th>
            <th className="text-left p-3 text-sm font-bold">Sản phẩm</th>
            <th className="text-center p-3 text-sm font-bold">SL</th>
            <th className="text-right p-3 text-sm font-bold">Đơn giá</th>
            <th className="text-right p-3 text-sm font-bold">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          {(order.items || []).map((item, idx) => (
            <tr key={idx} className="border-b border-gray-200">
              <td className="p-3 text-sm">{idx + 1}</td>
              <td className="p-3 text-sm">{item.product_name}</td>
              <td className="p-3 text-center text-sm">{item.quantity}</td>
              <td className="p-3 text-right text-sm">{(item.unit_price || 0).toLocaleString('vi-VN')}đ</td>
              <td className="p-3 text-right text-sm font-medium">{(item.subtotal || 0).toLocaleString('vi-VN')}đ</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary */}
      <div className="flex justify-end mb-6">
        <div className="w-80">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Tạm tính:</span>
              <span className="font-medium">{(order.subtotal || 0).toLocaleString('vi-VN')}đ</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Phí ship:</span>
              <span className="font-medium">{(order.shipping_fee || 0).toLocaleString('vi-VN')}đ</span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Giảm giá:</span>
                <span className="font-medium">-{order.discount_amount.toLocaleString('vi-VN')}đ</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t-2 border-gray-300 text-lg font-bold">
              <span>TỔNG CỘNG:</span>
              <span className="text-[#7CB342]">{(order.total_amount || 0).toLocaleString('vi-VN')}đ</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment & Status Info */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-bold text-sm mb-2">Thanh toán</h3>
          <p className="text-sm">
            <strong>Phương thức:</strong>{' '}
            {order.payment_method === 'bank_transfer' ? 'Chuyển khoản' :
             order.payment_method === 'cod' ? 'COD' :
             order.payment_method === 'momo' ? 'MoMo' :
             order.payment_method === 'vnpay' ? 'VNPay' : order.payment_method}
          </p>
          <p className="text-sm mt-1">
            <strong>Trạng thái:</strong>{' '}
            <span className={`font-bold ${
              order.payment_status === 'paid' ? 'text-green-600' :
              order.payment_status === 'pending' ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {order.payment_status === 'paid' ? 'Đã thanh toán' :
               order.payment_status === 'pending' ? 'Chờ thanh toán' :
               order.payment_status}
            </span>
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-bold text-sm mb-2">Giao hàng</h3>
          <p className="text-sm">
            <strong>Trạng thái:</strong>{' '}
            <span className="font-bold text-blue-600">
              {order.order_status === 'pending' ? 'Chờ xử lý' :
               order.order_status === 'confirmed' ? 'Đã xác nhận' :
               order.order_status === 'shipping' ? 'Đang giao' :
               order.order_status === 'delivered' ? 'Đã giao' :
               order.order_status}
            </span>
          </p>
          {order.tracking_number && (
            <p className="text-sm mt-1">
              <strong>Mã vận đơn:</strong> {order.tracking_number}
            </p>
          )}
        </div>
      </div>

      {/* Notes */}
      {order.note && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="font-bold text-sm mb-1">Ghi chú khách hàng</h3>
          <p className="text-sm">{order.note}</p>
        </div>
      )}

      {/* Footer */}
      <div className="border-t-2 border-gray-300 pt-6 mt-12">
        <p className="text-xs text-gray-500 text-center">
          Cảm ơn quý khách đã tin tưởng sử dụng sản phẩm của Farmer Smart!<br/>
          🌱 100% Organic • ✅ An Toàn • 🚚 Giao Nhanh
        </p>
      </div>
    </div>
  );
}