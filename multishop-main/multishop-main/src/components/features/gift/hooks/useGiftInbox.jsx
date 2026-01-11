/**
 * useGiftInbox Hook
 * Manages receiver's gift inbox
 */

import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import * as giftTransactionRepo from '../data/giftTransactionRepository';
import { GIFT_STATUS } from '../domain/giftStateMachine';

export function useGiftInbox() {
  const { data: gifts = [], isLoading, refetch } = useQuery({
    queryKey: ['giftInbox'],
    queryFn: async () => {
      const user = await base44.auth.me();
      if (!user) return [];

      const allGifts = await giftTransactionRepo.listInbox(user.id);

      // Check and mark expired gifts
      const now = new Date();
      const giftsWithExpiry = await Promise.all(
        allGifts.map(async (gift) => {
          if (giftTransactionRepo.isExpired(gift) && 
              [GIFT_STATUS.SENT, GIFT_STATUS.REDEEMABLE].includes(gift.status)) {
            await giftTransactionRepo.markExpired(gift.id);
            return { ...gift, status: GIFT_STATUS.EXPIRED };
          }
          return gift;
        })
      );

      return giftsWithExpiry;
    },
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000 // Poll every minute
  });

  // Split into categories
  const activeGifts = gifts.filter(g => 
    [GIFT_STATUS.SENT, GIFT_STATUS.REDEEMABLE].includes(g.status)
  );

  const historyGifts = gifts.filter(g => 
    [GIFT_STATUS.REDEEMED, GIFT_STATUS.FULFILLMENT_CREATED, GIFT_STATUS.DELIVERED, GIFT_STATUS.SWAPPED, GIFT_STATUS.EXPIRED, GIFT_STATUS.CANCELLED].includes(g.status)
  );

  return {
    activeGifts,
    historyGifts,
    allGifts: gifts,
    isLoading,
    refetch
  };
}