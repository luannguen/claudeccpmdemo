/**
 * 🔄 Real-time Returns Hook - Low-latency, optimized polling
 * 
 * ✅ Features:
 * - Real-time sync for both customer & admin
 * - Optimistic updates
 * - Aggressive cache invalidation
 * - Low polling interval for instant updates
 * - Auto-refetch on focus
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export function useRealTimeReturns(userEmail, options = {}) {
  const {
    enabled = true,
    isAdmin = false,
    refetchInterval = 2000, // 2s for real-time feel
    maxReturns = 100
  } = options;

  const queryClient = useQueryClient();

  // Fetch returns
  const { data: returns = [], isLoading, error, refetch } = useQuery({
    queryKey: isAdmin ? ['admin-returns-realtime'] : ['customer-returns-realtime', userEmail],
    queryFn: async () => {
      console.log('🔄 Fetching returns...', { isAdmin, userEmail });
      const allReturns = await base44.entities.ReturnRequest.list('-created_date', maxReturns);
      console.log('✅ Total returns fetched:', allReturns.length);
      
      if (isAdmin) {
        console.log('👨‍💼 Admin view - showing all returns');
        return allReturns;
      } else {
        const customerReturns = allReturns.filter(r => r.customer_email === userEmail);
        console.log('👤 Customer view - filtered returns:', customerReturns.length, 'for', userEmail);
        return customerReturns;
      }
    },
    enabled: enabled && !!userEmail,
    refetchInterval,
    refetchOnWindowFocus: true,
    staleTime: 0, // Always fresh
    cacheTime: 1000 * 60 * 5, // 5 min cache
  });

  // Update return status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ returnId, status, notes }) => {
      return await base44.entities.ReturnRequest.update(returnId, {
        status,
        admin_notes: notes,
        timeline: [
          ...(returns.find(r => r.id === returnId)?.timeline || []),
          {
            status,
            timestamp: new Date().toISOString(),
            actor: userEmail,
            note: notes || `Cập nhật trạng thái: ${status}`
          }
        ]
      });
    },
    onMutate: async ({ returnId, status }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['admin-returns-realtime'] });
      await queryClient.cancelQueries({ queryKey: ['customer-returns-realtime'] });
      
      const previousReturns = queryClient.getQueryData(
        isAdmin ? ['admin-returns-realtime'] : ['customer-returns-realtime', userEmail]
      );
      
      queryClient.setQueryData(
        isAdmin ? ['admin-returns-realtime'] : ['customer-returns-realtime', userEmail],
        (old = []) => old.map(r => r.id === returnId ? { ...r, status } : r)
      );
      
      return { previousReturns };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      queryClient.setQueryData(
        isAdmin ? ['admin-returns-realtime'] : ['customer-returns-realtime', userEmail],
        context.previousReturns
      );
    },
    onSuccess: () => {
      // Aggressive invalidation
      queryClient.invalidateQueries({ queryKey: ['admin-returns-realtime'] });
      queryClient.invalidateQueries({ queryKey: ['customer-returns-realtime'] });
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['user-notifications'] });
    }
  });

  // Stats
  const stats = {
    total: returns.length,
    pending: returns.filter(r => r.status === 'pending').length,
    approved: returns.filter(r => r.status === 'approved').length,
    refunded: returns.filter(r => r.status === 'refunded').length,
    rejected: returns.filter(r => r.status === 'rejected').length,
    totalRefundAmount: returns
      .filter(r => r.status === 'refunded')
      .reduce((sum, r) => sum + r.total_return_amount, 0)
  };

  return {
    returns: returns || [], // ✅ Use fresh data directly, not local state
    stats,
    isLoading,
    error,
    refetch,
    updateStatus: updateStatusMutation.mutate,
    isUpdating: updateStatusMutation.isPending
  };
}

export default useRealTimeReturns;