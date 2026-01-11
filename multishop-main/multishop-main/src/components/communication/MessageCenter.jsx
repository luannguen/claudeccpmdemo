/**
 * 💬 Message Center - In-app messaging between customer-shop-admin
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, Send, X, Paperclip, Image as ImageIcon, 
  Clock, Check, CheckCheck, User, Store, Shield
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import EnhancedModal from '../EnhancedModal';

export default function MessageCenter({ isOpen, onClose, orderId, currentUser }) {
  const [message, setMessage] = useState('');
  const [attachment, setAttachment] = useState(null);
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  // Real-time messages
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['order-messages', orderId],
    queryFn: async () => {
      if (!orderId) return [];
      const allMessages = await base44.entities.OrderMessage.list('-created_date', 500);
      return allMessages.filter(m => m.order_id === orderId).reverse();
    },
    enabled: !!orderId && isOpen,
    refetchInterval: 2000, // Real-time polling
    staleTime: 0
  });

  // Send message mutation
  const sendMutation = useMutation({
    mutationFn: async (messageData) => {
      return await base44.entities.OrderMessage.create(messageData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order-messages', orderId] });
      setMessage('');
      setAttachment(null);
    }
  });

  const handleSend = () => {
    if (!message.trim() && !attachment) return;

    sendMutation.mutate({
      order_id: orderId,
      sender_email: currentUser.email,
      sender_name: currentUser.full_name,
      sender_role: currentUser.role,
      message: message.trim(),
      attachment_url: attachment,
      is_read: false
    });
  };

  const handleAttachment = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setAttachment(file_url);
    } catch (error) {
      console.error('Failed to upload attachment:', error);
    }
  };

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getRoleIcon = (role) => {
    if (role === 'admin' || role === 'super_admin') return Shield;
    if (role === 'owner') return Store;
    return User;
  };

  const getRoleColor = (role) => {
    if (role === 'admin' || role === 'super_admin') return 'text-purple-600';
    if (role === 'owner') return 'text-orange-600';
    return 'text-blue-600';
  };

  return (
    <EnhancedModal
      isOpen={isOpen}
      onClose={onClose}
      title="Tin nhắn đơn hàng"
      icon={MessageSquare}
      maxWidth="2xl"
    >
      <div className="flex flex-col h-[600px]">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-[#7CB342] border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Chưa có tin nhắn nào</p>
              <p className="text-sm text-gray-400 mt-2">Gửi tin nhắn đầu tiên để bắt đầu!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isOwnMessage = msg.sender_email === currentUser.email;
              const RoleIcon = getRoleIcon(msg.sender_role);

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      {!isOwnMessage && (
                        <>
                          <RoleIcon className={`w-4 h-4 ${getRoleColor(msg.sender_role)}`} />
                          <span className="text-xs font-medium text-gray-700">{msg.sender_name}</span>
                        </>
                      )}
                      {isOwnMessage && (
                        <span className="text-xs text-gray-500 ml-auto">Bạn</span>
                      )}
                    </div>

                    <div className={`rounded-2xl p-3 ${
                      isOwnMessage 
                        ? 'bg-[#7CB342] text-white' 
                        : 'bg-white border border-gray-200'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                      
                      {msg.attachment_url && (
                        <div className="mt-2">
                          <img 
                            src={msg.attachment_url} 
                            alt="Attachment" 
                            className="rounded-lg max-w-full"
                          />
                        </div>
                      )}

                      <div className="flex items-center justify-end gap-1 mt-1">
                        <span className="text-xs opacity-70">
                          {new Date(msg.created_date).toLocaleTimeString('vi-VN', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                        {isOwnMessage && (
                          msg.is_read ? 
                            <CheckCheck className="w-3 h-3" /> : 
                            <Check className="w-3 h-3" />
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t">
          {attachment && (
            <div className="mb-2 flex items-center gap-2 bg-gray-100 p-2 rounded-lg">
              <ImageIcon className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-700 flex-1 truncate">File đính kèm</span>
              <button
                onClick={() => setAttachment(null)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex items-end gap-2">
            <label className="cursor-pointer p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Paperclip className="w-5 h-5 text-gray-600" />
              <input
                type="file"
                accept="image/*"
                onChange={handleAttachment}
                className="hidden"
              />
            </label>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Nhập tin nhắn..."
              rows={2}
              className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342] resize-none"
            />

            <button
              onClick={handleSend}
              disabled={!message.trim() && !attachment}
              className="px-4 py-2 bg-[#7CB342] text-white rounded-xl hover:bg-[#5a8f31] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-2">
            Nhấn Enter để gửi, Shift+Enter để xuống dòng
          </p>
        </div>
      </div>
    </EnhancedModal>
  );
}