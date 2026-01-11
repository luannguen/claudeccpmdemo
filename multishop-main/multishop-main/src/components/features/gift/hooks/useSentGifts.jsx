/**
 * useSentGifts Hook
 * Lists gifts sent by current user
 */

import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import * as giftTransactionRepo from '../data/giftTransactionRepository';

export function useSentGifts() {
  const { data: sentGifts = [], isLoading, refetch } = useQuery({
    queryKey: ['sentGifts'],
    queryFn: async () => {
      const user = await base44.auth.me();
      if (!user) return [];

      return giftTransactionRepo.listSent(user.id);
    },
    staleTime: 30 * 1000
  });

  return {
    sentGifts,
    isLoading,
    refetch
  };
}