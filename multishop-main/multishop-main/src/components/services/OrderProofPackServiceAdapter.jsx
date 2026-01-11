/**
 * OrderProofPackService - Legacy Adapter
 * 
 * ⚠️ DEPRECATED: Sử dụng @/components/features/preorder thay thế
 * 
 * @deprecated Use @/components/features/preorder instead
 */

import {
  getProofPackByOrderId,
  generateProofPack,
  regenerateProofPack as updateProofPack,
  exportReconciliationData,
  convertToCSV
} from '@/components/features/preorder';

export const OrderProofPackService = {
  generateProofPack,
  getProofPackByOrderId,
  updateProofPack,
  exportReconciliationData,
  convertToCSV
};

export default OrderProofPackService;