/**
 * Performance Optimizations Registry
 * 
 * Registry for performance-related utilities and patterns.
 */

// ========== VIRTUALIZATION ==========
export const virtualizationRegistry = {
  VirtualizedList: {
    path: '@/components/shared/ui/VirtualizedList',
    description: 'Virtualized list for large datasets',
    usage: '<VirtualizedList items={items} renderItem={...} />',
    threshold: 100 // Use when items > 100
  },
  VirtualizedGrid: {
    path: '@/components/shared/ui/VirtualizedList',
    description: 'Virtualized grid for large datasets',
    usage: '<VirtualizedGrid items={items} columns={4} renderItem={...} />',
    threshold: 50
  },
  useVirtualization: {
    path: '@/components/shared/ui/VirtualizedList',
    description: 'Hook to check if virtualization is needed',
    usage: 'const shouldVirtualize = useVirtualization(itemCount)'
  }
};

// ========== DEBOUNCING ==========
export const debouncingRegistry = {
  useDebouncedValue: {
    path: '@/components/shared/utils/debounce',
    description: 'Debounce a value (for search/filter)',
    usage: 'const debouncedSearch = useDebouncedValue(search, 300)',
    defaultDelay: 300
  },
  useDebouncedCallback: {
    path: '@/components/shared/utils/debounce',
    description: 'Debounce a callback function',
    usage: 'const debouncedFn = useDebouncedCallback(fn, 300)'
  }
};

// ========== OPTIMISTIC UPDATES ==========
export const optimisticRegistry = {
  useOptimisticEntityMutation: {
    path: '@/components/shared/hooks/useEntityMutation',
    description: 'Mutation with optimistic UI update',
    usage: 'useMutation with onMutate/onError/onSettled'
  }
};

// ========== CACHING ==========
export const cachingRegistry = {
  defaultStaleTime: 30000, // 30 seconds
  longCacheTime: 300000, // 5 minutes
  shortCacheTime: 10000, // 10 seconds
  
  queryKeyPatterns: {
    list: (entity) => [entity, 'list'],
    detail: (entity, id) => [entity, 'detail', id],
    stats: (entity) => [entity, 'stats'],
    search: (entity, term) => [entity, 'search', term]
  }
};

// ========== COMBINED REGISTRY ==========
export const performanceRegistry = {
  virtualization: virtualizationRegistry,
  debouncing: debouncingRegistry,
  optimistic: optimisticRegistry,
  caching: cachingRegistry
};

/**
 * Check if virtualization is recommended for item count
 */
export function shouldVirtualize(itemCount, mode = 'list') {
  const threshold = mode === 'grid' 
    ? virtualizationRegistry.VirtualizedGrid.threshold
    : virtualizationRegistry.VirtualizedList.threshold;
  return itemCount > threshold;
}

/**
 * Get recommended stale time for entity type
 */
export function getStaleTime(entityType) {
  const longCache = ['siteConfig', 'category', 'feature'];
  const shortCache = ['notification', 'order'];
  
  if (longCache.includes(entityType)) return cachingRegistry.longCacheTime;
  if (shortCache.includes(entityType)) return cachingRegistry.shortCacheTime;
  return cachingRegistry.defaultStaleTime;
}