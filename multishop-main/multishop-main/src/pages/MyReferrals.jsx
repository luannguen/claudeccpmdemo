import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';
import { Icon } from '@/components/ui/AnimatedIcon.jsx';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  useMyReferralMember,
  useMyReferralEvents,
  useMyReferredCustomers,
  useRegisterReferralMember,
  useCheckEligibility,
  useReferralSettings
} from '@/components/hooks/useReferralSystem';
import SeederRankProgress from '@/components/referral/SeederRankProgress';
import RegisterCustomerModalEnhanced from '@/components/referral/RegisterCustomerModalEnhanced';
import ClaimCustomerModal from '@/components/referral/ClaimCustomerModal';
import WithdrawalRequestModal from '@/components/referral/WithdrawalRequestModal';
import TierProgressAlert from '@/components/referral/TierProgressAlert';
import ReferralCommissionTracker from '@/components/referral/ReferralCommissionTracker';
import { useMyWithdrawals } from '@/components/hooks/useWithdrawal';
import ReferralLeaderboard from '@/components/referral/ReferralLeaderboard';
import ReferralAchievements from '@/components/referral/ReferralAchievements';
import ReferralQRCode from '@/components/referral/ReferralQRCode';
import CommissionForecast from '@/components/referral/CommissionForecast';
import { useRegisterCustomer } from '@/components/hooks/useReferralCustomerRegistration';
import { useReferralMembers } from '@/components/hooks/useReferralSystem';
import ReferralShareToolkit from '@/components/referral/ReferralShareToolkit';
import ReferralAnalyticsDashboard from '@/components/referral/ReferralAnalyticsDashboard';
import GamificationLeaderboard from '@/components/referral/GamificationLeaderboard';
import MilestoneTracker from '@/components/referral/MilestoneTracker';
import PerformanceInsights from '@/components/referral/PerformanceInsights';
import CustomerJourneyViewer from '@/components/referral/CustomerJourneyViewer';
import SmartNotificationPanel from '@/components/referral/SmartNotificationPanel';

// ========== COMPONENTS ==========

