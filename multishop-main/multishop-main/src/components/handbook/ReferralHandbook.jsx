/**
 * Referral Handbook Component
 * Hướng dẫn chi tiết về Referral System
 */

import React from 'react';
import { Icon } from '@/components/ui/AnimatedIcon.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ReferralHandbook({ searchQuery }) {
  return (
    <div className="space-y-8">
      {/* Introduction */}
      <Card className="border-amber-200">
        <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50">
          <CardTitle className="flex items-center gap-2">
            <Icon.Gift size={24} className="text-amber-600" />
            Hệ Thống Giới Thiệu (Referral Program)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <p className="text-gray-700">
            <strong>Mục đích:</strong> Khuyến khích khách hàng giới thiệu bạn bè mua hàng, 
            người giới thiệu (CTV) nhận hoa hồng từ doanh số của khách được giới thiệu (F1).
          </p>
          <Alert>
            <Icon.Lightbulb className="h-4 w-4" />
            <AlertDescription>
              <strong>Ví dụ thực tế:</strong> Anh A giới thiệu Chị B mua rau 1 triệu đồng. 
              Tùy theo doanh số F1 của Anh A trong tháng, Anh A nhận hoa hồng 1-3% (10K-30K).
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Key Concepts */}
      <Card>
        <CardHeader>
          <CardTitle>📚 Khái Niệm Quan Trọng</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-bold text-lg mb-2 flex items-center gap-2">
              <Badge className="bg-blue-500">Thuật ngữ</Badge>
              CTV (Cộng Tác Viên)
            </h4>
            <p className="text-gray-700 mb-2">
              Người tham gia chương trình giới thiệu, có mã giới thiệu riêng để chia sẻ.
            </p>
            <div className="bg-blue-50 p-3 rounded-lg text-sm">
              <strong>Điều kiện trở thành CTV:</strong>
              <ul className="list-disc ml-5 mt-2 space-y-1">
                <li>Có tài khoản đăng nhập</li>
                <li>Có ít nhất 1 đơn hàng thành công (tùy cài đặt)</li>
                <li>Được admin duyệt (nếu bật "require approval")</li>
              </ul>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-2 flex items-center gap-2">
              <Badge className="bg-green-500">Thuật ngữ</Badge>
              F1 (Khách Hàng Được Giới Thiệu)
            </h4>
            <p className="text-gray-700 mb-2">
              Khách hàng sử dụng mã giới thiệu của CTV khi mua hàng lần đầu.
            </p>
            <div className="bg-green-50 p-3 rounded-lg text-sm">
              <strong>Cách F1 được gán cho CTV:</strong>
              <ul className="list-disc ml-5 mt-2 space-y-1">
                <li><strong>Tự động:</strong> Khách nhập mã giới thiệu khi checkout → hệ thống tự gán</li>
                <li><strong>Manual:</strong> CTV tự đăng ký KH mới qua form (tên + SĐT)</li>
                <li><strong>Claim:</strong> CTV claim KH cũ đã mua trước đó (retroactive)</li>
              </ul>
              <p className="mt-2 text-amber-700">
                ⚠️ <strong>Lưu ý:</strong> Sau đơn đầu tiên, F1 sẽ bị <strong>lock</strong> - không thể chuyển sang CTV khác 
                (trừ khi admin can thiệp).
              </p>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-2 flex items-center gap-2">
              <Badge className="bg-purple-500">Thuật ngữ</Badge>
              Commission (Hoa Hồng)
            </h4>
            <p className="text-gray-700">
              Phần trăm doanh số mà CTV nhận được khi F1 mua hàng.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-2 flex items-center gap-2">
              <Badge className="bg-orange-500">Thuật ngữ</Badge>
              Seeder Rank (Cấp Bậc Người Gieo Hạt)
            </h4>
            <p className="text-gray-700 mb-2">
              Hệ thống 7 cấp bậc dựa trên số F1 của CTV và cấp bậc của các F1 đó.
            </p>
            <div className="bg-orange-50 p-4 rounded-lg text-sm space-y-2">
              <div className="flex items-center gap-3">
                <Badge variant="outline">Cấp 1</Badge>
                <strong>Người Gieo Hạt</strong>
                <span className="text-gray-600">- Mới gia nhập (0% bonus)</span>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline">Cấp 2</Badge>
                <strong>Hạt Giống Khỏe</strong>
                <span className="text-gray-600">- 7 F1 có mua hàng (+0.1% bonus)</span>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline">Cấp 3</Badge>
                <strong>Mầm Khỏe</strong>
                <span className="text-gray-600">- 7 F1 đạt Hạt Giống (+0.2%, có certificate)</span>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline">Cấp 4</Badge>
                <strong>Chồi Khỏe</strong>
                <span className="text-gray-600">- 7 F1 đạt Mầm (+0.3%, training)</span>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline">Cấp 5</Badge>
                <strong>Cành Khỏe</strong>
                <span className="text-gray-600">- 7 F1 đạt Chồi (+0.4%, đại diện vùng)</span>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline">Cấp 6</Badge>
                <strong>Cây Khỏe</strong>
                <span className="text-gray-600">- 7 F1 đạt Cành (+0.5%, vinh danh event)</span>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="bg-amber-500">Cấp 7</Badge>
                <strong>Danh Hiệu Nông Sản</strong>
                <span className="text-gray-600">- 1 F1 đạt Cây (+0.5%, branding riêng)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Commission Calculation */}
      <Card>
        <CardHeader>
          <CardTitle>💰 Cách Tính Hoa Hồng</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-bold mb-2">Công Thức:</h4>
            <div className="bg-violet-50 p-4 rounded-xl border-2 border-violet-200">
              <p className="font-mono text-sm">
                <strong>Hoa hồng</strong> = Doanh số F1 trong tháng × (<strong>Commission Tier Rate</strong> + <strong>Seeder Rank Bonus</strong>)
              </p>
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-3">Ví Dụ Cụ Thể:</h4>
            <div className="space-y-3">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium mb-2">Trường hợp 1: CTV mới (Người Gieo Hạt)</p>
                <ul className="text-sm space-y-1 ml-4">
                  <li>• Doanh số F1 tháng này: 8 triệu</li>
                  <li>• Commission tier: <strong>1%</strong> (0-10 triệu)</li>
                  <li>• Rank bonus: <strong>0%</strong> (chưa có rank)</li>
                  <li>• <strong>Hoa hồng = 8,000,000 × 1% = 80,000đ</strong></li>
                </ul>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium mb-2">Trường hợp 2: CTV cao cấp (Mầm Khỏe)</p>
                <ul className="text-sm space-y-1 ml-4">
                  <li>• Doanh số F1 tháng này: 60 triệu</li>
                  <li>• Commission tier: <strong>3%</strong> (&gt;50 triệu)</li>
                  <li>• Rank bonus: <strong>+0.2%</strong> (Mầm Khỏe)</li>
                  <li>• <strong>Hoa hồng = 60,000,000 × (3% + 0.2%) = 1,920,000đ</strong></li>
                </ul>
              </div>
            </div>
          </div>

          <Alert className="bg-amber-50 border-amber-200">
            <Icon.AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>Lưu ý:</strong> Hoa hồng được tính dựa trên <strong>tổng doanh số F1 trong tháng</strong>, 
              không phải từng đơn riêng lẻ. Càng nhiều F1 mua → doanh số cao → tier cao hơn → % hoa hồng cao hơn.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Commission Tiers */}
      <Card>
        <CardHeader>
          <CardTitle>📊 Commission Tiers (Bậc Hoa Hồng)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
              <div className="text-center w-20">
                <p className="text-3xl font-bold text-gray-600">1%</p>
              </div>
              <div className="flex-1">
                <p className="font-bold">Tier 1: 0 - 10 triệu</p>
                <p className="text-sm text-gray-600">Doanh số F1 dưới 10 triệu/tháng</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
              <div className="text-center w-20">
                <p className="text-3xl font-bold text-blue-600">2%</p>
              </div>
              <div className="flex-1">
                <p className="font-bold">Tier 2: 10 - 50 triệu</p>
                <p className="text-sm text-gray-600">Doanh số F1 từ 10-50 triệu/tháng</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl">
              <div className="text-center w-20">
                <p className="text-3xl font-bold text-amber-600">3%</p>
              </div>
              <div className="flex-1">
                <p className="font-bold">Tier 3: Trên 50 triệu</p>
                <p className="text-sm text-gray-600">Doanh số F1 trên 50 triệu/tháng</p>
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-green-800">
              💡 <strong>Tips:</strong> Khuyến khích CTV focus vào chất lượng F1 (mua nhiều, đều đặn) 
              hơn là chỉ số lượng. Một vài F1 tốt có thể tạo doanh số lớn hơn nhiều F1 ít mua.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Admin Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>🔧 Công Việc Admin Thường Ngày</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="font-bold text-amber-700">1</span>
              </div>
              <div className="flex-1">
                <p className="font-bold">Duyệt CTV mới</p>
                <p className="text-sm text-gray-600 mt-1">
                  Vào <strong>Referral Members → Filter "Pending"</strong> → Kiểm tra lịch sử đơn hàng → Click "Duyệt" hoặc "Từ chối"
                </p>
                <Alert className="mt-2 bg-blue-50 border-blue-200">
                  <AlertDescription className="text-sm text-blue-700">
                    ⚙️ Có thể tắt approval bắt buộc tại: <strong>Referral Settings → Require Admin Approval</strong>
                  </AlertDescription>
                </Alert>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="font-bold text-green-700">2</span>
              </div>
              <div className="flex-1">
                <p className="font-bold">Kiểm tra gian lận (Fraud Detection)</p>
                <p className="text-sm text-gray-600 mt-1">
                  Hệ thống tự động đánh dấu các case nghi ngờ. Admin vào <strong>Fraud Suspects</strong> để xem xét.
                </p>
                <div className="mt-2 space-y-1 text-sm">
                  <p className="text-red-600 font-medium">🚨 Dấu hiệu gian lận:</p>
                  <ul className="list-disc ml-5 text-gray-700">
                    <li>Nhiều F1 cùng địa chỉ / số điện thoại</li>
                    <li>F1 không nhận hàng (COD failed) nhiều lần</li>
                    <li>Doanh số tăng đột biến cuối tháng</li>
                    <li>CTV tự giới thiệu chính mình</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="font-bold text-blue-700">3</span>
              </div>
              <div className="flex-1">
                <p className="font-bold">Xử lý thanh toán hoa hồng</p>
                <p className="text-sm text-gray-600 mt-1">
                  Vào <strong>Payout</strong> tab → Chọn CTV → Preview → Confirm thanh toán
                </p>
                <div className="bg-violet-50 p-3 rounded-lg mt-2 text-sm">
                  <strong>Chu kỳ thanh toán:</strong>
                  <ul className="ml-4 mt-1 space-y-1">
                    <li>• Tháng: Ngày 15 hàng tháng (mặc định)</li>
                    <li>• Điều kiện: Tối thiểu 500K hoa hồng</li>
                    <li>• Phương thức: Chuyển khoản ngân hàng</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="font-bold text-purple-700">4</span>
              </div>
              <div className="flex-1">
                <p className="font-bold">Set Custom Rate (Nâng cao)</p>
                <p className="text-sm text-gray-600 mt-1">
                  Dành cho CTV đặc biệt, admin có thể set % hoa hồng cố định (override tier + rank).
                </p>
                <p className="text-sm text-amber-700 mt-2">
                  Vd: CTV A làm rất tốt → Admin set custom 5% cố định (thay vì 1-3% theo tier)
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Guide */}
      <Card>
        <CardHeader>
          <CardTitle>⚙️ Hướng Dẫn Cài Đặt</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-bold">is_program_enabled</h4>
              <p className="text-sm text-gray-600">Bật/tắt toàn bộ chương trình giới thiệu</p>
              <Badge className="mt-1">Mặc định: true</Badge>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-bold">enable_referrer_order_check</h4>
              <p className="text-sm text-gray-600">
                Yêu cầu CTV phải có ít nhất 1 đơn hàng thành công trước khi tham gia
              </p>
              <Badge className="mt-1">Khuyến nghị: true (tránh spam)</Badge>
            </div>

            <div className="border-l-4 border-amber-500 pl-4">
              <h4 className="font-bold">require_admin_approval</h4>
              <p className="text-sm text-gray-600">
                CTV mới phải đợi admin duyệt (status = pending_approval)
              </p>
              <Badge className="mt-1">Khuyến nghị: true (kiểm soát chất lượng)</Badge>
            </div>

            <div className="border-l-4 border-purple-500 pl-4">
              <h4 className="font-bold">min_payout_amount</h4>
              <p className="text-sm text-gray-600">
                Hoa hồng tối thiểu để được rút (VNĐ)
              </p>
              <Badge className="mt-1">Mặc định: 500,000đ</Badge>
            </div>

            <div className="border-l-4 border-red-500 pl-4">
              <h4 className="font-bold">fraud_threshold_score</h4>
              <p className="text-sm text-gray-600">
                Điểm nghi ngờ gian lận (0-100). Trên ngưỡng này sẽ bị đánh dấu
              </p>
              <Badge className="mt-1">Mặc định: 50</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FAQs */}
      <Card>
        <CardHeader>
          <CardTitle>❓ Câu Hỏi Thường Gặp</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-bold text-blue-700">Q: Tại sao F1 bị lock sau đơn đầu tiên?</h4>
            <p className="text-sm text-gray-700 mt-1">
              <strong>A:</strong> Để tránh tranh chấp giữa các CTV. Một F1 chỉ thuộc về 1 CTV duy nhất. 
              Nếu cần chuyển, admin có thể dùng tính năng "Reassign Customer".
            </p>
          </div>

          <div>
            <h4 className="font-bold text-blue-700">Q: CTV có thể tự đăng ký F1 không?</h4>
            <p className="text-sm text-gray-700 mt-1">
              <strong>A:</strong> Có! CTV vào MyReferrals → "Đăng ký KH mới" → Nhập tên + SĐT. 
              Hệ thống sẽ tự tạo Customer và gán cho CTV.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-blue-700">Q: Nếu order bị return/refund thì sao?</h4>
            <p className="text-sm text-gray-700 mt-1">
              <strong>A:</strong> Hệ thống tự động <strong>reverse commission</strong>. 
              Hoa hồng sẽ bị trừ khỏi unpaid_commission của CTV, và được ghi log trong CommissionLog.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-blue-700">Q: Làm sao biết CTV đạt rank mới?</h4>
            <p className="text-sm text-gray-700 mt-1">
              <strong>A:</strong> Hệ thống tự động check khi có F1 mới hoặc F1 lên rank. 
              CTV sẽ nhận notification. Admin xem tại Referral Members → Sort by Rank.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Troubleshooting */}
      <Card className="border-red-200">
        <CardHeader className="bg-red-50">
          <CardTitle className="flex items-center gap-2 text-red-700">
            <Icon.AlertTriangle size={20} />
            Xử Lý Sự Cố
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-3">
          <div>
            <p className="font-bold text-red-600">❌ Hoa hồng không được tính</p>
            <ul className="text-sm text-gray-700 ml-5 mt-1 space-y-1">
              <li>1. Check order có field <code>referral_code_applied</code> không</li>
              <li>2. Check order status = "delivered" chưa</li>
              <li>3. Check field <code>referral_commission_calculated</code> = false</li>
              <li>4. Chạy lại script: Admin Orders → Select order → "Recalculate Commission"</li>
            </ul>
          </div>

          <div>
            <p className="font-bold text-red-600">❌ CTV không lên rank dù đủ F1</p>
            <ul className="text-sm text-gray-700 ml-5 mt-1 space-y-1">
              <li>1. Check F1 có <code>total_orders &gt;= 1</code> không (F1 phải mua ít nhất 1 đơn)</li>
              <li>2. Check rank config tại Settings → Seeder Rank Config</li>
              <li>3. Manual trigger: Referral Members → Select CTV → "Recalculate Rank"</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}