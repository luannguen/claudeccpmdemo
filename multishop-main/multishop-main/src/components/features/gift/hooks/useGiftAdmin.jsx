/**
 * useGiftAdmin Hook
 * Admin gift management - list, analytics, bulk operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { GIFT_STATUS, GIFT_ORDER_STATUS } from '../types';

const GiftTransaction = base44.entities.GiftTransaction;
const GiftOrder = base44.entities.GiftOrder;

export function useGiftAdmin(filters = {}) {
  const queryClient = useQueryClient();

  // All gift transactions
  const { data: transactions = [], isLoading: loadingTransactions } = useQuery({
    queryKey: ['adminGiftTransactions', filters],
    queryFn: async () => {
      const query = {};
      if (filters.status) query.status = filters.status;
      if (filters.dateFrom) query.created_date = { $gte: filters.dateFrom };
      
      return await GiftTransaction.filter(query, '-created_date', 100);
    },
    staleTime: 30 * 1000
  });

  // All gift orders
  const { data: orders = [], isLoading: loadingOrders } = useQuery({
    queryKey: ['adminGiftOrders', filters],
    queryFn: async () => {
      const query = {};
      if (filters.orderStatus) query.status = filters.orderStatus;
      
      return await GiftOrder.filter(query, '-created_date', 100);
    },
    staleTime: 30 * 1000
  });

  // Analytics
  const analytics = {
    totalGifts: transactions.length,
    totalRevenue: orders.reduce((sum, o) => 
      o.status === GIFT_ORDER_STATUS.PAID ? sum + (o.total_amount || 0) : sum, 0
    ),
    statusBreakdown: transactions.reduce((acc, g) => {
      acc[g.status] = (acc[g.status] || 0) + 1;
      return acc;
    }, {}),
    avgGiftValue: transactions.length > 0 
      ? transactions.reduce((sum, g) => sum + (g.item_value || 0), 0) / transactions.length 
      : 0,
    
    pendingPayment: transactions.filter(g => g.status === GIFT_STATUS.PENDING_PAYMENT).length,
    redeemable: transactions.filter(g => g.status === GIFT_STATUS.REDEEMABLE).length,
    redeemed: transactions.filter(g => g.status === GIFT_STATUS.REDEEMED).length,
    delivered: transactions.filter(g => g.status === GIFT_STATUS.DELIVERED).length,
    expired: transactions.filter(g => g.status === GIFT_STATUS.EXPIRED).length,
    
    topSenders: getTopSenders(transactions),
    topReceivers: getTopReceivers(transactions),
    topProducts: getTopProducts(transactions),
    
    // Monthly trend
    monthlyTrend: getMonthlyTrend(transactions)
  };

  // Update gift status
  const updateGiftMutation = useMutation({
    mutationFn: async ({ giftId, data }) => {
      return await GiftTransaction.update(giftId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminGiftTransactions'] });
    }
  });

  // Mark as delivered
  const markDeliveredMutation = useMutation({
    mutationFn: async (giftId) => {
      return await GiftTransaction.update(giftId, { status: GIFT_STATUS.DELIVERED });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminGiftTransactions'] });
    }
  });

  // Cancel gift
  const cancelGiftMutation = useMutation({
    mutationFn: async (giftId) => {
      return await GiftTransaction.update(giftId, { status: GIFT_STATUS.CANCELLED });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminGiftTransactions'] });
    }
  });

  return {
    transactions,
    orders,
    analytics,
    isLoading: loadingTransactions || loadingOrders,
    
    // Actions
    updateGift: updateGiftMutation.mutateAsync,
    markDelivered: markDeliveredMutation.mutateAsync,
    cancelGift: cancelGiftMutation.mutateAsync,
    
    // Mutation states
    isUpdating: updateGiftMutation.isPending,
    isMarking: markDeliveredMutation.isPending,
    isCancelling: cancelGiftMutation.isPending
  };
}

// Helper functions
function getTopSenders(transactions) {
  const senders = {};
  transactions.forEach(g => {
    const key = g.sender_user_id || 'unknown';
    if (!senders[key]) {
      senders[key] = { userId: key, name: g.sender_name || 'Unknown', count: 0, totalValue: 0 };
    }
    senders[key].count++;
    senders[key].totalValue += g.item_value || 0;
  });
  return Object.values(senders).sort((a, b) => b.count - a.count).slice(0, 5);
}

function getTopReceivers(transactions) {
  const receivers = {};
  transactions.forEach(g => {
    const key = g.receiver_user_id || 'unknown';
    if (!receivers[key]) {
      receivers[key] = { userId: key, name: g.receiver_name || 'Unknown', count: 0, totalValue: 0 };
    }
    receivers[key].count++;
    receivers[key].totalValue += g.item_value || 0;
  });
  return Object.values(receivers).sort((a, b) => b.count - a.count).slice(0, 5);
}

function getTopProducts(transactions) {
  const products = {};
  transactions.forEach(g => {
    const key = g.item_id || 'unknown';
    if (!products[key]) {
      products[key] = { productId: key, name: g.item_name || 'Unknown', count: 0, totalValue: 0, image: g.item_image };
    }
    products[key].count++;
    products[key].totalValue += g.item_value || 0;
  });
  return Object.values(products).sort((a, b) => b.count - a.count).slice(0, 5);
}

function getMonthlyTrend(transactions) {
  const months = {};
  transactions.forEach(g => {
    const date = new Date(g.created_date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!months[key]) {
      months[key] = { month: key, count: 0, value: 0 };
    }
    months[key].count++;
    months[key].value += g.item_value || 0;
  });
  return Object.values(months).sort((a, b) => a.month.localeCompare(b.month)).slice(-6);
}