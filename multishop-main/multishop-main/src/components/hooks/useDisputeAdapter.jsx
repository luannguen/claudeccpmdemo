/**
 * useDispute - Legacy Adapter
 * 
 * ⚠️ DEPRECATED: Sử dụng @/components/features/preorder thay thế
 * 
 * @deprecated Use @/components/features/preorder instead
 */

import {
  useOrderDisputes,
  useDisputeDetail,
  useOpenDisputes,
  useDisputesList,
  useDisputeMutations,
  DISPUTE_TYPES,
  RESOLUTION_TYPES
} from '@/components/features/preorder';

// Re-export everything
export {
  useOrderDisputes,
  useDisputeDetail,
  useOpenDisputes,
  useDisputesList,
  useDisputeMutations,
  DISPUTE_TYPES,
  RESOLUTION_TYPES
};

export default useDisputeMutations;