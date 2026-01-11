/**
 * ConnectionChatTab - Chat với kết nối
 * Reuse pattern từ FeedbackThreadView, FeedbackReplyForm
 */

import React, { useState, useRef, useEffect } from "react";
import { Icon } from "@/components/ui/AnimatedIcon";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/NotificationToast";
import { NotificationServiceFacade } from "@/components/features/notification";
import { QuickReplyPicker } from "@/components/features/ecard";

export default function ConnectionChatTab({ connection, currentUser }) {
  const [message, setMessage] = useState('');
  const [images, setImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  // Handle quick reply selection
  const handleQuickReply = (content) => {
    // Replace placeholder with connection name
    const processedContent = content.replace(/\{name\}/g, connection.target_name || 'bạn');
    setMessage(processedContent);
    setShowQuickReplies(false);
  };

  // Generate a consistent chat room ID from 2 user IDs (sorted)
  const getChatRoomId = (userId1, userId2) => {
    return [userId1, userId2].sort().join('_');
  };

  const chatRoomId = currentUser?.id && connection?.target_user_id 
    ? getChatRoomId(currentUser.id, connection.target_user_id) 
    : null;

  // Get messages for this chat room (between 2 users)
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['connection-messages', chatRoomId],
    queryFn: async () => {
      if (!chatRoomId || !currentUser?.id || !connection?.target_user_id) return [];
      
      // Get all messages between these 2 users
      const sentMessages = await base44.entities.ConnectionMessage.filter({
        sender_user_id: currentUser.id,
        receiver_user_id: connection.target_user_id
      }, '-created_date', 100);
      
      const receivedMessages = await base44.entities.ConnectionMessage.filter({
        sender_user_id: connection.target_user_id,
        receiver_user_id: currentUser.id
      }, '-created_date', 100);
      
      // Merge and sort by created_date
      const allMessages = [...sentMessages, ...receivedMessages]
        .sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
      
      return allMessages;
    },
    enabled: !!chatRoomId,
    refetchInterval: 5000 // Poll every 5s for new messages
  });

  // Mark messages as read when viewing
  useEffect(() => {
    if (messages.length > 0 && currentUser?.id) {
      const unreadMessages = messages.filter(
        m => m.receiver_user_id === currentUser.id && !m.is_read
      );
      unreadMessages.forEach(async (msg) => {
        await base44.entities.ConnectionMessage.update(msg.id, {
          is_read: true,
          read_at: new Date().toISOString()
        });
      });
    }
  }, [messages, currentUser?.id]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message mutation
  const sendMutation = useMutation({
    mutationFn: async ({ content, images: imageUrls }) => {
      // Get current user's profile for avatar
      const profiles = await base44.entities.EcardProfile.filter({
        user_id: currentUser.id
      });
      const myProfile = profiles[0];

      const newMessage = await base44.entities.ConnectionMessage.create({
        connection_id: chatRoomId, // Use chat room ID
        sender_user_id: currentUser.id,
        sender_name: myProfile?.display_name || currentUser.full_name,
        sender_avatar: myProfile?.profile_image_url || null,
        receiver_user_id: connection.target_user_id,
        content,
        images: imageUrls
      });

      // Send notification to receiver - get email if not cached
      const senderName = myProfile?.display_name || currentUser.full_name || 'Một người';
      const previewContent = content 
        ? (content.length > 50 ? content.substring(0, 50) + '...' : content)
        : '📷 Đã gửi hình ảnh';
      
      // Get receiver email from connection or fetch from User
      let receiverEmail = connection.target_email;
      if (!receiverEmail) {
        const targetUsers = await base44.entities.User.filter({ id: connection.target_user_id });
        receiverEmail = targetUsers[0]?.email;
      }
      
      if (receiverEmail) {
        try {
          await NotificationServiceFacade.notifyNewMessage({
            recipientEmail: receiverEmail,
            senderName,
            senderEmail: currentUser.email,
            connectionId: connection.id,
            senderUserId: currentUser.id,
            messagePreview: previewContent
          });
          console.log('✅ Chat notification sent to:', receiverEmail);
        } catch (err) {
          console.error('❌ Failed to send chat notification:', err);
        }
      }

      return newMessage;
    },
    onSuccess: () => {
      setMessage('');
      setImages([]);
      queryClient.invalidateQueries({ queryKey: ['connection-messages', chatRoomId] });
    },
    onError: () => {
      addToast('Không thể gửi tin nhắn', 'error');
    }
  });

  // Handle image upload
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      const uploadedUrls = [];
      for (const file of files) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        uploadedUrls.push(file_url);
      }
      setImages(prev => [...prev, ...uploadedUrls]);
    } catch (error) {
      addToast('Không thể tải ảnh lên', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSend = () => {
    if (!message.trim() && images.length === 0) return;
    sendMutation.mutate({ content: message.trim(), images });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!connection) return null;

  return (
    <div className="flex flex-col h-[400px]">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 rounded-t-xl">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Icon.Spinner size={32} />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Icon.MessageCircle size={48} className="mx-auto mb-3 text-gray-300" />
            <p>Chưa có tin nhắn</p>
            <p className="text-sm">Bắt đầu cuộc trò chuyện với {connection.target_name}</p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isOwn={msg.sender_user_id === currentUser?.id}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Image Preview */}
      {images.length > 0 && (
        <div className="px-4 py-2 border-t bg-white flex gap-2 flex-wrap">
          {images.map((url, idx) => (
            <div key={idx} className="relative">
              <img 
                src={url} 
                alt="" 
                className="w-16 h-16 object-cover rounded-lg border"
              />
              <button
                onClick={() => setImages(prev => prev.filter((_, i) => i !== idx))}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"
              >
                <Icon.X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Quick Replies Panel */}
      {showQuickReplies && (
        <div className="border-t bg-white p-2">
          <QuickReplyPicker 
            onSelect={handleQuickReply}
            onClose={() => setShowQuickReplies(false)}
          />
        </div>
      )}

      {/* Input Area */}
      <div className="p-3 border-t bg-white rounded-b-xl">
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="shrink-0"
            title="Đính kèm ảnh"
          >
            {isUploading ? <Icon.Spinner size={20} /> : <Icon.Image size={20} />}
          </Button>
          
          {/* Quick Reply Button */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setShowQuickReplies(!showQuickReplies)}
            className={`shrink-0 ${showQuickReplies ? 'bg-[#7CB342]/10 text-[#7CB342]' : ''}`}
            title="Tin nhắn mẫu"
          >
            <Icon.Zap size={20} />
          </Button>
          
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Nhắn tin cho ${connection.target_name}...`}
            className="min-h-[40px] max-h-[100px] resize-none"
            rows={1}
          />
          
          <Button
            onClick={handleSend}
            disabled={(!message.trim() && images.length === 0) || sendMutation.isPending}
            className="shrink-0 bg-[#7CB342] hover:bg-[#689F38]"
          >
            {sendMutation.isPending ? (
              <Icon.Spinner size={20} />
            ) : (
              <Icon.Send size={20} />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Message Bubble Component
function MessageBubble({ message, isOwn }) {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex gap-2 max-w-[80%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        {!isOwn && (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7CB342] to-[#558B2F] flex items-center justify-center text-white text-sm font-bold shrink-0 overflow-hidden">
            {message.sender_avatar ? (
              <img src={message.sender_avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              message.sender_name?.charAt(0)?.toUpperCase() || 'U'
            )}
          </div>
        )}

        {/* Message Content */}
        <div className={`rounded-2xl px-4 py-2 ${
          isOwn 
            ? 'bg-[#7CB342] text-white rounded-tr-sm' 
            : 'bg-white border border-gray-200 rounded-tl-sm'
        }`}>
          {/* Images */}
          {message.images?.length > 0 && (
            <div className="flex gap-1 flex-wrap mb-2">
              {message.images.map((url, idx) => (
                <img
                  key={idx}
                  src={url}
                  alt=""
                  className="max-w-[150px] max-h-[150px] object-cover rounded-lg cursor-pointer"
                  onClick={() => window.open(url, '_blank')}
                />
              ))}
            </div>
          )}
          
          {/* Text */}
          {message.content && (
            <p className={`text-sm whitespace-pre-wrap ${isOwn ? '' : 'text-gray-800'}`}>
              {message.content}
            </p>
          )}
          
          {/* Time */}
          <p className={`text-xs mt-1 ${isOwn ? 'text-white/70' : 'text-gray-400'}`}>
            {new Date(message.created_date).toLocaleTimeString('vi-VN', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
            {isOwn && message.is_read && (
              <span className="ml-1">✓✓</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}