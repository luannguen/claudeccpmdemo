/**
 * useDispute - Hook for dispute management
 * 
 * Feature Logic Layer
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { disputeRepository } from '../data';
import { validateDisputeSubmission } from '../domain';

/**
 * Hook for disputes by order
 */
export function useOrderDisputes(orderId) {
  return useQuery({
    queryKey: ['order-disputes', orderId],
    queryFn: () => disputeRepository.getDisputesByOrderId(orderId),
    enabled: !!orderId
  });
}

/**
 * Hook for single dispute
 */
export function useDisputeDetail(disputeId) {
  return useQuery({
    queryKey: ['dispute-detail', disputeId],
    queryFn: () => disputeRepository.getDisputeById(disputeId),
    enabled: !!disputeId
  });
}

/**
 * Hook for open disputes (admin)
 */
export function useOpenDisputes() {
  return useQuery({
    queryKey: ['open-disputes'],
    queryFn: () => disputeRepository.getOpenDisputes()
  });
}

/**
 * Hook for all disputes (admin)
 */
export function useDisputesList(status = null) {
  return useQuery({
    queryKey: ['disputes-list', status],
    queryFn: () => status 
      ? disputeRepository.getDisputesByStatus(status)
      : disputeRepository.listDisputes()
  });
}

/**
 * Hook for dispute mutations
 */
export function useDisputeMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const validation = validateDisputeSubmission(data);
      if (!validation.valid) {
        throw new Error(validation.errors.join(', '));
      }
      
      return await disputeRepository.createDispute(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['open-disputes'] });
      queryClient.invalidateQueries({ queryKey: ['disputes-list'] });
      queryClient.invalidateQueries({ queryKey: ['order-disputes'] });
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ disputeId, status, actor, note }) => {
      return await disputeRepository.updateDisputeStatus(disputeId, status, actor, note);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dispute-detail'] });
      queryClient.invalidateQueries({ queryKey: ['open-disputes'] });
      queryClient.invalidateQueries({ queryKey: ['disputes-list'] });
    }
  });

  const addResolutionMutation = useMutation({
    mutationFn: async ({ disputeId, option }) => {
      return await disputeRepository.addResolutionOption(disputeId, option);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dispute-detail'] });
    }
  });

  const resolveMutation = useMutation({
    mutationFn: async ({ disputeId, resolution, actor }) => {
      return await disputeRepository.resolveDispute(disputeId, resolution, actor);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dispute-detail'] });
      queryClient.invalidateQueries({ queryKey: ['open-disputes'] });
      queryClient.invalidateQueries({ queryKey: ['disputes-list'] });
    }
  });

  const addNoteMutation = useMutation({
    mutationFn: async ({ disputeId, note, author }) => {
      return await disputeRepository.addInternalNote(disputeId, note, author);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dispute-detail'] });
    }
  });

  return {
    create: createMutation,
    updateStatus: updateStatusMutation,
    addResolution: addResolutionMutation,
    resolve: resolveMutation,
    addNote: addNoteMutation
  };
}

/**
 * Dispute types for UI
 */
export const DISPUTE_TYPES = [
  { id: 'delivery_delay', label: 'Giao hàng chậm trễ' },
  { id: 'partial_delivery', label: 'Giao thiếu hàng' },
  { id: 'quality_issue', label: 'Vấn đề chất lượng' },
  { id: 'wrong_specification', label: 'Sai quy cách/kích cỡ' },
  { id: 'damaged_goods', label: 'Hàng hư hỏng' },
  { id: 'missing_items', label: 'Thiếu sản phẩm' },
  { id: 'not_as_described', label: 'Không đúng mô tả' },
  { id: 'seller_no_response', label: 'Người bán không phản hồi' },
  { id: 'payment_issue', label: 'Vấn đề thanh toán' },
  { id: 'other', label: 'Khác' }
];

export const RESOLUTION_TYPES = [
  { id: 'full_refund', label: 'Hoàn tiền 100%', icon: '💰' },
  { id: 'partial_refund', label: 'Hoàn tiền một phần', icon: '💵' },
  { id: 'swap_lot', label: 'Đổi sang lot khác', icon: '🔄' },
  { id: 'reship', label: 'Giao lại hàng', icon: '📦' },
  { id: 'voucher', label: 'Voucher giảm giá', icon: '🎫' },
  { id: 'points', label: 'Cộng điểm thưởng', icon: '⭐' },
  { id: 'discount_next_order', label: 'Giảm giá đơn tiếp', icon: '🏷️' },
  { id: 'replacement', label: 'Đổi hàng mới', icon: '🔃' },
  { id: 'no_action', label: 'Không cần xử lý', icon: '✓' }
];