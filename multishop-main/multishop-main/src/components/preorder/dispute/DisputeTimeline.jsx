/**
 * DisputeTimeline - Timeline xử lý dispute
 * UI Layer
 */

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Circle, CheckCircle, Clock, AlertTriangle, 
  MessageCircle, User, Shield, ArrowUp
} from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const EVENT_CONFIG = {
  ticket_created: { icon: Circle, color: 'text-blue-500', bgColor: 'bg-blue-100' },
  under_review: { icon: Clock, color: 'text-yellow-500', bgColor: 'bg-yellow-100' },
  resolution_proposed: { icon: MessageCircle, color: 'text-purple-500', bgColor: 'bg-purple-100' },
  resolution_accepted: { icon: CheckCircle, color: 'text-green-500', bgColor: 'bg-green-100' },
  resolution_rejected: { icon: AlertTriangle, color: 'text-red-500', bgColor: 'bg-red-100' },
  escalated: { icon: ArrowUp, color: 'text-orange-500', bgColor: 'bg-orange-100' },
  resolved: { icon: CheckCircle, color: 'text-emerald-500', bgColor: 'bg-emerald-100' },
  closed: { icon: Shield, color: 'text-gray-500', bgColor: 'bg-gray-100' },
  note_added: { icon: MessageCircle, color: 'text-gray-500', bgColor: 'bg-gray-100' },
  customer_response: { icon: User, color: 'text-blue-500', bgColor: 'bg-blue-100' },
  seller_response: { icon: User, color: 'text-indigo-500', bgColor: 'bg-indigo-100' }
};

function TimelineItem({ event, isLast }) {
  const config = EVENT_CONFIG[event.event] || EVENT_CONFIG.note_added;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3"
    >
      {/* Icon and line */}
      <div className="flex flex-col items-center">
        <div className={`p-2 rounded-full ${config.bgColor}`}>
          <Icon className={`w-4 h-4 ${config.color}`} />
        </div>
        {!isLast && (
          <div className="w-0.5 h-full bg-gray-200 mt-2" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-medium text-gray-900 text-sm">
              {event.note || event.event?.replace(/_/g, ' ')}
            </p>
            {event.actor && (
              <p className="text-xs text-gray-500 mt-0.5">
                bởi {event.actor}
              </p>
            )}
          </div>
          <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
            {event.timestamp && format(
              new Date(event.timestamp),
              'dd/MM HH:mm',
              { locale: vi }
            )}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default function DisputeTimeline({ timeline = [], showAll = false }) {
  const displayTimeline = showAll ? timeline : timeline.slice(-5);

  if (timeline.length === 0) {
    return (
      <div className="text-center py-6">
        <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
        <p className="text-sm text-gray-500">Chưa có hoạt động</p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {!showAll && timeline.length > 5 && (
        <p className="text-xs text-gray-500 mb-4">
          Hiển thị 5 hoạt động gần nhất
        </p>
      )}
      
      {displayTimeline.map((event, index) => (
        <TimelineItem
          key={index}
          event={event}
          isLast={index === displayTimeline.length - 1}
        />
      ))}
    </div>
  );
}