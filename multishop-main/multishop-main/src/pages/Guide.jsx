import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@/components/ui/AnimatedIcon.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

const GuideSection = ({ icon: IconComponent, title, children, gradient }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="mb-8"
  >
    <Card className={`border-2 ${gradient} overflow-hidden`}>
      <CardHeader className="bg-gradient-to-r from-white to-gray-50">
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
            <IconComponent size={24} className="text-white" />
          </div>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {children}
      </CardContent>
    </Card>
  </motion.div>
);

const StepItem = ({ number, title, description, icon: IconComponent }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ delay: number * 0.1 }}
    className="flex gap-4 mb-6 last:mb-0"
  >
    <div className="flex-shrink-0">
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
        {number}
      </div>
    </div>
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-2">
        {IconComponent && <IconComponent size={20} className="text-green-600" />}
        <h4 className="font-semibold text-lg">{title}</h4>
      </div>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  </motion.div>
);

const FeatureCard = ({ icon: IconComponent, title, description, badge }) => (
  <motion.div
    whileHover={{ scale: 1.02, y: -5 }}
    className="p-6 bg-gradient-to-br from-white to-gray-50 rounded-xl border-2 border-green-100 hover:border-green-300 transition-all"
  >
    <div className="flex items-start justify-between mb-3">
      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
        <IconComponent size={28} className="text-white" />
      </div>
      {badge && <Badge className="bg-amber-500">{badge}</Badge>}
    </div>
    <h4 className="font-bold text-lg mb-2">{title}</h4>
    <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
  </motion.div>
);

