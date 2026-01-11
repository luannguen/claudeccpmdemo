/**
 * GiftTransactionTable - Admin table for gift transactions
 * UI Layer - Presentation only
 */

import React, { useState } from 'react';
import { Icon } from '@/components/ui/AnimatedIcon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { formatCurrency } from '@/components/shared/utils/formatters';
import { GIFT_STATUS } from '../../types';

const STATUS_CONFIG = {
  [GIFT_STATUS.PENDING_PAYMENT]: { label: 'Chờ thanh toán', color: 'bg-gray-100 text-gray-700' },
  [GIFT_STATUS.PAID]: { label: 'Đã TT', color: 'bg-blue-100 text-blue-700' },
  [GIFT_STATUS.SENT]: { label: 'Đã gửi', color: 'bg-indigo-100 text-indigo-700' },
  [GIFT_STATUS.REDEEMABLE]: { label: 'Chờ đổi', color: 'bg-amber-100 text-amber-700' },
  [GIFT_STATUS.REDEEMED]: { label: 'Đã đổi', color: 'bg-purple-100 text-purple-700' },
  [GIFT_STATUS.FULFILLMENT_CREATED]: { label: 'Đang xử lý', color: 'bg-cyan-100 text-cyan-700' },
  [GIFT_STATUS.DELIVERED]: { label: 'Đã giao', color: 'bg-green-100 text-green-700' },
  [GIFT_STATUS.SWAPPED]: { label: 'Đã đổi SP', color: 'bg-teal-100 text-teal-700' },
  [GIFT_STATUS.CANCELLED]: { label: 'Đã hủy', color: 'bg-red-100 text-red-700' },
  [GIFT_STATUS.EXPIRED]: { label: 'Hết hạn', color: 'bg-orange-100 text-orange-700' }
};

export default function GiftTransactionTable({ 
  transactions, 
  isLoading,
  onMarkDelivered,
  onCancelGift,
  onViewDetail
}) {
  const [sortField, setSortField] = useState('created_date');
  const [sortDir, setSortDir] = useState('desc');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const sortedTransactions = [...transactions].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];
    
    if (sortField === 'created_date' || sortField === 'sent_date') {
      aVal = new Date(aVal || 0).getTime();
      bVal = new Date(bVal || 0).getTime();
    }
    
    if (sortDir === 'asc') return aVal > bVal ? 1 : -1;
    return aVal < bVal ? 1 : -1;
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <Icon.Gift size={32} className="text-gray-400" />
        </div>
        <h3 className="font-medium text-gray-900 mb-2">Chưa có giao dịch quà tặng</h3>
        <p className="text-gray-500 text-sm">Các giao dịch quà tặng sẽ hiển thị ở đây</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          <Icon.Gift size={20} className="text-[#7CB342]" />
          Giao dịch quà tặng ({transactions.length})
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('created_date')}
              >
                Ngày tạo {sortField === 'created_date' && (sortDir === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Sản phẩm
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Người gửi
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Người nhận
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('item_value')}
              >
                Giá trị {sortField === 'item_value' && (sortDir === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Trạng thái
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sortedTransactions.map(gift => (
              <tr key={gift.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap">
                  <p className="text-sm text-gray-900">
                    {format(new Date(gift.created_date), 'dd/MM/yyyy', { locale: vi })}
                  </p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(gift.created_date), 'HH:mm')}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {gift.item_image ? (
                      <img 
                        src={gift.item_image} 
                        alt={gift.item_name} 
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Icon.Package size={16} className="text-gray-400" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate max-w-[150px]">
                        {gift.item_name}
                      </p>
                      {gift.redemption_code && (
                        <p className="text-xs text-gray-500 font-mono">{gift.redemption_code}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm text-gray-900">{gift.sender_name || 'N/A'}</p>
                  <p className="text-xs text-gray-500 truncate max-w-[120px]">{gift.sender_email}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm text-gray-900">{gift.receiver_name || 'N/A'}</p>
                  <p className="text-xs text-gray-500 truncate max-w-[120px]">{gift.receiver_email}</p>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <p className="text-sm font-medium text-[#7CB342]">
                    {formatCurrency(gift.item_value)}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <Badge className={STATUS_CONFIG[gift.status]?.color || 'bg-gray-100'}>
                    {STATUS_CONFIG[gift.status]?.label || gift.status}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewDetail?.(gift)}
                      className="h-8 w-8 p-0"
                    >
                      <Icon.Eye size={16} className="text-gray-500" />
                    </Button>
                    
                    {[GIFT_STATUS.FULFILLMENT_CREATED, GIFT_STATUS.REDEEMED].includes(gift.status) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onMarkDelivered?.(gift.id)}
                        className="h-8 w-8 p-0 text-green-600 hover:bg-green-50"
                      >
                        <Icon.PackageCheck size={16} />
                      </Button>
                    )}
                    
                    {[GIFT_STATUS.PENDING_PAYMENT, GIFT_STATUS.REDEEMABLE].includes(gift.status) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onCancelGift?.(gift.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                      >
                        <Icon.X size={16} />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}