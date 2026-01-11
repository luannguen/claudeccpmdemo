/**
 * useDispute - Hook for dispute/exception handling
 * Feature Logic Layer
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  DisputeService,
  createDispute,
  proposeResolutions,
  selectResolution,
  escalateDispute,
  addInternalNote
} from '@/components/services/DisputeService';

/**
 * Hook to list disputes (admin)
 */
export function useDisputeList(filters = {}) {
  return useQuery({
    queryKey: ['disputes', filters],
    queryFn: async () => {
      const disputes = await base44.entities.DisputeTicket.filter(
        filters,
        '-created_date'
      );
      return disputes;
    }
  });
}

/**
 * Hook to get dispute by ID
 */
export function useDisputeDetail(disputeId) {
  return useQuery({
    queryKey: ['dispute', disputeId],
    queryFn: async () => {
      if (!disputeId) return null;
      const disputes = await base44.entities.DisputeTicket.filter({ id: disputeId });
      return disputes[0] || null;
    },
    enabled: !!disputeId
  });
}

/**
 * Hook for customer's disputes
 */
export function useMyDisputes(customerEmail) {
  return useQuery({
    queryKey: ['my-disputes', customerEmail],
    queryFn: async () => {
      if (!customerEmail) return [];
      return await base44.entities.DisputeTicket.filter(
        { customer_email: customerEmail },
        '-created_date'
      );
    },
    enabled: !!customerEmail
  });
}

/**
 * Hook for dispute mutations
 */
export function useDisputeMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createDispute,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disputes'] });
      queryClient.invalidateQueries({ queryKey: ['my-disputes'] });
    }
  });

  const proposeResolutionsMutation = useMutation({
    mutationFn: async ({ disputeId, adminEmail }) => {
      return await proposeResolutions(disputeId, adminEmail);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['dispute', variables.disputeId] });
      queryClient.invalidateQueries({ queryKey: ['disputes'] });
    }
  });

  const selectResolutionMutation = useMutation({
    mutationFn: async ({ disputeId, optionId, customerNote }) => {
      return await selectResolution(disputeId, optionId, customerNote);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['dispute', variables.disputeId] });
      queryClient.invalidateQueries({ queryKey: ['disputes'] });
      queryClient.invalidateQueries({ queryKey: ['my-disputes'] });
    }
  });

  const escalateMutation = useMutation({
    mutationFn: async ({ disputeId, escalatedTo, reason }) => {
      return await escalateDispute(disputeId, escalatedTo, reason);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['dispute', variables.disputeId] });
      queryClient.invalidateQueries({ queryKey: ['disputes'] });
    }
  });

  const addNoteMutation = useMutation({
    mutationFn: async ({ disputeId, note, author }) => {
      return await addInternalNote(disputeId, note, author);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['dispute', variables.disputeId] });
    }
  });

  return {
    createDispute: createMutation,
    proposeResolutions: proposeResolutionsMutation,
    selectResolution: selectResolutionMutation,
    escalate: escalateMutation,
    addNote: addNoteMutation
  };
}

/**
 * Hook for dispute statistics
 */
export function useDisputeStats() {
  return useQuery({
    queryKey: ['dispute-stats'],
    queryFn: async () => {
      const disputes = await base44.entities.DisputeTicket.filter({});
      
      const open = disputes.filter(d => 
        ['open', 'under_review', 'pending_customer_response', 'pending_seller_response'].includes(d.status)
      ).length;
      
      const resolved = disputes.filter(d => d.status === 'resolved').length;
      const escalated = disputes.filter(d => d.status === 'escalated').length;
      
      const breachedSLA = disputes.filter(d => d.is_sla_breached).length;

      // Type breakdown
      const byType = {};
      disputes.forEach(d => {
        byType[d.dispute_type] = (byType[d.dispute_type] || 0) + 1;
      });

      return {
        total: disputes.length,
        open,
        resolved,
        escalated,
        breachedSLA,
        byType,
        resolution_rate: disputes.length > 0 
          ? ((resolved / disputes.length) * 100).toFixed(1) 
          : 0
      };
    }
  });
}

export default {
  useDisputeList,
  useDisputeDetail,
  useMyDisputes,
  useDisputeMutations,
  useDisputeStats
};