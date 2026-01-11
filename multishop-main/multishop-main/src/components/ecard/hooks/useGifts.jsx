/**
 * @deprecated Use hooks from '@/components/features/gift' instead
 * 
 * Migration:
 * - useGiftInbox for received gifts
 * - useGiftSend for sending gifts  
 * - useGiftOrder for checkout flow
 * - useGiftRedeem for redeeming gifts
 * 
 * Example:
 * import { useGiftInbox, useGiftSend } from '@/components/features/gift';
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/NotificationToast';
import * as giftRepository from '../data/giftRepository';

// Safe toast wrapper
const useSafeToast = () => {
  try {
    return useToast();
  } catch {
    return { addToast: () => {} };
  }
};

/** @deprecated Use useGiftInbox, useGiftSend from features/gift module */
export function useGifts() {
  const queryClient = useQueryClient();
  const { addToast } = useSafeToast();

  const { data: sentGifts = [], isLoading: isLoadingSent } = useQuery({
    queryKey: ['sentGifts'],
    queryFn: async () => {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) return [];
      
      const user = await base44.auth.me();
      if (!user) return [];
      
      return giftRepository.listSentGifts(user.id);
    },
    retry: false,
    throwOnError: false
  });

  const { data: receivedGifts = [], isLoading: isLoadingReceived } = useQuery({
    queryKey: ['receivedGifts'],
    queryFn: async () => {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) return [];
      
      const user = await base44.auth.me();
      if (!user) return [];
      
      return giftRepository.listReceivedGifts(user.id);
    },
    retry: false,
    throwOnError: false
  });

  const sendGiftMutation = useMutation({
    mutationFn: (giftData) => giftRepository.sendGift(giftData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sentGifts'] });
      addToast('Đã gửi quà thành công!', 'success');
    },
    onError: () => {
      addToast('Không thể gửi quà', 'error');
    }
  });

  const redeemGiftMutation = useMutation({
    mutationFn: async (code) => {
      const user = await base44.auth.me();
      return giftRepository.redeemGift(code, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receivedGifts'] });
      addToast('Đã đổi quà thành công!', 'success');
    },
    onError: (error) => {
      addToast(error.message || 'Không thể đổi quà', 'error');
    }
  });

  return {
    sentGifts,
    receivedGifts,
    isLoading: isLoadingSent || isLoadingReceived,
    sendGift: sendGiftMutation.mutate,
    redeemGift: redeemGiftMutation.mutate,
    isSending: sendGiftMutation.isPending,
    isRedeeming: redeemGiftMutation.isPending
  };
}