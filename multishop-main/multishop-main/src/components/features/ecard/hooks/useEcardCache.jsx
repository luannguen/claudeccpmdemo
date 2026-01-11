/**
 * useEcardCache - Main hook for EcardCache management
 * Feature Logic Layer
 * 
 * Provides:
 * - Cache data fetching
 * - Optimistic updates
 * - Background sync trigger
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ecardCacheRepository } from '../data/ecardCacheRepository';
import { EMPTY_CACHE, isCacheStale } from '../types/EcardCacheDTO';

const CACHE_QUERY_KEY = ['ecard-cache'];

/**
 * Main hook for EcardCache
 */
export function useEcardCache() {
  const queryClient = useQueryClient();

  // ========== FETCH CACHE ==========
  const { 
    data: cache, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: CACHE_QUERY_KEY,
    queryFn: async () => {
      const cached = await ecardCacheRepository.getOrCreateCache();
      
      // If cache is stale, trigger background sync
      if (isCacheStale(cached?.last_synced_at)) {
        triggerBackgroundSync();
      }
      
      return cached;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false
  });

  // ========== BACKGROUND SYNC ==========
  const syncMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('syncEcardCache', {});
      return response.data;
    },
    onSuccess: () => {
      // Refetch cache after sync
      queryClient.invalidateQueries({ queryKey: CACHE_QUERY_KEY });
    }
  });

  const triggerBackgroundSync = () => {
    if (!syncMutation.isPending) {
      syncMutation.mutate();
    }
  };

  // ========== OPTIMISTIC UPDATES ==========

  /**
   * Optimistic update for stats
   */
  const updateStatsOptimistic = (statKey, delta = 1) => {
    queryClient.setQueryData(CACHE_QUERY_KEY, (old) => {
      if (!old) return old;
      return {
        ...old,
        stats: {
          ...old.stats,
          [statKey]: (old.stats?.[statKey] || 0) + delta
        }
      };
    });

    // Also persist to DB in background
    if (cache?.id) {
      ecardCacheRepository.incrementStat(cache.id, statKey, delta).catch(console.error);
    }
  };

  /**
   * Optimistic update after creating a post
   */
  const onPostCreated = () => {
    updateStatsOptimistic('post_count', 1);
  };

  /**
   * Optimistic update after adding a connection
   */
  const onConnectionAdded = (connectionPreview) => {
    queryClient.setQueryData(CACHE_QUERY_KEY, (old) => {
      if (!old) return old;
      
      const currentPreview = old.connections_preview || [];
      const filtered = currentPreview.filter(c => c.id !== connectionPreview.id);
      const newPreview = [connectionPreview, ...filtered].slice(0, 20);
      
      return {
        ...old,
        stats: {
          ...old.stats,
          connection_count: (old.stats?.connection_count || 0) + 1
        },
        connections_preview: newPreview
      };
    });

    // Persist in background
    if (cache?.id) {
      ecardCacheRepository.addConnectionPreview(cache.id, connectionPreview).catch(console.error);
    }
  };

  /**
   * Optimistic update after sending/receiving a gift
   */
  const onGiftAction = (type, giftPreview) => {
    const statKey = type === 'received' ? 'gifts_received_count' : 'gifts_sent_count';
    const summaryKey = type === 'received' ? 'recent_received' : 'recent_sent';

    queryClient.setQueryData(CACHE_QUERY_KEY, (old) => {
      if (!old) return old;
      
      const currentList = old.gifts_summary?.[summaryKey] || [];
      const newList = [giftPreview, ...currentList].slice(0, 5);
      
      return {
        ...old,
        stats: {
          ...old.stats,
          [statKey]: (old.stats?.[statKey] || 0) + 1
        },
        gifts_summary: {
          ...old.gifts_summary,
          [summaryKey]: newList
        }
      };
    });

    // Persist in background
    if (cache?.id) {
      ecardCacheRepository.addGiftToSummary(cache.id, type, giftPreview).catch(console.error);
    }
  };

  /**
   * Force refresh cache from server
   */
  const forceSync = () => {
    syncMutation.mutate();
  };

  // ========== COMPUTED VALUES ==========
  const stats = cache?.stats || EMPTY_CACHE.stats;
  const connectionsPreview = cache?.connections_preview || [];
  const giftsSummary = cache?.gifts_summary || EMPTY_CACHE.gifts_summary;
  const profileSnapshot = cache?.profile_snapshot || {};
  const isStale = isCacheStale(cache?.last_synced_at);
  const isSyncing = syncMutation.isPending;

  return {
    // Data
    cache,
    stats,
    connectionsPreview,
    giftsSummary,
    profileSnapshot,
    
    // Status
    isLoading,
    error,
    isStale,
    isSyncing,
    lastSyncedAt: cache?.last_synced_at,
    
    // Actions
    forceSync,
    refetch,
    
    // Optimistic updates
    onPostCreated,
    onConnectionAdded,
    onGiftAction,
    updateStatsOptimistic
  };
}

export default useEcardCache;