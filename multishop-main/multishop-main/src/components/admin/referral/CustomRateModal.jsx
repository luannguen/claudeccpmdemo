/**
 * CustomRateModal - Admin set custom commission rate
 * UI Layer - Presentation only
 */

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Icon } from '@/components/ui/AnimatedIcon.jsx';
import { useSetCustomRate } from '@/components/hooks/useCustomCommissionRate';
import { base44 } from '@/api/base44Client';

export default function CustomRateModal({ isOpen, onClose, member, adminEmail }) {
  const [rate, setRate] = useState('');
  const [note, setNote] = useState('');
  const setCustomRateMutation = useSetCustomRate();

  useEffect(() => {
    if (member?.custom_commission_rate) {
      setRate(member.custom_commission_rate.toString());
      setNote(member.custom_rate_note || '');
    } else {
      setRate('');
      setNote('');
    }
  }, [member]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const rateValue = parseFloat(rate);
    if (isNaN(rateValue) || rateValue < 0 || rateValue > 100) {
      return;
    }

    await setCustomRateMutation.mutateAsync({
      memberId: member.id,
      rate: rateValue,
      adminEmail,
      note
    });

    // Commission log
    await base44.entities.ReferralCommissionLog.create({
      referrer_id: member.id,
      referrer_email: member.user_email,
      change_type: 'custom_rate_set',
      old_value: { custom_rate: member.custom_commission_rate || null },
      new_value: { custom_rate: rateValue },
      affected_amount: 0,
      balance_before: member.unpaid_commission || 0,
      balance_after: member.unpaid_commission || 0,
      triggered_by: adminEmail,
      triggered_by_role: 'admin',
      reason: note || 'Custom rate set by admin',
      metadata: { rate: rateValue }
    });

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon.Settings size={20} className="text-blue-500" />
            Set Custom Commission Rate
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
            <p className="font-medium text-amber-900 mb-1">⚠️ Admin Override</p>
            <p className="text-amber-700 text-xs">
              Custom rate sẽ <strong>override</strong> tier + rank bonus. 
              CTV này sẽ luôn nhận {rate}% cho mọi đơn hàng.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              CTV: <span className="text-gray-600">{member?.full_name}</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              % Hoa hồng (0-100)
            </label>
            <Input
              type="number"
              min="0"
              max="100"
              step="0.1"
              placeholder="VD: 5.5"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Ví dụ: 5 = 5%, 10.5 = 10.5%
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Lý do / Ghi chú
            </label>
            <Textarea
              placeholder="VD: CTV chiến lược, hợp đồng đặc biệt..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
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
              disabled={setCustomRateMutation.isPending}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {setCustomRateMutation.isPending ? (
                <Icon.Spinner size={16} className="mr-2" />
              ) : (
                <Icon.CheckCircle size={16} className="mr-2" />
              )}
              Lưu
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}