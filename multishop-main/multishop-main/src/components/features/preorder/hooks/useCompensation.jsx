/**
 * useCompensation - Hook for auto-compensation
 * 
 * Feature Logic Layer
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { compensationRepository, walletRepository } from '../data';
import {
  COMPENSATION_RULES,
  calculateDelayDays,
  findDelayCompensationRule,
  calculateShortage,
  findShortageCompensationRule,
  calculateCompensationValue,
  generateVoucherCode,
  getVoucherExpiry
} from '../domain';
import { base44 } from '@/api/base44Client';

/**
 * Hook for pending compensations (admin)
 */
export function usePendingCompensations() {
  return useQuery({
    queryKey: ['pending-compensations'],
    queryFn: () => compensationRepository.getPendingCompensations()
  });
}

/**
 * Hook for order compensations
 */
export function useOrderCompensations(orderId) {
  return useQuery({
    queryKey: ['order-compensations', orderId],
    queryFn: () => compensationRepository.getCompensationsByOrderId(orderId),
    enabled: !!orderId
  });
}

/**
 * Hook for compensation mutations
 */
export function useCompensationMutations() {
  const queryClient = useQueryClient();

  const checkDelayMutation = useMutation({
    mutationFn: async ({ orderId, lotId }) => {
      const orders = await base44.entities.Order.filter({ id: orderId });
      const order = orders[0];
      if (!order) return null;

      const existingComps = await compensationRepository.getCompensationsByTrigger(
        orderId, 
        'delay_threshold'
      );

      const lots = await base44.entities.ProductLot.filter({ id: lotId });
      const lot = lots[0];
      if (!lot?.estimated_harvest_date) return null;

      const delayDays = calculateDelayDays(lot.estimated_harvest_date);
      if (delayDays <= 0) return null;

      const ruleResult = findDelayCompensationRule(delayDays, existingComps);
      if (!ruleResult) return null;

      const { name, rule } = ruleResult;
      const compensationValue = calculateCompensationValue(rule, order.total_amount);

      const compensation = await compensationRepository.createCompensation({
        order_id: orderId,
        order_number: order.order_number,
        customer_email: order.customer_email,
        customer_name: order.customer_name,
        lot_id: lotId,
        lot_name: lot.lot_name,
        trigger_type: 'delay_threshold',
        trigger_details: {
          days_delayed: delayDays,
          rule_id: name,
          rule_description: rule.description
        },
        compensation_type: rule.compensation_type,
        compensation_value: compensationValue,
        compensation_unit: rule.compensation_unit === 'percent' ? 'vnd' : rule.compensation_unit,
        status: 'pending',
        auto_approved: true,
        policy_reference: { rule_applied: name },
        notes: rule.description
      });

      return compensation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-compensations'] });
      queryClient.invalidateQueries({ queryKey: ['order-compensations'] });
    }
  });

  const applyCompensationMutation = useMutation({
    mutationFn: async (compensationId) => {
      const compensation = await compensationRepository.getCompensationById(compensationId);
      if (!compensation) throw new Error('Compensation not found');

      const result = {
        success: true,
        compensation_type: compensation.compensation_type,
        value: compensation.compensation_value
      };

      switch (compensation.compensation_type) {
        case 'voucher':
          const voucherCode = generateVoucherCode(compensation.order_id);
          const voucherExpiry = getVoucherExpiry();
          
          result.voucher_code = voucherCode;
          result.voucher_expiry = voucherExpiry;
          
          await compensationRepository.markCompensationApplied(compensationId, {
            voucher_code: voucherCode,
            voucher_expiry: voucherExpiry
          });
          break;

        case 'points':
          result.points_awarded = compensation.compensation_value;
          await compensationRepository.markCompensationApplied(compensationId, {
            points_awarded: compensation.compensation_value
          });
          break;

        case 'partial_refund':
        case 'discount_current_order':
          const wallet = await walletRepository.getWalletByOrderId(compensation.order_id);
          if (wallet) {
            // Process refund through wallet
            // This would need escrow integration
          }
          
          await compensationRepository.markCompensationApplied(compensationId);
          break;

        default:
          result.success = false;
          result.error = 'Unknown compensation type';
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-compensations'] });
      queryClient.invalidateQueries({ queryKey: ['order-compensations'] });
    }
  });

  const approveMutation = useMutation({
    mutationFn: async ({ compensationId, approverEmail }) => {
      await compensationRepository.approveCompensation(compensationId, approverEmail);
      return await applyCompensationMutation.mutateAsync(compensationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-compensations'] });
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ compensationId, approverEmail, reason }) => {
      return await compensationRepository.rejectCompensation(compensationId, approverEmail, reason);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-compensations'] });
    }
  });

  return {
    checkDelay: checkDelayMutation,
    apply: applyCompensationMutation,
    approve: approveMutation,
    reject: rejectMutation
  };
}

// Export rules for UI
export { COMPENSATION_RULES };