/**
 * Base Hook for Entity Detail Operations
 * Provides common detail functionality: fetch, update, delete
 * 
 * Usage:
 * const { item, isLoading, update, remove } = useEntityDetail({
 *   repository: productRepository,
 *   queryKey: 'product',
 *   id: productId
 * });
 */

import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * @typedef {Object} UseEntityDetailOptions
 * @property {Object} repository - Repository instance
 * @property {string} queryKey - React Query key base
 * @property {string} id - Entity ID
 * @property {number} [staleTime] - Cache time in ms
 * @property {boolean} [enabled] - Whether to fetch
 * @property {Function} [transformFn] - Transform data before returning
 */

/**
 * Base hook for entity detail operations
 * @param {UseEntityDetailOptions} options
 */
export function useEntityDetail({
  repository,
  queryKey,
  id,
  staleTime = 30 * 1000,
  enabled = true,
  transformFn
}) {
  const queryClient = useQueryClient();

  // Fetch data
  const { data: result, isLoading, error, refetch } = useQuery({
    queryKey: [queryKey, id],
    queryFn: () => repository.getById(id),
    enabled: enabled && !!id,
    staleTime
  });

  // Extract item
  const item = result?.success ? (transformFn ? transformFn(result.data) : result.data) : null;

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data) => repository.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey, id] });
      queryClient.invalidateQueries({ queryKey: [queryKey] }); // Invalidate list too
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: () => repository.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
    }
  });

  // Handlers
  const update = useCallback(async (data) => {
    return updateMutation.mutateAsync(data);
  }, [updateMutation]);

  const remove = useCallback(async () => {
    return deleteMutation.mutateAsync();
  }, [deleteMutation]);

  return {
    // Data
    item,
    id,

    // State
    isLoading,
    error: error || (result?.success === false ? result.message : null),
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,

    // Actions
    update,
    remove,
    refresh: refetch
  };
}

/**
 * Hook for entity detail with form state
 */
export function useEntityDetailWithForm({
  repository,
  queryKey,
  id,
  defaultValues = {},
  ...options
}) {
  const detail = useEntityDetail({ repository, queryKey, id, ...options });

  // Form values based on item or defaults
  const formValues = detail.item || defaultValues;

  // Submit handler
  const submit = useCallback(async (data) => {
    if (id) {
      // Update existing
      return detail.update(data);
    } else {
      // Create new
      const createMethod = repository.createWithValidation || repository.create;
      return createMethod(data);
    }
  }, [id, detail, repository]);

  return {
    ...detail,
    formValues,
    submit,
    isNew: !id
  };
}

export default useEntityDetail;