/**
 * useConnectionChat Hook (Enhanced)
 * Feature Layer - Orchestrates chat functionality
 * 
 * @module features/ecard/hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/components/AuthProvider';
import { chatRepository } from '../data/chatRepository';

const STALE_TIME = 30 * 1000; // 30 seconds for chat

/**
 * Hook for connection chat
 */
export function useConnectionChat(connectionId) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Get messages
  const { 
    data: messages = [], 
    isLoading,
    refetch: refreshMessages 
  } = useQuery({
    queryKey: ['chat-messages', connectionId],
    queryFn: () => chatRepository.getMessages(connectionId),
    enabled: !!connectionId,
    staleTime: STALE_TIME,
    refetchInterval: 30000 // Auto refresh every 30s
  });
  
  // Get pinned messages
  const { data: pinnedMessages = [] } = useQuery({
    queryKey: ['chat-pinned', connectionId],
    queryFn: () => chatRepository.getPinnedMessages(connectionId),
    enabled: !!connectionId,
    staleTime: STALE_TIME
  });
  
  // Send message mutation
  const sendMutation = useMutation({
    mutationFn: (data) => chatRepository.sendMessage({
      connection_id: connectionId,
      sender_user_id: user?.id,
      sender_name: user?.full_name,
      sender_avatar: user?.avatar_url,
      ...data
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages', connectionId] });
    }
  });
  
  // Schedule message mutation
  const scheduleMutation = useMutation({
    mutationFn: ({ content, attachments, scheduledAt }) => 
      chatRepository.scheduleMessage({
        connection_id: connectionId,
        sender_user_id: user?.id,
        sender_name: user?.full_name,
        sender_avatar: user?.avatar_url,
        content,
        attachments
      }, scheduledAt),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages', connectionId] });
    }
  });
  
  // Pin message mutation
  const pinMutation = useMutation({
    mutationFn: (messageId) => chatRepository.pinMessage(messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-pinned', connectionId] });
      queryClient.invalidateQueries({ queryKey: ['chat-messages', connectionId] });
    }
  });
  
  // Unpin mutation
  const unpinMutation = useMutation({
    mutationFn: (messageId) => chatRepository.unpinMessage(messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-pinned', connectionId] });
      queryClient.invalidateQueries({ queryKey: ['chat-messages', connectionId] });
    }
  });
  
  // Mark as read mutation
  const markReadMutation = useMutation({
    mutationFn: () => chatRepository.markAllAsRead(connectionId, user?.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages', connectionId] });
    }
  });
  
  // Search messages
  const searchMessages = async (query) => {
    if (!query || query.length < 2) return [];
    return chatRepository.searchMessages(connectionId, query);
  };
  
  // Unread count
  const unreadCount = messages.filter(
    m => m.receiver_user_id === user?.id && !m.is_read
  ).length;
  
  return {
    messages,
    pinnedMessages,
    isLoading,
    unreadCount,
    sendMessage: (content, attachments = []) => 
      sendMutation.mutateAsync({ content, attachments }),
    scheduleMessage: scheduleMutation.mutateAsync,
    pinMessage: pinMutation.mutateAsync,
    unpinMessage: unpinMutation.mutateAsync,
    markAllAsRead: markReadMutation.mutateAsync,
    searchMessages,
    refreshMessages,
    isSending: sendMutation.isPending
  };
}

export default useConnectionChat;