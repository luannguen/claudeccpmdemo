import React from 'react';
import { Mail, MessageSquare } from 'lucide-react';

function UserMessageCard({ summary, orders, onOpenChat }) {
  return (
    <div
      className={`bg-white rounded-xl p-4 shadow-md hover:shadow-xl transition-all border-2 ${
        summary.unreadCount > 0 ? 'border-blue-200 bg-blue-50' : 'border-gray-100'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-[#7CB342] rounded-full flex items-center justify-center text-white font-bold">
              {summary.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-bold text-gray-900">{summary.name}</p>
                {summary.unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-blue-500 text-white rounded-full text-xs font-bold">
                    {summary.unreadCount} mới
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600">{summary.email}</p>
            </div>
          </div>

          <p className="text-sm text-gray-700 line-clamp-2 mb-2">
            {summary.latestMessage.message}
          </p>

          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>
              {new Date(summary.latestMessage.created_date).toLocaleString('vi-VN')}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              {summary.totalMessages} tin nhắn
            </span>
            <span className="flex items-center gap-1">
              🛒 {summary.orderCount} đơn hàng
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {summary.messages.slice(0, 3).map(msg => {
            const order = orders.find(o => o.id === msg.order_id);
            return (
              <button
                key={msg.id}
                onClick={() => onOpenChat({ order })}
                className="px-3 py-1.5 bg-gray-100 hover:bg-[#7CB342] hover:text-white rounded-lg text-xs transition-colors text-left"
              >
                #{order?.order_number || msg.order_id.slice(-6)}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function OrderMessageCard({ summary, onOpenChat }) {
  return (
    <div
      className={`bg-white rounded-xl p-4 shadow-md hover:shadow-xl transition-all border-2 ${
        summary.unreadCount > 0 ? 'border-blue-200 bg-blue-50' : 'border-gray-100'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-[#7CB342] rounded-full flex items-center justify-center text-white font-bold">
              {summary.order?.customer_name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-bold text-gray-900">
                  {summary.order?.customer_name || 'Khách hàng'}
                </p>
                {summary.unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-blue-500 text-white rounded-full text-xs font-bold">
                    {summary.unreadCount} mới
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600">
                Đơn #{summary.order?.order_number || summary.orderId.slice(-6)}
              </p>
            </div>
          </div>

          <p className="text-sm text-gray-700 line-clamp-2 mb-2">
            {summary.latestMessage.message}
          </p>

          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>
              {new Date(summary.latestMessage.created_date).toLocaleString('vi-VN')}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              {summary.totalMessages} tin nhắn
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onOpenChat(summary);
            }}
            className="px-4 py-2 bg-[#7CB342] text-white rounded-lg hover:bg-[#FF9800] transition-colors flex items-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            Chat
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MessagesList({ summaries, viewMode, orders, isLoading, onOpenChat }) {
  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 border-4 border-[#7CB342] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Đang tải tin nhắn...</p>
      </div>
    );
  }

  if (summaries.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl">
        <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Không có tin nhắn nào</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {summaries.map((summary) => {
        if (viewMode === 'by-user') {
          return (
            <UserMessageCard
              key={summary.email}
              summary={summary}
              orders={orders}
              onOpenChat={onOpenChat}
            />
          );
        }

        return (
          <OrderMessageCard
            key={summary.orderId}
            summary={summary}
            onOpenChat={onOpenChat}
          />
        );
      })}
    </div>
  );
}