function ReferralNotMember({ onRegister, checking, settings }) {
  const { data: user } = useQuery({
    queryKey: ['current-user-referral'],
    queryFn: () => base44.auth.me()
  });
  
  const { checkEligibility, checking: checkingEligibility, result } = useCheckEligibility();
  
  const requireOrderCheck = settings?.enable_referrer_order_check === true;
  
  const handleCheckEligibility = async () => {
    if (user?.email) {
      await checkEligibility(user.email);
    }
  };
  
  const handleRegister = () => {
    if (user) {
      onRegister({
        email: user.email,
        fullName: user.full_name,
        phone: user.phone || ''
      });
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
        <CardHeader className="text-center pb-4">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon.Gift size={40} className="text-amber-600" />
          </div>
          <CardTitle className="text-2xl">Chương Trình Giới Thiệu</CardTitle>
          <p className="text-gray-600 mt-2">
            Giới thiệu bạn bè và nhận hoa hồng lên đến 3% doanh số!
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Benefits */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-white rounded-xl">
              <div className="text-2xl font-bold text-amber-600">1%</div>
              <div className="text-xs text-gray-500">0-10 triệu</div>
            </div>
            <div className="p-4 bg-white rounded-xl">
              <div className="text-2xl font-bold text-amber-600">2%</div>
              <div className="text-xs text-gray-500">10-50 triệu</div>
            </div>
            <div className="p-4 bg-white rounded-xl">
              <div className="text-2xl font-bold text-amber-600">3%</div>
              <div className="text-xs text-gray-500">&gt;50 triệu</div>
            </div>
          </div>
          
          {/* Requirements */}
          <div className="bg-white rounded-xl p-4">
            <h4 className="font-medium mb-3">Điều kiện tham gia:</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              {requireOrderCheck && (
                <li className="flex items-center gap-2">
                  <Icon.CheckCircle size={16} className="text-green-500" />
                  Có ít nhất 1 đơn hàng thành công
                </li>
              )}
              <li className="flex items-center gap-2">
                <Icon.CheckCircle size={16} className="text-green-500" />
                Tài khoản xác thực đầy đủ
              </li>
              <li className="flex items-center gap-2">
                <Icon.CheckCircle size={16} className="text-green-500" />
                Không vi phạm chính sách
              </li>
            </ul>
          </div>
          
          {/* Eligibility Check */}
          {result && (
            <div className={`p-4 rounded-xl ${result.eligible ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {result.eligible ? (
                <div className="flex items-center gap-2">
                  <Icon.CheckCircle size={20} />
                  <span>{result.message}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Icon.AlertCircle size={20} />
                  <span>{result.message}</span>
                </div>
              )}
            </div>
          )}
          
          {/* Actions */}
          <div className="flex gap-3">
            {requireOrderCheck ? (
              // Need to check eligibility first
              !result ? (
                <Button 
                  onClick={handleCheckEligibility}
                  disabled={checkingEligibility}
                  variant="outline"
                  className="flex-1"
                >
                  {checkingEligibility ? 'Đang kiểm tra...' : 'Kiểm tra điều kiện'}
                </Button>
              ) : result.eligible ? (
                <Button 
                  onClick={handleRegister}
                  disabled={checking}
                  className="flex-1 bg-amber-500 hover:bg-amber-600"
                >
                  {checking ? 'Đang đăng ký...' : 'Đăng ký ngay'}
                </Button>
              ) : (
                <Link to={createPageUrl('Services')} className="flex-1">
                  <Button className="w-full">
                    Mua hàng ngay
                  </Button>
                </Link>
              )
            ) : (
              // No order check required - register directly
              <Button 
                onClick={handleRegister}
                disabled={checking}
                className="flex-1 bg-amber-500 hover:bg-amber-600"
              >
                {checking ? 'Đang đăng ký...' : 'Đăng ký ngay'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ReferralPending({ member }) {
  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-amber-200">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon.Clock size={32} className="text-amber-600" />
          </div>
          <CardTitle>Đang Chờ Duyệt</CardTitle>
          <p className="text-gray-600 mt-2">
            Đơn đăng ký của bạn đang được xem xét. Chúng tôi sẽ thông báo khi tài khoản được kích hoạt.
          </p>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Ngày đăng ký:</span>
                <p className="font-medium">{new Date(member.created_date).toLocaleDateString('vi-VN')}</p>
              </div>
              <div>
                <span className="text-gray-500">Mã giới thiệu:</span>
                <p className="font-medium">{member.referral_code}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ReferralDashboard({ member, events, customers, settings }) {
  const [copied, setCopied] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  const { data: withdrawals = [] } = useMyWithdrawals(member?.id);
  
  const { data: allMembers = [] } = useReferralMembers({ status: 'all' });
  const registerCustomerMutation = useRegisterCustomer(member.id);
  
  const copyCode = () => {
    navigator.clipboard.writeText(member.referral_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const copyLink = () => {
    navigator.clipboard.writeText(member.referral_link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const shareToZalo = () => {
    window.open(`https://zalo.me/share?url=${encodeURIComponent(member.referral_link)}`, '_blank');
  };
  
  const shareToMessenger = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(member.referral_link)}`, '_blank');
  };
  
  const rankColors = {
    member: 'bg-gray-100 text-gray-700',
    silver: 'bg-gray-200 text-gray-800',
    gold: 'bg-amber-100 text-amber-700',
    platinum: 'bg-purple-100 text-purple-700'
  };
  
    const rankLabels = settings?.seeder_rank_config || {};
  const currentRankLabel = rankLabels[member.seeder_rank]?.label || member.seeder_rank;
  
  // Calculate commission rate based on current month revenue
  const currentTier = settings?.commission_tiers?.find(tier => {
    const max = tier.max_revenue || Infinity;
    return member.current_month_revenue >= tier.min_revenue && member.current_month_revenue < max;
  }) || settings?.commission_tiers?.[0];
  
  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <Icon.Users size={24} className="text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{member.total_referred_customers || 0}</p>
                <p className="text-xs text-gray-500">Khách giới thiệu</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Icon.TrendingUp size={24} className="text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {((member.total_referral_revenue || 0) / 1000000).toFixed(1)}M
                </p>
                <p className="text-xs text-gray-500">Tổng doanh số</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Icon.Wallet size={24} className="text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {((member.unpaid_commission || 0) / 1000).toFixed(0)}K
                </p>
                <p className="text-xs text-gray-500">Hoa hồng chờ</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Icon.Award size={24} className="text-purple-600" />
              </div>
              <div>
                <Badge className={rankColors[member.seeder_rank] || rankColors.nguoi_gieo_hat}>
                  {currentRankLabel}
                </Badge>
                <p className="text-xs text-gray-500 mt-1">Hạng thành viên</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Referral Code & Share */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Icon.Share size={20} className="text-amber-500" />
              Mã Giới Thiệu Của Bạn
            </CardTitle>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowClaimModal(true)}
                size="sm"
                variant="outline"
                className="border-amber-300 text-amber-700 hover:bg-amber-50"
              >
                <Icon.UserCheck size={16} className="mr-1.5" />
                Claim KH cũ
              </Button>
              <Button
                onClick={() => setShowRegisterModal(true)}
                size="sm"
                className="bg-[#7CB342] hover:bg-[#5a8f31]"
              >
                <Icon.UserPlus size={16} className="mr-1.5" />
                Đăng ký KH mới
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Code */}
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-amber-50 border-2 border-dashed border-amber-300 rounded-xl px-6 py-4 text-center">
              <p className="text-3xl font-bold text-amber-600 tracking-wider">{member.referral_code}</p>
            </div>
            <Button onClick={copyCode} variant="outline" className="h-16">
              {copied ? <Icon.CheckCircle size={20} className="text-green-500" /> : <Icon.Copy size={20} />}
            </Button>
          </div>
          
          {/* Link */}
          <div className="flex items-center gap-2">
            <Input 
              value={member.referral_link} 
              readOnly 
              className="bg-gray-50"
            />
            <Button onClick={copyLink} variant="outline" size="icon">
              <Icon.Link size={16} />
            </Button>
          </div>
          
          {/* Share buttons */}
          <div className="flex gap-3">
            <Button onClick={shareToZalo} variant="outline" className="flex-1">
              <Icon.MessageCircle size={16} className="mr-2" />
              Zalo
            </Button>
            <Button onClick={shareToMessenger} variant="outline" className="flex-1">
              <Icon.Share size={16} className="mr-2" />
              Messenger
            </Button>
            <Button onClick={copyLink} variant="outline" className="flex-1">
              <Icon.Copy size={16} className="mr-2" />
              Copy Link
            </Button>
          </div>
          
          {/* Current commission rate */}
          {currentTier && (
            <div className="bg-green-50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Tỉ lệ hoa hồng hiện tại</p>
                  <p className="text-2xl font-bold text-green-600">{currentTier.rate}%</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Doanh số tháng này</p>
                  <p className="font-medium">{(member.current_month_revenue || 0).toLocaleString('vi-VN')}đ</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Enhanced Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-6">
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="analytics">Phân tích</TabsTrigger>
          <TabsTrigger value="events">Hoa hồng</TabsTrigger>
          <TabsTrigger value="customers">Khách hàng</TabsTrigger>
          <TabsTrigger value="achievements">Thành tựu</TabsTrigger>
          <TabsTrigger value="tools">Công cụ</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-4">
          <div className="space-y-6">
            <SmartNotificationPanel member={member} events={events} />
            <ReferralCommissionTracker member={member} events={events} settings={settings} />
            <CommissionForecast member={member} events={events} />
          </div>
        </TabsContent>
        
        <TabsContent value="analytics" className="mt-4">
          <ReferralAnalyticsDashboard 
            member={member} 
            events={events} 
            customers={customers}
          />
        </TabsContent>
        
        <TabsContent value="events" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              {events.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Icon.DollarSign size={48} className="mx-auto mb-3 opacity-30" />
                  <p>Chưa có hoa hồng nào</p>
                  <p className="text-sm">Chia sẻ mã giới thiệu để nhận hoa hồng!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {events.map(event => (
                    <div key={event.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <p className="font-medium">{event.referred_customer_name}</p>
                        <p className="text-sm text-gray-500">
                          Đơn #{event.order_number} • {new Date(event.created_date).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">+{event.commission_amount?.toLocaleString('vi-VN')}đ</p>
                        <Badge variant="outline" className={
                          event.status === 'paid' ? 'bg-green-50 text-green-700' :
                          event.status === 'calculated' ? 'bg-blue-50 text-blue-700' :
                          'bg-gray-50 text-gray-700'
                        }>
                          {event.status === 'paid' ? 'Đã thanh toán' :
                           event.status === 'calculated' ? 'Chờ thanh toán' : 'Đang xử lý'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="customers" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              {customers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Icon.Users size={48} className="mx-auto mb-3 opacity-30" />
                  <p>Chưa giới thiệu khách hàng nào</p>
                  <Button 
                    onClick={() => setShowRegisterModal(true)}
                    variant="outline"
                    className="mt-4"
                  >
                    <Icon.UserPlus size={16} className="mr-2" />
                    Đăng ký khách hàng đầu tiên
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {customers.map(customer => (
                    <div key={customer.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                          <span className="font-medium text-amber-600">
                            {customer.full_name?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{customer.full_name}</p>
                            {customer.referral_locked && (
                              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300">
                                🔒 Đã khóa
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">
                            {customer.phone} • {new Date(customer.referred_date || customer.created_date).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{customer.total_orders || 0} đơn</p>
                        <p className="text-sm text-gray-500">
                          {(customer.total_spent || 0).toLocaleString('vi-VN')}đ
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="achievements" className="mt-4">
          <div className="space-y-6">
            <ReferralAchievements 
              member={member} 
              allMembers={allMembers}
              events={events}
            />
            <ReferralLeaderboard 
              members={allMembers}
              currentUserEmail={member.user_email}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="tools" className="mt-4">
          <div className="space-y-6">
            <ReferralShareToolkit member={member} />
          </div>
        </TabsContent>
      </Tabs>

      {/* Register Customer Modal */}
      <RegisterCustomerModalEnhanced
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSubmit={(data) => {
          registerCustomerMutation.mutate(data, {
            onSuccess: () => setShowRegisterModal(false)
          });
        }}
        isSubmitting={registerCustomerMutation.isPending}
      />

      {/* Claim Customer Modal */}
      <ClaimCustomerModal
        isOpen={showClaimModal}
        onClose={() => setShowClaimModal(false)}
        referrerId={member.id}
      />

      {/* Withdrawal Request Modal */}
      <WithdrawalRequestModal
        isOpen={showWithdrawalModal}
        onClose={() => setShowWithdrawalModal(false)}
        referrer={member}
      />
      
      {/* Rank Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon.TrendingUp size={20} className="text-green-500" />
            Hành Trình Người Gieo Hạt
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SeederRankProgress 
            member={member} 
            rankConfig={settings?.seeder_rank_config || {}} 
          />
        </CardContent>
      </Card>

      {/* Commission Tiers Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon.Star size={20} className="text-amber-500" />
            Thông Tin Hoa Hồng & Cấp Bậc
          </CardTitle>
        </CardHeader>
        <CardContent>
                    <p className="text-gray-500 mb-4">Hoa hồng được tính dựa trên tổng doanh số F1 trong tháng cộng với thưởng cấp bậc Người Gieo Hạt.</p>
          <div className="grid md:grid-cols-2 gap-4">
            {/* Commission Tiers */}
            <div className="space-y-3">
              <h4 className="font-medium">Hoa hồng theo doanh số</h4>
              {settings?.commission_tiers?.map((tier, index) => (
                <div 
                  key={index} 
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    currentTier?.label === tier.label ? 'bg-amber-50 border border-amber-300' : 'bg-gray-50'
                  }`}
                >
                  <div>
                    <p className="font-medium text-sm">{tier.label}</p>
                    {currentTier?.label === tier.label && (
                      <Badge size="sm" className="bg-amber-500 mt-1">Mức hiện tại</Badge>
                    )}
                  </div>
                  <div className="text-lg font-bold text-amber-600">{tier.rate}%</div>
                </div>
              ))}
            </div>

            {/* Rank Bonus */}
            <div className="space-y-3">
              <h4 className="font-medium">Thưởng theo cấp bậc</h4>
              {Object.entries(settings?.seeder_rank_config || {}).map(([key, rank]) => (
                 <div 
                  key={key} 
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    member.seeder_rank === key ? 'bg-green-50 border border-green-300' : 'bg-gray-50'
                  }`}
                >
                  <div>
                    <p className="font-medium text-sm">{rank.label}</p>
                     {member.seeder_rank === key && (
                      <Badge size="sm" variant="secondary" className="bg-green-500 text-white mt-1">Cấp của bạn</Badge>
                    )}
                  </div>
                  <div className="text-lg font-bold text-green-600">+{rank.bonus}%</div>
                </div>
              ))}
            </div>

          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ========== MAIN PAGE ==========

// Customer Journey Card Component
function CustomerJourneyCard({ customer }) {
  const [showJourney, setShowJourney] = React.useState(false);
  
  return (
    <>
      <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setShowJourney(true)}>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                {customer.full_name?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <p className="font-semibold">{customer.full_name}</p>
                <p className="text-sm text-gray-500">{customer.phone}</p>
                <p className="text-xs text-gray-400">
                  {customer.total_orders || 0} đơn • {(customer.total_spent || 0).toLocaleString('vi-VN')}đ
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={customer.total_orders > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}>
                {customer.total_orders > 0 ? 'Đã mua' : 'Chưa mua'}
              </Badge>
              <Icon.ChevronRight size={18} className="text-gray-400" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {showJourney && (
        <Dialog open={showJourney} onOpenChange={setShowJourney}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
            <CustomerJourneyViewer 
              customerId={customer.id}
              customerName={customer.full_name}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

export default function MyReferrals() {
  const { data: member, isLoading: loadingMember } = useMyReferralMember();
  const { data: events = [] } = useMyReferralEvents();
  const { data: customers = [] } = useMyReferredCustomers();
  const { data: settings } = useReferralSettings();
  
  const registerMutation = useRegisterReferralMember();
  
  const handleRegister = async (userData) => {
    await registerMutation.mutateAsync(userData);
  };
  
  if (loadingMember) {
    return (
      <div className="min-h-screen bg-gray-50 pt-32 pb-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6">Chương Trình Giới Thiệu</h1>
        
        {!member ? (
          <ReferralNotMember 
            onRegister={handleRegister}
            checking={registerMutation.isPending}
            settings={settings}
          />
        ) : member.status === 'pending_approval' ? (
          <ReferralPending member={member} />
        ) : member.status === 'suspended' || member.status === 'banned' ? (
          <Card className="border-red-200">
            <CardContent className="pt-6 text-center">
              <Icon.AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium">Tài khoản bị đình chỉ</h3>
              <p className="text-gray-500 mt-2">{member.suspension_reason || 'Vui lòng liên hệ hỗ trợ để biết thêm chi tiết.'}</p>
            </CardContent>
          </Card>
        ) : (
          <ReferralDashboard 
            member={member}
            events={events}
            customers={customers}
            settings={settings}
          />
        )}
      </div>
    </div>
  );
}