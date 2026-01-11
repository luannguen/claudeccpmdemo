import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useState, useEffect, useCallback } from 'react';

export function useOrderChat(orderId, currentUser) {
  const queryClient = useQueryClient();
  const [isTyping, setIsTyping] = useState(false);

  // Fetch messages with 2-second polling for real-time feel
  const { data: messages = [], isLoading, error } = useQuery({
    queryKey: ['order-messages', orderId],
    queryFn: async () => {
      if (!orderId) return [];
      const msgs = await base44.entities.OrderMessage.filter(
        { order_id: orderId },
        'created_date',
        500
      );
      return msgs;
    },
    enabled: !!orderId,
    refetchInterval: 2000, // Poll every 2 seconds for real-time updates
    staleTime: 0
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData) => {
      const newMessage = await base44.entities.OrderMessage.create({
        order_id: orderId,
        sender_email: currentUser?.email,
        sender_name: currentUser?.full_name || currentUser?.name || 'User',
        sender_role: currentUser?.role || 'user',
        message: messageData.message,
        attachment_url: messageData.attachment_url || null,
        is_read: false
      });

      // Create notification for recipient
      if (currentUser?.role === 'user') {
        // Notify admins
        await base44.entities.AdminNotification.create({
          recipient_email: null, // Broadcast to all admins
          type: 'customer_inquiry',
          title: `💬 Tin nhắn mới từ ${currentUser.full_name}`,
          message: `Đơn hàng: ${messageData.orderNumber} - ${messageData.message.substring(0, 50)}...`,
          link: `/admin/orders`,
          priority: 'normal',
          related_entity_type: 'Order',
          related_entity_id: orderId,
          metadata: {
            order_id: orderId,
            message_id: newMessage.id
          }
        });
      } else {
        // Notify customer
        await base44.entities.Notification.create({
          recipient_email: messageData.customerEmail,
          type: 'order_chat',
          title: '💬 Phản hồi từ Farmer Smart',
          message: `Đơn hàng ${messageData.orderNumber}: ${messageData.message.substring(0, 50)}...`,
          link: `/my-orders`,
          priority: 'normal',
          metadata: {
            order_id: orderId,
            message_id: newMessage.id
          }
        });
      }

      return newMessage;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order-messages', orderId] });
    }
  });

  // Mark messages as read
  const markAsRead = useCallback(async () => {
    if (!currentUser?.email || !messages.length) return;

    const unreadMessages = messages.filter(
      msg => !msg.is_read && msg.sender_email !== currentUser.email
    );

    for (const msg of unreadMessages) {
      try {
        await base44.entities.OrderMessage.update(msg.id, {
          is_read: true,
          read_date: new Date().toISOString()
        });
      } catch (err) {
        console.error('Failed to mark message as read:', err);
      }
    }

    if (unreadMessages.length > 0) {
      queryClient.invalidateQueries({ queryKey: ['order-messages', orderId] });
    }
  }, [messages, currentUser, orderId, queryClient]);

  // Auto mark as read when messages change
  useEffect(() => {
    if (messages.length > 0) {
      markAsRead();
    }
  }, [messages.length]);

  const unreadCount = messages.filter(
    msg => !msg.is_read && msg.sender_email !== currentUser?.email
  ).length;

  return {
    messages,
    isLoading,
    error,
    unreadCount,
    sendMessage: sendMessageMutation.mutate,
    isSending: sendMessageMutation.isPending,
    markAsRead
  };
}