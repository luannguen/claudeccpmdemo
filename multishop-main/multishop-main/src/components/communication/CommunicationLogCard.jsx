import React from 'react';
import { Mail, MessageSquare, Bell, Phone, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';

const channelIcons = {
  email: Mail,
  sms: Phone,
  push: Bell,
  in_app: MessageSquare,
  order_chat: ShoppingCart
};

const channelColors = {
  email: 'blue',
  sms: 'green',
  push: 'purple',
  in_app: 'orange',
  order_chat: 'indigo'
};

const statusColors = {
  sent: 'gray',
  delivered: 'blue',
  opened: 'green',
  clicked: 'purple',
  failed: 'red',
  bounced: 'red'
};

export default function CommunicationLogCard({ log, isAdmin = false }) {
  const Icon = channelIcons[log.channel] || MessageSquare;
  const channelColor = channelColors[log.channel] || 'gray';
  const statusColor = statusColors[log.status] || 'gray';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all border border-gray-100"
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-full bg-${channelColor}-100 flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-5 h-5 text-${channelColor}-600`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-gray-900 truncate">{log.subject || log.type}</h3>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium bg-${statusColor}-100 text-${statusColor}-700`}>
              {log.status}
            </span>
          </div>

          {isAdmin && (
            <p className="text-sm text-gray-600 mb-2">
              👤 {log.customer_name} ({log.customer_email})
            </p>
          )}

          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
            {log.content?.substring(0, 150)}...
          </p>

          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-3">
              <span className={`px-2 py-0.5 rounded bg-${channelColor}-50 text-${channelColor}-700`}>
                {log.channel}
              </span>
              {log.order_number && (
                <span>📦 #{log.order_number}</span>
              )}
            </div>
            <span>{new Date(log.sent_date || log.created_date).toLocaleDateString('vi-VN')}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}