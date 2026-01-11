/**
 * GiftOptionsStep - Step 2 of gift wizard
 * Configure delivery mode, gift context, message
 * 
 * ECARD-F19: Nâng cấp với Gift Context (ngữ cảnh quan hệ)
 */

import React from 'react';
import { Icon } from '@/components/ui/AnimatedIcon';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { DELIVERY_MODE_CONFIG, DELIVERY_MODE } from '../../types';
import { GIFT_CONTEXT, GIFT_CONTEXT_CONFIG } from '../../domain/giftContextPolicies';
import GiftContextSelector, { GiftContextPreview } from '../GiftContextSelector';

export default function GiftOptionsStep({ options, onChange, receiver, onBack, onNext }) {
  const updateOption = (key, value) => {
    onChange({ ...options, [key]: value });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Receiver Info */}
      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
        <div className="w-12 h-12 rounded-full bg-[#7CB342]/20 flex items-center justify-center">
          {receiver?.target_avatar ? (
            <img src={receiver.target_avatar} alt="" className="w-full h-full rounded-full object-cover" />
          ) : (
            <Icon.User size={24} className="text-[#7CB342]" />
          )}
        </div>
        <div>
          <p className="font-medium text-gray-900">{receiver?.target_name}</p>
          <p className="text-sm text-gray-500">Người nhận quà</p>
        </div>
      </div>

      {/* Delivery Mode */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Hình thức gửi
        </label>
        <div className="grid grid-cols-1 gap-2">
          {Object.entries(DELIVERY_MODE_CONFIG).map(([key, config]) => {
            const ModeIcon = Icon[config.icon];
            const isSelected = options.delivery_mode === key;
            
            return (
              <button
                key={key}
                type="button"
                onClick={() => updateOption('delivery_mode', key)}
                className={`flex items-start gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                  isSelected
                    ? 'border-[#7CB342] bg-[#7CB342]/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  isSelected ? 'bg-[#7CB342] text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  {ModeIcon && <ModeIcon size={20} />}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{config.label}</p>
                  <p className="text-sm text-gray-500">{config.description}</p>
                </div>
                {isSelected && (
                  <Icon.CheckCircle size={20} className="text-[#7CB342] mt-1" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Scheduled Date (if scheduled mode) */}
      {options.delivery_mode === DELIVERY_MODE.SCHEDULED && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ngày gửi
          </label>
          <input
            type="date"
            value={options.scheduled_delivery_date || ''}
            onChange={e => updateOption('scheduled_delivery_date', e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl"
          />
        </div>
      )}

      {/* Gift Context - ECARD-F19 */}
      <GiftContextSelector
        value={options.gift_context || GIFT_CONTEXT.OTHER}
        onChange={(value) => updateOption('gift_context', value)}
        senderName="Bạn"
        variant="chips"
        showPreview={true}
      />

      {/* Message */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Lời nhắn
        </label>
        <Textarea
          value={options.message}
          onChange={e => updateOption('message', e.target.value)}
          placeholder={GIFT_CONTEXT_CONFIG[options.gift_context]?.defaultMessage || 'Viết lời chúc của bạn...'}
          rows={3}
          className="resize-none"
        />
      </div>

      {/* Can Swap */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
        <div>
          <p className="font-medium text-gray-900">Cho phép đổi quà</p>
          <p className="text-sm text-gray-500">Người nhận có thể đổi sang quà khác</p>
        </div>
        <Switch
          checked={options.can_swap}
          onCheckedChange={v => updateOption('can_swap', v)}
        />
      </div>

      {/* Navigation */}
      <div className="flex gap-3 pt-4 border-t border-gray-100">
        <Button variant="outline" onClick={onBack} className="flex-1">
          <Icon.ChevronLeft size={18} className="mr-1" />
          Quay lại
        </Button>
        <Button onClick={onNext} className="flex-1 bg-[#7CB342] hover:bg-[#689F38]">
          Thanh toán
          <Icon.ChevronRight size={18} className="ml-1" />
        </Button>
      </div>
    </div>
  );
}

function DetailRow({ label, value, icon }) {
  const RowIcon = icon ? Icon[icon] : null;
  
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-500 flex items-center gap-2">
        {RowIcon && <RowIcon size={14} />}
        {label}
      </span>
      <span className="text-gray-900 font-medium">{value}</span>
    </div>
  );
}