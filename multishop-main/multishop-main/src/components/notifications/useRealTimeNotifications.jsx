/**
 * @deprecated since v2.0.0
 * 
 * ⚠️ This file is deprecated and will be removed in future versions.
 * 
 * Migration:
 * ```
 * // OLD:
 * import { useRealTimeNotifications } from '@/components/notifications/useRealTimeNotifications';
 * 
 * // NEW:
 * import { useClientNotifications, useAdminNotifications } from '@/components/features/notification';
 * ```
 * 
 * See: components/features/notification/README.md
 * 
 * 🔄 Real-Time Notifications Hook
 * 
 * Quản lý notification với real-time sync, no lag, no delay
 */

// @deprecated - Use useClientNotifications or useAdminNotifications from @/components/features/notification instead

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useEffect, useRef, useCallback, useState } from 'react';

export function useRealTimeNotifications(userEmail, options = {}) {
  const {
    enabled = true,
    isAdmin = false,
    refetchInterval = isAdmin ? 1500 : 5000, // ⚡ Admin: 1.5s, User: 5s
    maxNotifications = 50
  } = options;

  const queryClient = useQueryClient();
  const audioRef = useRef(null);
  const previousCountRef = useRef(0);
  const [soundEnabled, setSoundEnabled] = useState(false); // ✅ Default: OFF
  const [customSoundUrl, setCustomSoundUrl] = useState(null);

  // ✅ Load sound config from PlatformConfig (for admin)
  useEffect(() => {
    if (!isAdmin) return;

    const loadSoundConfig = async () => {
      try {
        const configs = await base44.entities.PlatformConfig.list('-created_date', 100);
        const soundConfig = configs.find(c => c.config_key === 'notification_sound_settings');
        
        if (soundConfig) {
          const parsed = JSON.parse(soundConfig.config_value);
          setSoundEnabled(parsed.enabled || false);
          setCustomSoundUrl(parsed.sound_url || null);
        }
      } catch (error) {
        console.log('No sound config found');
      }
    };

    loadSoundConfig();
  }, [isAdmin]);

  // Query key
  const queryKey = isAdmin 
    ? ['admin-notifications-realtime', userEmail]
    : ['user-notifications-realtime', userEmail];

  // Fetch notifications
  const { data: notifications = [], isLoading, error } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!userEmail) {
        console.log('❌ No userEmail provided');
        return [];
      }
      
      console.log(`🔍 Fetching notifications for ${isAdmin ? 'ADMIN' : 'USER'}: ${userEmail}`);
      
      const entityName = isAdmin ? 'AdminNotification' : 'Notification';
      
      try {
        // ✅ Try service role first for admin
        let all = [];
        if (isAdmin) {
          try {
            all = await base44.asServiceRole.entities[entityName].list('-created_date', maxNotifications);
            console.log(`📊 Service role - Fetched ${all.length} ${entityName} records`);
          } catch (serviceError) {
            console.warn('⚠️ Service role failed, trying regular:', serviceError.message);
            all = await base44.entities[entityName].list('-created_date', maxNotifications);
            console.log(`📊 Regular - Fetched ${all.length} ${entityName} records`);
          }
        } else {
          all = await base44.entities[entityName].list('-created_date', maxNotifications);
          console.log(`📊 Fetched ${all.length} user notifications`);
        }
        
        let filtered = [];
        if (isAdmin) {
          // Admin: get all notifications for this admin (null recipient OR matching email)
          filtered = all.filter(n => !n.recipient_email || n.recipient_email === userEmail);
          console.log(`✅ Admin filtered: ${filtered.length} notifications (from ${all.length} total)`);
          console.log('📋 Sample notifications:', filtered.slice(0, 3).map(n => ({ 
            id: n.id, 
            type: n.type, 
            recipient: n.recipient_email, 
            title: n.title 
          })));
        } else {
          // User: get only their notifications
          filtered = all.filter(n => n.recipient_email === userEmail);
          console.log(`✅ User filtered: ${filtered.length} notifications for ${userEmail}`);
        }
        
        return filtered;
      } catch (error) {
        console.error(`❌ Failed to fetch ${entityName}:`, error.message);
        return [];
      }
    },
    enabled: enabled && !!userEmail,
    staleTime: 0, // ✅ Always fresh
    refetchInterval: 2000, // ✅ Aggressive polling every 2 seconds
    refetchIntervalInBackground: true, // ✅ Poll even when tab inactive
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true
  });

  // Unread count
  const unreadCount = notifications.filter(n => !n.is_read).length;

  // ✅ Initialize audio with custom URL  
  useEffect(() => {
    if (!soundEnabled) {
      audioRef.current = null;
      return;
    }

    if (customSoundUrl) {
      audioRef.current = new Audio(customSoundUrl);
    } else {
      // Gentle default sound (only if enabled)
      audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZSA0PVqvn77BdGAg+ltryxm8jBS6Azvj');
    }
  }, [soundEnabled, customSoundUrl]);

  // Play sound on new notification
  useEffect(() => {
    if (unreadCount > previousCountRef.current) {
      // New notification arrived
      console.log(`🔔 New notification detected! Count: ${previousCountRef.current} → ${unreadCount}`);

      // ✅ Play sound only if enabled
      if (soundEnabled && audioRef.current && document.hasFocus()) {
        console.log('🔊 Playing notification sound...');
        audioRef.current.play().catch(err => {
          console.log('Audio play blocked:', err.message);
        });
      } else {
        console.log('🔇 Sound disabled or no focus');
      }
      
      // Show browser notification if not focused
      if ('Notification' in window && Notification.permission === 'granted' && !document.hasFocus()) {
        const latestNotification = notifications.find(n => !n.is_read);
        if (latestNotification) {
          console.log('📱 Showing browser notification');
          new Notification(latestNotification.title || 'Thông báo mới', {
            body: latestNotification.message,
            icon: '/logo.png',
            badge: '/logo.png',
            tag: latestNotification.id
          });
        }
      }
    }

    previousCountRef.current = unreadCount;
  }, [unreadCount, notifications, soundEnabled]);

  // Mark as read
  const markAsRead = useCallback(async (notificationId) => {
    const entityName = isAdmin ? 'AdminNotification' : 'Notification';
    
    // ✅ OPTIMISTIC UPDATE FIRST - Instant UI feedback
    queryClient.setQueryData(queryKey, (old) =>
      old?.map(n => n.id === notificationId ? { ...n, is_read: true, read_date: new Date().toISOString() } : n) || []
    );

    try {
      // ✅ Then sync to DB
      await base44.entities[entityName].update(notificationId, {
        is_read: true,
        read_date: new Date().toISOString()
      });

      console.log('✅ Notification marked as read:', notificationId);
    } catch (error) {
      console.error('❌ Failed to mark notification as read:', error);
      // Rollback optimistic update on error
      queryClient.invalidateQueries({ queryKey });
    }
  }, [isAdmin, queryClient, queryKey]);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    const entityName = isAdmin ? 'AdminNotification' : 'Notification';
    const unreadNotifications = notifications.filter(n => !n.is_read);

    if (unreadNotifications.length === 0) return;

    try {
      await Promise.all(
        unreadNotifications.map(n =>
          base44.entities[entityName].update(n.id, {
            is_read: true,
            read_date: new Date().toISOString()
          })
        )
      );

      // Invalidate to refresh
      queryClient.invalidateQueries({ queryKey });
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  }, [isAdmin, notifications, queryClient, queryKey]);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  }, []);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    requestPermission,
    hasNotificationPermission: 'Notification' in window && Notification.permission === 'granted'
  };
}

export default useRealTimeNotifications;