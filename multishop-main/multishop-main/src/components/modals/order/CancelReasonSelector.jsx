import React from 'react';
import { Check } from 'lucide-react';
import { CANCEL_REASONS } from '@/components/hooks/useOrderDetail';

export default function CancelReasonSelector({ 
  selectedReasons, 
  onReasonToggle,
  otherReason,
  setOtherReason,
  reasons // Optional: custom reasons list (for preorder)
}) {
  // Use custom reasons if provided, otherwise use default
  const cancelReasons = reasons || CANCEL_REASONS;
  return (
    <div>
      <label className="block text-sm font-bold text-gray-900 mb-3">
        Lý do hủy đơn: <span className="text-red-500">*</span>
      </label>
      <p className="text-xs text-gray-600 mb-3">Chọn một hoặc nhiều lý do</p>
      
      <div className="space-y-2">
        {cancelReasons.map((reason) => (
          <label
            key={reason.id}
            className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              selectedReasons.includes(reason.id)
                ? 'border-[#7CB342] bg-green-50'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <div className="flex items-center h-5">
              <input
                type="checkbox"
                checked={selectedReasons.includes(reason.id)}
                onChange={() => onReasonToggle(reason.id)}
                className="w-5 h-5 text-[#7CB342] border-gray-300 rounded focus:ring-[#7CB342] cursor-pointer"
              />
            </div>
            <div className="flex-1">
              <span className={`text-sm ${
                selectedReasons.includes(reason.id) ? 'font-medium text-gray-900' : 'text-gray-700'
              }`}>
                {reason.label}
              </span>
            </div>
            {selectedReasons.includes(reason.id) && (
              <Check className="w-5 h-5 text-[#7CB342]" />
            )}
          </label>
        ))}
      </div>

      {/* Other Reason Input */}
      {selectedReasons.includes('other') && (
        <div className="mt-3 animate-fadeIn">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vui lòng cho biết lý do cụ thể: <span className="text-red-500">*</span>
          </label>
          <textarea
            value={otherReason}
            onChange={(e) => setOtherReason(e.target.value)}
            rows={3}
            placeholder="VD: Tôi cần thay đổi địa chỉ giao hàng..."
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342] resize-none text-sm"
          />
        </div>
      )}

      {/* Selected Summary */}
      {selectedReasons.length > 0 && (
        <div className="bg-blue-50 rounded-xl p-4 mt-4">
          <p className="text-xs text-blue-600 mb-2 font-medium">
            Đã chọn {selectedReasons.length} lý do:
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedReasons.map(id => {
              const reason = cancelReasons.find(r => r.id === id);
              return (
                <span key={id} className="px-3 py-1 bg-white rounded-full text-xs font-medium text-gray-700">
                  {reason?.label}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}