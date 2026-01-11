/**
 * WithdrawalRequestModal - CTV request rút tiền
 * UI Layer - Presentation only
 */

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Icon } from '@/components/ui/AnimatedIcon.jsx';
import { useRequestWithdrawal } from '@/components/hooks/useWithdrawal';
import WithdrawalService from '@/components/services/WithdrawalService';

export default function WithdrawalRequestModal({ isOpen, onClose, referrer }) {
  const [amount, setAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [bankAccountName, setBankAccountName] = useState('');
  
  const requestMutation = useRequestWithdrawal(referrer?.id);

  useEffect(() => {
    if (referrer) {
      setBankName(referrer.bank_name || '');
      setBankAccount(referrer.bank_account || '');
      setBankAccountName(referrer.bank_account_name || '');
    }
  }, [referrer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const amountNum = parseInt(amount.replace(/\D/g, ''));
    
    await requestMutation.mutateAsync({
      amount: amountNum,
      bankInfo: {
        name: bankName,
        account: bankAccount,
        account_name: bankAccountName
      }
    });

    setAmount('');
    onClose();
  };

  const availableBalance = referrer?.unpaid_commission || 0;
  const minAmount = WithdrawalService.MIN_WITHDRAWAL_AMOUNT;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon.Wallet size={20} className="text-green-500" />
            Yêu Cầu Rút Tiền
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Số dư khả dụng:</p>
            <p className="text-2xl font-bold text-green-600">
              {availableBalance.toLocaleString('vi-VN')}đ
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Số tiền muốn rút (tối thiểu {minAmount.toLocaleString('vi-VN')}đ)
            </label>
            <Input
              type="text"
              placeholder="VD: 500,000"
              value={amount}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                setAmount(value ? parseInt(value).toLocaleString('vi-VN') : '');
              }}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Tên ngân hàng
            </label>
            <Input
              placeholder="VD: Vietcombank, Techcombank..."
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Số tài khoản
            </label>
            <Input
              placeholder="VD: 1234567890"
              value={bankAccount}
              onChange={(e) => setBankAccount(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Tên chủ tài khoản
            </label>
            <Input
              placeholder="NGUYEN VAN A"
              value={bankAccountName}
              onChange={(e) => setBankAccountName(e.target.value.toUpperCase())}
              required
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
            <p>ℹ️ Yêu cầu sẽ được admin xem xét trong 24-48h. Bạn sẽ nhận thông báo khi được duyệt.</p>
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
              disabled={requestMutation.isPending}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {requestMutation.isPending ? (
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