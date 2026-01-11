/**
 * Notification Actions Hook
 * Reusable actions for all notification types
 */

import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { actionWorkflow } from '../domain';

export function useNotificationActions(actor, repository, queryKey) {
  const queryClient = useQueryClient();

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
      queryClient.invalidateQueries({ queryKey });
    }
    
    return result;
  }, [notificationId, repository, queryClient, queryKey]);

  const markAsActioned = useCallback(async (notification, actionedBy, actionNote = null) => {
    const updates = await actionWorkflow.markAsActioned(notification, { actionedBy, actionNote });
    
    // Optimistic update
    queryClient.setQueryData(queryKey, (old) =>
      old?.map(n => n.id === notification.id 
        ? { ...n, ...updates } 
        : n
      ) || []
    );

    const result = await repository.update(notification.id, updates);
    
    if (!result.success) {
      queryClient.invalidateQueries({ queryKey });
    }
    
    return result;
  }, [notification, repository, queryClient, queryKey]);

  const deleteNotification = useCallback(async (notificationId) => {
    // Optimistic remove
    queryClient.setQueryData(queryKey, (old) =>
      old?.filter(n => n.id !== notificationId) || []
    );

    const result = await repository.delete(notificationId);
    
    if (!result.success) {
      queryClient.invalidateQueries({ queryKey });
    }
    
    return result;
  }, [notificationId, repository, queryClient, queryKey]);

  const markAllAsRead = useCallback(async (userEmail, tenantId = null) => {
    const result = actor === 'tenant'
      ? await repository.markAllAsRead(tenantId, userEmail)
      : await repository.markAllAsRead(userEmail);
    
    if (result.success) {
      queryClient.invalidateQueries({ queryKey });
    }
    
    return result;
  }, [actor, repository, queryClient, queryKey]);

  return {
    markAsRead,
    markAsActioned,
    deleteNotification,
    markAllAsRead
  };
}

export default useNotificationActions;