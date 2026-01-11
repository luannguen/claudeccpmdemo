import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { MoreVertical } from 'lucide-react';
import { Icon } from '@/components/ui/AnimatedIcon.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/components/AdminLayout';
import AdminGuard from '@/components/AdminGuard';
import { useConfirmDialog } from '@/components/hooks/useConfirmDialog';
import { useToast } from '@/components/NotificationToast';
import ConfirmDialog from '@/components/ConfirmDialog';
import {
  useReferralMembers,
  useReferralMemberFilters,
  useApproveMember,
  useSuspendMember,
  useReactivateMember,
  useProcessPayout,
  useReferralEvents
} from '@/components/hooks/useReferralSystem';
import AdvancedFraudDetection from '@/components/referral/AdvancedFraudDetection';
import AdminFraudAIPanel from '@/components/referral/AdminFraudAIPanel';
import CustomRateModal from '@/components/admin/referral/CustomRateModal';
import BulkActionsToolbar from '@/components/admin/referral/BulkActionsToolbar';
import { useSetCustomRate, useDisableCustomRate } from '@/components/hooks/useCustomCommissionRate';

const RANK_CONFIG = {
  nguoi_gieo_hat: { label: 'Người Gieo Hạt', color: 'bg-gray-100 text-gray-600' },
  hat_giong_khoe: { label: 'Hạt Giống Khỏe', color: 'bg-green-100 text-green-700' },
  mam_khoe: { label: 'Mầm Khỏe', color: 'bg-lime-100 text-lime-700' },
  choi_khoe: { label: 'Chồi Khỏe', color: 'bg-emerald-100 text-emerald-700' },
  canh_khoe: { label: 'Cành Khỏe', color: 'bg-teal-100 text-teal-700' },
  cay_khoe: { label: 'Cây Khỏe', color: 'bg-amber-100 text-amber-700' },
  danh_hieu: { label: 'Danh Hiệu', color: 'bg-purple-100 text-purple-700' }
};

