/**
 * 📊 Return Status Tracker - Visual progress indicator
 */

import React from 'react';
import { CheckCircle, Clock, Package, DollarSign } from 'lucide-react';

const STATUSES = [
  { key: 'pending', label: 'Chờ duyệt', icon: Clock },
  { key: 'approved', label: 'Đã duyệt', icon: CheckCircle },
  { key: 'shipping_back', label: 'Gửi về', icon: Package },
  { key: 'received', label: 'Đã nhận', icon: Package },
  { key: 'refunded', label: 'Hoàn tiền', icon: DollarSign }
];

export default function ReturnStatusTracker({ returnRequest }) {
  const currentStatusIndex = STATUSES.findIndex(s => s.key === returnRequest.status);
  const isRejected = returnRequest.status === 'rejected';

  if (isRejected) {
    return (
      <div className="bg-red-50 rounded-lg p-4 border border-red-200">
        <p className="text-sm font-bold text-red-900 mb-1">❌ Yêu cầu bị từ chối</p>
        {returnRequest.rejection_reason && (
          <p className="text-xs text-red-700">Lý do: {returnRequest.rejection_reason}</p>
        )}
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className="flex items-center justify-between">
        {STATUSES.map((status, idx) => {
          const Icon = status.icon;
          const isActive = idx <= currentStatusIndex;
          const isCurrent = idx === currentStatusIndex;

          return (
            <React.Fragment key={status.key}>
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  isActive ? 'bg-[#7CB342] text-white scale-110' : 'bg-gray-200 text-gray-400'
                } ${isCurrent ? 'animate-pulse' : ''}`}>
                  {isActive ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <p className={`text-xs mt-2 font-medium ${
                  isActive ? 'text-[#7CB342]' : 'text-gray-500'
                }`}>
                  {status.label}
                </p>
              </div>
              {idx < STATUSES.length - 1 && (
                <div className={`flex-1 h-1 mx-2 transition-all ${
                  idx < currentStatusIndex ? 'bg-[#7CB342]' : 'bg-gray-200'
                }`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}