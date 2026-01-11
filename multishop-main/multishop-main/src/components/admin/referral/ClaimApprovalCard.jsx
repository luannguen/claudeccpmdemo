/**
 * ClaimApprovalCard - Hiển thị claim request trong AdminNotification
 * UI Layer
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/AnimatedIcon.jsx';
import { useApproveClaim, useRejectClaim } from '@/components/hooks/useReferralClaim';
import { useConfirmDialog } from '@/components/hooks/useConfirmDialog';
import { Input } from '@/components/ui/input';

export default function ClaimApprovalCard({ claim, adminEmail }) {
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);
  const { showConfirm } = useConfirmDialog();
  
  const approveMutation = useApproveClaim();
  const rejectMutation = useRejectClaim();

  const metadata = claim.metadata || {};

  const handleApprove = async () => {
    const confirmed = await showConfirm({
      title: 'Duyệt claim khách hàng',
      message: `Duyệt ${metadata.customer_name} trở thành F1 của ${metadata.referrer_name}?\n\n• Đơn cũ: ${metadata.pre_claim_orders} đơn (không tính hoa hồng)\n• Đơn mới: tính hoa hồng từ giờ`,
      type: 'success',
      confirmText: 'Duyệt',
      cancelText: 'Hủy'
    });

    if (confirmed) {
      await approveMutation.mutateAsync({
        claimRequestId: claim.id,
        adminEmail
      });
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      setShowRejectInput(true);
      return;
    }

    await rejectMutation.mutateAsync({
      claimRequestId: claim.id,
      adminEmail,
      reason: rejectReason
    });
    
    setRejectReason('');
    setShowRejectInput(false);
  };

  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <Icon.UserPlus size={18} className="text-amber-600" />
            <span>Yêu cầu Claim Khách Hàng</span>
          </div>
          <Badge className="bg-amber-500 text-white">Retroactive</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">CTV yêu cầu:</p>
            <p className="font-medium">{metadata.referrer_name}</p>
            <p className="text-xs text-gray-400">{metadata.referrer_email}</p>
          </div>
          <div>
            <p className="text-gray-500">Khách hàng:</p>
            <p className="font-medium">{metadata.customer_name}</p>
            <p className="text-xs text-gray-400">{metadata.customer_email}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg p-3 text-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Lịch sử trước claim:</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2">
              <Icon.Package size={14} className="text-gray-400" />
              <span><strong>{metadata.pre_claim_orders || 0}</strong> đơn</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon.DollarSign size={14} className="text-gray-400" />
              <span><strong>{(metadata.pre_claim_spent || 0).toLocaleString('vi-VN')}</strong>đ</span>
            </div>
          </div>
          <p className="text-xs text-red-600 mt-2">
            ⚠️ Các đơn cũ KHÔNG tính hoa hồng
          </p>
        </div>

        {!showRejectInput ? (
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowRejectInput(true)}
              disabled={approveMutation.isPending}
              className="flex-1"
            >
              <Icon.XCircle size={16} className="mr-2" />
              Từ chối
            </Button>
            <Button
              onClick={handleApprove}
              disabled={approveMutation.isPending}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {approveMutation.isPending ? (
                <Icon.Spinner size={16} className="mr-2" />
              ) : (
                <Icon.CheckCircle size={16} className="mr-2" />
              )}
              Duyệt
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Input
              placeholder="Nhập lý do từ chối..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowRejectInput(false);
                  setRejectReason('');
                }}
                className="flex-1"
              >
                Hủy
              </Button>
              <Button
                size="sm"
                onClick={handleReject}
                disabled={!rejectReason.trim() || rejectMutation.isPending}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                Xác nhận từ chối
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}