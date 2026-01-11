/**
 * AdminGifts Page - Admin gift management
 */

import React, { useState } from 'react';
import { Icon } from '@/components/ui/AnimatedIcon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminLayout from '@/components/AdminLayout';
import AdminGuard from '@/components/AdminGuard';
import { useToast } from '@/components/NotificationToast';
import { useConfirmDialog } from '@/components/hooks/useConfirmDialog';
import ConfirmDialog from '@/components/ConfirmDialog';

import { 
  useGiftAdmin, 
  GiftAnalyticsWidget, 
  GiftTransactionTable,
  GIFT_STATUS 
} from '@/components/features/gift';

function AdminGiftsContent() {
  const { addToast } = useToast();
  const { showConfirm, dialogProps } = useConfirmDialog();
  
  const [filters, setFilters] = useState({
    status: '',
    search: ''
  });

  const {
    transactions,
    orders,
    analytics,
    isLoading,
    markDelivered,
    cancelGift,
    isMarking,
    isCancelling
  } = useGiftAdmin(filters);

  // Filter transactions by search
  const filteredTransactions = transactions.filter(t => {
    if (!filters.search) return true;
    const search = filters.search.toLowerCase();
    return (
      t.sender_name?.toLowerCase().includes(search) ||
      t.receiver_name?.toLowerCase().includes(search) ||
      t.item_name?.toLowerCase().includes(search) ||
      t.redemption_code?.toLowerCase().includes(search)
    );
  }).filter(t => {
    if (!filters.status) return true;
    return t.status === filters.status;
  });

  const handleMarkDelivered = async (giftId) => {
    const confirmed = await showConfirm({
      title: 'Xác nhận giao hàng',
      message: 'Đánh dấu quà này đã được giao thành công?',
      type: 'success',
      confirmText: 'Xác nhận'
    });

    if (confirmed) {
      await markDelivered(giftId);
      addToast('Đã cập nhật trạng thái giao hàng', 'success');
    }
  };

  const handleCancelGift = async (giftId) => {
    const confirmed = await showConfirm({
      title: 'Hủy quà tặng',
      message: 'Bạn có chắc muốn hủy món quà này? Hành động này không thể hoàn tác.',
      type: 'danger',
      confirmText: 'Hủy quà'
    });

    if (confirmed) {
      await cancelGift(giftId);
      addToast('Đã hủy quà tặng', 'success');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Icon.Gift size={28} className="text-[#7CB342]" />
            Quản Lý Quà Tặng
          </h1>
          <p className="text-gray-500 mt-1">
            Theo dõi và quản lý tất cả giao dịch quà tặng
          </p>
        </div>
        
        <Button 
          onClick={() => window.location.reload()}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Icon.RefreshCw size={16} />
          Làm mới
        </Button>
      </div>

      {/* Analytics Widget */}
      <div className="mb-6">
        <GiftAnalyticsWidget analytics={analytics} isLoading={isLoading} />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Tìm kiếm theo tên, sản phẩm, mã quà..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full"
            />
          </div>
          
          <Select
            value={filters.status}
            onValueChange={(value) => setFilters({ ...filters, status: value })}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>Tất cả</SelectItem>
              <SelectItem value={GIFT_STATUS.PENDING_PAYMENT}>Chờ thanh toán</SelectItem>
              <SelectItem value={GIFT_STATUS.REDEEMABLE}>Chờ đổi quà</SelectItem>
              <SelectItem value={GIFT_STATUS.REDEEMED}>Đã đổi</SelectItem>
              <SelectItem value={GIFT_STATUS.FULFILLMENT_CREATED}>Đang xử lý</SelectItem>
              <SelectItem value={GIFT_STATUS.DELIVERED}>Đã giao</SelectItem>
              <SelectItem value={GIFT_STATUS.EXPIRED}>Hết hạn</SelectItem>
              <SelectItem value={GIFT_STATUS.CANCELLED}>Đã hủy</SelectItem>
            </SelectContent>
          </Select>
          
          {(filters.search || filters.status) && (
            <Button
              variant="ghost"
              onClick={() => setFilters({ status: '', search: '' })}
              className="text-gray-500"
            >
              <Icon.X size={16} className="mr-1" />
              Xóa lọc
            </Button>
          )}
        </div>
      </div>

      {/* Transactions Table */}
      <GiftTransactionTable
        transactions={filteredTransactions}
        isLoading={isLoading}
        onMarkDelivered={handleMarkDelivered}
        onCancelGift={handleCancelGift}
      />

      <ConfirmDialog {...dialogProps} />
    </div>
  );
}

export default function AdminGifts() {
  return (
    <AdminGuard>
      <AdminLayout>
        <AdminGiftsContent />
      </AdminLayout>
    </AdminGuard>
  );
}