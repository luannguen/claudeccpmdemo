/**
 * Hook: useConnections
 * Orchestrates connection operations
 * 
 * OPTIMIZED: Uses EcardCache for initial preview, lazy loads full data
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/NotificationToast';
import * as connectionRepository from '../data/connectionRepository';
import * as ecardRepository from '../data/ecardRepository';
import { useEcardCache } from '@/components/features/ecard';

// Safe toast wrapper
const useSafeToast = () => {
  try {
    return useToast();
  } catch {
    return { addToast: () => {} };
  }
};

export function useConnections() {
  const queryClient = useQueryClient();
  const { addToast } = useSafeToast();
  
  // Get cached connections preview for instant initial render
  const { connectionsPreview, onConnectionAdded } = useEcardCache();

  const { data: connections = [], isLoading, refetch } = useQuery({
    queryKey: ['userConnections'],
    refetchOnWindowFocus: false, // Reduce unnecessary refetches
    refetchInterval: 60000, // Poll every 60s instead of 30s
    queryFn: async () => {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) return connectionsPreview || [];
      
      const user = await base44.auth.me();
      if (!user) return connectionsPreview || [];
      
      const rawConnections = await connectionRepository.listConnections(user.id);
      
      // Deduplicate connections by target_user_id (keep the most recent one)
      const connectionMap = new Map();
      for (const conn of rawConnections) {
        const existing = connectionMap.get(conn.target_user_id);
        if (!existing || new Date(conn.created_date) > new Date(existing.created_date)) {
          connectionMap.set(conn.target_user_id, conn);
        }
      }
      const deduplicatedConnections = Array.from(connectionMap.values());
      
      // OPTIMIZED: Use cache preview as fallback for missing data
      const cacheMap = new Map();
      (connectionsPreview || []).forEach(cp => {
        cacheMap.set(cp.id, cp);
      });
      
      // Only enrich connections missing data AND not in cache
      const connectionsNeedingEnrichment = deduplicatedConnections.filter(conn => {
        const cached = cacheMap.get(conn.id);
        if (cached?.avatar_url || cached?.slug) return false;
        return !conn.target_avatar || !conn.target_slug;
      });
      
      // If no enrichment needed, merge with cache data and return
      if (connectionsNeedingEnrichment.length === 0) {
        return deduplicatedConnections.map(conn => {
          const cached = cacheMap.get(conn.id);
          return {
            ...conn,
            target_avatar: conn.target_avatar || cached?.avatar_url || null,
            target_slug: conn.target_slug || cached?.slug || null,
            target_name: conn.target_name || cached?.display_name || null
          };
        });
      }
      
      // Batch fetch profiles for connections needing enrichment (limit to 5 to reduce load)
      const userIdsToFetch = connectionsNeedingEnrichment.slice(0, 5).map(c => c.target_user_id);
      const profileMap = new Map();
      
      await Promise.all(
        userIdsToFetch.map(async (userId) => {
          try {
            const profiles = await base44.entities.EcardProfile.filter({ user_id: userId });
            if (profiles.length > 0) {
              profileMap.set(userId, profiles[0]);
            }
          } catch {
            // Ignore individual fetch errors
          }
        })
      );
      
      // Enrich connections with fetched profile data + cache data
      const enrichedConnections = deduplicatedConnections.map(conn => {
        const profile = profileMap.get(conn.target_user_id);
        const cached = cacheMap.get(conn.id);
        
        // 3-tier fallback for each field
        const avatar = conn.target_avatar || profile?.profile_image_url || cached?.avatar_url || null;
        const slug = conn.target_slug || profile?.public_url_slug || cached?.slug || null;
        const name = conn.target_name || 
                     profile?.display_name || 
                     cached?.display_name || 
                     conn.target_email?.split('@')[0] || 
                     'Người dùng';
        
        // Update connection in background (non-blocking) - INCLUDING target_name
        if (profile || !conn.target_name) {
          const updates = {};
          if (!conn.target_avatar && profile?.profile_image_url) {
            updates.target_avatar = profile.profile_image_url;
          }
          if (!conn.target_slug && profile?.public_url_slug) {
            updates.target_slug = profile.public_url_slug;
          }
          if (!conn.target_name) {
            // Fix Unknown connections
            updates.target_name = profile?.display_name || 
                                  cached?.display_name || 
                                  conn.target_email?.split('@')[0] || 
                                  'Người dùng';
          }
          if (Object.keys(updates).length > 0) {
            base44.entities.UserConnection.update(conn.id, updates).catch(() => {});
          }
        }
        
        return {
          ...conn,
          target_avatar: avatar,
          target_slug: slug,
          target_name: name
        };
      });
      
      return enrichedConnections;
    },
    // Use cache preview as initial data for instant render
    initialData: () => {
      if (connectionsPreview?.length > 0) {
        return connectionsPreview.map(cp => ({
          id: cp.id,
          target_user_email: cp.target_user_email,
          target_avatar: cp.avatar_url,
          target_slug: cp.slug,
          target_name: cp.display_name,
          care_level: cp.care_level,
          created_date: cp.connected_at
        }));
      }
      return undefined;
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: false,
    throwOnError: false
  });

  const connectByQrMutation = useMutation({
    mutationFn: async (targetSlug) => {
      // Check auth first
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) {
        throw new Error('NOT_AUTHENTICATED');
      }
      
      const user = await base44.auth.me();
      if (!user) {
        throw new Error('NOT_AUTHENTICATED');
      }
      
      let targetProfile;
      try {
        targetProfile = await ecardRepository.getProfileBySlug(targetSlug);
      } catch (err) {
        console.error('Failed to get target profile:', err);
        throw new Error('Không tìm thấy hồ sơ người dùng');
      }
      
      // Check self-connection
      if (user.id === targetProfile.user_id) {
        throw new Error('SELF_CONNECTION');
      }
      
      return connectionRepository.createBidirectionalConnection(user.id, targetProfile);
    },
    onSuccess: (result) => {
      // Optimistic update cache
      if (result.isNew && result.connection) {
        onConnectionAdded({
          id: result.connection.id,
          target_user_email: result.connection.target_user_email,
          display_name: result.connection.target_name,
          avatar_url: result.connection.target_avatar,
          slug: result.connection.target_slug,
          care_level: result.connection.care_level || 'normal',
          connected_at: result.connection.created_date
        });
      }
      
      // Invalidate queries for full refresh
      queryClient.invalidateQueries({ queryKey: ['userConnections'] });
      queryClient.invalidateQueries({ queryKey: ['ecard-cache'] });
      
      if (result.isNew) {
        addToast('Đã kết nối thành công!', 'success');
      } else {
        addToast('Đã kết nối trước đó', 'info');
      }
    },
    onError: (error) => {
      if (error.message === 'NOT_AUTHENTICATED') {
        // Don't show toast - let UI handle redirect
        return;
      }
      if (error.message === 'SELF_CONNECTION') {
        addToast('Không thể kết nối với chính mình', 'warning');
        return;
      }
      addToast('Không thể kết nối', 'error');
    }
  });

  const updateCareLevelMutation = useMutation({
    mutationFn: ({ connectionId, newLevel }) => 
      connectionRepository.updateCareLevel(connectionId, newLevel),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userConnections'] });
      addToast('Đã cập nhật mức chăm sóc', 'success');
    },
    onError: () => {
      addToast('Không thể cập nhật', 'error');
    }
  });

  // Connect with auth check - returns promise for better control
  const connectByQrWithAuth = async (targetSlug) => {
    const isAuth = await base44.auth.isAuthenticated();
    if (!isAuth) {
      return { success: false, reason: 'NOT_AUTHENTICATED' };
    }
    
    try {
      const result = await connectByQrMutation.mutateAsync(targetSlug);
      return { success: true, result };
    } catch (error) {
      return { success: false, reason: error.message };
    }
  };

  return {
    connections,
    isLoading,
    refetch,
    connectByQr: connectByQrMutation.mutate,
    connectByQrWithAuth,
    updateCareLevel: updateCareLevelMutation.mutate,
    isConnecting: connectByQrMutation.isPending,
    connectError: connectByQrMutation.error
  };
}

export function useConnectionRequests() {
  const queryClient = useQueryClient();
  const { addToast } = useSafeToast();

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['connectionRequests'],
    queryFn: async () => {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) return [];
      
      const user = await base44.auth.me();
      if (!user) return [];
      
      return base44.entities.UserConnection.filter({
        target_user_id: user.id,
        status: 'pending'
      });
    },
    retry: false,
    throwOnError: false
  });

  const acceptMutation = useMutation({
    mutationFn: (connectionId) => connectionRepository.acceptRequest(connectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connectionRequests'] });
      queryClient.invalidateQueries({ queryKey: ['userConnections'] });
      addToast('Đã chấp nhận kết nối', 'success');
    }
  });

  return {
    requests,
    isLoading,
    acceptRequest: acceptMutation.mutate
  };
}