export default function Guide() {
  const [activeTab, setActiveTab] = useState('shopping');

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 pt-32 pb-20">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <Icon.Lightbulb size={40} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Hướng Dẫn Sử Dụng
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Khám phá mọi tính năng và cách thức để trải nghiệm tốt nhất tại nông sản Khỏe
          </p>
        </motion.div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 mb-8 bg-white shadow-md h-auto p-2 gap-2">
            <TabsTrigger value="shopping" className="data-[state=active]:bg-green-500 data-[state=active]:text-white flex items-center gap-2 py-3">
              <Icon.ShoppingCart size={18} />
              <span className="hidden md:inline">Mua hàng</span>
            </TabsTrigger>
            <TabsTrigger value="community" className="data-[state=active]:bg-green-500 data-[state=active]:text-white flex items-center gap-2 py-3">
              <Icon.Users size={18} />
              <span className="hidden md:inline">Cộng đồng</span>
            </TabsTrigger>
            <TabsTrigger value="points" className="data-[state=active]:bg-green-500 data-[state=active]:text-white flex items-center gap-2 py-3">
              <Icon.Star size={18} />
              <span className="hidden md:inline">Tích điểm</span>
            </TabsTrigger>
            <TabsTrigger value="referral" className="data-[state=active]:bg-green-500 data-[state=active]:text-white flex items-center gap-2 py-3">
              <Icon.Gift size={18} />
              <span className="hidden md:inline">Giới thiệu</span>
            </TabsTrigger>
            <TabsTrigger value="collaborator" className="data-[state=active]:bg-green-500 data-[state=active]:text-white flex items-center gap-2 py-3">
              <Icon.Award size={18} />
              <span className="hidden md:inline">Cộng tác viên</span>
            </TabsTrigger>
          </TabsList>

          {/* Shopping Guide */}
          <TabsContent value="shopping" className="mt-0">
            <GuideSection
              icon={Icon.ShoppingCart}
              title="Hướng Dẫn Mua Hàng"
              gradient="border-green-300"
            >
              <div className="space-y-8">
                {/* Steps */}
                <div>
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Icon.CheckCircle size={24} className="text-green-600" />
                    Các Bước Mua Hàng
                  </h3>
                  <StepItem
                    number={1}
                    icon={Icon.Search}
                    title="Tìm kiếm sản phẩm"
                    description="Duyệt danh mục sản phẩm hoặc sử dụng thanh tìm kiếm để tìm sản phẩm bạn cần. Lọc theo danh mục: Rau, Trái cây, Gạo, hoặc Sản phẩm chế biến."
                  />
                  <StepItem
                    number={2}
                    icon={Icon.ShoppingCart}
                    title="Thêm vào giỏ hàng"
                    description="Nhấn nút 'Thêm vào giỏ' trên sản phẩm. Điều chỉnh số lượng mong muốn. Xem chi tiết sản phẩm để biết thêm thông tin về nguồn gốc và chất lượng."
                  />
                  <StepItem
                    number={3}
                    icon={Icon.FileText}
                    title="Điền thông tin giao hàng"
                    description="Nhập họ tên, số điện thoại, địa chỉ nhận hàng đầy đủ. Chọn thời gian giao hàng phù hợp. Thêm ghi chú nếu có yêu cầu đặc biệt."
                  />
                  <StepItem
                    number={4}
                    icon={Icon.CreditCard}
                    title="Chọn phương thức thanh toán"
                    description="Thanh toán khi nhận hàng (COD), chuyển khoản ngân hàng, hoặc ví điện tử (MoMo, VNPay). Nhập mã giảm giá nếu có."
                  />
                  <StepItem
                    number={5}
                    icon={Icon.CheckCircle}
                    title="Xác nhận đơn hàng"
                    description="Kiểm tra lại thông tin đơn hàng. Nhấn 'Đặt hàng' để hoàn tất. Bạn sẽ nhận được email/SMS xác nhận đơn hàng."
                  />
                </div>

                {/* Tips */}
                <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Icon.Lightbulb size={20} className="text-amber-600" />
                    Mẹo Mua Hàng Hiệu Quả
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <Icon.CheckCircle size={18} className="text-green-600 flex-shrink-0 mt-1" />
                      <span className="text-gray-700">Đặt hàng buổi sáng để được giao trong ngày</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Icon.CheckCircle size={18} className="text-green-600 flex-shrink-0 mt-1" />
                      <span className="text-gray-700">Mua combo để tiết kiệm chi phí và nhận ưu đãi</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Icon.CheckCircle size={18} className="text-green-600 flex-shrink-0 mt-1" />
                      <span className="text-gray-700">Theo dõi đơn hàng trong mục "Đơn hàng của tôi"</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Icon.CheckCircle size={18} className="text-green-600 flex-shrink-0 mt-1" />
                      <span className="text-gray-700">Chụp ảnh sản phẩm khi nhận hàng để bảo đảm quyền lợi</span>
                    </li>
                  </ul>
                </div>

                {/* CTA */}
                <div className="text-center">
                  <Link to={createPageUrl('Services')}>
                    <Button size="lg" className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
                      <Icon.ShoppingCart size={20} className="mr-2" />
                      Bắt Đầu Mua Sắm
                    </Button>
                  </Link>
                </div>
              </div>
            </GuideSection>
          </TabsContent>

          {/* Community Guide */}
          <TabsContent value="community" className="mt-0">
            <GuideSection
              icon={Icon.Users}
              title="Tham Gia Cộng Đồng"
              gradient="border-blue-300"
            >
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Icon.Heart size={24} className="text-red-500" />
                    Hoạt Động Cộng Đồng
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <FeatureCard
                      icon={Icon.Edit}
                      title="Đăng bài chia sẻ"
                      description="Chia sẻ kinh nghiệm chế biến món ăn, mẹo bảo quản thực phẩm, hoặc bất kỳ nội dung nào liên quan đến nông sản sạch."
                    />
                    <FeatureCard
                      icon={Icon.ThumbsUp}
                      title="Tương tác & bình luận"
                      description="Like, comment và chia sẻ bài viết của người khác. Kết nối với những người có cùng sở thích về sống khỏe."
                    />
                    <FeatureCard
                      icon={Icon.Camera}
                      title="Chia sẻ hình ảnh & video"
                      description="Đăng ảnh món ăn ngon, vườn rau tự trồng, hoặc video hướng dẫn chế biến để truyền cảm hứng cho cộng đồng."
                    />
                    <FeatureCard
                      icon={Icon.Star}
                      title="Đánh giá sản phẩm"
                      description="Viết review chi tiết về sản phẩm đã mua. Giúp người khác có thêm thông tin để đưa ra quyết định mua hàng."
                    />
                  </div>
                </div>

                <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Icon.Shield size={20} className="text-blue-600" />
                    Quy Tắc Cộng Đồng
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <Icon.CheckCircle size={18} className="text-blue-600 flex-shrink-0 mt-1" />
                      <span className="text-gray-700">Nội dung tích cực, không spam, quảng cáo trái phép</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Icon.CheckCircle size={18} className="text-blue-600 flex-shrink-0 mt-1" />
                      <span className="text-gray-700">Tôn trọng ý kiến và không tranh cãi thiếu văn hóa</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Icon.CheckCircle size={18} className="text-blue-600 flex-shrink-0 mt-1" />
                      <span className="text-gray-700">Chia sẻ thông tin chính xác, có nguồn gốc rõ ràng</span>
                    </li>
                  </ul>
                </div>

                <div className="text-center">
                  <Link to={createPageUrl('Community')}>
                    <Button size="lg" className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                      <Icon.Users size={20} className="mr-2" />
                      Khám Phá Cộng Đồng
                    </Button>
                  </Link>
                </div>
              </div>
            </GuideSection>
          </TabsContent>

          {/* Points Guide */}
          <TabsContent value="points" className="mt-0">
            <GuideSection
              icon={Icon.Star}
              title="Hệ Thống Tích Điểm"
              gradient="border-amber-300"
            >
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Icon.Coins size={24} className="text-amber-600" />
                    Cách Tích Điểm
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <FeatureCard
                      icon={Icon.ShoppingBag}
                      title="Mua sắm tích điểm"
                      badge="1% giá trị đơn"
                      description="Nhận 1 điểm cho mỗi 1.000đ chi tiêu. Ví dụ: Đơn 500.000đ = 500 điểm."
                    />
                    <FeatureCard
                      icon={Icon.Edit}
                      title="Viết đánh giá"
                      badge="+50 điểm"
                      description="Đánh giá chi tiết có hình ảnh/video về sản phẩm đã mua để nhận điểm thưởng."
                    />
                    <FeatureCard
                      icon={Icon.Gift}
                      title="Giới thiệu bạn bè"
                      badge="+100 điểm"
                      description="Mời bạn bè đăng ký và mua hàng thành công để nhận điểm thưởng cho cả hai."
                    />
                    <FeatureCard
                      icon={Icon.Calendar}
                      title="Đăng nhập hàng ngày"
                      badge="+10 điểm"
                      description="Check-in mỗi ngày để nhận điểm. Streak 7 ngày liên tiếp nhận thêm 50 điểm bonus."
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Icon.Gift size={24} className="text-purple-600" />
                    Đổi Quà & Ưu Đãi
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200">
                      <div>
                        <p className="font-bold text-lg">Voucher 50.000đ</p>
                        <p className="text-sm text-gray-600">Đơn hàng từ 300.000đ</p>
                      </div>
                      <Badge className="bg-amber-500 text-white">500 điểm</Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                      <div>
                        <p className="font-bold text-lg">Miễn phí vận chuyển</p>
                        <p className="text-sm text-gray-600">Áp dụng 1 lần</p>
                      </div>
                      <Badge className="bg-green-500 text-white">300 điểm</Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
                      <div>
                        <p className="font-bold text-lg">Giảm 10% toàn bộ đơn</p>
                        <p className="text-sm text-gray-600">Tối đa 100.000đ</p>
                      </div>
                      <Badge className="bg-blue-500 text-white">1000 điểm</Badge>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 rounded-xl p-6 border-2 border-amber-200">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Icon.Info size={20} className="text-amber-600" />
                    Lưu Ý Quan Trọng
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <Icon.Clock size={18} className="text-amber-600 flex-shrink-0 mt-1" />
                      <span className="text-gray-700">Điểm có hiệu lực trong 12 tháng kể từ ngày tích</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Icon.Ban size={18} className="text-amber-600 flex-shrink-0 mt-1" />
                      <span className="text-gray-700">Điểm không được chuyển nhượng hoặc quy đổi thành tiền mặt</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Icon.AlertCircle size={18} className="text-amber-600 flex-shrink-0 mt-1" />
                      <span className="text-gray-700">Đơn hàng bị hủy hoặc hoàn trả sẽ trừ lại điểm đã tích</span>
                    </li>
                  </ul>
                </div>

                <div className="text-center">
                  <Link to={createPageUrl('MyProfile')}>
                    <Button size="lg" className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700">
                      <Icon.Star size={20} className="mr-2" />
                      Xem Điểm Của Tôi
                    </Button>
                  </Link>
                </div>
              </div>
            </GuideSection>
          </TabsContent>

          {/* Referral Guide */}
          <TabsContent value="referral" className="mt-0">
            <GuideSection
              icon={Icon.Gift}
              title="Chương Trình Giới Thiệu"
              gradient="border-purple-300"
            >
              <div className="space-y-8">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200 mb-6">
                  <div className="text-center">
                    <Icon.Gift size={48} className="text-purple-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-2">Giới Thiệu - Nhận Thưởng</h3>
                    <p className="text-gray-600 mb-4">Chia sẻ niềm vui mua sắm, cùng nhận ưu đãi!</p>
                    <div className="flex items-center justify-center gap-8">
                      <div>
                        <p className="text-3xl font-bold text-purple-600">50.000đ</p>
                        <p className="text-sm text-gray-600">Bạn nhận</p>
                      </div>
                      <Icon.ArrowRight size={32} className="text-purple-400" />
                      <div>
                        <p className="text-3xl font-bold text-pink-600">50.000đ</p>
                        <p className="text-sm text-gray-600">Bạn bè nhận</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Icon.Zap size={24} className="text-yellow-600" />
                    Cách Thức Hoạt Động
                  </h3>
                  <StepItem
                    number={1}
                    icon={Icon.Share}
                    title="Chia sẻ mã giới thiệu"
                    description="Lấy mã giới thiệu cá nhân trong mục 'Giới thiệu bạn bè'. Chia sẻ qua Zalo, Facebook, Messenger hoặc sao chép link."
                  />
                  <StepItem
                    number={2}
                    icon={Icon.UserPlus}
                    title="Bạn bè đăng ký"
                    description="Bạn bè sử dụng mã của bạn khi đăng ký tài khoản mới. Mã phải được nhập trước khi hoàn tất đơn hàng đầu tiên."
                  />
                  <StepItem
                    number={3}
                    icon={Icon.ShoppingBag}
                    title="Hoàn thành đơn đầu tiên"
                    description="Bạn bè đặt và nhận hàng thành công đơn hàng đầu tiên từ 200.000đ trở lên để kích hoạt phần thưởng."
                  />
                  <StepItem
                    number={4}
                    icon={Icon.Wallet}
                    title="Nhận thưởng ngay"
                    description="Cả bạn và bạn bè đều nhận 50.000đ vào tài khoản. Tiền thưởng có thể dùng cho đơn hàng tiếp theo (tối thiểu 300.000đ)."
                  />
                </div>

                <div className="bg-purple-50 rounded-xl p-6 border-2 border-purple-200">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Icon.Star size={20} className="text-purple-600" />
                    Ưu Đãi Đặc Biệt
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <span className="text-gray-700">Giới thiệu 5 người</span>
                      <Badge className="bg-purple-500">+100.000đ bonus</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <span className="text-gray-700">Giới thiệu 10 người</span>
                      <Badge className="bg-purple-500">+250.000đ bonus</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <span className="text-gray-700">Top giới thiệu tháng</span>
                      <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500">Quà đặc biệt</Badge>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <Link to={createPageUrl('MyReferrals')}>
                    <Button size="lg" className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700">
                      <Icon.Gift size={20} className="mr-2" />
                      Bắt Đầu Giới Thiệu
                    </Button>
                  </Link>
                </div>
              </div>
            </GuideSection>
          </TabsContent>

          {/* Collaborator Guide */}
          <TabsContent value="collaborator" className="mt-0">
            <GuideSection
              icon={Icon.Award}
              title="Trở Thành Cộng Tác Viên"
              gradient="border-indigo-300"
            >
              <div className="space-y-8">
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-8 border-2 border-indigo-200 text-center mb-6">
                  <Icon.Crown size={56} className="text-indigo-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-3">Kiếm Thu Nhập Từ Đam Mê</h3>
                  <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                    Trở thành Người Gieo Hạt - Cộng tác viên chính thức của Nông Sản Khỏe. Nhận hoa hồng lên đến 3% doanh số bán hàng và nhiều quyền lợi hấp dẫn!
                  </p>
                  <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto">
                    <div className="bg-white rounded-xl p-4">
                      <p className="text-3xl font-bold text-indigo-600 mb-1">1-3%</p>
                      <p className="text-xs text-gray-600">Hoa hồng</p>
                    </div>
                    <div className="bg-white rounded-xl p-4">
                      <p className="text-3xl font-bold text-green-600 mb-1">0đ</p>
                      <p className="text-xs text-gray-600">Phí tham gia</p>
                    </div>
                    <div className="bg-white rounded-xl p-4">
                      <p className="text-3xl font-bold text-purple-600 mb-1">7 cấp</p>
                      <p className="text-xs text-gray-600">Thăng hạng</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Icon.CheckCircle size={24} className="text-green-600" />
                    Điều Kiện Tham Gia
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-white rounded-xl border-2 border-gray-200 flex items-start gap-3">
                      <Icon.CheckCircle size={24} className="text-green-600 flex-shrink-0" />
                      <div>
                        <p className="font-semibold mb-1">Đã mua hàng thành công</p>
                        <p className="text-sm text-gray-600">Tối thiểu 1 đơn hàng đã giao</p>
                      </div>
                    </div>
                    <div className="p-4 bg-white rounded-xl border-2 border-gray-200 flex items-start gap-3">
                      <Icon.CheckCircle size={24} className="text-green-600 flex-shrink-0" />
                      <div>
                        <p className="font-semibold mb-1">Tài khoản xác thực</p>
                        <p className="text-sm text-gray-600">Thông tin đầy đủ và chính xác</p>
                      </div>
                    </div>
                    <div className="p-4 bg-white rounded-xl border-2 border-gray-200 flex items-start gap-3">
                      <Icon.CheckCircle size={24} className="text-green-600 flex-shrink-0" />
                      <div>
                        <p className="font-semibold mb-1">Đam mê chia sẻ</p>
                        <p className="text-sm text-gray-600">Yêu thích sản phẩm nông sản sạch</p>
                      </div>
                    </div>
                    <div className="p-4 bg-white rounded-xl border-2 border-gray-200 flex items-start gap-3">
                      <Icon.CheckCircle size={24} className="text-green-600 flex-shrink-0" />
                      <div>
                        <p className="font-semibold mb-1">Tuân thủ quy định</p>
                        <p className="text-sm text-gray-600">Cam kết không vi phạm chính sách</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Icon.TrendingUp size={24} className="text-blue-600" />
                    Hệ Thống Cấp Bậc
                  </h3>
                  <div className="space-y-3">
                    {[
                      { rank: 'Người Gieo Hạt', rate: '1%', f1: '0-4', color: 'gray' },
                      { rank: 'Hạt Giống Khỏe', rate: '1.1%', f1: '5-9', color: 'green' },
                      { rank: 'Mầm Khỏe', rate: '1.2%', f1: '10-19', color: 'lime' },
                      { rank: 'Chồi Khỏe', rate: '1.3%', f1: '20-49', color: 'emerald' },
                      { rank: 'Cành Khỏe', rate: '1.4%', f1: '50-99', color: 'teal' },
                      { rank: 'Cây Khỏe', rate: '1.5%', f1: '100+', color: 'amber' },
                      { rank: 'Danh Hiệu', rate: '2%', f1: 'Đặc biệt', color: 'purple' }
                    ].map((tier, idx) => (
                      <motion.div
                        key={tier.rank}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.05 }}
                        className={`flex items-center justify-between p-4 bg-${tier.color}-50 rounded-xl border-2 border-${tier.color}-200`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg bg-${tier.color}-500 flex items-center justify-center text-white font-bold`}>
                            {idx + 1}
                          </div>
                          <div>
                            <p className="font-bold">{tier.rank}</p>
                            <p className="text-sm text-gray-600">{tier.f1} F1 đã mua</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600">{tier.rate}</p>
                          <p className="text-xs text-gray-600">Hoa hồng</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Icon.Gift size={24} className="text-purple-600" />
                    Quyền Lợi Đặc Biệt
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <FeatureCard
                      icon={Icon.DollarSign}
                      title="Hoa hồng hấp dẫn"
                      description="1-3% doanh số từ khách hàng F1. Chi trả hàng tháng, minh bạch và đúng hạn."
                    />
                    <FeatureCard
                      icon={Icon.Trophy}
                      title="Thưởng thăng hạng"
                      description="Bonus đặc biệt khi đạt cấp mới. Giấy chứng nhận và quà tặng cho cấp cao."
                    />
                    <FeatureCard
                      icon={Icon.Users}
                      title="Cộng đồng CTV"
                      description="Kết nối với CTV khác. Tham gia group riêng, training và sự kiện độc quyền."
                    />
                    <FeatureCard
                      icon={Icon.Sparkles}
                      title="Ưu đãi mua hàng"
                      description="Giảm giá đặc biệt cho CTV. Được dùng sản phẩm mẫu để trải nghiệm."
                    />
                  </div>
                </div>

                <div className="bg-indigo-50 rounded-xl p-6 border-2 border-indigo-200">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Icon.Rocket size={20} className="text-indigo-600" />
                    Bắt Đầu Ngay Hôm Nay
                  </h3>
                  <ol className="space-y-3 mb-6">
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                      <span className="text-gray-700">Đăng ký tài khoản CTV tại trang "Giới thiệu bạn bè"</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                      <span className="text-gray-700">Chờ admin duyệt (thường trong 24h)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                      <span className="text-gray-700">Nhận mã CTV và công cụ hỗ trợ bán hàng</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                      <span className="text-gray-700">Bắt đầu chia sẻ và nhận hoa hồng!</span>
                    </li>
                  </ol>
                </div>

                <div className="text-center">
                  <Link to={createPageUrl('MyReferrals')}>
                    <Button size="lg" className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700">
                      <Icon.Award size={20} className="mr-2" />
                      Đăng Ký Cộng Tác Viên
                    </Button>
                  </Link>
                </div>
              </div>
            </GuideSection>
          </TabsContent>
        </Tabs>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl p-8 text-center text-white shadow-xl"
        >
          <Icon.HelpCircle size={48} className="mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-3">Cần Hỗ Trợ Thêm?</h3>
          <p className="mb-6 opacity-90">
            Liên hệ với chúng tôi qua hotline, email hoặc chat trực tuyến. Đội ngũ hỗ trợ luôn sẵn sàng giúp bạn!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to={createPageUrl('Contact')}>
              <Button size="lg" variant="outline" className="bg-white text-green-600 hover:bg-gray-100">
                <Icon.Phone size={20} className="mr-2" />
                Liên Hệ
              </Button>
            </Link>
            <a href="mailto:support@nongsankhoe.com">
              <Button size="lg" variant="outline" className="bg-white text-green-600 hover:bg-gray-100">
                <Icon.Mail size={20} className="mr-2" />
                Email
              </Button>
            </a>
            <Button size="lg" variant="outline" className="bg-white text-blue-600 hover:bg-gray-100">
              <Icon.MessageCircle size={20} className="mr-2" />
              Gửi Feedback
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}