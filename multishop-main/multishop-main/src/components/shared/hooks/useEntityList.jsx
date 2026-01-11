/**
 * Base Hook for Entity List Operations
 * Provides common list functionality: fetch, filter, sort, pagination
 * 
 * Usage:
 * const { items, isLoading, filters, setFilter, refresh } = useEntityList({
 *   repository: productRepository,
 *   queryKey: 'products',
 *   initialFilters: { status: 'active' }
 * });
 */

import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';

/**
 * @typedef {Object} UseEntityListOptions
 * @property {Object} repository - Repository instance
 * @property {string} queryKey - React Query key
 * @property {Function} [fetchMethod] - Custom fetch method (default: repository.list)
 * @property {Object} [initialFilters] - Initial filter values
 * @property {string} [sortBy] - Initial sort field
 * @property {number} [limit] - Max items
 * @property {number} [staleTime] - Cache time in ms
 * @property {Function} [filterFn] - Client-side filter function
 * @property {Function} [transformFn] - Transform data before returning
 */

/**
 * Base hook for entity list operations
 * @param {UseEntityListOptions} options
 */
export function useEntityList({
  repository,
  queryKey,
  fetchMethod,
  initialFilters = {},
  sortBy = '-created_date',
  limit = 100,
  staleTime = 30 * 1000,
  filterFn,
  transformFn
}) {
  // State
  const [filters, setFiltersState] = useState(initialFilters);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch data
  const { data: result, isLoading, error, refetch } = useQuery({
    queryKey: [queryKey, sortBy, limit],
    queryFn: async () => {
      const method = fetchMethod || (() => repository.list(sortBy, limit));
      return method();
    },
    staleTime,
    initialData: { success: true, data: [] }
  });

  // Extract items from result
  const rawItems = useMemo(() => {
    if (!result?.success) return [];
    return result.data || [];
  }, [result]);

  // Apply filters
  const filteredItems = useMemo(() => {
    let items = rawItems;

    // Apply custom filter function
    if (filterFn) {
      items = filterFn(items, filters, searchTerm);
    } else {
      // Default filtering logic
      items = items.filter(item => {
        // Apply each filter
        for (const [key, value] of Object.entries(filters)) {
          if (value && value !== 'all') {
            if (item[key] !== value) return false;
          }
        }

        // Apply search
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          const searchableFields = ['name', 'title', 'full_name', 'email', 'phone', 'order_number'];
          const matchesSearch = searchableFields.some(field => 
            item[field]?.toLowerCase?.().includes(term)
          );
          if (!matchesSearch) return false;
        }

        return true;
      });
    }

    // Apply transform
    if (transformFn) {
      items = transformFn(items);
    }

    return items;
  }, [rawItems, filters, searchTerm, filterFn, transformFn]);

  // Handlers
  const setFilter = useCallback((key, value) => {
    setFiltersState(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersState(initialFilters);
    setSearchTerm('');
  }, [initialFilters]);

  const refresh = useCallback(() => {
    refetch();
  }, [refetch]);

  return {
    // Data
    items: filteredItems,
    allItems: rawItems,
    totalCount: rawItems.length,
    filteredCount: filteredItems.length,

    // State
    isLoading,
    error: error || (result?.success === false ? result.message : null),

    // Filters
    filters,
    setFilter,
    setFilters: setFiltersState,
    clearFilters,
    searchTerm,
    setSearchTerm,

    // Actions
    refresh,
    refetch
  };
}

/**
 * Hook for entity list with CRUD capabilities
 */
export function useEntityListWithCRUD({
  repository,
  queryKey,
  ...options
}) {
  const list = useEntityList({ repository, queryKey, ...options });

  // Create
  const create = useCallback(async (data) => {
    const createMethod = repository.createWithValidation || repository.create;
    const result = await createMethod(data);
    if (result.success) {
      list.refresh();
    }
    return result;
  }, [repository, list]);

  // Update
  const update = useCallback(async (id, data) => {
    const result = await repository.update(id, data);
    if (result.success) {
      list.refresh();
    }
    return result;
  }, [repository, list]);

  // Delete
  const remove = useCallback(async (id) => {
    const result = await repository.delete(id);
    if (result.success) {
      list.refresh();
    }
    return result;
  }, [repository, list]);

  return {
    ...list,
    create,
    update,
    remove
  };
}

export default useEntityList;