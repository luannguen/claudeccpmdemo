/**
 * Loyalty Handbook Component
 * Hướng dẫn chi tiết về Loyalty System
 */

import React from 'react';
import { Icon } from '@/components/ui/AnimatedIcon.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

export default function LoyaltyHandbook({ searchQuery }) {
  return (
    <div className="space-y-8">
      {/* Introduction */}
      <Card className="border-violet-200">
        <CardHeader className="bg-gradient-to-r from-violet-50 to-purple-50">
          <CardTitle className="flex items-center gap-2">
            <Icon.Star size={24} className="text-violet-600" />
            Hệ Thống Loyalty (Tích Điểm Thưởng)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <p className="text-gray-700">
            <strong>Mục đích:</strong> Khuyến khích khách hàng quay lại mua hàng bằng cách tích điểm 
            và hưởng quyền lợi đặc biệt theo hạng thành viên.
          </p>
          <Alert>
            <Icon.Lightbulb className="h-4 w-4" />
            <AlertDescription>
              <strong>Ví dụ:</strong> Khách mua 1 triệu → tích 1 điểm. 
              Khi có 1000 điểm → lên hạng Bạc → tích điểm nhanh hơn 5% + giảm giá 2%.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Tier System */}
      <Card>
        <CardHeader>
          <CardTitle>🏆 4 Hạng Thành Viên</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Bronze */}
            <div className="border-2 border-orange-200 rounded-xl p-4 bg-gradient-to-br from-orange-50 to-amber-50">
              <div className="flex items-center gap-3 mb-3">
                <Icon.Award size={28} className="text-orange-600" />
                <div>
                  <h3 className="font-bold text-lg">Hạng Đồng</h3>
                  <Badge className="bg-orange-100 text-orange-700">0 - 999 điểm</Badge>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Nhân điểm:</span>
                  <strong>x1.0</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Giảm giá:</span>
                  <strong>0%</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Free ship từ:</span>
                  <strong>200K</strong>
                </div>
              </div>
            </div>

            {/* Silver */}
            <div className="border-2 border-gray-300 rounded-xl p-4 bg-gradient-to-br from-gray-50 to-slate-100">
              <div className="flex items-center gap-3 mb-3">
                <Icon.Award size={28} className="text-gray-600" />
                <div>
                  <h3 className="font-bold text-lg">Hạng Bạc</h3>
                  <Badge className="bg-gray-200 text-gray-700">1,000 - 4,999 điểm</Badge>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Nhân điểm:</span>
                  <strong className="text-green-600">x1.05</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Giảm giá:</span>
                  <strong className="text-green-600">2%</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Free ship từ:</span>
                  <strong className="text-green-600">150K</strong>
                </div>
              </div>
            </div>

            {/* Gold */}
            <div className="border-2 border-amber-300 rounded-xl p-4 bg-gradient-to-br from-amber-50 to-yellow-100">
              <div className="flex items-center gap-3 mb-3">
                <Icon.Award size={28} className="text-amber-600" />
                <div>
                  <h3 className="font-bold text-lg">Hạng Vàng</h3>
                  <Badge className="bg-amber-200 text-amber-800">5,000 - 14,999 điểm</Badge>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Nhân điểm:</span>
                  <strong className="text-green-600">x1.1</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Giảm giá:</span>
                  <strong className="text-green-600">5%</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Free ship từ:</span>
                  <strong className="text-green-600">100K</strong>
                </div>
              </div>
            </div>

            {/* Platinum */}
            <div className="border-2 border-purple-300 rounded-xl p-4 bg-gradient-to-br from-purple-50 to-violet-100">
              <div className="flex items-center gap-3 mb-3">
                <Icon.Crown size={28} className="text-purple-600" />
                <div>
                  <h3 className="font-bold text-lg">Hạng Bạch Kim</h3>
                  <Badge className="bg-purple-200 text-purple-800">15,000+ điểm</Badge>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Nhân điểm:</span>
                  <strong className="text-green-600">x1.2</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Giảm giá:</span>
                  <strong className="text-green-600">10%</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Free ship:</span>
                  <strong className="text-green-600">Luôn luôn 🎉</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg mt-4">
            <p className="text-sm text-purple-800">
              💡 <strong>Cách lên hạng:</strong> Dựa vào <strong>Lifetime Points</strong> (tổng điểm tích lũy từ trước đến nay), 
              KHÔNG phải điểm hiện có. Điểm dùng rồi vẫn tính vào lifetime.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Points System */}
      <Card>
        <CardHeader>
          <CardTitle>🎯 Cách Tích & Tiêu Điểm</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
              <Icon.TrendingUp className="text-green-500" />
              Tích Điểm (Earn)
            </h4>
            <div className="bg-green-50 p-4 rounded-lg space-y-3">
              <p className="font-medium">Công thức tính điểm:</p>
              <div className="bg-white p-3 rounded-lg border border-green-200">
                <p className="font-mono text-sm">
                  Điểm = (Giá trị đơn hàng / 1000) × Point Multiplier + Referral Bonus
                </p>
              </div>
              
              <div className="space-y-2 text-sm">
                <p><strong>Ví dụ 1 - Khách Đồng:</strong></p>
                <ul className="ml-5 space-y-1">
                  <li>• Mua 1,500,000đ</li>
                  <li>• Point multiplier: x1.0 (Đồng)</li>
                  <li>• Điểm = 1,500,000 / 1000 × 1.0 = <strong>1,500 điểm</strong></li>
                </ul>

                <p className="mt-3"><strong>Ví dụ 2 - Khách Vàng + CTV Mầm Khỏe:</strong></p>
                <ul className="ml-5 space-y-1">
                  <li>• Mua 2,000,000đ</li>
                  <li>• Point multiplier: x1.1 (Vàng)</li>
                  <li>• Referral bonus: +100 điểm (CTV Mầm Khỏe)</li>
                  <li>• Điểm = (2,000,000 / 1000 × 1.1) + 100 = <strong>2,300 điểm</strong></li>
                </ul>
              </div>

              <Alert className="bg-white border-green-300">
                <Icon.CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 text-sm">
                  Điểm được tích <strong>TỰ ĐỘNG</strong> khi đơn hàng chuyển sang status "delivered".
                </AlertDescription>
              </Alert>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
              <Icon.DollarSign className="text-blue-500" />
              Tiêu Điểm (Redeem)
            </h4>
            <div className="bg-blue-50 p-4 rounded-lg space-y-3">
              <p className="font-medium">Quy tắc tiêu điểm:</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Icon.Check size={16} className="text-blue-600 mt-0.5" />
                  <div>
                    <strong>Tỉ lệ quy đổi:</strong> 1 điểm = 1,000đ giảm giá
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <Icon.Check size={16} className="text-blue-600 mt-0.5" />
                  <div>
                    <strong>Tối thiểu:</strong> 100 điểm (= 100,000đ giảm)
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <Icon.Check size={16} className="text-blue-600 mt-0.5" />
                  <div>
                    <strong>Tối đa:</strong> 50% giá trị đơn hàng
                    <p className="text-gray-600 text-xs mt-1">
                      Vd: Đơn 1 triệu → tối đa dùng 500 điểm (giảm 500K)
                    </p>
                  </div>
                </li>
              </ul>

              <div className="bg-white p-3 rounded-lg border border-blue-200 mt-3">
                <p className="font-medium text-sm mb-2">Ví dụ cụ thể:</p>
                <div className="space-y-1 text-xs text-gray-700">
                  <p>Khách có 2,000 điểm, mua đơn 1,200,000đ</p>
                  <p>→ Tối đa dùng: 1,200,000 × 50% / 1000 = <strong>600 điểm</strong></p>
                  <p>→ Khách chọn dùng 500 điểm</p>
                  <p>→ Giảm giá: 500 × 1,000 = <strong>500,000đ</strong></p>
                  <p>→ Phải trả: 1,200,000 - 500,000 = <strong>700,000đ</strong></p>
                  <p>→ Điểm còn lại: 2,000 - 500 = <strong>1,500 điểm</strong></p>
                </div>
              </div>
            </div>
          </div>

          <Alert className="bg-amber-50 border-amber-200">
            <Icon.Clock className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>⏰ Điểm có hạn sử dụng!</strong> Điểm tự động hết hạn sau 12 tháng kể từ ngày tích. 
              Hệ thống sẽ thông báo trước 30 ngày.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Tier Benefits Detail */}
      <Card>
        <CardHeader>
          <CardTitle>✨ Quyền Lợi Chi Tiết Từng Hạng</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Hạng</th>
                  <th className="p-3 text-left">Điều kiện</th>
                  <th className="p-3 text-center">Nhân điểm</th>
                  <th className="p-3 text-center">Giảm giá</th>
                  <th className="p-3 text-center">Free ship</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-3 font-medium">🥉 Đồng</td>
                  <td className="p-3">0 - 999 điểm</td>
                  <td className="p-3 text-center">x1.0</td>
                  <td className="p-3 text-center">0%</td>
                  <td className="p-3 text-center">Từ 200K</td>
                </tr>
                <tr className="border-b bg-gray-50">
                  <td className="p-3 font-medium">🥈 Bạc</td>
                  <td className="p-3">1,000 - 4,999 điểm</td>
                  <td className="p-3 text-center text-green-600">x1.05</td>
                  <td className="p-3 text-center text-green-600">2%</td>
                  <td className="p-3 text-center text-green-600">Từ 150K</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3 font-medium">🥇 Vàng</td>
                  <td className="p-3">5,000 - 14,999 điểm</td>
                  <td className="p-3 text-center text-green-600">x1.1</td>
                  <td className="p-3 text-center text-green-600">5%</td>
                  <td className="p-3 text-center text-green-600">Từ 100K</td>
                </tr>
                <tr className="bg-purple-50">
                  <td className="p-3 font-medium">👑 Bạch Kim</td>
                  <td className="p-3">15,000+ điểm</td>
                  <td className="p-3 text-center text-purple-600">x1.2</td>
                  <td className="p-3 text-center text-purple-600">10%</td>
                  <td className="p-3 text-center text-purple-600">Luôn luôn</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-violet-50 p-4 rounded-lg">
            <p className="font-medium mb-2">📈 Point Multiplier hoạt động như nào?</p>
            <p className="text-sm text-gray-700">
              Khi khách hạng Vàng (x1.1) mua 1 triệu → Base points = 1,000 điểm → 
              Bonus 10% = 100 điểm → <strong>Tổng tích: 1,100 điểm</strong>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Admin Operations */}
      <Card>
        <CardHeader>
          <CardTitle>🔧 Thao Tác Admin</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Icon.Edit className="text-violet-600" />
                <h4 className="font-bold">Điều Chỉnh Điểm Manual</h4>
              </div>
              <p className="text-sm text-gray-700 mb-2">
                <strong>Khi nào dùng:</strong> Khách khiếu nại thiếu điểm, đền bù sự cố, event đặc biệt
              </p>
              <div className="bg-white p-3 rounded-lg border text-xs space-y-1">
                <p>1. Vào AdminLoyalty → Tìm account</p>
                <p>2. Click "Điều chỉnh"</p>
                <p>3. Nhập số điểm: Dương (+) để cộng, Âm (-) để trừ</p>
                <p>4. Ghi rõ lý do (bắt buộc, để audit trail)</p>
                <p>5. Xác nhận → Điểm được cập nhật, ghi vào history</p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Icon.Clock className="text-amber-600" />
                <h4 className="font-bold">Xử Lý Điểm Hết Hạn</h4>
              </div>
              <p className="text-sm text-gray-700 mb-2">
                Hệ thống tự động chạy hàng ngày (backend function)
              </p>
              <div className="bg-white p-3 rounded-lg border text-xs space-y-1">
                <p>• Điểm hết hạn sau 12 tháng kể từ ngày tích</p>
                <p>• 30 ngày trước hết hạn → hiển thị cảnh báo cho khách</p>
                <p>• Đúng ngày hết hạn → tự động trừ điểm + notify khách</p>
                <p className="text-amber-700 mt-2">
                  ⚙️ Manual trigger: Dashboard → Code → Functions → processLoyaltyExpiration
                </p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Icon.BarChart className="text-blue-600" />
                <h4 className="font-bold">Xem Analytics</h4>
              </div>
              <p className="text-sm text-gray-700">
                AdminLoyalty → Tab "Phân tích" → Xem phân bố tier, xu hướng tích/tiêu điểm, top members
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cross-System Integration */}
      <Card className="border-green-200">
        <CardHeader className="bg-green-50">
          <CardTitle className="flex items-center gap-2">
            <Icon.Zap size={20} className="text-green-600" />
            Tích Hợp Loyalty ↔ Referral
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div>
            <h4 className="font-bold mb-2">🎁 CTV cao cấp → Bonus Loyalty Points</h4>
            <p className="text-sm text-gray-700 mb-2">
              Khi khách hàng vừa là CTV (có referral member), điểm tích được sẽ cao hơn:
            </p>
            <div className="bg-white p-3 rounded-lg border space-y-1 text-xs">
              <p>• CTV Hạt Giống Khỏe: +50 điểm/đơn</p>
              <p>• CTV Mầm Khỏe: +100 điểm/đơn</p>
              <p>• CTV Chồi Khỏe: +200 điểm/đơn</p>
              <p>• CTV Cành Khỏe: +300 điểm/đơn</p>
              <p>• CTV Cây Khỏe: +500 điểm/đơn</p>
              <p>• CTV Danh Hiệu: +1,000 điểm/đơn</p>
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-2">💎 Loyalty cao → Bonus Referral Rate</h4>
            <p className="text-sm text-gray-700 mb-2">
              CTV có loyalty tier cao sẽ nhận thêm % hoa hồng:
            </p>
            <div className="bg-white p-3 rounded-lg border space-y-1 text-xs">
              <p>• Đồng: +0%</p>
              <p>• Bạc: +0.1% hoa hồng</p>
              <p>• Vàng: +0.2% hoa hồng</p>
              <p>• Bạch Kim: +0.5% hoa hồng</p>
            </div>
          </div>

          <Alert className="bg-green-50 border-green-300">
            <Icon.Sparkles className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 text-sm">
              <strong>Ví dụ kết hợp:</strong> CTV Vàng (loyalty) + Mầm Khỏe (seeder) + Tier 3 (doanh số 60M)
              <br />→ Commission = 3% + 0.2% (rank) + 0.2% (loyalty) = <strong>3.4% hoa hồng!</strong>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* FAQs */}
      <Card>
        <CardHeader>
          <CardTitle>❓ Câu Hỏi Loyalty</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <h4 className="font-bold text-blue-700">Q: Khách dùng điểm nhưng order bị cancel?</h4>
            <p className="text-sm text-gray-700 mt-1">
              <strong>A:</strong> Điểm sẽ được hoàn lại tự động. Logic: 
              Điểm chỉ bị trừ thật khi order status = "delivered". Nếu cancel trước đó, điểm không bị động.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-blue-700">Q: Lifetime points khác gì total points?</h4>
            <p className="text-sm text-gray-700 mt-1">
              <strong>A:</strong>
            </p>
            <ul className="text-sm text-gray-700 ml-5 mt-1 space-y-1">
              <li>• <strong>Lifetime points:</strong> Tổng điểm tích lũy từ trước đến nay (không giảm khi dùng) → Dùng để tính tier</li>
              <li>• <strong>Total points:</strong> Điểm hiện có, có thể dùng → Trừ đi khi redeem</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-blue-700">Q: Điểm có hết hạn không?</h4>
            <p className="text-sm text-gray-700 mt-1">
              <strong>A:</strong> Có, sau 12 tháng kể từ ngày tích. Hệ thống tự động expire và notify khách trước 30 ngày.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Best Practices */}
      <Card className="border-green-200">
        <CardHeader className="bg-green-50">
          <CardTitle className="flex items-center gap-2 text-green-700">
            <Icon.Lightbulb size={20} />
            Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <Icon.CheckCircle size={16} className="text-green-600 mt-0.5" />
            <p>Theo dõi <strong>points_expiring_soon</strong> - nhắc khách dùng điểm trước khi mất</p>
          </div>
          <div className="flex items-start gap-2">
            <Icon.CheckCircle size={16} className="text-green-600 mt-0.5" />
            <p>Set reminder email tự động 30 ngày trước hết hạn</p>
          </div>
          <div className="flex items-start gap-2">
            <Icon.CheckCircle size={16} className="text-green-600 mt-0.5" />
            <p>Khuyến khích khách lên hạng cao → tăng retention</p>
          </div>
          <div className="flex items-start gap-2">
            <Icon.CheckCircle size={16} className="text-green-600 mt-0.5" />
            <p>Kết hợp với referral → khách vừa mua vừa giới thiệu → double incentive</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}