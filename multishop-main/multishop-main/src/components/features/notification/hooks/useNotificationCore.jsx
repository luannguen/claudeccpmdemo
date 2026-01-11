/**
 * Core Notification Hook
 * Reusable base hook for all actors
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { notificationRouter, realtimePoller, priorityManager } from '../core';
import { soundPolicy } from '../domain';

export function useNotificationCore({
  actor,
  userEmail,
  tenantId = null,
  pollingInterval = null,
  enabled = true,
  repository
}) {
  const queryClient = useQueryClient();
  const audioRef = useRef(null);
  const previousCountRef = useRef(0);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [customSoundUrl, setCustomSoundUrl] = useState(null);
  const soundConfigLoadedRef = useRef(false);

  // Build query key
  const queryKey = ['notifications', actor, userEmail, tenantId].filter(Boolean);

  // Get base polling config (without notifications dependency)
  const basePollingConfig = realtimePoller.createPollingConfig({ 
    actor, 
    customInterval: pollingInterval 
  });

  // Fetch notifications using repository
  const { data: notifications = [], isLoading, error } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!userEmail && actor !== 'admin') return [];
      
      let result;
      if (actor === 'tenant') {
        result = await repository.listForTenantUser(tenantId, userEmail);
      } else if (actor === 'admin') {
        // Admin repository uses listForAdmin method
        result = repository.listForAdmin 
          ? await repository.listForAdmin(userEmail)
          : await repository.listForUser(userEmail);
      } else {
        result = await repository.listForUser(userEmail);
      }
      
      if (!result.success) {
        console.error('Failed to fetch notifications:', result.message);
        return [];
      }
      
      return result.data;
    },
    enabled: enabled && (!!userEmail || actor === 'admin'),
    ...basePollingConfig
  });

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.is_read).length;

  // Sound effect on new notifications
  useEffect(() => {
    if (unreadCount > previousCountRef.current && soundEnabled) {
      console.log('🔔 New notifications detected:', unreadCount, '> previous:', previousCountRef.current);
      
      // Play sound for ANY new notification when sound is enabled
      if (audioRef.current) {
        console.log('🔊 Attempting to play sound...');
        audioRef.current.currentTime = 0; // Reset to start
        audioRef.current.play()
          .then(() => console.log('✅ Sound played successfully'))
          .catch(err => console.log('⚠️ Audio play blocked:', err.message));
      } else {
        console.log('❌ No audio element available');
      }
      
      // Browser notification
      const newNotifs = notifications.filter(n => !n.is_read);
      if ('Notification' in window && Notification.permission === 'granted' && !document.hasFocus()) {
        const latestNotif = newNotifs[0];
        if (latestNotif && priorityManager.shouldShowBrowserNotification(latestNotif)) {
          new Notification(latestNotif.title, {
            body: latestNotif.message,
            icon: '/logo.png',
            tag: latestNotif.id
          });
        }
      }
    }
    
    previousCountRef.current = unreadCount;
  }, [unreadCount, soundEnabled, notifications]);

  // Load sound settings from PlatformConfig (with retry and debounce)
  useEffect(() => {
    const loadSoundConfig = async () => {
      if (soundConfigLoadedRef.current) return;
      
      try {
        const configs = await base44.entities.PlatformConfig.filter(
          { config_key: 'notification_sound_settings' },
          '-created_date',
          1
        );
        const config = configs?.[0];
        
        if (config) {
          const parsed = JSON.parse(config.config_value);
          setSoundEnabled(parsed.enabled || false);
          setCustomSoundUrl(parsed.sound_url || null);
          soundConfigLoadedRef.current = true;
        }
      } catch (error) {
        // Silent fail - don't spam console on rate limit
        if (!error.message?.includes('Rate limit')) {
          console.error('Failed to load sound config:', error);
        }
      }
    };
    
    // Delay load by 2 seconds to reduce initial burst of API calls
    const timeoutId = setTimeout(loadSoundConfig, 2000);
    return () => clearTimeout(timeoutId);
  }, []);

  // Initialize audio with custom sound URL
  useEffect(() => {
    if (!soundEnabled) {
      audioRef.current = null;
      return;
    }
    
    // Use custom sound URL from settings, or fallback to default
    const soundUrl = customSoundUrl || soundPolicy.DEFAULT_SOUNDS.high;
    
    if (soundUrl) {
      audioRef.current = new Audio(soundUrl);
      audioRef.current.volume = 0.6;
      console.log('🔊 Audio initialized with URL:', soundUrl);
    }
  }, [soundEnabled, customSoundUrl]);

  // Mark as read
  const markAsRead = useCallback(async (notificationId) => {
    // Optimistic update
    queryClient.setQueryData(queryKey, (old) =>
      old?.map(n => n.id === notificationId 
        ? { ...n, is_read: true, read_date: new Date().toISOString() } 
        : n
      ) || []
    );

    const result = await repository.markAsRead(notificationId);
    if (!result.success) {
      // Rollback on error
      queryClient.invalidateQueries({ queryKey });
    }
  }, [repository, queryClient, queryKey]);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    const result = actor === 'tenant'
      ? await repository.markAllAsRead(tenantId, userEmail)
      : await repository.markAllAsRead(userEmail);
    
    if (result.success) {
      queryClient.invalidateQueries({ queryKey });
    }
  }, [actor, repository, userEmail, tenantId, queryClient, queryKey]);

  // Request browser notification permission
  const requestPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  }, []);

  return {
    notifications: priorityManager.sortByPriority(notifications),
    unreadCount,
    urgentCount: priorityManager.getUrgentNotifications(notifications).length,
    pendingActions: notifications.filter(n => n.requires_action && !n.is_read),
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    requestPermission,
    soundEnabled,
    setSoundEnabled,
    hasNotificationPermission: 'Notification' in window && Notification.permission === 'granted'
  };
}

export default useNotificationCore;