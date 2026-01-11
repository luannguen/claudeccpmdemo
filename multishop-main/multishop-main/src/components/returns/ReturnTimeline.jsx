/**
 * 📅 Return Timeline - Event history
 */

import React from 'react';
import { Clock, CheckCircle, XCircle, Package, User } from 'lucide-react';

const TIMELINE_ICONS = {
  pending: Clock,
  approved: CheckCircle,
  rejected: XCircle,
  shipping_back: Package,
  received: Package,
  refunded: CheckCircle,
  default: Clock
};

export default function ReturnTimeline({ returnRequest }) {
  const timeline = returnRequest.timeline || [];

  if (timeline.length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="font-bold text-gray-900 mb-4">Lịch Sử</h3>
      <div className="space-y-4">
        {timeline.map((event, idx) => {
          const Icon = TIMELINE_ICONS[event.status] || TIMELINE_ICONS.default;
          
          return (
            <div key={idx} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-[#7CB342] text-white flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                {idx < timeline.length - 1 && (
                  <div className="w-0.5 h-full bg-gray-300 mt-2" />
                )}
              </div>
              <div className="flex-1 pb-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="font-bold text-gray-900 mb-1">{event.status}</p>
                  <p className="text-sm text-gray-700 mb-2">{event.note}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(event.timestamp).toLocaleString('vi-VN')}
                    </span>
                    {event.actor && (
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {event.actor}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}