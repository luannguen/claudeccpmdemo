/**
 * PreOrderMessageThread - Chat thread cho đơn hàng preorder
 * Module 6: Customer Communication Hub
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, Send, Image, X, Clock, 
  CheckCircle2, User, Store, Bot, Paperclip
} from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

const MESSAGE_TYPES = {
  customer: { icon: User, color: 'bg-blue-500', align: 'right' },
  seller: { icon: Store, color: 'bg-green-500', align: 'left' },
  system: { icon: Bot, color: 'bg-gray-400', align: 'center' }
};

function MessageBubble({ message }) {
  const config = MESSAGE_TYPES[message.sender_type] || MESSAGE_TYPES.customer;
  const isCustomer = message.sender_type === 'customer';
  const isSystem = message.sender_type === 'system';

  if (isSystem) {
    return (
      <div className="flex justify-center my-4">
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-600">
          <Bot className="w-4 h-4" />
          <span>{message.content}</span>
          <span className="text-xs text-gray-400">
            {format(new Date(message.created_at), 'HH:mm', { locale: vi })}
          </span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isCustomer ? 'flex-row-reverse' : ''}`}
    >
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${config.color}`}>
        {message.sender_avatar ? (
          <img src={message.sender_avatar} alt="" className="w-full h-full rounded-full object-cover" />
        ) : (
          <config.icon className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Content */}
      <div className={`max-w-[70%] ${isCustomer ? 'items-end' : 'items-start'} flex flex-col`}>
        <div className={`rounded-2xl px-4 py-2 ${
          isCustomer 
            ? 'bg-[#7CB342] text-white rounded-tr-sm' 
            : 'bg-white border border-gray-200 rounded-tl-sm'
        }`}>
          {/* Sender name for seller */}
          {!isCustomer && message.sender_name && (
            <p className="text-xs text-gray-500 mb-1">{message.sender_name}</p>
          )}
          
          <p className={`text-sm ${isCustomer ? 'text-white' : 'text-gray-800'}`}>
            {message.content}
          </p>

          {/* Attachments */}
          {message.attachments?.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {message.attachments.map((att, i) => (
                <a 
                  key={i}
                  href={att.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-1 text-xs ${
                    isCustomer ? 'text-white/80' : 'text-blue-500'
                  } underline`}
                >
                  <Paperclip className="w-3 h-3" />
                  {att.name}
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Timestamp & status */}
        <div className={`flex items-center gap-1 mt-1 text-xs text-gray-400 ${isCustomer ? 'flex-row-reverse' : ''}`}>
          <span>{format(new Date(message.created_at), 'HH:mm', { locale: vi })}</span>
          {isCustomer && message.read && (
            <CheckCircle2 className="w-3 h-3 text-blue-400" />
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function PreOrderMessageThread({
  orderId,
  messages = [],
  onSendMessage,
  isLoading,
  currentUserType = 'customer', // customer | seller
  className = ''
}) {
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const [attachments, setAttachments] = useState([]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() && attachments.length === 0) return;

    setIsSending(true);
    try {
      await onSendMessage?.({
        content: newMessage.trim(),
        attachments,
        sender_type: currentUserType
      });
      setNewMessage('');
      setAttachments([]);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`bg-white border-2 border-gray-100 rounded-2xl overflow-hidden flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-4 border-b bg-gray-50 flex items-center gap-3">
        <div className="w-10 h-10 bg-[#7CB342]/10 rounded-xl flex items-center justify-center">
          <MessageCircle className="w-5 h-5 text-[#7CB342]" />
        </div>
        <div>
          <h3 className="font-bold text-gray-800">Tin nhắn đơn hàng</h3>
          <p className="text-xs text-gray-500">Trao đổi về đơn đặt trước #{orderId?.slice(-6)}</p>
        </div>
      </div>

      {/* Messages list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[500px] bg-gray-50">
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <Clock className="w-5 h-5 animate-spin mr-2" />
            Đang tải tin nhắn...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
            <MessageCircle className="w-12 h-12 mb-2 opacity-50" />
            <p>Chưa có tin nhắn nào</p>
            <p className="text-xs">Gửi tin nhắn để trao đổi về đơn hàng</p>
          </div>
        ) : (
          <>
            {messages.map((msg, index) => (
              <MessageBubble key={msg.id || index} message={msg} />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input area */}
      <div className="p-4 border-t bg-white">
        {/* Attachments preview */}
        {attachments.length > 0 && (
          <div className="flex gap-2 mb-2 flex-wrap">
            {attachments.map((att, i) => (
              <div key={i} className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-lg text-xs">
                <Paperclip className="w-3 h-3" />
                <span className="max-w-[100px] truncate">{att.name}</span>
                <button onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))}>
                  <X className="w-3 h-3 text-gray-400 hover:text-red-500" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          {/* Attachment button */}
          <label className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors">
            <Image className="w-5 h-5 text-gray-400" />
            <input 
              type="file" 
              className="hidden" 
              multiple
              accept="image/*"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                setAttachments(prev => [...prev, ...files.map(f => ({ name: f.name, file: f }))]);
              }}
            />
          </label>

          {/* Message input */}
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Nhập tin nhắn..."
            className="flex-1 min-h-[44px] max-h-[120px] resize-none"
            rows={1}
          />

          {/* Send button */}
          <Button
            onClick={handleSend}
            disabled={isSending || (!newMessage.trim() && attachments.length === 0)}
            className="bg-[#7CB342] hover:bg-[#558B2F] px-4"
          >
            {isSending ? (
              <Clock className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}