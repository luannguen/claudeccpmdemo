/**
 * GiftCard - Display single gift transaction
 * Used in inbox and sent lists
 */

import React from 'react';
import { Icon } from '@/components/ui/AnimatedIcon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { GIFT_STATUS, isExpired, canRedeem, canSwap } from '../domain/giftStateMachine';
import { GiftContextTag } from './GiftContextDisplay';

const STATUS_CONFIG = {
  [GIFT_STATUS.PENDING_PAYMENT]: { label: 'Chờ thanh toán', color: 'bg-amber-100 text-amber-700', icon: 'Clock' },
  [GIFT_STATUS.PAID]: { label: 'Đã thanh toán', color: 'bg-blue-100 text-blue-700', icon: 'CreditCard' },
  [GIFT_STATUS.SENT]: { label: 'Đã gửi', color: 'bg-purple-100 text-purple-700', icon: 'Send' },
  [GIFT_STATUS.REDEEMABLE]: { label: 'Chờ đổi', color: 'bg-green-100 text-green-700', icon: 'Gift' },
  [GIFT_STATUS.REDEEMED]: { label: 'Đã đổi', color: 'bg-teal-100 text-teal-700', icon: 'PackageCheck' },
  [GIFT_STATUS.FULFILLMENT_CREATED]: { label: 'Đang giao', color: 'bg-indigo-100 text-indigo-700', icon: 'Truck' },
  [GIFT_STATUS.DELIVERED]: { label: 'Đã giao', color: 'bg-green-100 text-green-700', icon: 'CheckCircle' },
  [GIFT_STATUS.SWAPPED]: { label: 'Đã đổi quà', color: 'bg-gray-100 text-gray-700', icon: 'RefreshCw' },
  [GIFT_STATUS.CANCELLED]: { label: 'Đã hủy', color: 'bg-red-100 text-red-700', icon: 'X' },
  [GIFT_STATUS.EXPIRED]: { label: 'Hết hạn', color: 'bg-gray-100 text-gray-500', icon: 'Clock' }
};

export default function GiftCard({ 
  gift, 
  view = 'received', // 'received' | 'sent'
  onRedeem,
  onSwap,
  onViewDetail 
}) {
  // Guard against null gift
  if (!gift) return null;
  
  const config = STATUS_CONFIG[gift.status] || STATUS_CONFIG[GIFT_STATUS.SENT];
  const StatusIcon = Icon[config.icon];
  const expired = isExpired(gift);
  const redeemable = canRedeem(gift);
  const swappable = canSwap(gift);

  const isReceived = view === 'received';
  const personName = isReceived ? gift.sender_name : gift.receiver_name;
  const personLabel = isReceived ? 'Từ' : 'Đến';

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex gap-4 p-4">
        {/* Product Image */}
        <div className="relative">
          <img
            src={gift.item_image}
            alt={gift.item_name}
            className="w-20 h-20 rounded-xl object-cover"
          />
          {expired && (
            <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
              <span className="text-white text-xs font-medium">Hết hạn</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-medium text-gray-900 truncate">{gift.item_name}</h3>
            <Badge className={config.color}>
              {StatusIcon && <StatusIcon size={12} className="mr-1" />}
              {config.label}
            </Badge>
          </div>

          <p className="text-[#7CB342] font-bold mb-2">
            {gift.item_value?.toLocaleString('vi-VN')}đ
          </p>

          <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
            <span className="flex items-center gap-1">
              <Icon.User size={14} />
              {personLabel}: {personName}
            </span>
            {gift.sent_date && (
              <span className="flex items-center gap-1">
                <Icon.Calendar size={14} />
                {format(new Date(gift.sent_date), 'dd/MM/yyyy', { locale: vi })}
              </span>
            )}
            {/* ECARD-F19: Gift Context Tag */}
            {gift.gift_context && gift.gift_context !== 'other' && (
              <GiftContextTag contextKey={gift.gift_context} size="xs" />
            )}
          </div>

          {/* Message */}
          {gift.message && (
            <p className="text-sm text-gray-600 italic mt-2 line-clamp-1">
              "{gift.message}"
            </p>
          )}

          {/* Expiry warning */}
          {!expired && gift.expires_at && redeemable && (
            <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
              <Icon.Clock size={12} />
              Hết hạn: {format(new Date(gift.expires_at), 'dd/MM/yyyy', { locale: vi })}
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      {isReceived && redeemable && !expired && (
        <div className="flex gap-2 px-4 pb-4">
          <Button
            onClick={() => onRedeem?.(gift)}
            className="flex-1 bg-[#7CB342] hover:bg-[#689F38]"
            size="sm"
          >
            <Icon.PackageCheck size={16} className="mr-1" />
            Đổi quà
          </Button>
          {swappable && (
            <Button
              onClick={() => onSwap?.(gift)}
              variant="outline"
              size="sm"
            >
              <Icon.RefreshCw size={16} className="mr-1" />
              Đổi khác
            </Button>
          )}
        </div>
      )}

      {/* View Detail */}
      {onViewDetail && (
        <button
          onClick={() => onViewDetail(gift)}
          className="w-full px-4 py-2 text-sm text-[#7CB342] hover:bg-[#7CB342]/5 border-t border-gray-100 transition-colors"
        >
          Xem chi tiết
        </button>
      )}
    </div>
  );
}