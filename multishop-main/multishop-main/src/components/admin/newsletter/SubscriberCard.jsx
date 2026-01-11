import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

export default function SubscriberCard({ subscriber, onUpdateStatus, onDelete }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-[#7CB342] to-[#FF9800] rounded-full flex items-center justify-center text-white font-bold text-lg">
          {subscriber.email?.charAt(0).toUpperCase()}
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          subscriber.status === 'active' ? 'bg-green-100 text-green-700' :
          subscriber.status === 'unsubscribed' ? 'bg-red-100 text-red-700' :
          'bg-gray-100 text-gray-700'
        }`}>
          {subscriber.status === 'active' ? 'Active' :
           subscriber.status === 'unsubscribed' ? 'Unsubscribed' : 'Bounced'}
        </span>
      </div>

      <h3 className="font-bold text-gray-900 mb-2 truncate">{subscriber.email}</h3>
      {subscriber.full_name && (
        <p className="text-sm text-gray-600 mb-3">{subscriber.full_name}</p>
      )}

      <div className="grid grid-cols-3 gap-2 mb-4 text-center">
        <div className="bg-blue-50 rounded-lg p-2">
          <p className="text-xs text-blue-600">Đã gửi</p>
          <p className="font-bold text-blue-700">{subscriber.emails_sent || 0}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-2">
          <p className="text-xs text-green-600">Đã mở</p>
          <p className="font-bold text-green-700">{subscriber.emails_opened || 0}</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-2">
          <p className="text-xs text-purple-600">Clicks</p>
          <p className="font-bold text-purple-700">{subscriber.emails_clicked || 0}</p>
        </div>
      </div>

      <div className="flex gap-2">
        {subscriber.status === 'active' ? (
          <button
            onClick={() => onUpdateStatus(subscriber.id, 'unsubscribed')}
            className="flex-1 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
          >
            Unsubscribe
          </button>
        ) : (
          <button
            onClick={() => onUpdateStatus(subscriber.id, 'active')}
            className="flex-1 py-2 bg-green-50 text-green-600 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors"
          >
            Reactivate
          </button>
        )}
        <button
          onClick={() => {
            if (confirm('Xóa subscriber này?')) {
              onDelete(subscriber.id);
            }
          }}
          className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="text-xs text-gray-400 mt-3">
        Đăng ký: {new Date(subscriber.created_date).toLocaleDateString('vi-VN')}
      </p>
    </motion.div>
  );
}