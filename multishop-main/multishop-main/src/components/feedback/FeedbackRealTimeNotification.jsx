import React, { useEffect, useRef } from 'react';
import { useFeedbackNotifications } from '@/components/hooks/useFeedbackEnhanced';
import { useToast } from '@/components/NotificationToast';
import { useQueryClient } from '@tanstack/react-query';

export default function FeedbackRealTimeNotification() {
  const { data: notifications } = useFeedbackNotifications();
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const lastNotifiedIdsRef = useRef(new Set());
  const isFirstLoadRef = useRef(true);

  useEffect(() => {
    if (!notifications || notifications.items.length === 0) {
      isFirstLoadRef.current = false;
      return;
    }

    // Skip first load to avoid showing notifications on page load
    if (isFirstLoadRef.current) {
      // Store current IDs but don't notify
      notifications.items.forEach(item => {
        lastNotifiedIdsRef.current.add(item.id);
      });
      isFirstLoadRef.current = false;
      return;
    }

    // Check for new items
    notifications.items.forEach(item => {
      if (!lastNotifiedIdsRef.current.has(item.id) && item.admin_response && !item.user_read_response) {
        lastNotifiedIdsRef.current.add(item.id);
        addToast(
          `🔔 Admin đã phản hồi feedback: "${item.title}"`,
          'success'
        );
        // Refresh feedback list
        queryClient.invalidateQueries({ queryKey: ['my-feedbacks'] });
      }
    });
  }, [notifications, addToast, queryClient]);

  return null; // Silent component
}