function MemberCard({ member, onApprove, onSuspend, onReactivate, onPayout, onViewDetails, onSetCustomRate, isSelected, onToggleSelect }) {
  const statusConfig = {
    active: { label: 'Đang hoạt động', color: 'bg-green-100 text-green-700', icon: 'CheckCircle' },
    pending_approval: { label: 'Chờ duyệt', color: 'bg-amber-100 text-amber-700', icon: 'Clock' },
    suspended: { label: 'Đình chỉ', color: 'bg-red-100 text-red-700', icon: 'Ban' },
    fraud_suspect: { label: 'Nghi gian lận', color: 'bg-red-100 text-red-700', icon: 'AlertTriangle' },
    banned: { label: 'Đã cấm', color: 'bg-gray-100 text-gray-700', icon: 'XCircle' }
  };
  
  const status = statusConfig[member.status] || statusConfig.pending_approval;
  const rank = RANK_CONFIG[member.seeder_rank] || RANK_CONFIG.nguoi_gieo_hat;
  const StatusIcon = Icon[status.icon];
  
  return (
    <Card className={`hover:shadow-md transition-shadow ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(member.id)}
            className="mt-1 mr-3 w-4 h-4 text-blue-600 rounded cursor-pointer"
          />
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
              <span className="text-xl font-bold text-amber-600">
                {member.full_name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{member.full_name}</h3>
                <Badge className={rank.color}>{rank.label}</Badge>
              </div>
              <p className="text-sm text-gray-500">{member.user_email}</p>
              <p className="text-sm text-gray-500">{member.phone}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={status.color}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {status.label}
                </Badge>
                <span className="text-xs text-gray-400">
                  Mã: <strong>{member.referral_code}</strong>
                </span>
              </div>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewDetails(member)}>
                <Icon.Eye size={16} className="mr-2" /> Xem chi tiết
              </DropdownMenuItem>
              {member.status === 'active' && (
                <DropdownMenuItem onClick={() => onSetCustomRate(member)} className="text-blue-600">
                  <Icon.Settings size={16} className="mr-2" /> Set Custom Rate
                </DropdownMenuItem>
              )}
              {member.status === 'pending_approval' && (
                <DropdownMenuItem onClick={() => onApprove(member)} className="text-green-600">
                  <Icon.CheckCircle size={16} className="mr-2" /> Duyệt
                </DropdownMenuItem>
              )}
              {member.status === 'active' && (
                <>
                  <DropdownMenuItem onClick={() => onPayout(member)} className="text-blue-600">
                    <Icon.DollarSign size={16} className="mr-2" /> Thanh toán hoa hồng
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onSuspend(member)} className="text-red-600">
                    <Icon.Ban size={16} className="mr-2" /> Đình chỉ
                  </DropdownMenuItem>
                </>
              )}
              {(member.status === 'suspended' || member.status === 'fraud_suspect') && (
                <DropdownMenuItem onClick={() => onReactivate(member)} className="text-green-600">
                  <Icon.RefreshCw size={16} className="mr-2" /> Kích hoạt lại
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mt-4 pt-4 border-t">
          <div className="text-center">
            <p className="text-lg font-bold text-blue-600">{member.total_referred_customers || 0}</p>
            <p className="text-xs text-gray-500">Khách GT</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-green-600">
              {((member.total_referral_revenue || 0) / 1000000).toFixed(1)}M
            </p>
            <p className="text-xs text-gray-500">Doanh số</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-amber-600">
              {((member.unpaid_commission || 0) / 1000).toFixed(0)}K
            </p>
            <p className="text-xs text-gray-500">Chờ TT</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-purple-600">
              {((member.total_paid_commission || 0) / 1000).toFixed(0)}K
            </p>
            <p className="text-xs text-gray-500">Đã TT</p>
          </div>
        </div>

        {/* Custom Rate Badge */}
        {member.custom_rate_enabled && (
          <div className="mt-3 p-2 bg-blue-50 rounded-lg flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-blue-700">
              <Icon.Settings size={16} />
              <span>Custom Rate: <strong>{member.custom_commission_rate}%</strong></span>
            </div>
            {member.custom_rate_note && (
              <p className="text-xs text-blue-600">"{member.custom_rate_note}"</p>
            )}
          </div>
        )}
        
        {/* Fraud Warning */}
        {member.fraud_score >= 30 && (
          <div className="mt-3 p-2 bg-red-50 rounded-lg flex items-center gap-2 text-sm text-red-600">
            <Icon.AlertTriangle size={16} />
            <span>Fraud score: {member.fraud_score}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AdminReferralMembersContent() {
  const { data: user } = useQuery({
    queryKey: ['admin-user'],
    queryFn: () => base44.auth.me()
  });
  
  const { filters, updateFilter, clearFilters } = useReferralMemberFilters();
  const { data: members = [], isLoading } = useReferralMembers(filters);
  const { data: events = [] } = useReferralEvents({});
  const { data: allCustomers = [] } = useQuery({
    queryKey: ['all-customers-for-fraud'],
    queryFn: () => base44.entities.Customer.list()
  });
  const { data: allOrders = [] } = useQuery({
    queryKey: ['all-orders-for-fraud'],
    queryFn: () => base44.entities.Order.list()
  });
  
  const approveMutation = useApproveMember();
  const suspendMutation = useSuspendMember();
  const reactivateMutation = useReactivateMember();
  const payoutMutation = useProcessPayout();
  
  const { dialog, showConfirm, handleConfirm, handleCancel } = useConfirmDialog();
  const { addToast } = useToast();
  
  const [selectedMember, setSelectedMember] = useState(null);
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');
  const [showPayoutDialog, setShowPayoutDialog] = useState(false);
  const [selectedForPayout, setSelectedForPayout] = useState([]);
  const [showCustomRateModal, setShowCustomRateModal] = useState(false);
  const [memberForCustomRate, setMemberForCustomRate] = useState(null);
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  
  const handleApprove = async (member) => {
    const confirmed = await showConfirm({
      title: 'Duyệt thành viên',
      message: `Bạn có chắc chắn muốn duyệt thành viên "${member.full_name}" tham gia chương trình giới thiệu?`,
      type: 'success',
      confirmText: 'Duyệt',
      cancelText: 'Hủy'
    });
    
    if (confirmed) {
      try {
        await approveMutation.mutateAsync({ memberId: member.id, adminEmail: user?.email });
        addToast(`Đã duyệt thành viên ${member.full_name}`, 'success');
      } catch (error) {
        addToast('Có lỗi xảy ra khi duyệt thành viên', 'error');
      }
    }
  };
  
  const handleSuspend = (member) => {
    setSelectedMember(member);
    setShowSuspendDialog(true);
  };
  
  const confirmSuspend = async () => {
    if (!suspendReason.trim()) {
      addToast('Vui lòng nhập lý do đình chỉ', 'warning');
      return;
    }
    
    try {
      await suspendMutation.mutateAsync({
        memberId: selectedMember.id,
        reason: suspendReason,
        adminEmail: user?.email
      });
      addToast(`Đã đình chỉ thành viên ${selectedMember.full_name}`, 'success');
      setShowSuspendDialog(false);
      setSuspendReason('');
      setSelectedMember(null);
    } catch (error) {
      addToast('Có lỗi xảy ra khi đình chỉ thành viên', 'error');
    }
  };
  
  const handleReactivate = async (member) => {
    const confirmed = await showConfirm({
      title: 'Kích hoạt lại thành viên',
      message: `Bạn có chắc chắn muốn kích hoạt lại thành viên "${member.full_name}"?`,
      type: 'info',
      confirmText: 'Kích hoạt',
      cancelText: 'Hủy'
    });
    
    if (confirmed) {
      try {
        await reactivateMutation.mutateAsync({ memberId: member.id, adminEmail: user?.email });
        addToast(`Đã kích hoạt lại thành viên ${member.full_name}`, 'success');
      } catch (error) {
        addToast('Có lỗi xảy ra khi kích hoạt thành viên', 'error');
      }
    }
  };
  
  const handlePayout = (member) => {
    setSelectedForPayout([member.id]);
    setShowPayoutDialog(true);
  };
  
  const confirmPayout = async () => {
    try {
      await payoutMutation.mutateAsync({ memberIds: selectedForPayout, adminEmail: user?.email });
      addToast(`Đã thanh toán thành công cho ${selectedForPayout.length} thành viên`, 'success');
      setShowPayoutDialog(false);
      setSelectedForPayout([]);
    } catch (error) {
      addToast('Có lỗi xảy ra khi thanh toán', 'error');
    }
  };
  
  const handleViewDetails = (member) => {
    setSelectedMember(member);
  };

  const handleSetCustomRate = (member) => {
    setMemberForCustomRate(member);
    setShowCustomRateModal(true);
  };

  const handleToggleSelect = (memberId) => {
    setSelectedMemberIds(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSelectAll = () => {
    if (selectedMemberIds.length === members.length) {
      setSelectedMemberIds([]);
    } else {
      setSelectedMemberIds(members.map(m => m.id));
    }
  };
  
  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Tên', 'Email', 'Mã GT', 'Trạng thái', 'Hạng', 'Khách GT', 'Doanh số', 'Hoa hồng chờ', 'Đã thanh toán'];
    const rows = members.map(m => [
      m.full_name,
      m.user_email,
      m.referral_code,
      m.status,
      m.rank,
      m.total_referred_customers || 0,
      m.total_referral_revenue || 0,
      m.unpaid_commission || 0,
      m.total_paid_commission || 0
    ]);
    
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `referral-members-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Icon.Users size={28} className="text-blue-600" />
            Quản Lý Thành Viên
          </h1>
          <p className="text-gray-500">
            {members.length} thành viên
            {selectedMemberIds.length > 0 && (
              <span className="ml-2 text-blue-600">
                • {selectedMemberIds.length} đã chọn
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          {members.length > 0 && (
            <Button onClick={handleSelectAll} variant="outline" size="sm">
              {selectedMemberIds.length === members.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
            </Button>
          )}
          <Button onClick={exportToCSV} variant="outline">
            <Icon.Download size={16} className="mr-2" />
            Export CSV
          </Button>
        </div>
      </div>
      
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Icon.Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Tìm theo tên, email, mã..."
                  value={filters.search}
                  onChange={(e) => updateFilter('search', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={filters.status} onValueChange={(v) => updateFilter('status', v)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="active">Đang hoạt động</SelectItem>
                <SelectItem value="pending_approval">Chờ duyệt</SelectItem>
                <SelectItem value="suspended">Đình chỉ</SelectItem>
                <SelectItem value="fraud_suspect">Nghi gian lận</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filters.rank} onValueChange={(v) => updateFilter('rank', v)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Cấp bậc" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="nguoi_gieo_hat">Người Gieo Hạt</SelectItem>
                <SelectItem value="hat_giong_khoe">Hạt Giống Khỏe</SelectItem>
                <SelectItem value="mam_khoe">Mầm Khỏe</SelectItem>
                <SelectItem value="choi_khoe">Chồi Khỏe</SelectItem>
                <SelectItem value="canh_khoe">Cành Khỏe</SelectItem>
                <SelectItem value="cay_khoe">Cây Khỏe</SelectItem>
                <SelectItem value="danh_hieu">Danh Hiệu</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="ghost" onClick={clearFilters}>
              Xóa lọc
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Members Grid */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="animate-pulse space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : members.length === 0 ? (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <Icon.Users size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Không tìm thấy thành viên nào</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map(member => (
            <MemberCard
              key={member.id}
              member={member}
              onApprove={handleApprove}
              onSuspend={handleSuspend}
              onReactivate={handleReactivate}
              onPayout={handlePayout}
              onViewDetails={handleViewDetails}
              onSetCustomRate={handleSetCustomRate}
              isSelected={selectedMemberIds.includes(member.id)}
              onToggleSelect={handleToggleSelect}
            />
          ))}
        </div>
      )}
      
      {/* Suspend Dialog */}
      <Dialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Đình chỉ thành viên</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Bạn sắp đình chỉ thành viên: <strong>{selectedMember?.full_name}</strong></p>
            <Textarea
              placeholder="Nhập lý do đình chỉ..."
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSuspendDialog(false)}>Hủy</Button>
            <Button onClick={confirmSuspend} className="bg-red-500 hover:bg-red-600">
              Đình chỉ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Payout Dialog */}
      <Dialog open={showPayoutDialog} onOpenChange={setShowPayoutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thanh toán hoa hồng</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Xác nhận thanh toán hoa hồng cho {selectedForPayout.length} thành viên?</p>
            {selectedForPayout.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                {members.filter(m => selectedForPayout.includes(m.id)).map(m => (
                  <div key={m.id} className="flex justify-between py-2">
                    <span>{m.full_name}</span>
                    <span className="font-bold">{(m.unpaid_commission || 0).toLocaleString('vi-VN')}đ</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPayoutDialog(false)}>Hủy</Button>
            <Button onClick={confirmPayout} className="bg-green-500 hover:bg-green-600">
              Xác nhận thanh toán
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Member Detail Dialog with Fraud Detection */}
      {selectedMember && !showSuspendDialog && (
        <Dialog open={!!selectedMember} onOpenChange={() => setSelectedMember(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>Chi tiết thành viên</DialogTitle>
            </DialogHeader>
            
            <Tabs defaultValue="info">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="info">Thông tin</TabsTrigger>
                <TabsTrigger value="fraud">Phân tích gian lận</TabsTrigger>
              </TabsList>
              
              <TabsContent value="info" className="mt-4">
                <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-amber-600">
                    {selectedMember.full_name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedMember.full_name}</h3>
                  <p className="text-gray-500">{selectedMember.user_email}</p>
                  <p className="text-gray-500">{selectedMember.phone}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">Mã giới thiệu</p>
                  <p className="text-lg font-bold">{selectedMember.referral_code}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">Cấp bậc</p>
                  <p className="text-lg font-bold">{RANK_CONFIG[selectedMember.seeder_rank]?.label || selectedMember.seeder_rank}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">Tổng doanh số</p>
                  <p className="text-lg font-bold text-green-600">
                    {(selectedMember.total_referral_revenue || 0).toLocaleString('vi-VN')}đ
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">Khách giới thiệu</p>
                  <p className="text-lg font-bold">{selectedMember.total_referred_customers || 0}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">Hoa hồng chờ</p>
                  <p className="text-lg font-bold text-amber-600">
                    {(selectedMember.unpaid_commission || 0).toLocaleString('vi-VN')}đ
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">Đã thanh toán</p>
                  <p className="text-lg font-bold text-purple-600">
                    {(selectedMember.total_paid_commission || 0).toLocaleString('vi-VN')}đ
                  </p>
                </div>
              </div>
              
              {selectedMember.fraud_score > 0 && (
                <div className="bg-red-50 rounded-lg p-4">
                  <p className="font-medium text-red-700 mb-2">Cảnh báo gian lận</p>
                  <p className="text-sm">Fraud score: {selectedMember.fraud_score}</p>
                  {selectedMember.fraud_flags?.length > 0 && (
                    <ul className="text-sm mt-2 list-disc list-inside">
                      {selectedMember.fraud_flags.map((flag, i) => (
                        <li key={i}>{flag}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
              
              {selectedMember.admin_notes && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">Ghi chú admin</p>
                  <p>{selectedMember.admin_notes}</p>
                </div>
              )}
                </div>
              </TabsContent>
            
            <TabsContent value="fraud" className="mt-4">
              <div className="space-y-4">
                <AdminFraudAIPanel
                  member={selectedMember}
                  allMembers={members}
                  allCustomers={allCustomers}
                  allOrders={allOrders}
                />
                <AdvancedFraudDetection
                  member={selectedMember}
                  allMembers={members}
                  allCustomers={allCustomers}
                  allOrders={allOrders}
                />
              </div>
            </TabsContent>
          </Tabs>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Custom Rate Modal */}
      <CustomRateModal
        isOpen={showCustomRateModal}
        onClose={() => {
          setShowCustomRateModal(false);
          setMemberForCustomRate(null);
        }}
        member={memberForCustomRate}
        adminEmail={user?.email}
      />

      {/* Bulk Actions Toolbar */}
      <BulkActionsToolbar
        selectedIds={selectedMemberIds}
        members={members}
        onClearSelection={() => setSelectedMemberIds([])}
        adminEmail={user?.email}
      />

      {/* Global Confirm Dialog */}
      <ConfirmDialog
        isOpen={dialog.isOpen}
        onClose={handleCancel}
        onConfirm={handleConfirm}
        title={dialog.title}
        message={dialog.message}
        type={dialog.type}
        confirmText={dialog.confirmText}
        cancelText={dialog.cancelText}
      />
    </div>
  );
}

export default function AdminReferralMembers() {
  return (
    <AdminGuard>
      <AdminLayout>
        <AdminReferralMembersContent />
      </AdminLayout>
    </AdminGuard>
  );
}