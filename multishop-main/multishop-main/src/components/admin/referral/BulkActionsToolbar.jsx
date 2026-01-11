/**
 * BulkActionsToolbar - Admin bulk actions cho referral members
 * UI Layer - Presentation only
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/AnimatedIcon.jsx';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useConfirmDialog } from '@/components/hooks/useConfirmDialog';
import { useBulkApprove, useBulkSuspend, useBulkPayout } from '@/components/hooks/useBulkReferralActions';

export default function BulkActionsToolbar({ selectedIds, members, onClearSelection, adminEmail }) {
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');
  
  const { showConfirm } = useConfirmDialog();
  const bulkApproveMutation = useBulkApprove();
  const bulkSuspendMutation = useBulkSuspend();
  const bulkPayoutMutation = useBulkPayout();

  const selectedMembers = members.filter(m => selectedIds.includes(m.id));
  const pendingCount = selectedMembers.filter(m => m.status === 'pending_approval').length;
  const activeCount = selectedMembers.filter(m => m.status === 'active').length;
  const totalUnpaid = selectedMembers.reduce((sum, m) => sum + (m.unpaid_commission || 0), 0);

  const handleBulkApprove = async () => {
    const confirmed = await showConfirm({
      title: 'Duyệt hàng loạt',
      message: `Duyệt ${pendingCount} thành viên chờ duyệt?`,
      type: 'success',
      confirmText: 'Duyệt tất cả',
      cancelText: 'Hủy'
    });

    if (confirmed) {
      const pendingIds = selectedMembers.filter(m => m.status === 'pending_approval').map(m => m.id);
      await bulkApproveMutation.mutateAsync({ memberIds: pendingIds, adminEmail });
      onClearSelection();
    }
  };

  const handleBulkPayout = async () => {
    const confirmed = await showConfirm({
      title: 'Thanh toán hàng loạt',
      message: `Thanh toán cho ${activeCount} CTV?\n\nTổng: ${totalUnpaid.toLocaleString('vi-VN')}đ`,
      type: 'warning',
      confirmText: 'Xác nhận thanh toán',
      cancelText: 'Hủy'
    });

    if (confirmed) {
      const activeIds = selectedMembers.filter(m => m.status === 'active' && m.unpaid_commission > 0).map(m => m.id);
      await bulkPayoutMutation.mutateAsync({ memberIds: activeIds, adminEmail });
      onClearSelection();
    }
  };

  const handleBulkSuspend = () => {
    setShowSuspendDialog(true);
  };

  const confirmBulkSuspend = async () => {
    if (!suspendReason.trim()) return;

    await bulkSuspendMutation.mutateAsync({
      memberIds: selectedIds,
      adminEmail,
      reason: suspendReason
    });

    setShowSuspendDialog(false);
    setSuspendReason('');
    onClearSelection();
  };

  if (selectedIds.length === 0) return null;

  return (
    <>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <div className="bg-white border-2 border-blue-500 rounded-2xl shadow-2xl px-6 py-4 flex items-center gap-4">
          <Badge className="bg-blue-600 text-white text-base px-3 py-1">
            {selectedIds.length} đã chọn
          </Badge>
          
          <div className="flex gap-2">
            {pendingCount > 0 && (
              <Button
                size="sm"
                onClick={handleBulkApprove}
                disabled={bulkApproveMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                <Icon.CheckCircle size={16} className="mr-1.5" />
                Duyệt ({pendingCount})
              </Button>
            )}
            
            {activeCount > 0 && totalUnpaid > 0 && (
              <Button
                size="sm"
                onClick={handleBulkPayout}
                disabled={bulkPayoutMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Icon.DollarSign size={16} className="mr-1.5" />
                Thanh toán ({activeCount})
              </Button>
            )}
            
            <Button
              size="sm"
              variant="outline"
              onClick={handleBulkSuspend}
              disabled={bulkSuspendMutation.isPending}
              className="border-red-500 text-red-600 hover:bg-red-50"
            >
              <Icon.Ban size={16} className="mr-1.5" />
              Đình chỉ
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={onClearSelection}
            >
              <Icon.X size={16} />
            </Button>
          </div>
        </div>
      </div>

      {/* Suspend Dialog */}
      <Dialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Đình chỉ {selectedIds.length} thành viên</DialogTitle>
          </DialogHeader>
          <div>
            <label className="block text-sm font-medium mb-2">Lý do đình chỉ</label>
            <Input
              placeholder="Nhập lý do..."
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSuspendDialog(false)}>
              Hủy
            </Button>
            <Button
              onClick={confirmBulkSuspend}
              disabled={!suspendReason.trim() || bulkSuspendMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}