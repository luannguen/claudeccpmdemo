/**
 * Order Handbook - Sổ tay Admin về Quản lý Đơn hàng
 * Hướng dẫn chi tiết về quy trình, workflow, thuật ngữ
 */

import React, { useState } from 'react';
import { Icon } from '@/components/ui/AnimatedIcon.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart, CreditCard, Truck, Package, 
  Clock, CheckCircle, XCircle, RefreshCw,
  Users, FileText, Bell, Settings
} from 'lucide-react';

// ========== SECTION COMPONENTS ==========

function OverviewSection() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon.ShoppingCart size={24} className="text-green-600" />
            Tổng Quan Hệ Thống Đơn Hàng
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-green-50 rounded-xl">
            <h4 className="font-bold text-green-900 mb-2">🛒 Đơn hàng là gì?</h4>
            <p className="text-green-800 text-sm">
              Đơn hàng (Order) là giao dịch mua bán giữa khách hàng và shop. 
              Mỗi đơn chứa thông tin: sản phẩm, số lượng, giá, thông tin giao hàng, 
              trạng thái thanh toán và vận chuyển.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3">📋 Các loại đơn hàng:</h4>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <h5 className="font-semibold text-blue-900">🛍️ Đơn thường (Regular)</h5>
                <p className="text-sm text-blue-800">Sản phẩm có sẵn, giao ngay sau khi thanh toán</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <h5 className="font-semibold text-green-900">🌾 Đơn Pre-Order</h5>
                <p className="text-sm text-green-800">Đặt trước, cọc → chờ thu hoạch → thanh toán → giao</p>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg">
                <h5 className="font-semibold text-amber-900">💵 Đơn COD</h5>
                <p className="text-sm text-amber-800">Thanh toán khi nhận hàng (Cash On Delivery)</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <h5 className="font-semibold text-purple-900">💳 Đơn Prepaid</h5>
                <p className="text-sm text-purple-800">Thanh toán trước qua VNPay, MoMo, chuyển khoản</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3">📊 Vòng đời đơn hàng:</h4>
            <div className="space-y-2">
              {[
                { step: 1, status: 'pending', title: 'Chờ xác nhận', desc: 'Đơn mới tạo, chờ admin xác nhận' },
                { step: 2, status: 'confirmed', title: 'Đã xác nhận', desc: 'Admin đã xác nhận, chuẩn bị hàng' },
                { step: 3, status: 'processing', title: 'Đang xử lý', desc: 'Đóng gói, chuẩn bị giao' },
                { step: 4, status: 'shipping', title: 'Đang giao', desc: 'Đã bàn giao cho shipper' },
                { step: 5, status: 'delivered', title: 'Đã giao', desc: 'Khách đã nhận hàng thành công' },
                { step: 6, status: 'completed', title: 'Hoàn thành', desc: 'Đơn hoàn tất, đã đối soát' },
              ].map(item => (
                <div key={item.step} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {item.step}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{item.title}</span>
                      <Badge variant="outline" className="text-xs">{item.status}</Badge>
                    </div>
                    <p className="text-sm text-gray-600">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Terms */}
      <Card>
        <CardHeader>
          <CardTitle>📚 Thuật Ngữ Quan Trọng</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { term: 'Order Number', def: 'Mã đơn hàng unique, format: ORD-XXXXX' },
              { term: 'SKU', def: 'Stock Keeping Unit - Mã quản lý sản phẩm trong kho' },
              { term: 'COD', def: 'Cash On Delivery - Thanh toán khi nhận hàng' },
              { term: 'Prepaid', def: 'Thanh toán trước qua các cổng thanh toán' },
              { term: 'Subtotal', def: 'Tổng tiền sản phẩm chưa bao gồm phí ship' },
              { term: 'Total', def: 'Tổng tiền đơn hàng bao gồm ship và giảm giá' },
              { term: 'Discount', def: 'Giảm giá từ coupon hoặc chương trình khuyến mãi' },
              { term: 'Shipping Fee', def: 'Phí vận chuyển tính theo địa chỉ và trọng lượng' },
            ].map(item => (
              <div key={item.term} className="p-3 bg-gray-50 rounded-lg">
                <span className="font-bold text-gray-900">{item.term}:</span>
                <span className="text-gray-600 ml-2 text-sm">{item.def}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatusSection() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-6 h-6 text-blue-600" />
            Trạng Thái Đơn Hàng
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-xl">
            <h4 className="font-bold text-blue-900 mb-2">📊 Order Status là gì?</h4>
            <p className="text-blue-800 text-sm">
              Trạng thái đơn hàng cho biết đơn đang ở bước nào trong quy trình. 
              Mỗi lần chuyển trạng thái, hệ thống có thể tự động gửi email/SMS thông báo cho khách.
            </p>
          </div>

          <div className="border rounded-xl p-4">
            <h4 className="font-bold text-gray-900 mb-3">Các trạng thái chính:</h4>
            <div className="space-y-3">
              {[
                { 
                  status: 'pending', 
                  label: 'Chờ xác nhận', 
                  color: 'bg-yellow-100 text-yellow-800',
                  icon: '⏳',
                  desc: 'Đơn mới tạo, chờ admin xem xét và xác nhận',
                  actions: ['Xác nhận đơn', 'Hủy đơn']
                },
                { 
                  status: 'confirmed', 
                  label: 'Đã xác nhận', 
                  color: 'bg-blue-100 text-blue-800',
                  icon: '✅',
                  desc: 'Admin đã xác nhận, bắt đầu chuẩn bị hàng',
                  actions: ['Chuyển sang xử lý', 'Hủy đơn']
                },
                { 
                  status: 'processing', 
                  label: 'Đang xử lý', 
                  color: 'bg-indigo-100 text-indigo-800',
                  icon: '📦',
                  desc: 'Đang đóng gói, chuẩn bị giao cho vận chuyển',
                  actions: ['Tạo vận đơn', 'Hủy đơn']
                },
                { 
                  status: 'shipping', 
                  label: 'Đang giao', 
                  color: 'bg-cyan-100 text-cyan-800',
                  icon: '🚚',
                  desc: 'Đã bàn giao cho shipper, đang trên đường giao',
                  actions: ['Cập nhật tracking', 'Xác nhận đã giao']
                },
                { 
                  status: 'delivered', 
                  label: 'Đã giao', 
                  color: 'bg-green-100 text-green-800',
                  icon: '🎉',
                  desc: 'Khách đã nhận hàng thành công',
                  actions: ['Hoàn thành đơn', 'Xử lý khiếu nại']
                },
                { 
                  status: 'completed', 
                  label: 'Hoàn thành', 
                  color: 'bg-emerald-100 text-emerald-800',
                  icon: '✨',
                  desc: 'Đơn đã hoàn tất hoàn toàn',
                  actions: ['Xem lịch sử']
                },
                { 
                  status: 'cancelled', 
                  label: 'Đã hủy', 
                  color: 'bg-red-100 text-red-800',
                  icon: '❌',
                  desc: 'Đơn bị hủy bởi admin hoặc khách',
                  actions: ['Xem lý do hủy', 'Hoàn tiền (nếu đã thanh toán)']
                },
              ].map(item => (
                <div key={item.status} className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <Badge className={item.color}>{item.label}</Badge>
                      <code className="ml-2 text-xs bg-gray-200 px-1 rounded">{item.status}</code>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{item.desc}</p>
                  <div className="flex flex-wrap gap-1">
                    <span className="text-xs text-gray-500">Actions:</span>
                    {item.actions.map(action => (
                      <Badge key={action} variant="outline" className="text-xs">{action}</Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-amber-50 rounded-xl">
            <h4 className="font-bold text-amber-900 mb-2">⚠️ Lưu ý quan trọng:</h4>
            <ul className="text-sm text-amber-800 space-y-1">
              <li>• Chỉ có thể hủy đơn khi chưa shipping</li>
              <li>• Đơn COD có thể bị hoàn khi khách từ chối nhận</li>
              <li>• Đơn prepaid phải hoàn tiền khi hủy</li>
              <li>• Mỗi lần đổi trạng thái được ghi log để audit</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PaymentSection() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-purple-600" />
            Thanh Toán & Payment Methods
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-purple-50 rounded-xl">
            <h4 className="font-bold text-purple-900 mb-2">💳 Payment Status là gì?</h4>
            <p className="text-purple-800 text-sm">
              Trạng thái thanh toán theo dõi tiền đã được thu hay chưa, 
              tách biệt với trạng thái đơn hàng.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="border rounded-xl p-4">
              <h5 className="font-bold text-gray-900 mb-3">Payment Status:</h5>
              <div className="space-y-2">
                {[
                  { status: 'pending', label: 'Chờ thanh toán', color: 'bg-yellow-100 text-yellow-800' },
                  { status: 'partial', label: 'Thanh toán một phần', color: 'bg-orange-100 text-orange-800' },
                  { status: 'paid', label: 'Đã thanh toán', color: 'bg-green-100 text-green-800' },
                  { status: 'refunded', label: 'Đã hoàn tiền', color: 'bg-red-100 text-red-800' },
                  { status: 'failed', label: 'Thanh toán thất bại', color: 'bg-gray-100 text-gray-800' },
                ].map(item => (
                  <div key={item.status} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <Badge className={item.color}>{item.label}</Badge>
                    <code className="text-xs">{item.status}</code>
                  </div>
                ))}
              </div>
            </div>

            <div className="border rounded-xl p-4">
              <h5 className="font-bold text-gray-900 mb-3">Payment Methods:</h5>
              <div className="space-y-2">
                {[
                  { method: 'cod', label: 'COD', desc: 'Thanh toán khi nhận hàng' },
                  { method: 'bank_transfer', label: 'Chuyển khoản', desc: 'QR code VietQR' },
                  { method: 'vnpay', label: 'VNPay', desc: 'Cổng thanh toán VNPay' },
                  { method: 'momo', label: 'MoMo', desc: 'Ví điện tử MoMo' },
                  { method: 'wallet', label: 'Ví nội bộ', desc: 'Tiền trong ví escrow' },
                ].map(item => (
                  <div key={item.method} className="p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{item.label}</Badge>
                      <code className="text-xs text-gray-500">{item.method}</code>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-xl">
            <h4 className="font-bold text-blue-900 mb-2">🔄 Quy trình thanh toán COD:</h4>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. Khách đặt hàng, chọn COD</li>
              <li>2. Admin xác nhận, giao cho shipper</li>
              <li>3. Shipper giao hàng, thu tiền mặt</li>
              <li>4. Shipper đối soát với shop</li>
              <li>5. Update payment_status = paid</li>
            </ol>
          </div>

          <div className="p-4 bg-green-50 rounded-xl">
            <h4 className="font-bold text-green-900 mb-2">💰 Quy trình thanh toán Online:</h4>
            <ol className="text-sm text-green-800 space-y-1">
              <li>1. Khách đặt hàng, chọn VNPay/MoMo</li>
              <li>2. Redirect sang cổng thanh toán</li>
              <li>3. Thanh toán thành công → callback</li>
              <li>4. Hệ thống update payment_status = paid</li>
              <li>5. Gửi email xác nhận</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Xác minh thanh toán */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-600" />
            Xác Minh Thanh Toán Chuyển Khoản
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Với đơn chuyển khoản, cần xác minh thủ công hoặc tự động qua API ngân hàng.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-3 bg-amber-50 rounded-lg">
              <h5 className="font-semibold text-amber-900 mb-2">Xác minh thủ công:</h5>
              <ul className="text-sm text-amber-800 space-y-1">
                <li>• Khách chụp ảnh bill chuyển khoản</li>
                <li>• Admin vào Payment Verification</li>
                <li>• Kiểm tra số tiền, nội dung CK</li>
                <li>• Approve → Update payment status</li>
              </ul>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-2">Xác minh tự động:</h5>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Tích hợp API ngân hàng (casso, sepay...)</li>
                <li>• Nhận webhook khi có giao dịch</li>
                <li>• Match theo nội dung CK = mã đơn</li>
                <li>• Auto update payment status</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ShippingSection() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="w-6 h-6 text-cyan-600" />
            Vận Chuyển & Giao Hàng
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-cyan-50 rounded-xl">
            <h4 className="font-bold text-cyan-900 mb-2">🚚 Quy trình giao hàng:</h4>
            <p className="text-cyan-800 text-sm">
              Sau khi đơn được xác nhận và đóng gói, bước tiếp theo là giao cho đơn vị vận chuyển 
              hoặc shipper nội bộ để giao đến khách.
            </p>
          </div>

          <div className="border rounded-xl p-4">
            <h4 className="font-bold text-gray-900 mb-3">Thông tin giao hàng trong Order:</h4>
            <div className="bg-gray-50 rounded-lg p-3 text-sm">
              <ul className="space-y-1 text-gray-700">
                <li>• <code className="bg-gray-200 px-1 rounded">shipping_address</code> - Địa chỉ giao hàng đầy đủ</li>
                <li>• <code className="bg-gray-200 px-1 rounded">shipping_phone</code> - SĐT người nhận</li>
                <li>• <code className="bg-gray-200 px-1 rounded">shipping_name</code> - Tên người nhận</li>
                <li>• <code className="bg-gray-200 px-1 rounded">shipping_method</code> - Phương thức (express/standard)</li>
                <li>• <code className="bg-gray-200 px-1 rounded">shipping_fee</code> - Phí vận chuyển</li>
                <li>• <code className="bg-gray-200 px-1 rounded">tracking_number</code> - Mã vận đơn</li>
                <li>• <code className="bg-gray-200 px-1 rounded">shipping_provider</code> - Đơn vị vận chuyển</li>
              </ul>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-2">Đơn vị vận chuyển phổ biến:</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• GHN (Giao Hàng Nhanh)</li>
                <li>• GHTK (Giao Hàng Tiết Kiệm)</li>
                <li>• Viettel Post</li>
                <li>• J&T Express</li>
                <li>• Shipper nội bộ</li>
              </ul>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-2">Tính phí ship:</h5>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Theo khoảng cách (km)</li>
                <li>• Theo trọng lượng (kg)</li>
                <li>• Theo kích thước (dài x rộng x cao)</li>
                <li>• Free ship đơn từ X đồng</li>
                <li>• Voucher free ship</li>
              </ul>
            </div>
          </div>

          <div className="p-4 bg-amber-50 rounded-xl">
            <h4 className="font-bold text-amber-900 mb-2">📦 Các trường hợp đặc biệt:</h4>
            <div className="text-sm text-amber-800 space-y-2">
              <div className="p-2 bg-white rounded">
                <strong>Giao thất bại lần 1:</strong> Shipper liên hệ lại, hẹn giao lần 2
              </div>
              <div className="p-2 bg-white rounded">
                <strong>Giao thất bại 3 lần:</strong> Hoàn hàng về shop, liên hệ khách
              </div>
              <div className="p-2 bg-white rounded">
                <strong>Khách từ chối nhận (COD):</strong> Hoàn hàng, đơn chuyển cancelled
              </div>
              <div className="p-2 bg-white rounded">
                <strong>Địa chỉ sai:</strong> Liên hệ khách cập nhật, giao lại
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CustomerSection() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" />
            Thông Tin Khách Hàng
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-indigo-50 rounded-xl">
            <h4 className="font-bold text-indigo-900 mb-2">👤 Customer trong Order:</h4>
            <p className="text-indigo-800 text-sm">
              Mỗi đơn hàng liên kết với một khách hàng (Customer entity). 
              Thông tin khách được lưu để phục vụ CRM, remarketing, loyalty.
            </p>
          </div>

          <div className="border rounded-xl p-4">
            <h4 className="font-bold text-gray-900 mb-3">Thông tin khách trong Order:</h4>
            <div className="grid md:grid-cols-2 gap-3 text-sm">
              <div className="p-2 bg-gray-50 rounded">
                <strong>customer_name</strong>
                <p className="text-gray-600">Họ tên khách hàng</p>
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <strong>customer_email</strong>
                <p className="text-gray-600">Email để gửi thông báo</p>
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <strong>customer_phone</strong>
                <p className="text-gray-600">SĐT liên hệ</p>
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <strong>customer_id</strong>
                <p className="text-gray-600">Link đến Customer entity</p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-2">✅ Khách có tài khoản:</h5>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Lịch sử đơn hàng</li>
                <li>• Tích điểm Loyalty</li>
                <li>• Có thể là Referral member</li>
                <li>• Địa chỉ đã lưu</li>
              </ul>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg">
              <h5 className="font-semibold text-amber-900 mb-2">👤 Khách vãng lai (Guest):</h5>
              <ul className="text-sm text-amber-800 space-y-1">
                <li>• Không cần đăng ký</li>
                <li>• Nhập thông tin khi checkout</li>
                <li>• Vẫn track được qua email/phone</li>
                <li>• Có thể convert thành member</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CancellationSection() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="w-6 h-6 text-red-600" />
            Hủy Đơn & Hoàn Tiền
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-red-50 rounded-xl">
            <h4 className="font-bold text-red-900 mb-2">❌ Khi nào có thể hủy đơn?</h4>
            <p className="text-red-800 text-sm">
              Đơn có thể bị hủy bởi khách hoặc admin ở các giai đoạn khác nhau, 
              với các quy định hoàn tiền khác nhau.
            </p>
          </div>

          <div className="border rounded-xl p-4">
            <h4 className="font-bold text-gray-900 mb-3">Ai có thể hủy đơn?</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <h5 className="font-semibold text-blue-900 mb-2">Khách hàng:</h5>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Hủy khi đơn còn pending</li>
                  <li>• Hủy khi confirmed (chờ admin duyệt)</li>
                  <li>• Không thể hủy khi đang shipping</li>
                </ul>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <h5 className="font-semibold text-purple-900 mb-2">Admin:</h5>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>• Hủy được ở mọi trạng thái (trừ completed)</li>
                  <li>• Hết hàng / không liên lạc được khách</li>
                  <li>• Phát hiện gian lận</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="p-4 bg-amber-50 rounded-xl">
            <h4 className="font-bold text-amber-900 mb-2">💰 Chính sách hoàn tiền:</h4>
            <div className="space-y-2 text-sm text-amber-800">
              <div className="p-2 bg-white rounded">
                <strong>Đơn COD chưa giao:</strong> Không cần hoàn tiền
              </div>
              <div className="p-2 bg-white rounded">
                <strong>Đơn prepaid, khách hủy:</strong> Hoàn 100% qua phương thức gốc
              </div>
              <div className="p-2 bg-white rounded">
                <strong>Đơn prepaid, admin hủy:</strong> Hoàn 100% + có thể tặng voucher xin lỗi
              </div>
              <div className="p-2 bg-white rounded">
                <strong>Pre-order đã cọc:</strong> Theo policy hoàn tiền riêng (xem tab Pre-Order)
              </div>
            </div>
          </div>

          <div className="border rounded-xl p-4">
            <h4 className="font-bold text-gray-900 mb-3">Lý do hủy đơn phổ biến:</h4>
            <div className="flex flex-wrap gap-2">
              {[
                'Khách đổi ý',
                'Hết hàng',
                'Không liên lạc được',
                'Giá sai',
                'Địa chỉ sai',
                'Duplicate order',
                'Fraud detected',
                'Khách từ chối nhận (COD)',
              ].map(reason => (
                <Badge key={reason} variant="outline">{reason}</Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function NotificationSection() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-6 h-6 text-amber-600" />
            Thông Báo Đơn Hàng
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-amber-50 rounded-xl">
            <h4 className="font-bold text-amber-900 mb-2">📬 Hệ thống thông báo:</h4>
            <p className="text-amber-800 text-sm">
              Hệ thống tự động gửi thông báo cho khách hàng qua Email/SMS 
              ở các mốc quan trọng của đơn hàng.
            </p>
          </div>

          <div className="border rounded-xl p-4">
            <h4 className="font-bold text-gray-900 mb-3">Các loại thông báo tự động:</h4>
            <div className="space-y-3">
              {[
                { trigger: 'Đặt hàng thành công', template: 'order_confirmation', channels: ['Email', 'SMS'] },
                { trigger: 'Thanh toán thành công', template: 'payment_confirmed', channels: ['Email'] },
                { trigger: 'Đơn đang giao', template: 'shipping_notification', channels: ['Email', 'SMS'] },
                { trigger: 'Đã giao hàng', template: 'delivery_confirmation', channels: ['Email'] },
                { trigger: 'Đơn bị hủy', template: 'order_cancelled', channels: ['Email'] },
                { trigger: 'Yêu cầu đánh giá', template: 'review_request', channels: ['Email'] },
              ].map(item => (
                <div key={item.template} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{item.trigger}</p>
                    <code className="text-xs text-gray-500">{item.template}</code>
                  </div>
                  <div className="flex gap-1">
                    {item.channels.map(ch => (
                      <Badge key={ch} variant="outline" className="text-xs">{ch}</Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-xl">
            <h4 className="font-bold text-blue-900 mb-2">⚙️ Cấu hình Email Templates:</h4>
            <p className="text-sm text-blue-800 mb-2">
              Admin có thể tùy chỉnh nội dung email tại:
            </p>
            <p className="text-sm font-medium text-blue-900">
              Admin → Settings → Email Templates
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AdminActionsSection() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-6 h-6 text-gray-600" />
            Thao Tác Admin
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-xl">
            <h4 className="font-bold text-gray-900 mb-2">🔧 Các thao tác phổ biến:</h4>
            <p className="text-gray-700 text-sm">
              Hướng dẫn các thao tác admin thường dùng khi quản lý đơn hàng.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                action: 'Xác nhận đơn hàng',
                steps: ['Vào Admin → Orders', 'Chọn đơn pending', 'Click "Xác nhận"', 'Đơn chuyển sang confirmed'],
                note: 'Kiểm tra thanh toán trước khi xác nhận đơn prepaid'
              },
              {
                action: 'Cập nhật tracking number',
                steps: ['Chọn đơn đang xử lý', 'Nhập mã vận đơn', 'Chọn đơn vị vận chuyển', 'Lưu → Gửi email cho khách'],
                note: 'Khách có thể tra cứu trực tiếp trên website của hãng ship'
              },
              {
                action: 'Xử lý hoàn tiền',
                steps: ['Chọn đơn cần hoàn', 'Click "Hoàn tiền"', 'Nhập số tiền & lý do', 'Xác nhận hoàn tiền'],
                note: 'Với VNPay/MoMo, tiền hoàn về tài khoản gốc sau 3-5 ngày'
              },
              {
                action: 'In phiếu giao hàng',
                steps: ['Chọn đơn (có thể chọn nhiều)', 'Click "In phiếu"', 'Chọn template', 'In hoặc xuất PDF'],
                note: 'Phiếu bao gồm mã vạch để scan khi giao'
              },
              {
                action: 'Export danh sách đơn',
                steps: ['Filter đơn theo điều kiện', 'Click "Export"', 'Chọn format (Excel/CSV)', 'Download file'],
                note: 'Dùng để đối soát với kế toán hoặc đơn vị vận chuyển'
              },
            ].map(item => (
              <div key={item.action} className="border rounded-xl p-4">
                <h5 className="font-bold text-gray-900 mb-2">{item.action}</h5>
                <ol className="text-sm text-gray-700 space-y-1 mb-2">
                  {item.steps.map((step, i) => (
                    <li key={i}>{i + 1}. {step}</li>
                  ))}
                </ol>
                <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded">
                  💡 {item.note}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-6 h-6 text-blue-600" />
            Bulk Actions (Xử lý hàng loạt)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Chọn nhiều đơn và thực hiện thao tác cùng lúc để tiết kiệm thời gian.
          </p>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              { action: 'Bulk Confirm', desc: 'Xác nhận nhiều đơn pending' },
              { action: 'Bulk Print', desc: 'In phiếu giao hàng hàng loạt' },
              { action: 'Bulk Update Status', desc: 'Đổi trạng thái nhiều đơn' },
              { action: 'Bulk Export', desc: 'Xuất data nhiều đơn ra Excel' },
            ].map(item => (
              <div key={item.action} className="p-3 bg-blue-50 rounded-lg">
                <p className="font-medium text-blue-900">{item.action}</p>
                <p className="text-sm text-blue-700">{item.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ========== MAIN COMPONENT ==========

export default function OrderHandbook({ searchQuery = '' }) {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Tổng quan', icon: ShoppingCart },
    { id: 'status', label: 'Trạng thái', icon: Clock },
    { id: 'payment', label: 'Thanh toán', icon: CreditCard },
    { id: 'shipping', label: 'Vận chuyển', icon: Truck },
    { id: 'customer', label: 'Khách hàng', icon: Users },
    { id: 'cancel', label: 'Hủy & Hoàn', icon: XCircle },
    { id: 'notification', label: 'Thông báo', icon: Bell },
    { id: 'admin', label: 'Thao tác Admin', icon: Settings },
  ];

  return (
    <div className="space-y-6">
      <Card className="border-green-200 bg-green-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon.ShoppingCart size={24} className="text-green-600" />
            📚 Sổ Tay Quản Lý Đơn Hàng
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Hướng dẫn chi tiết về quy trình đơn hàng, thanh toán, vận chuyển, 
            và các thao tác admin thường dùng.
          </p>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap h-auto gap-1 bg-white p-2 border rounded-xl">
          {tabs.map(tab => {
            const TabIcon = tab.icon;
            return (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id}
                className="flex items-center gap-1 text-xs px-3 py-2"
              >
                <TabIcon className="w-4 h-4" />
                {tab.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <div className="mt-6">
          <TabsContent value="overview"><OverviewSection /></TabsContent>
          <TabsContent value="status"><StatusSection /></TabsContent>
          <TabsContent value="payment"><PaymentSection /></TabsContent>
          <TabsContent value="shipping"><ShippingSection /></TabsContent>
          <TabsContent value="customer"><CustomerSection /></TabsContent>
          <TabsContent value="cancel"><CancellationSection /></TabsContent>
          <TabsContent value="notification"><NotificationSection /></TabsContent>
          <TabsContent value="admin"><AdminActionsSection /></TabsContent>
        </div>
      </Tabs>
    </div>
  );
}