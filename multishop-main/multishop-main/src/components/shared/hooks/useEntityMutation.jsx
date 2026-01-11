/**
 * Base Hook for Entity Mutations (Create, Update, Delete)
 * Provides consistent mutation handling with optimistic updates
 * 
 * Usage:
 * const { create, update, remove, isLoading } = useEntityMutation({
 *   repository: productRepository,
 *   queryKey: 'products',
 *   onSuccess: () => toast.success('Saved!')
 * });
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { logError, trackAction } from '@/components/shared/errors/ErrorLogger';

/**
 * @typedef {Object} UseEntityMutationOptions
 * @property {Object} repository - Repository instance
 * @property {string} queryKey - React Query key to invalidate
 * @property {Function} [onSuccess] - Success callback
 * @property {Function} [onError] - Error callback
 * @property {boolean} [optimistic=false] - Enable optimistic updates
 * @property {Function} [getOptimisticData] - Function to generate optimistic data
 */

/**
 * Base hook for entity mutations with optimistic update support
 * @param {UseEntityMutationOptions} options
 */
export function useEntityMutation({
  repository,
  queryKey,
  onSuccess,
  onError,
  optimistic = false,
  getOptimisticData
}) {
  const queryClient = useQueryClient();

  // Shared success/error handling
  const handleSuccess = useCallback((result, action, variables) => {
    trackAction(`${queryKey}.${action}`, { success: true });
    queryClient.invalidateQueries({ queryKey: [queryKey] });
    if (onSuccess) onSuccess(result, action, variables);
    return result;
  }, [queryClient, queryKey, onSuccess]);

  const handleError = useCallback((error, action, variables, context) => {
    logError(error, { action, queryKey, variables });
    
    // Rollback optimistic update
    if (context?.previousData) {
      queryClient.setQueryData([queryKey], context.previousData);
    }
    
    if (onError) onError(error, action, variables);
  }, [queryClient, queryKey, onError]);

  // Optimistic update helper
  const getOptimisticConfig = useCallback((action, mutationFn) => {
    if (!optimistic) {
      return { mutationFn };
    }

    return {
      mutationFn,
      onMutate: async (variables) => {
        // Cancel outgoing refetches
        await queryClient.cancelQueries({ queryKey: [queryKey] });
        
        // Snapshot current data
        const previousData = queryClient.getQueryData([queryKey]);
        
        // Optimistically update
        if (getOptimisticData) {
          const optimisticData = getOptimisticData(previousData, variables, action);
          queryClient.setQueryData([queryKey], optimisticData);
        }
        
        return { previousData };
      }
    };
  }, [optimistic, queryClient, queryKey, getOptimisticData]);

  // Create mutation
  const createMutation = useMutation({
    ...getOptimisticConfig('create', async (data) => {
      const createMethod = repository.createWithValidation || repository.create;
      const result = await createMethod(data);
      if (!result.success) throw new Error(result.message);
      return result;
    }),
    onSuccess: (result, variables) => handleSuccess(result, 'create', variables),
    onError: (error, variables, context) => handleError(error, 'create', variables, context)
  });

  // Update mutation
  const updateMutation = useMutation({
    ...getOptimisticConfig('update', async ({ id, data }) => {
      const result = await repository.update(id, data);
      if (!result.success) throw new Error(result.message);
      return result;
    }),
    onSuccess: (result, variables) => handleSuccess(result, 'update', variables),
    onError: (error, variables, context) => handleError(error, 'update', variables, context)
  });

  // Delete mutation
  const deleteMutation = useMutation({
    ...getOptimisticConfig('delete', async (id) => {
      const result = await repository.delete(id);
      if (!result.success) throw new Error(result.message);
      return result;
    }),
    onSuccess: (result, variables) => handleSuccess(result, 'delete', variables),
    onError: (error, variables, context) => handleError(error, 'delete', variables, context)
  });

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    ...getOptimisticConfig('bulkDelete', async (ids) => {
      const results = await Promise.all(ids.map(id => repository.delete(id)));
      const failed = results.filter(r => !r.success);
      if (failed.length > 0) throw new Error(`${failed.length} items failed to delete`);
      return results;
    }),
    onSuccess: (results, variables) => handleSuccess(results, 'bulkDelete', variables),
    onError: (error, variables, context) => handleError(error, 'bulkDelete', variables, context)
  });

  return {
    // Create
    create: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError: createMutation.error,

    // Update
    update: useCallback((id, data) => updateMutation.mutateAsync({ id, data }), [updateMutation]),
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error,

    // Delete
    remove: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    deleteError: deleteMutation.error,

    // Bulk Delete
    bulkRemove: bulkDeleteMutation.mutateAsync,
    isBulkDeleting: bulkDeleteMutation.isPending,

    // Combined state
    isLoading: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending || bulkDeleteMutation.isPending,

    // Reset
    reset: useCallback(() => {
      createMutation.reset();
      updateMutation.reset();
      deleteMutation.reset();
      bulkDeleteMutation.reset();
    }, [createMutation, updateMutation, deleteMutation, bulkDeleteMutation])
  };
}

/**
 * Hook with optimistic updates enabled by default
 */
export function useOptimisticEntityMutation(options) {
  return useEntityMutation({
    ...options,
    optimistic: true,
    getOptimisticData: options.getOptimisticData || defaultOptimisticHandler
  });
}

/**
 * Default optimistic data handler
 */
function defaultOptimisticHandler(previousData, variables, action) {
  if (!Array.isArray(previousData)) return previousData;
  
  switch (action) {
    case 'create':
      // Add temporary item with optimistic ID
      return [...previousData, { 
        ...variables, 
        id: `temp-${Date.now()}`,
        _optimistic: true 
      }];
    
    case 'update':
      // Update item in place
      return previousData.map(item => 
        item.id === variables.id ? { ...item, ...variables.data, _optimistic: true } : item
      );
    
    case 'delete':
      // Remove item
      return previousData.filter(item => item.id !== variables);
    
    case 'bulkDelete':
      // Remove multiple items
      return previousData.filter(item => !variables.includes(item.id));
    
    default:
      return previousData;
  }
}

/**
 * Hook for single entity form submission
 */
export function useEntityFormSubmit({
  repository,
  queryKey,
  id = null,
  onSuccess,
  onError
}) {
  const mutation = useEntityMutation({ repository, queryKey, onSuccess, onError });

  const submit = useCallback(async (data) => {
    if (id) {
      return mutation.update(id, data);
    } else {
      return mutation.create(data);
    }
  }, [id, mutation]);

  return {
    submit,
    isSubmitting: mutation.isLoading,
    isNew: !id
  };
}

export default useEntityMutation;