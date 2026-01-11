/**
 * ClaimCustomerModal - UI cho CTV claim KH cũ
 * UI Layer - Presentation only
 */

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Icon } from '@/components/ui/AnimatedIcon.jsx';
import { useRequestClaim } from '@/components/hooks/useReferralClaim';

export default function ClaimCustomerModal({ isOpen, onClose, referrerId }) {
  const [customerEmail, setCustomerEmail] = useState('');
  const requestClaimMutation = useRequestClaim(referrerId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!customerEmail || !customerEmail.includes('@')) {
      return;
    }

    await requestClaimMutation.mutateAsync(customerEmail);
    setCustomerEmail('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon.UserPlus size={20} className="text-amber-500" />
            Claim Khách Hàng Hiện Có
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
            <p className="font-medium text-blue-900 mb-2">ℹ️ Lưu ý:</p>
            <ul className="space-y-1 text-blue-700 text-xs">
              <li>• Khách hàng phải đã mua hàng nhưng chưa có CTV</li>
              <li>• Đơn cũ KHÔNG tính hoa hồng</li>
              <li>• Chỉ đơn mới (sau khi duyệt) mới tính</li>
              <li>• Cần admin duyệt trước khi có hiệu lực</li>
            </ul>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Email khách hàng
            </label>
            <Input
              type="email"
              placeholder="khachhang@email.com"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              required
            />
          </div>

          <div className="flex gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              Hủy
            </Button>
            <Button 
              type="submit"
              disabled={requestClaimMutation.isPending}
              className="flex-1 bg-amber-500 hover:bg-amber-600"
            >
              {requestClaimMutation.isPending ? (
                <Icon.Spinner size={16} className="mr-2" />
              ) : (
                <Icon.Send size={16} className="mr-2" />
              )}
              Gửi yêu cầu
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}