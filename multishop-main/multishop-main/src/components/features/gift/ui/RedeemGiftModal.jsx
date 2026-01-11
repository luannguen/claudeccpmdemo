/**
 * RedeemGiftModal - Modal for receiver to redeem gift
 * Enter shipping info to complete redemption
 */

import React, { useState } from 'react';
import { Icon } from '@/components/ui/AnimatedIcon';
import EnhancedModal from '@/components/EnhancedModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useGiftRedeem } from '../hooks/useGiftRedeem';
import { canRedeem, isExpired } from '../domain/giftStateMachine';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { GiftContextBanner } from './GiftContextDisplay';

export default function RedeemGiftModal({ isOpen, onClose, gift, onRedeemed }) {
  const [shippingInfo, setShippingInfo] = useState({
    phone: '',
    address: '',
    city: '',
    district: '',
    ward: '',
    delivery_date: '',
    delivery_time: ''
  });
  const [step, setStep] = useState('info'); // info | success

  const { redeemGift, isRedeeming } = useGiftRedeem();

  const updateField = (field, value) => {
    setShippingInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleRedeem = async () => {
    try {
      await redeemGift({ gift, shippingInfo });
      setStep('success');
      onRedeemed?.();
    } catch (error) {
      // Error handled in hook
    }
  };

  const isValid = shippingInfo.phone.length >= 10 && shippingInfo.address.length >= 10;
  const expired = isExpired(gift);
  const redeemable = canRedeem(gift);

  if (!gift) return null;

  return (
    <EnhancedModal
      isOpen={isOpen}
      onClose={onClose}
      title={step === 'success' ? '🎉 Đổi quà thành công!' : '🎁 Đổi quà'}
      maxWidth="md"
      showControls={false}
      enableDrag={false}
      positionKey="redeem-gift"
    >
      {step === 'info' ? (
        <div className="p-6 space-y-6">
          {/* ECARD-F19: Gift Context Banner */}
          {(gift.gift_context || gift.occasion) && (
            <GiftContextBanner gift={gift} className="mb-4" />
          )}

          {/* Gift Info */}
          <div className="flex gap-4 p-4 bg-gradient-to-br from-[#7CB342]/10 to-[#7CB342]/5 rounded-xl">
            <img
              src={gift.item_image}
              alt={gift.item_name}
              className="w-20 h-20 rounded-xl object-cover shadow-lg"
            />
            <div className="flex-1">
              <p className="font-bold text-gray-900">{gift.item_name}</p>
              <p className="text-[#7CB342] font-bold">
                {gift.item_value?.toLocaleString('vi-VN')}đ
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Từ: {gift.sender_name}
              </p>
              {gift.message && (
                <p className="text-sm text-gray-600 italic mt-1">"{gift.message}"</p>
              )}
            </div>
          </div>

          {/* Expiry Warning */}
          {gift.expires_at && (
            <div className={`flex items-center gap-2 p-3 rounded-lg ${
              expired ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
            }`}>
              <Icon.Clock size={18} />
              <span className="text-sm">
                {expired 
                  ? 'Quà đã hết hạn'
                  : `Hết hạn: ${format(new Date(gift.expires_at), 'dd/MM/yyyy', { locale: vi })}`
                }
              </span>
            </div>
          )}

          {/* Not redeemable */}
          {!redeemable && !expired && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-100 text-gray-600">
              <Icon.Info size={18} />
              <span className="text-sm">Quà này không thể đổi lúc này</span>
            </div>
          )}

          {/* Shipping Form */}
          {redeemable && !expired && (
            <>
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Thông tin nhận hàng</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số điện thoại *
                  </label>
                  <Input
                    type="tel"
                    placeholder="0912 345 678"
                    value={shippingInfo.phone}
                    onChange={e => updateField('phone', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Địa chỉ nhận hàng *
                  </label>
                  <Textarea
                    placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                    value={shippingInfo.address}
                    onChange={e => updateField('address', e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ngày giao (tuỳ chọn)
                    </label>
                    <Input
                      type="date"
                      value={shippingInfo.delivery_date}
                      onChange={e => updateField('delivery_date', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Giờ giao (tuỳ chọn)
                    </label>
                    <select
                      value={shippingInfo.delivery_time}
                      onChange={e => updateField('delivery_time', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                    >
                      <option value="">Linh hoạt</option>
                      <option value="morning">Sáng (8h-12h)</option>
                      <option value="afternoon">Chiều (13h-18h)</option>
                      <option value="evening">Tối (18h-21h)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="pt-4 border-t border-gray-100">
                <Button
                  onClick={handleRedeem}
                  disabled={!isValid || isRedeeming}
                  className="w-full bg-[#7CB342] hover:bg-[#689F38]"
                >
                  {isRedeeming ? (
                    <>
                      <Icon.Spinner size={18} className="mr-2" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <Icon.PackageCheck size={18} className="mr-2" />
                      Xác nhận nhận quà
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      ) : (
        // Success Step
        <div className="p-6 text-center space-y-6">
          <div className="w-20 h-20 mx-auto bg-[#7CB342]/10 rounded-full flex items-center justify-center">
            <Icon.CheckCircle size={40} className="text-[#7CB342]" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Đổi quà thành công!
            </h2>
            <p className="text-gray-600">
              Đơn hàng của bạn đã được tạo và sẽ được giao sớm nhất có thể.
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 text-left">
            <p className="text-sm text-gray-500 mb-2">Địa chỉ giao hàng:</p>
            <p className="font-medium text-gray-900">{shippingInfo.phone}</p>
            <p className="text-gray-700">{shippingInfo.address}</p>
          </div>

          <Button onClick={onClose} className="w-full bg-[#7CB342] hover:bg-[#689F38]">
            Đóng
          </Button>
        </div>
      )}
    </EnhancedModal>
  );
}