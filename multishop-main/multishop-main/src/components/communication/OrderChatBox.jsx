import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Loader2, MessageSquare } from 'lucide-react';
import { useOrderChat } from './useOrderChat';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

export default function OrderChatBox({ order, isAdmin = false }) {
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const { data: currentUser } = useQuery({
    queryKey: ['current-user-chat'],
    queryFn: () => base44.auth.me()
  });

  const {
    messages,
    isLoading,
    unreadCount,
    sendMessage,
    isSending
  } = useOrderChat(order?.id, currentUser);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim() || isSending) return;

    sendMessage({
      message: message.trim(),
      orderNumber: order?.order_number || order?.id?.slice(-6),
      customerEmail: order?.customer_email
    });

    setMessage('');
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      sendMessage({
        message: `📎 Đã gửi file: ${file.name}`,
        attachment_url: file_url,
        orderNumber: order?.order_number || order?.id?.slice(-6),
        customerEmail: order?.customer_email
      });
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Lỗi upload file: ' + error.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const isMyMessage = (msg) => {
    return msg.sender_email === currentUser?.email;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-[#7CB342]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-[#7CB342]" />
          <h3 className="font-semibold">
            Chat đơn hàng #{order?.order_number || order?.id?.slice(-6)}
          </h3>
        </div>
        {unreadCount > 0 && (
          <span className="px-2 py-1 bg-red-500 text-white rounded-full text-xs">
            {unreadCount} mới
          </span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Chưa có tin nhắn. Hãy bắt đầu chat!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMine = isMyMessage(msg);
            return (
              <div
                key={msg.id}
                className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[70%] ${isMine ? 'order-2' : 'order-1'}`}>
                  {!isMine && (
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 bg-[#7CB342] rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {msg.sender_name?.charAt(0)?.toUpperCase()}
                      </div>
                      <span className="text-xs text-gray-600 font-medium">
                        {msg.sender_name}
                      </span>
                    </div>
                  )}
                  
                  <div
                    className={`rounded-2xl px-4 py-2 ${
                      isMine
                        ? 'bg-[#7CB342] text-white'
                        : 'bg-white border border-gray-200'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {msg.message}
                    </p>
                    {msg.attachment_url && (
                      <>
                        {msg.attachment_url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                          <img
                            src={msg.attachment_url}
                            alt="Attachment"
                            className="mt-2 max-w-full h-auto rounded-lg max-h-64 object-cover cursor-pointer"
                            onClick={() => window.open(msg.attachment_url, '_blank')}
                          />
                        ) : (
                          <a
                            href={msg.attachment_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`text-xs underline mt-2 block ${
                              isMine ? 'text-white' : 'text-blue-600'
                            }`}
                          >
                            📎 Xem file
                          </a>
                        )}
                      </>
                    )}
                  </div>
                  
                  <div className={`text-xs text-gray-400 mt-1 ${isMine ? 'text-right' : 'text-left'}`}>
                    {formatTime(msg.created_date)}
                    {msg.is_read && isMine && ' • Đã xem'}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t bg-white">
        <div className="flex gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            title="Đính kèm file"
          >
            {uploading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Paperclip className="w-5 h-5" />
            )}
          </button>

          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Nhập tin nhắn..."
            className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7CB342]"
          />

          <button
            type="submit"
            disabled={!message.trim() || isSending}
            className="px-4 py-2 bg-[#7CB342] text-white rounded-lg hover:bg-[#FF9800] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}