/**
 * Action Workflow
 * Manages notification action lifecycle
 */

/**
 * Mark notification as actioned
 */
export const markAsActioned = async (notification, { actionedBy, actionNote = null }) => {
  const updates = {
    is_read: true,
    read_date: new Date().toISOString(),
    metadata: {
      ...(notification.metadata || {}),
      actioned: true,
      actioned_by: actionedBy,
      actioned_date: new Date().toISOString(),
      action_note: actionNote
    }
  };
  
  return updates;
};

/**
 * Check if notification requires action
 */
export const requiresAction = (notification) => {
  return notification.requires_action === true && !notification.is_read;
};

/**
 * Get pending action notifications
 */
export const getPendingActions = (notifications) => {
  return notifications.filter(requiresAction);
};

/**
 * Get actioned notifications
 */
export const getActionedNotifications = (notifications) => {
  return notifications.filter(n => n.metadata?.actioned === true);
};

/**
 * Track action completion
 */
export const trackActionCompletion = (notification, result) => {
  return {
    notification_id: notification.id,
    notification_type: notification.type,
    actioned_date: new Date().toISOString(),
    result: result, // 'success' | 'failed' | 'skipped'
    metadata: notification.metadata
  };
};

export const actionWorkflow = {
  markAsActioned,
  requiresAction,
  getPendingActions,
  getActionedNotifications,
  trackActionCompletion
};

export default actionWorkflow;