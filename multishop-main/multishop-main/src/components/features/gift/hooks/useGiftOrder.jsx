/**
 * useGiftOrder Hook
 * Manages gift order creation and payment flow
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/NotificationToast';
import * as giftOrderRepo from '../data/giftOrderRepository';
import * as giftTransactionRepo from '../data/giftTransactionRepository';
import { validateGiftOrderItems } from '../domain/validators';
import { base44 } from '@/api/base44Client';
import { notifyGiftReceived } from '../services/giftNotificationHandler';

export function useGiftOrder() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  // Create draft order
  const createDraftMutation = useMutation({
    mutationFn: async ({ items, giftConfig }) => {
      const user = await base44.auth.me();
      
      // Validate
      const validation = validateGiftOrderItems(items);
      if (!validation.success) {
        throw new Error(validation.message);
      }

      return giftOrderRepo.createDraft(user.id, items);
    },
    onError: (error) => {
      addToast(error.message || 'Không thể tạo đơn quà', 'error');
    }
  });

  // Mark pending payment
  const markPendingMutation = useMutation({
    mutationFn: ({ orderId, paymentMethod }) => 
      giftOrderRepo.markPendingPayment(orderId, paymentMethod),
    onError: () => {
      addToast('Không thể xử lý thanh toán', 'error');
    }
  });

  // On payment success - create gift transaction
  const onPaymentSuccessMutation = useMutation({
    mutationFn: async ({ orderId, paymentId, giftConfig }) => {
      // Mark order as paid
      await giftOrderRepo.markPaid(orderId, paymentId);

      // Get order
      const orders = await giftOrderRepo.getById(orderId);
      const order = orders[0];

      // Create gift transaction
      const gift = await giftTransactionRepo.createFromOrder(order, giftConfig);

      // Mark gift as sent
      await giftTransactionRepo.markSent(gift.id);

      // If instant or redeem_required - make redeemable
      if (giftConfig.delivery_mode === 'instant' || giftConfig.delivery_mode === 'redeem_required') {
        await giftTransactionRepo.markRedeemable(gift.id);
      }

      // Notify receiver about the gift
      await notifyGiftReceived(gift);

      return { order, gift };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sentGifts'] });
      queryClient.invalidateQueries({ queryKey: ['giftOrders'] });
      addToast('Quà đã được gửi thành công!', 'success');
    },
    onError: () => {
      addToast('Không thể tạo quà tặng', 'error');
    }
  });

  return {
    createDraft: createDraftMutation.mutateAsync,
    markPendingPayment: markPendingMutation.mutateAsync,
    onPaymentSuccess: onPaymentSuccessMutation.mutateAsync,
    isCreating: createDraftMutation.isPending,
    isProcessing: onPaymentSuccessMutation.isPending
  };
}