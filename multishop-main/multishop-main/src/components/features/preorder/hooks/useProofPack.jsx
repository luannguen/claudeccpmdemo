/**
 * useProofPack - Order proof pack hooks
 * 
 * Part of PreOrder Module
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getProofPackByOrderId,
  generateProofPack,
  regenerateProofPack,
  exportReconciliationData,
  exportAsCSV
} from '../data/proofPackRepository';

/**
 * Get proof pack for order
 */
export function useOrderProofPack(orderId) {
  return useQuery({
    queryKey: ['proof-pack', orderId],
    queryFn: () => getProofPackByOrderId(orderId),
    enabled: !!orderId,
    staleTime: 10 * 60 * 1000
  });
}

/**
 * Proof pack mutations
 */
export function useProofPackMutations() {
  const queryClient = useQueryClient();

  const generateMutation = useMutation({
    mutationFn: (orderId) => generateProofPack(orderId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['proof-pack', data.order_id] });
    }
  });

  const regenerateMutation = useMutation({
    mutationFn: (proofPackId) => regenerateProofPack(proofPackId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['proof-pack', data.order_id] });
    }
  });

  return {
    generate: generateMutation.mutateAsync,
    regenerate: regenerateMutation.mutateAsync,
    isGenerating: generateMutation.isPending,
    isRegenerating: regenerateMutation.isPending
  };
}

/**
 * Export reconciliation data
 */
export function useExportReconciliation() {
  return useMutation({
    mutationFn: (filters) => exportReconciliationData(filters)
  });
}

/**
 * Export as CSV
 */
export function useExportCSV() {
  return useMutation({
    mutationFn: (filters) => exportAsCSV(filters)
  });
}