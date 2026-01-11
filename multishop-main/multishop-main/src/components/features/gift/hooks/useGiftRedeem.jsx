/**
 * useGiftRedeem Hook
 * Handles gift redemption flow
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/NotificationToast';
import * as giftTransactionRepo from '../data/giftTransactionRepository';
import * as fulfillmentBridge from '../data/fulfillmentBridge';
import { validateShippingInfo } from '../domain/validators';
import { canRedeem, canSwap } from '../domain/giftStateMachine';
import { canSwapToProduct } from '../domain/giftRules';
import { notifyGiftRedeemed, notifyGiftSwapped } from '../services/giftNotificationHandler';

export function useGiftRedeem() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  // Redeem gift
  const redeemMutation = useMutation({
    mutationFn: async ({ gift, shippingInfo }) => {
      // Validate can redeem
      if (!canRedeem(gift)) {
        throw new Error('Quà này không thể đổi lúc này');
      }

      // Validate shipping info
      const validation = validateShippingInfo(shippingInfo);
      if (!validation.success) {
        throw new Error(validation.message);
      }

      // Mark as redeemed
      await giftTransactionRepo.redeemGift(gift.id, shippingInfo);

      // Create fulfillment order for admin
      const order = await fulfillmentBridge.createFulfillmentOrder(gift, shippingInfo);

      // Link order to gift
      await fulfillmentBridge.linkFulfillmentOrder(gift.id, order.id);

      // Notify sender via service
      await notifyGiftRedeemed(gift);

      return { gift, order };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['giftInbox'] });
      queryClient.invalidateQueries({ queryKey: ['sentGifts'] });
      addToast('Đã đổi quà thành công! Đơn hàng sẽ được giao sớm.', 'success');
    },
    onError: (error) => {
      addToast(error.message || 'Không thể đổi quà', 'error');
    }
  });

  // Swap gift
  const swapMutation = useMutation({
    mutationFn: async ({ gift, newProduct }) => {
      // Validate can swap
      if (!canSwap(gift)) {
        throw new Error('Quà này không thể đổi');
      }

      const validation = canSwapToProduct(gift, newProduct);
      if (!validation.valid) {
        throw new Error(validation.reason);
      }

      // Swap to new product
      const newGift = await giftTransactionRepo.swapGift(gift.id, newProduct.id, newProduct);

      // Notify sender via service
      await notifyGiftSwapped(gift, newProduct);

      return newGift;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['giftInbox'] });
      queryClient.invalidateQueries({ queryKey: ['sentGifts'] });
      addToast('Đã đổi sang quà mới!', 'success');
    },
    onError: (error) => {
      addToast(error.message || 'Không thể đổi quà', 'error');
    }
  });

  return {
    redeemGift: redeemMutation.mutateAsync,
    swapGift: swapMutation.mutateAsync,
    isRedeeming: redeemMutation.isPending,
    isSwapping: swapMutation.isPending
  };
}