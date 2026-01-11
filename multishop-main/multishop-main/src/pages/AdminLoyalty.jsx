/**
 * Admin Loyalty Page
 * UI Layer - Quản lý loyalty accounts
 */

import React, { useState, useMemo } from 'react';
import { Icon } from '@/components/ui/AnimatedIcon.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/components/AdminLayout';
import AdminGuard from '@/components/AdminGuard';
import { useLoyaltyAccounts, useLoyaltyStats, useAdjustPoints } from '@/components/hooks/useLoyalty';
import { TIER_CONFIG } from '@/components/services/loyaltyCore';
import LoyaltyAnalyticsDashboard from '@/components/admin/loyalty/LoyaltyAnalyticsDashboard';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/NotificationToast';

// ========== ADJUST POINTS MODAL ==========
function AdjustPointsModal({ isOpen, onClose, account }) {
  const [points, setPoints] = useState('');
  const [reason, setReason] = useState('');
  const adjustMutation = useAdjustPoints();
  const { addToast } = useToast();
  
  const { data: user } = useQuery({
    queryKey: ['current-admin-loyalty'],
    queryFn: () => base44.auth.me()
  });
  
  const handleSubmit = async () => {
    const pointsNum = parseInt(points);
    if (isNaN(pointsNum) || pointsNum === 0) {
      addToast('Số điểm không hợp lệ', 'error');
      return;
    }
    
    await adjustMutation.mutateAsync({
      accountId: account.id,
      points: pointsNum,
      reason,
      adminEmail: user?.email || 'admin'
    });
    
    onClose();
    setPoints('');
    setReason('');
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Điều Chỉnh Điểm - {account?.user_name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Số điểm (âm để trừ, dương để cộng)</label>
            <Input
              type="number"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              placeholder="Vd: 500 hoặc -200"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Lý do</label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Mô tả lý do điều chỉnh..."
              rows={3}
            />
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Hủy
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={!points || adjustMutation.isPending}
              className="flex-1 bg-violet-600 hover:bg-violet-700"
            >
              {adjustMutation.isPending ? 'Đang xử lý...' : 'Xác nhận'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ========== ACCOUNT CARD ==========
function LoyaltyAccountCard({ account, onAdjustPoints }) {
  const tierConfig = TIER_CONFIG[account.tier] || TIER_CONFIG.bronze;
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {account.user_name?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <p className="font-bold">{account.user_name}</p>
              <p className="text-sm text-gray-500">{account.user_email}</p>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={() => onAdjustPoints(account)}>
            <Icon.Edit size={14} className="mr-1" />
            Điều chỉnh
          </Button>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
          <div className="text-center">
            <p className="text-2xl font-bold text-violet-600">{account.total_points || 0}</p>
            <p className="text-xs text-gray-500">Điểm hiện có</p>
          </div>
          <div className="text-center">
            <Badge className={tierConfig.color}>{tierConfig.label}</Badge>
            <p className="text-xs text-gray-500 mt-1">{account.tier_progress || 0}% next tier</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-gray-700">{account.total_orders_platform || 0}</p>
            <p className="text-xs text-gray-500">Đơn hàng</p>
          </div>
        </div>
        
        {account.points_expiring_soon > 0 && (
          <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-lg text-xs">
            <Icon.AlertTriangle size={14} className="inline mr-1 text-amber-600" />
            <span className="text-amber-700">
              {account.points_expiring_soon} điểm sắp hết hạn
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ========== MAIN CONTENT ==========
function AdminLoyaltyContent() {
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [adjustModal, setAdjustModal] = useState({ open: false, account: null });
  const [activeTab, setActiveTab] = useState('overview');
  
  const { data: accounts = [], isLoading } = useLoyaltyAccounts();
  const { data: stats } = useLoyaltyStats();
  
  const filteredAccounts = useMemo(() => {
    return accounts.filter(a => {
      const matchSearch = !search || 
        a.user_name?.toLowerCase().includes(search.toLowerCase()) ||
        a.user_email?.toLowerCase().includes(search.toLowerCase());
      
      const matchTier = tierFilter === 'all' || a.tier === tierFilter;
      
      return matchSearch && matchTier;
    });
  }, [accounts, search, tierFilter]);
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Icon.Star size={28} className="text-amber-500" />
          Quản Lý Loyalty
        </h1>
        <p className="text-gray-500">Hệ thống tích điểm & hạng thành viên</p>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center">
                <Icon.Users size={24} className="text-violet-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.totalAccounts || 0}</p>
                <p className="text-sm text-gray-500">Tài khoản</p>
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
                  {((stats?.totalPointsActive || 0) / 1000).toFixed(0)}K
                </p>
                <p className="text-sm text-gray-500">Điểm đang lưu hành</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Icon.Gift size={24} className="text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {((stats?.totalPointsIssued || 0) / 1000).toFixed(0)}K
                </p>
                <p className="text-sm text-gray-500">Tổng điểm phát hành</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <Icon.Award size={24} className="text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.avgPointsPerAccount || 0}</p>
                <p className="text-sm text-gray-500">Điểm TB/tài khoản</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Tier Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Phân Bố Theo Hạng</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {Object.entries(TIER_CONFIG).map(([key, config]) => (
              <div key={key} className="text-center p-4 bg-gray-50 rounded-xl">
                <div className={`w-12 h-12 ${config.color} rounded-full flex items-center justify-center mx-auto mb-2`}>
                  <Icon.Award size={20} />
                </div>
                <p className="font-bold text-2xl">{stats?.byTier?.[key] || 0}</p>
                <p className="text-sm text-gray-600">{config.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Icon.Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên, email..."
            className="pl-10"
          />
        </div>
        <Select value={tierFilter} onValueChange={setTierFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Hạng" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả hạng</SelectItem>
            <SelectItem value="bronze">Đồng</SelectItem>
            <SelectItem value="silver">Bạc</SelectItem>
            <SelectItem value="gold">Vàng</SelectItem>
            <SelectItem value="platinum">Bạch Kim</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Danh sách</TabsTrigger>
          <TabsTrigger value="analytics">Phân tích</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6 space-y-4">
          {/* Accounts Grid */}
          {isLoading ? (
            <div className="text-center py-12">
              <Icon.Spinner size={48} className="mx-auto mb-4" />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAccounts.map(account => (
                <LoyaltyAccountCard
                  key={account.id}
                  account={account}
                  onAdjustPoints={(acc) => setAdjustModal({ open: true, account: acc })}
                />
              ))}
            </div>
          )}
          
          {filteredAccounts.length === 0 && !isLoading && (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                <Icon.Search size={48} className="mx-auto mb-3 opacity-30" />
                <p>Không tìm thấy tài khoản</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="analytics" className="mt-6">
          <LoyaltyAnalyticsDashboard accounts={accounts} />
        </TabsContent>
      </Tabs>
      
      {/* Adjust Modal */}
      {adjustModal.account && (
        <AdjustPointsModal
          isOpen={adjustModal.open}
          onClose={() => setAdjustModal({ open: false, account: null })}
          account={adjustModal.account}
        />
      )}
    </div>
  );
}

export default function AdminLoyalty() {
  return (
    <AdminGuard>
      <AdminLayout>
        <AdminLoyaltyContent />
      </AdminLayout>
    </AdminGuard>
  );
}