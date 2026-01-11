/**
 * UI Component: Reassign Customer Modal (Admin)
 * 
 * Single Goal: Admin chuyển KH sang CTV khác
 * 
 * Architecture: UI Layer
 */

import React, { useState } from 'react';
import { X, RefreshCw, AlertTriangle, User, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function ReassignCustomerModal({ 
  customer, 
  isOpen, 
  onClose, 
  onSubmit, 
  isSubmitting 
}) {
  const [newReferrerId, setNewReferrerId] = useState('');
  const [reason, setReason] = useState('');

  // Fetch all active referral members
  const { data: referralMembers = [] } = useQuery({
    queryKey: ['admin-all-referral-members'],
    queryFn: () => base44.entities.ReferralMember.filter({ status: 'active' }, '-created_date', 500),
    enabled: isOpen
  });

  // Current referrer info
  const currentReferrer = referralMembers.find(r => r.id === customer?.referrer_id);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!newReferrerId) {
      alert('Vui lòng chọn CTV mới');
      return;
    }
    
    if (!reason.trim()) {
      alert('Vui lòng nhập lý do');
      return;
    }

    onSubmit({
      customerId: customer.id,
      newReferrerId,
      reason: reason.trim()
    });
  };

  const handleClose = () => {
    setNewReferrerId('');
    setReason('');
    onClose();
  };

  if (!customer) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-amber-600" />
            Chuyển Khách Hàng Sang CTV Khác
          </DialogTitle>
          <DialogDescription>
            Thao tác này sẽ thay đổi người được hưởng hoa hồng cho các đơn hàng tương lai
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Customer Info */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-gray-500" />
              <span className="font-medium text-sm">Thông tin khách hàng</span>
            </div>
            <p className="text-sm"><strong>Tên:</strong> {customer.full_name}</p>
            <p className="text-xs text-gray-600">
              {customer.phone} • {customer.email}
            </p>
          </div>

          {/* Current Referrer */}
          {currentReferrer && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-sm text-blue-700">CTV hiện tại</span>
              </div>
              <p className="text-sm font-medium">{currentReferrer.full_name}</p>
              <p className="text-xs text-gray-600">{currentReferrer.user_email}</p>
            </div>
          )}

          {/* New Referrer Select */}
          <div>
            <Label>CTV mới <span className="text-red-500">*</span></Label>
            <Select value={newReferrerId} onValueChange={setNewReferrerId}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Chọn CTV mới..." />
              </SelectTrigger>
              <SelectContent>
                {referralMembers
                  .filter(r => r.id !== customer.referrer_id)
                  .map(member => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.full_name} ({member.referral_code}) - {member.total_referred_customers || 0} KH
                    </SelectItem>
                  ))
                }
              </SelectContent>
            </Select>
          </div>

          {/* Reason */}
          <div>
            <Label>Lý do chuyển đổi <span className="text-red-500">*</span></Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="VD: Gán nhầm ban đầu, CTV cũ nghỉ việc, yêu cầu từ CTV..."
              rows={3}
              className="mt-1"
            />
          </div>

          {/* Warning */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2 text-xs text-amber-700">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium mb-1">⚠️ Lưu ý quan trọng:</p>
              <ul className="space-y-1 ml-3 list-disc">
                <li>Hoa hồng các đơn cũ vẫn thuộc CTV cũ</li>
                <li>Chỉ đơn mới sẽ tính cho CTV mới</li>
                <li>Khách hàng sẽ bị khóa, không thể đổi lại</li>
              </ul>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !newReferrerId || !reason.trim()}
              className="flex-1 bg-amber-500 hover:bg-amber-600"
            >
              {isSubmitting ? 'Đang xử lý...' : 'Xác nhận chuyển'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}