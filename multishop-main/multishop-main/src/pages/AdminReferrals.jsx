import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Icon } from '@/components/ui/AnimatedIcon.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminLayout from '@/components/AdminLayout';
import AdminGuard from '@/components/AdminGuard';
import { useReferralStats, useReferralMembers, useReferralEvents, useReferralSettings } from '@/components/hooks/useReferralSystem';
import ReferralAnalyticsReport from '@/components/referral/ReferralAnalyticsReport';
import ReferralLeaderboard from '@/components/referral/ReferralLeaderboard';
import AutomatedPayoutScheduler from '@/components/referral/AutomatedPayoutScheduler';

function AdminReferralsContent() {
  const [activeTab, setActiveTab] = useState('overview');
  const { data: stats, isLoading } = useReferralStats();
  const { data: members = [] } = useReferralMembers({ status: 'all' });
  const { data: events = [] } = useReferralEvents({});
  const { data: settings } = useReferralSettings();
  
  const pendingMembers = members.filter(m => m.status === 'pending_approval');
  const fraudSuspects = members.filter(m => m.status === 'fraud_suspect' || m.fraud_score >= 50);
  
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="grid grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-gray-200 rounded-xl" />)}
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Icon.Award size={28} className="text-amber-500" />
            Quản Lý Giới Thiệu
          </h1>
          <p className="text-gray-500">Hệ thống quản lý referral toàn diện</p>
        </div>
        <div className="flex gap-2">
          <Link to={createPageUrl('AdminReferralSettings')}>
            <Button variant="outline">
              <Icon.Settings size={16} />
              Cài đặt
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Icon.Users size={24} className="text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.totalMembers || 0}</p>
                <p className="text-sm text-gray-500">Tổng thành viên</p>
              </div>
            </div>
            <div className="mt-3 flex gap-2 text-xs">
              <Badge variant="outline" className="bg-green-50">{stats?.activeMembers || 0} active</Badge>
              <Badge variant="outline" className="bg-amber-50">{stats?.pendingMembers || 0} chờ duyệt</Badge>
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
                  {((stats?.totalRevenue || 0) / 1000000).toFixed(1)}M
                </p>
                <p className="text-sm text-gray-500">Tổng doanh số</p>
              </div>
            </div>
            <div className="mt-3 text-xs text-gray-500">
              Tháng này: {((stats?.currentMonthRevenue || 0) / 1000000).toFixed(1)}M
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <Icon.Wallet size={24} className="text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {((stats?.unpaidCommission || 0) / 1000000).toFixed(1)}M
                </p>
                <p className="text-sm text-gray-500">Hoa hồng chờ TT</p>
              </div>
            </div>
            <div className="mt-3 text-xs text-gray-500">
              Đã trả: {((stats?.paidCommission || 0) / 1000000).toFixed(1)}M
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <Icon.AlertTriangle size={24} className="text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.suspectedFraud || 0}</p>
                <p className="text-sm text-gray-500">Nghi ngờ gian lận</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to={createPageUrl('AdminReferralMembers')}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Icon.Users size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Quản lý thành viên</p>
                    <p className="text-sm text-gray-500">{stats?.totalMembers || 0} thành viên</p>
                  </div>
                </div>
                <Icon.ChevronRight size={20} className="text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </Link>
        
        <Link to={createPageUrl('AdminReferralSettings')}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Icon.Settings size={20} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium">Cài đặt chính sách</p>
                    <p className="text-sm text-gray-500">Tỉ lệ, điều kiện</p>
                  </div>
                </div>
                <Icon.ChevronRight size={20} className="text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </Link>
        
        <Link to={createPageUrl('AdminReferralAuditLog')}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Icon.FileText size={20} className="text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Audit Log</p>
                    <p className="text-sm text-gray-500">Lịch sử hành động</p>
                  </div>
                </div>
                <Icon.ChevronRight size={20} className="text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </Link>
        
        <Link to={`${createPageUrl('AdminReferralMembers')}?status=fraud_suspect`}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full border-red-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <Icon.Shield size={20} className="text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium">Kiểm tra gian lận</p>
                    <p className="text-sm text-red-500">{fraudSuspects.length} cần xem xét</p>
                  </div>
                </div>
                <Icon.ChevronRight size={20} className="text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
      
      {/* Pending Approvals */}
      {pendingMembers.length > 0 && (
        <Card className="border-amber-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon.Clock size={20} className="text-amber-500" />
              Chờ Duyệt ({pendingMembers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingMembers.slice(0, 5).map(member => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-xl">
                  <div>
                    <p className="font-medium">{member.full_name}</p>
                    <p className="text-sm text-gray-500">{member.user_email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {new Date(member.created_date).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {pendingMembers.length > 5 && (
              <Link to={`${createPageUrl('AdminReferralMembers')}?status=pending_approval`}>
                <Button variant="link" className="mt-3 w-full">
                  Xem tất cả ({pendingMembers.length})
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Enhanced Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="analytics">Phân tích</TabsTrigger>
          <TabsTrigger value="leaderboard">Xếp hạng</TabsTrigger>
          <TabsTrigger value="payout">Thanh toán</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6">
          {/* Top Referrers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon.Award size={20} className="text-amber-500" />
                Top Người Giới Thiệu
              </CardTitle>
            </CardHeader>
        <CardContent>
          {stats?.topReferrers?.length > 0 ? (
            <div className="space-y-3">
              {stats.topReferrers.slice(0, 10).map((member, index) => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-amber-100 text-amber-700' :
                      index === 1 ? 'bg-gray-200 text-gray-700' :
                      index === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{member.full_name}</p>
                      <p className="text-sm text-gray-500">{member.referral_code}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      {((member.total_referral_revenue || 0) / 1000000).toFixed(1)}M
                    </p>
                    <p className="text-xs text-gray-500">
                      {member.total_referred_customers || 0} khách
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Chưa có dữ liệu
            </div>
          )}
        </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics" className="mt-6">
          <ReferralAnalyticsReport 
            members={members}
            events={events}
            settings={settings}
          />
        </TabsContent>
        
        <TabsContent value="leaderboard" className="mt-6">
          <ReferralLeaderboard members={members} />
        </TabsContent>
        
        <TabsContent value="payout" className="mt-6">
          <AutomatedPayoutScheduler 
            settings={settings}
            members={members}
            onToggleAuto={() => {}}
            onUpdateSchedule={() => {}}
            onPreviewPayout={() => {}}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function AdminReferrals() {
  return (
    <AdminGuard requiredModule="referrals" requiredPermission="referrals.view">
      <AdminLayout>
        <AdminReferralsContent />
      </AdminLayout>
    </AdminGuard>
  );
}