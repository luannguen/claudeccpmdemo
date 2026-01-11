import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

// ✅ Filter Options - exportable config
export const CHANNEL_OPTIONS = [
  { value: 'all', label: 'Tất cả kênh' },
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS' },
  { value: 'push', label: 'Push' },
  { value: 'in_app', label: 'In-App' },
  { value: 'order_chat', label: 'Order Chat' }
];

export const TYPE_OPTIONS = [
  { value: 'all', label: 'Tất cả loại' },
  { value: 'order_confirmation', label: 'Xác nhận đơn' },
  { value: 'shipping_notification', label: 'Thông báo giao' },
  { value: 'delivery_confirmation', label: 'Xác nhận giao' },
  { value: 'review_request', label: 'Yêu cầu review' },
  { value: 'cart_recovery', label: 'Khôi phục giỏ' },
  { value: 'promotional', label: 'Khuyến mãi' },
  { value: 'support_message', label: 'Hỗ trợ' }
];

export const STATUS_OPTIONS = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'sent', label: 'Đã gửi' },
  { value: 'delivered', label: 'Đã nhận' },
  { value: 'opened', label: 'Đã mở' },
  { value: 'clicked', label: 'Đã click' },
  { value: 'failed', label: 'Thất bại' }
];

/**
 * Hook fetch communication logs
 */
export function useCommunicationLogs() {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['admin-communication-logs'],
    queryFn: () => base44.entities.CommunicationLog.list('-created_date', 500),
    refetchInterval: 5000,
    staleTime: 0
  });

  return { logs, isLoading };
}

/**
 * Hook tính stats cho communication logs
 */
export function useCommunicationStats(logs = []) {
  return useMemo(() => ({
    total: logs.length,
    email: logs.filter(l => l.channel === 'email').length,
    sms: logs.filter(l => l.channel === 'sms').length,
    delivered: logs.filter(l => l.status === 'delivered' || l.status === 'opened').length,
    uniqueCustomers: new Set(logs.map(l => l.customer_email)).size
  }), [logs]);
}

/**
 * Hook filter logs
 */
export function useFilteredLogs(logs, filters) {
  const { searchTerm, channelFilter, typeFilter, statusFilter } = filters;

  return useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = !searchTerm || 
        log.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.order_number?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesChannel = channelFilter === 'all' || log.channel === channelFilter;
      const matchesType = typeFilter === 'all' || log.type === typeFilter;
      const matchesStatus = statusFilter === 'all' || log.status === statusFilter;

      return matchesSearch && matchesChannel && matchesType && matchesStatus;
    });
  }, [logs, searchTerm, channelFilter, typeFilter, statusFilter]);
}

/**
 * Hook quản lý state filters
 */
export function useCommunicationsState() {
  const [searchTerm, setSearchTerm] = useState('');
  const [channelFilter, setChannelFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const resetFilters = () => {
    setSearchTerm('');
    setChannelFilter('all');
    setTypeFilter('all');
    setStatusFilter('all');
  };

  const hasFilters = searchTerm || channelFilter !== 'all' || typeFilter !== 'all' || statusFilter !== 'all';

  return {
    filters: { searchTerm, channelFilter, typeFilter, statusFilter },
    setSearchTerm,
    setChannelFilter,
    setTypeFilter,
    setStatusFilter,
    resetFilters,
    hasFilters
  };
}

export default useCommunicationLogs;