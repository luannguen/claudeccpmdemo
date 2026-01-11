import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

/**
 * Hook fetch newsletter subscribers
 */
export function useNewsletterSubscribers() {
  return useQuery({
    queryKey: ['newsletter-subscribers'],
    queryFn: async () => {
      const result = await base44.entities.NewsletterSubscriber.list('-created_date', 500);
      return result || [];
    },
    staleTime: 2 * 60 * 1000
  });
}

/**
 * Hook tính stats cho newsletter
 */
export function useNewsletterStats(subscribers = []) {
  return useMemo(() => ({
    total: subscribers.length,
    active: subscribers.filter(s => s.status === 'active').length,
    unsubscribed: subscribers.filter(s => s.status === 'unsubscribed').length,
    totalSent: subscribers.reduce((sum, s) => sum + (s.emails_sent || 0), 0),
    totalOpened: subscribers.reduce((sum, s) => sum + (s.emails_opened || 0), 0),
    avgOpenRate: subscribers.length > 0 
      ? Math.round((subscribers.reduce((sum, s) => sum + (s.emails_opened || 0), 0) / 
          Math.max(subscribers.reduce((sum, s) => sum + (s.emails_sent || 0), 0), 1)) * 100)
      : 0
  }), [subscribers]);
}

/**
 * Hook filter subscribers
 */
export function useFilteredSubscribers(subscribers, filters) {
  const { searchTerm, statusFilter } = filters;

  return useMemo(() => {
    return subscribers.filter(sub => {
      const matchesSearch = 
        sub.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || sub.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [subscribers, searchTerm, statusFilter]);
}

/**
 * Hook mutations cho newsletter
 */
export function useNewsletterMutations() {
  const queryClient = useQueryClient();

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.NewsletterSubscriber.update(id, { 
      status,
      unsubscribed_date: status === 'unsubscribed' ? new Date().toISOString() : undefined
    }),
    onSuccess: () => queryClient.invalidateQueries(['newsletter-subscribers'])
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.NewsletterSubscriber.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['newsletter-subscribers'])
  });

  return { updateStatusMutation, deleteMutation };
}

/**
 * Hook quản lý state filters
 */
export function useNewsletterState() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCampaignModal, setShowCampaignModal] = useState(false);

  return {
    filters: { searchTerm, statusFilter },
    setSearchTerm,
    setStatusFilter,
    showCampaignModal,
    setShowCampaignModal
  };
}

/**
 * Export subscribers to CSV
 */
export function exportSubscribersToCSV(subscribers) {
  const csv = [
    ['Email', 'Họ tên', 'Trạng thái', 'Ngày đăng ký', 'Email đã gửi', 'Email đã mở'].join(','),
    ...subscribers.map(s => [
      s.email,
      s.full_name || '',
      s.status,
      new Date(s.created_date).toLocaleDateString('vi-VN'),
      s.emails_sent || 0,
      s.emails_opened || 0
    ].join(','))
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `newsletter_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
}

export default useNewsletterSubscribers;