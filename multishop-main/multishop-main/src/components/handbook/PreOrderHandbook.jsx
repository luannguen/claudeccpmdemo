/**
 * PreOrder Handbook - Sổ tay Admin về hệ thống Bán Trước
 * Hướng dẫn chi tiết về quy trình, entities, thuật ngữ
 */

import React, { useState } from 'react';
import { Icon } from '@/components/ui/AnimatedIcon.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Wallet, RefreshCw, AlertTriangle, Package, FileText,
  Shield, TrendingUp, Users, Zap, Clock, CheckCircle
} from 'lucide-react';

// ========== SECTION COMPONENTS ==========

function OverviewSection() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon.Package size={24} className="text-green-600" />
            Tổng Quan Hệ Thống Bán Trước
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-green-50 rounded-xl">
            <h4 className="font-bold text-green-900 mb-2">🌾 Bán Trước (Pre-Order) là gì?</h4>
            <p className="text-green-800 text-sm">
              Hệ thống cho phép khách hàng đặt mua sản phẩm TRƯỚC khi thu hoạch. 
              Khách đặt cọc một phần, sau đó thanh toán phần còn lại khi sản phẩm sẵn sàng giao.
              Giá có thể tăng dần theo thời gian gần ngày thu hoạch.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3">📋 Quy trình chính:</h4>
            <div className="space-y-2">
              {[
                { step: 1, title: 'Tạo Lot', desc: 'Admin tạo ProductLot với thông tin thu hoạch, giá, số lượng' },
                { step: 2, title: 'Khách đặt cọc', desc: 'Khách chọn số lượng, thanh toán 30-50% tiền cọc' },
                { step: 3, title: 'Theo dõi', desc: 'Hệ thống gửi thông báo progress, cập nhật giá' },
                { step: 4, title: 'Thu hoạch', desc: 'Khi đến ngày, gửi thông báo thanh toán phần còn lại' },
                { step: 5, title: 'Giao hàng', desc: 'Giao hàng và hoàn tất đơn, release tiền cho seller' },
              ].map(item => (
                <div key={item.step} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {item.step}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{item.title}</p>
                    <p className="text-sm text-gray-600">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-xl">
              <h4 className="font-semibold text-blue-900 mb-2">🎯 Lợi ích cho Seller</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Có vốn trước khi thu hoạch (tiền cọc)</li>
                <li>• Đảm bảo đầu ra sản phẩm</li>
                <li>• Giảm rủi ro tồn kho</li>
                <li>• Xây dựng mối quan hệ khách hàng</li>
              </ul>
            </div>
            <div className="p-4 bg-purple-50 rounded-xl">
              <h4 className="font-semibold text-purple-900 mb-2">🎯 Lợi ích cho Khách</h4>
              <ul className="text-sm text-purple-800 space-y-1">
                <li>• Giá tốt hơn khi đặt sớm (Early Bird)</li>
                <li>• Đảm bảo có hàng khi thu hoạch</li>
                <li>• Sản phẩm tươi mới nhất</li>
                <li>• Được bảo vệ bởi policy rõ ràng</li>
              </ul>
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
              { term: 'Lot', def: 'Lô hàng cụ thể với số lượng, thời gian thu hoạch xác định' },
              { term: 'Deposit (Cọc)', def: 'Khoản thanh toán đầu tiên, thường 30-50% tổng giá trị' },
              { term: 'Final Payment', def: 'Thanh toán phần còn lại trước/khi giao hàng' },
              { term: 'Harvest Date', def: 'Ngày dự kiến thu hoạch sản phẩm' },
              { term: 'Escrow', def: 'Hệ thống giữ tiền an toàn cho đến khi giao dịch hoàn tất' },
              { term: 'Release', def: 'Giải phóng tiền từ escrow cho seller sau khi giao hàng' },
              { term: 'Dispute', def: 'Khiếu nại/tranh chấp từ khách hàng về đơn hàng' },
              { term: 'Fulfillment', def: 'Quá trình đóng gói và giao hàng đến khách' },
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

function EscrowSection() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-6 h-6 text-blue-600" />
            Hệ Thống Escrow (Ví Giữ Tiền)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-xl">
            <h4 className="font-bold text-blue-900 mb-2">💰 Escrow là gì?</h4>
            <p className="text-blue-800 text-sm">
              Escrow là hệ thống giữ tiền trung gian. Khi khách thanh toán, tiền được GIỮ trong 
              "ví escrow" thay vì chuyển ngay cho seller. Tiền chỉ được RELEASE cho seller sau khi 
              đơn hàng giao thành công và khách xác nhận nhận hàng.
            </p>
          </div>

          {/* PaymentWallet Entity */}
          <div className="border rounded-xl p-4">
            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Badge className="bg-blue-500">Entity</Badge>
              PaymentWallet - Ví Thanh Toán
            </h4>
            <p className="text-sm text-gray-600 mb-3">
              Mỗi đơn hàng preorder có 1 PaymentWallet để track tiền vào/ra.
            </p>
            <div className="bg-gray-50 rounded-lg p-3 text-sm">
              <p className="font-medium mb-2">Các trường quan trọng:</p>
              <ul className="space-y-1 text-gray-700">
                <li>• <code className="bg-gray-200 px-1 rounded">deposit_held</code> - Tiền cọc đang giữ</li>
                <li>• <code className="bg-gray-200 px-1 rounded">final_payment_held</code> - Thanh toán cuối đang giữ</li>
                <li>• <code className="bg-gray-200 px-1 rounded">total_held</code> - Tổng tiền đang giữ</li>
                <li>• <code className="bg-gray-200 px-1 rounded">status</code> - Trạng thái ví</li>
                <li>• <code className="bg-gray-200 px-1 rounded">release_conditions</code> - Điều kiện để release tiền</li>
              </ul>
            </div>

            <div className="mt-4">
              <p className="font-medium mb-2">Vòng đời trạng thái ví:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { status: 'pending_deposit', color: 'bg-yellow-100 text-yellow-800' },
                  { status: 'deposit_held', color: 'bg-blue-100 text-blue-800' },
                  { status: 'pending_final', color: 'bg-orange-100 text-orange-800' },
                  { status: 'fully_held', color: 'bg-green-100 text-green-800' },
                  { status: 'released_to_seller', color: 'bg-emerald-100 text-emerald-800' },
                ].map((s, i) => (
                  <React.Fragment key={s.status}>
                    <Badge className={s.color}>{s.status}</Badge>
                    {i < 4 && <span className="text-gray-400">→</span>}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* WalletTransaction Entity */}
          <div className="border rounded-xl p-4">
            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Badge className="bg-blue-500">Entity</Badge>
              WalletTransaction - Lịch Sử Giao Dịch
            </h4>
            <p className="text-sm text-gray-600 mb-3">
              Mỗi thay đổi số dư ví tạo 1 record transaction để audit.
            </p>
            <div className="bg-gray-50 rounded-lg p-3 text-sm">
              <p className="font-medium mb-2">Các loại giao dịch:</p>
              <ul className="space-y-1 text-gray-700">
                <li>• <code className="bg-green-100 px-1 rounded">deposit_in</code> - Nhận tiền cọc</li>
                <li>• <code className="bg-green-100 px-1 rounded">final_payment_in</code> - Nhận thanh toán cuối</li>
                <li>• <code className="bg-red-100 px-1 rounded">refund_out</code> - Hoàn tiền</li>
                <li>• <code className="bg-blue-100 px-1 rounded">seller_payout</code> - Chuyển cho seller</li>
                <li>• <code className="bg-yellow-100 px-1 rounded">commission_deduct</code> - Khấu trừ hoa hồng</li>
              </ul>
            </div>
          </div>

          {/* Release Conditions */}
          <div className="p-4 bg-green-50 rounded-xl">
            <h4 className="font-bold text-green-900 mb-2">✅ Điều kiện Release tiền cho Seller</h4>
            <p className="text-sm text-green-800 mb-2">
              Tiền chỉ được release khi TẤT CẢ điều kiện sau được đáp ứng:
            </p>
            <ul className="text-sm text-green-800 space-y-1">
              <li>✓ <strong>delivery_confirmed</strong> - Đã giao hàng thành công</li>
              <li>✓ <strong>customer_accepted</strong> - Khách xác nhận nhận hàng HOẶC</li>
              <li>✓ <strong>inspection_period_passed</strong> - Qua 24h sau giao (auto-accept)</li>
              <li>✓ <strong>dispute_resolved</strong> - Không có dispute đang mở</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* RefundRequest */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-6 h-6 text-purple-600" />
            RefundRequest - Yêu Cầu Hoàn Tiền
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Khi cần hoàn tiền cho khách (do hủy đơn, chất lượng kém, giao thiếu...), 
            hệ thống tạo RefundRequest để track và xử lý.
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-3 bg-purple-50 rounded-lg">
              <h5 className="font-semibold text-purple-900 mb-2">Loại hoàn tiền:</h5>
              <ul className="text-sm text-purple-800 space-y-1">
                <li>• <strong>customer_cancel</strong> - Khách hủy đơn</li>
                <li>• <strong>seller_cancel</strong> - Seller hủy</li>
                <li>• <strong>quality_issue</strong> - Vấn đề chất lượng</li>
                <li>• <strong>shortage</strong> - Giao thiếu hàng</li>
                <li>• <strong>delay_compensation</strong> - Bồi thường trễ</li>
              </ul>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg">
              <h5 className="font-semibold text-amber-900 mb-2">Quy trình xử lý:</h5>
              <ol className="text-sm text-amber-800 space-y-1">
                <li>1. Tạo RefundRequest</li>
                <li>2. Tính toán số tiền hoàn (theo policy)</li>
                <li>3. Admin review (nếu cần)</li>
                <li>4. Approve → Tạo WalletTransaction</li>
                <li>5. Xử lý thanh toán ngược</li>
              </ol>
            </div>
          </div>

          <div className="p-4 bg-red-50 rounded-xl">
            <h5 className="font-semibold text-red-900 mb-2">⚠️ Policy hoàn tiền khi khách hủy:</h5>
            <div className="text-sm text-red-800">
              <p>Tỉ lệ hoàn tiền phụ thuộc thời điểm hủy:</p>
              <ul className="mt-2 space-y-1">
                <li>• <strong>Trước 7 ngày thu hoạch:</strong> Hoàn 100%</li>
                <li>• <strong>3-7 ngày:</strong> Hoàn 80% (giữ 20% phí)</li>
                <li>• <strong>1-3 ngày:</strong> Hoàn 50%</li>
                <li>• <strong>Dưới 1 ngày:</strong> Hoàn 0% (giữ toàn bộ)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DisputeSection() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            DisputeTicket - Quản Lý Khiếu Nại
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-red-50 rounded-xl">
            <h4 className="font-bold text-red-900 mb-2">🔥 Dispute là gì?</h4>
            <p className="text-red-800 text-sm">
              Dispute (tranh chấp) là khi khách hàng báo cáo có vấn đề với đơn hàng: 
              giao trễ, thiếu hàng, chất lượng kém, hàng hư hỏng... 
              Hệ thống tạo ticket để theo dõi và giải quyết.
            </p>
          </div>

          <div className="border rounded-xl p-4">
            <h4 className="font-bold text-gray-900 mb-3">Các loại Dispute:</h4>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                { type: 'delivery_delay', label: 'Giao hàng trễ', color: 'bg-yellow-100' },
                { type: 'partial_delivery', label: 'Giao thiếu', color: 'bg-orange-100' },
                { type: 'quality_issue', label: 'Chất lượng kém', color: 'bg-red-100' },
                { type: 'damaged_goods', label: 'Hàng hư hỏng', color: 'bg-pink-100' },
                { type: 'wrong_specification', label: 'Sai quy cách', color: 'bg-purple-100' },
                { type: 'not_as_described', label: 'Không như mô tả', color: 'bg-indigo-100' },
              ].map(item => (
                <div key={item.type} className={`${item.color} p-2 rounded-lg text-sm`}>
                  <code className="font-mono">{item.type}</code>
                  <span className="ml-2 text-gray-700">- {item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border rounded-xl p-4">
            <h4 className="font-bold text-gray-900 mb-3">Workflow xử lý Dispute:</h4>
            <div className="space-y-2">
              {[
                { status: 'open', label: 'Mới tạo', desc: 'Khách vừa báo cáo sự cố' },
                { status: 'under_review', label: 'Đang xem xét', desc: 'Admin đang kiểm tra' },
                { status: 'resolution_proposed', label: 'Đề xuất giải quyết', desc: 'Đã đưa ra các phương án' },
                { status: 'resolution_accepted', label: 'Khách chọn', desc: 'Khách đã chọn phương án' },
                { status: 'resolved', label: 'Đã giải quyết', desc: 'Áp dụng xong, đóng ticket' },
              ].map((item, i) => (
                <div key={item.status} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {i + 1}
                  </div>
                  <div className="flex-1 p-2 bg-gray-50 rounded-lg">
                    <span className="font-medium">{item.label}</span>
                    <span className="text-gray-500 text-sm ml-2">({item.status})</span>
                    <p className="text-xs text-gray-600">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-green-50 rounded-xl">
            <h4 className="font-bold text-green-900 mb-2">💡 Các phương án giải quyết:</h4>
            <ul className="text-sm text-green-800 space-y-1">
              <li>✓ <strong>full_refund</strong> - Hoàn tiền 100%</li>
              <li>✓ <strong>partial_refund</strong> - Hoàn một phần</li>
              <li>✓ <strong>voucher</strong> - Tặng voucher giảm giá</li>
              <li>✓ <strong>points</strong> - Cộng điểm thưởng</li>
              <li>✓ <strong>reship</strong> - Giao lại hàng</li>
              <li>✓ <strong>swap_lot</strong> - Đổi sang lot khác</li>
              <li>✓ <strong>replacement</strong> - Thay thế sản phẩm</li>
            </ul>
          </div>

          <div className="p-4 bg-amber-50 rounded-xl">
            <h4 className="font-bold text-amber-900 mb-2">⏱️ SLA (Service Level Agreement):</h4>
            <div className="text-sm text-amber-800">
              <p>Thời gian cam kết xử lý:</p>
              <ul className="mt-2 space-y-1">
                <li>• <strong>Critical:</strong> Phản hồi trong 4h, giải quyết trong 24h</li>
                <li>• <strong>High:</strong> Phản hồi trong 8h, giải quyết trong 48h</li>
                <li>• <strong>Medium:</strong> Phản hồi trong 24h, giải quyết trong 72h</li>
                <li>• <strong>Low:</strong> Phản hồi trong 48h, giải quyết trong 1 tuần</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function FulfillmentSection() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-6 h-6 text-cyan-600" />
            FulfillmentRecord - Giao Hàng Từng Đợt
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-cyan-50 rounded-xl">
            <h4 className="font-bold text-cyan-900 mb-2">📦 Partial Fulfillment là gì?</h4>
            <p className="text-cyan-800 text-sm">
              Với preorder, đặc biệt nông sản, có thể KHÔNG giao đủ một lần. 
              Ví dụ: Khách đặt 10kg, nhưng đợt 1 chỉ thu hoạch đủ giao 7kg, 
              3kg còn lại giao đợt sau. Hệ thống track từng đợt giao.
            </p>
          </div>

          <div className="border rounded-xl p-4">
            <h4 className="font-bold text-gray-900 mb-3">FulfillmentRecord Entity:</h4>
            <div className="bg-gray-50 rounded-lg p-3 text-sm">
              <ul className="space-y-1 text-gray-700">
                <li>• <code className="bg-gray-200 px-1 rounded">order_id</code> - ID đơn hàng</li>
                <li>• <code className="bg-gray-200 px-1 rounded">sequence</code> - Đợt giao thứ mấy (1, 2, 3...)</li>
                <li>• <code className="bg-gray-200 px-1 rounded">fulfillment_type</code> - Loại: full/partial/replacement</li>
                <li>• <code className="bg-gray-200 px-1 rounded">items</code> - Chi tiết sản phẩm đợt này</li>
                <li>• <code className="bg-gray-200 px-1 rounded">total_items_shipped</code> - Số lượng đã giao</li>
                <li>• <code className="bg-gray-200 px-1 rounded">total_items_remaining</code> - Còn lại chưa giao</li>
                <li>• <code className="bg-gray-200 px-1 rounded">tracking_number</code> - Mã vận đơn</li>
                <li>• <code className="bg-gray-200 px-1 rounded">delivery_proof</code> - Bằng chứng giao hàng</li>
              </ul>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-2">Trạng thái giao:</h5>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• pending - Chờ xử lý</li>
                <li>• preparing - Đang chuẩn bị</li>
                <li>• in_transit - Đang vận chuyển</li>
                <li>• delivered - Đã giao</li>
                <li>• partial_delivered - Giao một phần</li>
              </ul>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg">
              <h5 className="font-semibold text-amber-900 mb-2">Xử lý phần còn lại:</h5>
              <ul className="text-sm text-amber-800 space-y-1">
                <li>• ship_next_batch - Giao đợt sau</li>
                <li>• refund_remaining - Hoàn tiền phần thiếu</li>
                <li>• transfer_to_lot - Chuyển sang lot khác</li>
                <li>• waiting_harvest - Chờ thu hoạch tiếp</li>
              </ul>
            </div>
          </div>

          <div className="p-4 bg-purple-50 rounded-xl">
            <h4 className="font-bold text-purple-900 mb-2">🔍 QC Inspection:</h4>
            <p className="text-sm text-purple-800">
              Trước khi giao, có thể ghi nhận kiểm tra chất lượng (QC). 
              Mỗi FulfillmentRecord có trường <code className="bg-purple-200 px-1 rounded">qc_inspection</code> 
              chứa: người kiểm, ngày kiểm, kết quả, ảnh, ghi chú.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ProofPackSection() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-600" />
            OrderProofPack - Hồ Sơ Chứng Từ
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-indigo-50 rounded-xl">
            <h4 className="font-bold text-indigo-900 mb-2">📋 Proof Pack là gì?</h4>
            <p className="text-indigo-800 text-sm">
              Proof Pack là bộ hồ sơ đầy đủ của một đơn hàng, bao gồm: 
              policy đã áp dụng, xác nhận của khách, timeline sự kiện, 
              lịch sử thanh toán, dispute, refund... Dùng để audit, 
              giải quyết tranh chấp, đối soát tài chính.
            </p>
          </div>

          <div className="border rounded-xl p-4">
            <h4 className="font-bold text-gray-900 mb-3">Nội dung Proof Pack:</h4>
            <div className="grid md:grid-cols-2 gap-3 text-sm">
              <div className="p-2 bg-gray-50 rounded">
                <strong>policy_snapshot</strong>
                <p className="text-gray-600">Policy version, rules tại thời điểm đặt hàng</p>
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <strong>customer_acknowledgement</strong>
                <p className="text-gray-600">Khách đã tick checkbox đồng ý, IP, device</p>
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <strong>timeline_events</strong>
                <p className="text-gray-600">Mọi sự kiện: tạo đơn, thanh toán, giao, dispute...</p>
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <strong>notifications_sent</strong>
                <p className="text-gray-600">Lịch sử email/SMS đã gửi</p>
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <strong>financial_summary</strong>
                <p className="text-gray-600">Tổng đã trả, cọc, hoàn, net amount</p>
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <strong>qc_records</strong>
                <p className="text-gray-600">Hồ sơ kiểm tra chất lượng</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-green-50 rounded-xl">
            <h4 className="font-bold text-green-900 mb-2">🎯 Khi nào cần Proof Pack?</h4>
            <ul className="text-sm text-green-800 space-y-1">
              <li>✓ Giải quyết dispute có tranh cãi về policy</li>
              <li>✓ Đối soát tài chính cuối tháng</li>
              <li>✓ Audit nội bộ hoặc từ bên ngoài</li>
              <li>✓ Khách yêu cầu xem lại lịch sử đơn</li>
              <li>✓ Export báo cáo cho kế toán</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function FraudSection() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-red-600" />
            CustomerRiskProfile - Chống Gian Lận
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-red-50 rounded-xl">
            <h4 className="font-bold text-red-900 mb-2">🛡️ Fraud Detection là gì?</h4>
            <p className="text-red-800 text-sm">
              Hệ thống phát hiện và ngăn chặn các hành vi gian lận như: 
              scalping (đặt nhiều rồi hủy), lạm dụng refund, tạo nhiều tài khoản, 
              dispute giả... Mỗi khách có một Risk Profile được tính toán tự động.
            </p>
          </div>

          <div className="border rounded-xl p-4">
            <h4 className="font-bold text-gray-900 mb-3">Risk Score (0-100):</h4>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">Điểm rủi ro được tính dựa trên:</p>
              <div className="grid md:grid-cols-2 gap-2 text-sm">
                <div className="p-2 bg-gray-50 rounded">
                  <strong>Tỉ lệ hủy đơn:</strong> max 30 điểm
                </div>
                <div className="p-2 bg-gray-50 rounded">
                  <strong>Số disputes:</strong> max 20 điểm
                </div>
                <div className="p-2 bg-gray-50 rounded">
                  <strong>Số refund requests:</strong> max 15 điểm
                </div>
                <div className="p-2 bg-gray-50 rounded">
                  <strong>Nhiều device/địa chỉ:</strong> max 20 điểm
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-3 bg-red-50 rounded-lg">
              <h5 className="font-semibold text-red-900 mb-2">Risk Level:</h5>
              <ul className="text-sm text-red-800 space-y-1">
                <li>• <strong>Low (0-19):</strong> Bình thường</li>
                <li>• <strong>Medium (20-39):</strong> Cần theo dõi</li>
                <li>• <strong>High (40-59):</strong> Hạn chế</li>
                <li>• <strong>Critical (60+):</strong> Cần duyệt thủ công</li>
              </ul>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-2">Trust Tier:</h5>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• <strong>New:</strong> Khách mới</li>
                <li>• <strong>Basic:</strong> Có 3+ đơn thành công</li>
                <li>• <strong>Trusted:</strong> 10+ đơn, trust score cao</li>
                <li>• <strong>VIP:</strong> 25+ đơn, trust score rất cao</li>
              </ul>
            </div>
          </div>

          <div className="p-4 bg-amber-50 rounded-xl">
            <h4 className="font-bold text-amber-900 mb-2">⚠️ Restrictions cho High Risk:</h4>
            <ul className="text-sm text-amber-800 space-y-1">
              <li>✓ Bắt buộc thanh toán 100% (không cho cọc)</li>
              <li>✓ Giới hạn số lượng đặt mỗi lot</li>
              <li>✓ Giới hạn số preorder active cùng lúc</li>
              <li>✓ Cần admin duyệt thủ công</li>
              <li>✓ Có thể bị blacklist</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CompensationSection() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-amber-600" />
            AutoCompensation - Bồi Thường Tự Động
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-amber-50 rounded-xl">
            <h4 className="font-bold text-amber-900 mb-2">⚡ Auto Compensation là gì?</h4>
            <p className="text-amber-800 text-sm">
              Hệ thống tự động phát hiện khi nào cần bồi thường cho khách 
              (giao trễ, thiếu hàng...) và tự động tạo compensation mà 
              không cần admin can thiệp. Giúp tăng trải nghiệm khách hàng.
            </p>
          </div>

          <div className="border rounded-xl p-4">
            <h4 className="font-bold text-gray-900 mb-3">Các trigger tự động:</h4>
            <div className="space-y-3">
              <div className="p-3 bg-yellow-50 rounded-lg">
                <h5 className="font-semibold text-yellow-900">🕐 Delay Triggers:</h5>
                <ul className="text-sm text-yellow-800 mt-1 space-y-1">
                  <li>• Trễ 7 ngày → Voucher 5%</li>
                  <li>• Trễ 14 ngày → Voucher 10%</li>
                  <li>• Trễ 21 ngày → Giảm 15% đơn hiện tại</li>
                  <li>• Trễ 30 ngày → Hoàn 20% giá trị đơn</li>
                </ul>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <h5 className="font-semibold text-orange-900">📦 Shortage Triggers:</h5>
                <ul className="text-sm text-orange-800 mt-1 space-y-1">
                  <li>• Thiếu {"<"}10% → Cộng 200 points</li>
                  <li>• Thiếu 10-30% → Hoàn tiền phần thiếu</li>
                  <li>• Thiếu {">"}30% → Hoàn tiền + bonus 5%</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="p-4 bg-green-50 rounded-xl">
            <h4 className="font-bold text-green-900 mb-2">🎁 Loại compensation:</h4>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• <strong>voucher</strong> - Mã giảm giá cho đơn sau</li>
              <li>• <strong>points</strong> - Cộng điểm tích lũy</li>
              <li>• <strong>discount_current_order</strong> - Giảm giá đơn hiện tại</li>
              <li>• <strong>partial_refund</strong> - Hoàn một phần tiền</li>
              <li>• <strong>free_shipping_next</strong> - Free ship đơn sau</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CampaignSection() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-600" />
            PreOrderCampaign - Growth & Marketing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-purple-50 rounded-xl">
            <h4 className="font-bold text-purple-900 mb-2">🚀 Campaign là gì?</h4>
            <p className="text-purple-800 text-sm">
              Các chiến dịch marketing đặc biệt cho preorder: Group Buy, 
              Early Bird, Flash Sale... giúp tăng số đơn, tạo FOMO, 
              khuyến khích khách đặt sớm.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="border rounded-xl p-4">
              <h5 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Group Buy
              </h5>
              <p className="text-sm text-gray-600 mb-2">
                Đủ X người đặt → Unlock ưu đãi cho tất cả
              </p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Threshold: 50 đơn</li>
                <li>• Bonus: Giảm 15% cho tất cả</li>
                <li>• Progress bar hiển thị realtime</li>
              </ul>
            </div>

            <div className="border rounded-xl p-4">
              <h5 className="font-bold text-yellow-900 mb-2 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Early Bird
              </h5>
              <p className="text-sm text-gray-600 mb-2">
                Đặt sớm hơn → Giảm nhiều hơn (theo tier)
              </p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Tier 1: 20 đơn đầu → -20%</li>
                <li>• Tier 2: 30 đơn tiếp → -15%</li>
                <li>• Tier 3: 50 đơn tiếp → -10%</li>
              </ul>
            </div>

            <div className="border rounded-xl p-4">
              <h5 className="font-bold text-pink-900 mb-2 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Flash Sale
              </h5>
              <p className="text-sm text-gray-600 mb-2">
                Số lượng giới hạn, giá siêu rẻ
              </p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Max quantity: 100</li>
                <li>• Per customer limit: 2</li>
                <li>• Discount: 30%</li>
              </ul>
            </div>

            <div className="border rounded-xl p-4">
              <h5 className="font-bold text-green-900 mb-2 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Referral Bonus
              </h5>
              <p className="text-sm text-gray-600 mb-2">
                Giới thiệu bạn → Cả 2 được thưởng
              </p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Referrer: 50K/đơn thành công</li>
                <li>• Referee: Giảm 10% đơn đầu</li>
                <li>• Max 10 referrals/người</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AnalyticsSection() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-green-600" />
            PreOrderAnalytics - Phân Tích Dữ Liệu
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-green-50 rounded-xl">
            <h4 className="font-bold text-green-900 mb-2">📊 Analytics là gì?</h4>
            <p className="text-green-800 text-sm">
              Hệ thống thu thập và phân tích dữ liệu preorder: funnel chuyển đổi, 
              doanh thu, tỉ lệ hủy, độ trễ giao hàng, dispute... 
              Giúp admin ra quyết định dựa trên data.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="border rounded-xl p-4">
              <h5 className="font-bold text-blue-900 mb-2">📈 Funnel Metrics:</h5>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Page views → Add to cart</li>
                <li>• Add to cart → Checkout</li>
                <li>• Checkout → Deposit paid</li>
                <li>• Deposit → Final payment</li>
                <li>• Final → Delivered</li>
              </ul>
            </div>

            <div className="border rounded-xl p-4">
              <h5 className="font-bold text-green-900 mb-2">💰 Revenue Metrics:</h5>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Total order value</li>
                <li>• Deposit collected</li>
                <li>• Final payments</li>
                <li>• Total refunded</li>
                <li>• Net revenue</li>
              </ul>
            </div>

            <div className="border rounded-xl p-4">
              <h5 className="font-bold text-red-900 mb-2">❌ Cancellation Insights:</h5>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Cancel rate %</li>
                <li>• Reasons breakdown</li>
                <li>• Policy tier breakdown</li>
                <li>• Penalty collected</li>
              </ul>
            </div>

            <div className="border rounded-xl p-4">
              <h5 className="font-bold text-amber-900 mb-2">🚚 Delivery Metrics:</h5>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• On-time delivery %</li>
                <li>• Average delay days</li>
                <li>• Partial delivery count</li>
                <li>• Dispute rate</li>
              </ul>
            </div>
          </div>

          <div className="p-4 bg-purple-50 rounded-xl">
            <h4 className="font-bold text-purple-900 mb-2">🔮 Demand Forecast:</h4>
            <p className="text-sm text-purple-800 mb-2">
              Dự báo nhu cầu dựa trên dữ liệu hiện tại:
            </p>
            <ul className="text-sm text-purple-800 space-y-1">
              <li>• Predicted total orders</li>
              <li>• Probability đạt capacity</li>
              <li>• Trend: increasing/stable/decreasing</li>
              <li>• Recommendations: giảm giá? chạy promo?</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ========== MAIN COMPONENT ==========

export default function PreOrderHandbook({ searchQuery = '' }) {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Tổng quan', icon: Package },
    { id: 'escrow', label: 'Escrow & Refund', icon: Wallet },
    { id: 'dispute', label: 'Dispute', icon: AlertTriangle },
    { id: 'fulfillment', label: 'Fulfillment', icon: Package },
    { id: 'proofpack', label: 'Proof Pack', icon: FileText },
    { id: 'fraud', label: 'Chống gian lận', icon: Shield },
    { id: 'compensation', label: 'Bồi thường', icon: Zap },
    { id: 'campaign', label: 'Campaign', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      <Card className="border-green-200 bg-green-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon.Package size={24} className="text-green-600" />
            📚 Sổ Tay Hệ Thống Bán Trước (Pre-Order)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Hướng dẫn chi tiết về quy trình bán trước, các entities, 
            thuật ngữ và cách vận hành hệ thống.
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
          <TabsContent value="escrow"><EscrowSection /></TabsContent>
          <TabsContent value="dispute"><DisputeSection /></TabsContent>
          <TabsContent value="fulfillment"><FulfillmentSection /></TabsContent>
          <TabsContent value="proofpack"><ProofPackSection /></TabsContent>
          <TabsContent value="fraud"><FraudSection /></TabsContent>
          <TabsContent value="compensation"><CompensationSection /></TabsContent>
          <TabsContent value="campaign"><CampaignSection /></TabsContent>
          <TabsContent value="analytics"><AnalyticsSection /></TabsContent>
        </div>
      </Tabs>
    </div>
  );
}