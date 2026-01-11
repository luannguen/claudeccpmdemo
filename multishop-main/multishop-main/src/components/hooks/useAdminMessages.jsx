import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { showAdminAlert } from '@/components/AdminAlert';

/**
 * Hook để fetch order messages
 */
export function useOrderMessages() {
  const { data: messages = [], isLoading: loadingMessages } = useQuery({
    queryKey: ['admin-order-messages'],
    queryFn: () => base44.entities.OrderMessage.list('-created_date', 500),
    refetchInterval: 3000,
    staleTime: 0
  });

  const { data: orders = [], isLoading: loadingOrders } = useQuery({
    queryKey: ['admin-orders-for-messages'],
    queryFn: () => base44.entities.Order.list('-created_date', 500)
  });

  return {
    messages,
    orders,
    isLoading: loadingMessages || loadingOrders
  };
}

/**
 * Hook để group và filter messages
 */
export function useMessageSummaries(messages = [], orders = []) {
  // Group messages by order
  const messagesByOrder = useMemo(() => {
    const grouped = {};
    messages.forEach(msg => {
      if (!grouped[msg.order_id]) {
        grouped[msg.order_id] = [];
      }
      grouped[msg.order_id].push(msg);
    });
    return grouped;
  }, [messages]);

  // Create order summaries
  const orderSummaries = useMemo(() => {
    return Object.entries(messagesByOrder).map(([orderId, msgs]) => {
      const order = orders.find(o => o.id === orderId);
      const latestMsg = msgs[msgs.length - 1];
      const unreadCount = msgs.filter(m => !m.is_read && m.sender_role !== 'admin').length;
      
      return {
        orderId,
        order,
        messages: msgs,
        latestMessage: latestMsg,
        unreadCount,
        totalMessages: msgs.length
      };
    }).sort((a, b) => {
      return new Date(b.latestMessage.created_date) - new Date(a.latestMessage.created_date);
    });
  }, [messagesByOrder, orders]);

  // Group by user
  const userSummaries = useMemo(() => {
    const grouped = {};
    messages.forEach(msg => {
      const email = msg.sender_email;
      if (!grouped[email]) {
        grouped[email] = [];
      }
      grouped[email].push(msg);
    });

    return Object.entries(grouped).map(([email, msgs]) => {
      const latestMsg = msgs[msgs.length - 1];
      const unreadCount = msgs.filter(m => !m.is_read && m.sender_role !== 'admin').length;
      const uniqueOrders = [...new Set(msgs.map(m => m.order_id))];

      return {
        email,
        name: latestMsg.sender_name,
        messages: msgs,
        latestMessage: latestMsg,
        unreadCount,
        totalMessages: msgs.length,
        orderCount: uniqueOrders.length
      };
    }).sort((a, b) => new Date(b.latestMessage.created_date) - new Date(a.latestMessage.created_date));
  }, [messages]);

  return { orderSummaries, userSummaries };
}

/**
 * Hook để filter messages
 */
export function useFilteredMessages(orderSummaries, userSummaries, filters) {
  const { viewMode, searchTerm, statusFilter, priorityFilter } = filters;
  
  return useMemo(() => {
    const summaries = viewMode === 'by-order' ? orderSummaries : userSummaries;
    
    return summaries.filter(summary => {
      const matchesSearch = 
        summary.order?.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        summary.order?.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        summary.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        summary.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        summary.latestMessage?.message?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = 
        statusFilter === 'all' ||
        (statusFilter === 'unread' && summary.unreadCount > 0) ||
        (statusFilter === 'answered' && summary.unreadCount === 0);

      const matchesPriority = 
        priorityFilter === 'all' ||
        (priorityFilter === 'urgent' && summary.unreadCount > 5);

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [orderSummaries, userSummaries, viewMode, searchTerm, statusFilter, priorityFilter]);
}

/**
 * Hook tính stats cho messages
 */
export function useMessageStats(orderSummaries) {
  return useMemo(() => ({
    total: orderSummaries.length,
    unread: orderSummaries.filter(s => s.unreadCount > 0).length,
    read: orderSummaries.filter(s => s.unreadCount === 0).length,
    urgent: orderSummaries.filter(s => s.unreadCount > 5).length
  }), [orderSummaries]);
}

/**
 * Hook để delete message
 */
export function useDeleteMessage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (messageId) => {
      await base44.entities.OrderMessage.delete(messageId);
    },
    onSuccess: () => {
      showAdminAlert('✅ Đã xóa tin nhắn', 'success');
      queryClient.invalidateQueries({ queryKey: ['admin-order-messages'] });
    }
  });
}

/**
 * Hook quản lý state cho AdminMessages
 */
export function useMessagesState() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [viewMode, setViewMode] = useState('by-order');

  return {
    filters: { searchTerm, statusFilter, priorityFilter, viewMode },
    setSearchTerm,
    setStatusFilter,
    setPriorityFilter,
    setViewMode,
    selectedOrder,
    setSelectedOrder
  };
}

export default useOrderMessages;