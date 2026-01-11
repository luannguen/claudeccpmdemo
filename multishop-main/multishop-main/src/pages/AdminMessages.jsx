import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import AdminLayout from '@/components/AdminLayout';
import AdminGuard from '@/components/AdminGuard';
import OrderChatWidget from '@/components/communication/OrderChatWidget';

// Hooks
import {
  useOrderMessages,
  useMessageSummaries,
  useFilteredMessages,
  useMessageStats,
  useMessagesState
} from '@/components/hooks/useAdminMessages';

// Components
import MessagesStats from '@/components/admin/messages/MessagesStats';
import MessagesFilters from '@/components/admin/messages/MessagesFilters';
import MessagesList from '@/components/admin/messages/MessagesList';

function AdminMessagesContent() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State
  const {
    filters,
    setSearchTerm,
    setStatusFilter,
    setPriorityFilter,
    setViewMode,
    selectedOrder,
    setSelectedOrder
  } = useMessagesState();

  // Data
  const { messages, orders, isLoading } = useOrderMessages();
  const { orderSummaries, userSummaries } = useMessageSummaries(messages, orders);
  const filteredSummaries = useFilteredMessages(orderSummaries, userSummaries, filters);
  const stats = useMessageStats(orderSummaries);

  // Auto-open chat if orderId is in URL params (from notification click)
  useEffect(() => {
    const orderId = searchParams.get('orderId');
    if (orderId && orders.length > 0 && !selectedOrder) {
      const order = orders.find(o => o.id === orderId);
      if (order) {
        setSelectedOrder(order);
        // Clear the URL param after opening
        setSearchParams({}, { replace: true });
      }
    }
  }, [searchParams, orders, selectedOrder, setSelectedOrder, setSearchParams]);

  // Handlers
  const handleOpenChat = (summary) => {
    if (summary.order) {
      setSelectedOrder(summary.order);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-serif font-bold text-[#0F0F0F] mb-2">Tin Nhắn Liên Hệ</h1>
        <p className="text-gray-600">Quản lý và trả lời tin nhắn từ khách hàng</p>
      </div>

      {/* Stats */}
      <MessagesStats stats={stats} />

      {/* Filters */}
      <MessagesFilters
        viewMode={filters.viewMode}
        setViewMode={setViewMode}
        searchTerm={filters.searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={filters.statusFilter}
        setStatusFilter={setStatusFilter}
        priorityFilter={filters.priorityFilter}
        setPriorityFilter={setPriorityFilter}
      />

      {/* Messages List */}
      <MessagesList
        summaries={filteredSummaries}
        viewMode={filters.viewMode}
        orders={orders}
        isLoading={isLoading}
        onOpenChat={handleOpenChat}
      />

      {/* Chat Widget */}
      <OrderChatWidget
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
}

export default function AdminMessages() {
  return (
    <AdminGuard>
      <AdminLayout>
        <AdminMessagesContent />
      </AdminLayout>
    </AdminGuard>
  );
}