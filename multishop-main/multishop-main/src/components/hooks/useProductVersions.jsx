/**
 * Product Versions Hook
 * Feature Logic - Version history management
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productVersionRepository } from "@/components/data/repositories/productVersionRepository";
import { productRepository } from "@/components/data";
import { useToast } from "@/components/NotificationToast";

export function useProductVersions(productId) {
  return useQuery({
    queryKey: ['product-versions', productId],
    queryFn: async () => {
      if (!productId) return [];
      const result = await productVersionRepository.list(productId, 50);
      return result.success ? result.data : [];
    },
    enabled: !!productId,
    staleTime: 2 * 60 * 1000
  });
}

export function useRestoreVersion() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: async ({ productId, version }) => {
      // Restore = create new version với data từ snapshot
      const restoreData = {
        ...version.snapshot,
        current_version: (version.snapshot.current_version || 1) + 1
      };
      
      // Save current state as version trước khi restore
      const currentResult = await productRepository.get(productId);
      if (currentResult.success) {
        await productVersionRepository.save(
          productId,
          currentResult.data,
          ['restored_from_version'],
          `Restored từ version ${version.version_number}`
        );
      }
      
      // Update product
      const result = await productRepository.update(productId, restoreData);
      return result;
    },
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['admin-panel-products'] });
        queryClient.invalidateQueries({ queryKey: ['product-versions'] });
        addToast('Đã khôi phục version cũ', 'success');
      }
    },
    onError: () => {
      addToast('Không thể khôi phục version. Vui lòng thử lại.', 'error');
    }
  });
}