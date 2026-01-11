/**
 * Notification Digest Rules - Domain Logic
 * NOTIF-F06: Smart Notification Batching & Digest
 */

// Notification types that should ALWAYS be sent immediately (bypass digest)
export const CRITICAL_NOTIFICATION_TYPES = [
  // Payment critical
  'payment_failed',
  'payment_verification_needed',
  'refund_request',
  'refund_processed',
  
  // Order critical  
  'order_cancelled',
  'order_delivered',
  
  // Security
  'security_alert',
  'password_changed',
  'login_new_device',
  
  // Account
  'account_suspended',
  'account_verified',
  
  // System critical
  'system_maintenance',
  'urgent_action_required'
];

// Notification type grouping for digest summary
export const NOTIFICATION_TYPE_GROUPS = {
  orders: {
    label: '🛍️ Đơn hàng',
    types: ['new_order', 'order_confirmed', 'order_processing', 'order_shipping', 'order_status_change']
  },
  payments: {
    label: '💳 Thanh toán',
    types: ['payment_received', 'payment_success', 'deposit_received', 'deposit_paid']
  },
  social: {
    label: '🤝 Kết nối & Tin nhắn',
    types: ['new_connection', 'new_message', 'connection_request', 'profile_view']
  },
  gifts: {
    label: '🎁 Quà tặng',
    types: ['gift', 'gift_received', 'gift_sent', 'gift_redeemed']
  },
  reviews: {
    label: '⭐ Đánh giá',
    types: ['new_review', 'review_response', 'review_helpful']
  },
  referral: {
    label: '👥 Giới thiệu',
    types: ['new_referral', 'referral_commission', 'referral_member_approved']
  },
  community: {
    label: '📝 Cộng đồng',
    types: ['new_comment', 'new_like', 'new_follow', 'post_featured']
  },
  system: {
    label: '🔔 Hệ thống',
    types: ['system', 'reminder', 'announcement']
  }
};

/**
 * Check if notification type should bypass digest
 */
export function shouldBypassDigest(notificationType, priority) {
  // Critical types always bypass
  if (CRITICAL_NOTIFICATION_TYPES.includes(notificationType)) {
    return true;
  }
  
  // Urgent priority always bypasses
  if (priority === 'urgent' || priority === 'critical') {
    return true;
  }
  
  return false;
}

/**
 * Get notification group for a type
 */
export function getNotificationGroup(type) {
  for (const [groupKey, group] of Object.entries(NOTIFICATION_TYPE_GROUPS)) {
    if (group.types.includes(type)) {
      return { key: groupKey, ...group };
    }
  }
  return { key: 'other', label: '📌 Khác', types: [] };
}

/**
 * Group notifications by type for digest summary
 */
export function groupNotificationsForDigest(notifications) {
  const grouped = {};
  
  for (const notif of notifications) {
    const group = getNotificationGroup(notif.type);
    
    if (!grouped[group.key]) {
      grouped[group.key] = {
        type: group.key,
        label: group.label,
        count: 0,
        notifications: [],
        sample_titles: []
      };
    }
    
    grouped[group.key].count++;
    grouped[group.key].notifications.push(notif);
    
    // Keep up to 3 sample titles
    if (grouped[group.key].sample_titles.length < 3) {
      grouped[group.key].sample_titles.push(notif.title);
    }
  }
  
  // Convert to array and sort by count desc
  return Object.values(grouped)
    .sort((a, b) => b.count - a.count);
}

/**
 * Calculate next digest time based on user preference
 */
export function calculateNextDigestTime(preference) {
  const now = new Date();
  const frequency = preference?.digest_frequency || 'daily';
  const digestTime = preference?.digest_time || '09:00';
  const digestDay = preference?.digest_day || 1;
  
  const [hours, minutes] = digestTime.split(':').map(Number);
  
  switch (frequency) {
    case 'hourly': {
      // Next hour
      const next = new Date(now);
      next.setHours(next.getHours() + 1, 0, 0, 0);
      return next;
    }
    
    case 'daily': {
      // Today at digest_time or tomorrow if already passed
      const next = new Date(now);
      next.setHours(hours, minutes, 0, 0);
      
      if (next <= now) {
        next.setDate(next.getDate() + 1);
      }
      return next;
    }
    
    case 'weekly': {
      // Next occurrence of digest_day at digest_time
      const next = new Date(now);
      const currentDay = next.getDay();
      let daysToAdd = digestDay - currentDay;
      
      if (daysToAdd < 0 || (daysToAdd === 0 && now.getHours() >= hours)) {
        daysToAdd += 7;
      }
      
      next.setDate(next.getDate() + daysToAdd);
      next.setHours(hours, minutes, 0, 0);
      return next;
    }
    
    default:
      return null; // realtime - no digest
  }
}

/**
 * Check if user should receive digest based on preference
 */
export function shouldReceiveDigest(preference, notificationType) {
  if (!preference?.digest_enabled) {
    return false;
  }
  
  if (preference?.digest_frequency === 'realtime') {
    return false;
  }
  
  // Check muted types
  if (preference?.muted_types?.includes(notificationType)) {
    return false;
  }
  
  // Check channel preferences
  const group = getNotificationGroup(notificationType);
  const channelPref = preference?.channel_preferences?.[group.key];
  
  if (channelPref === 'off') {
    return false;
  }
  
  if (channelPref === 'realtime') {
    return false;
  }
  
  return true;
}

/**
 * Get digest summary text
 */
export function getDigestSummaryText(groupedSummary) {
  if (!groupedSummary?.length) {
    return 'Không có thông báo mới';
  }
  
  const totalCount = groupedSummary.reduce((sum, g) => sum + g.count, 0);
  const topGroups = groupedSummary.slice(0, 3);
  
  const parts = topGroups.map(g => `${g.count} ${g.label.replace(/^[^\s]+\s/, '')}`);
  
  if (groupedSummary.length > 3) {
    const otherCount = groupedSummary.slice(3).reduce((sum, g) => sum + g.count, 0);
    parts.push(`${otherCount} khác`);
  }
  
  return `Bạn có ${totalCount} thông báo: ${parts.join(', ')}`;
}

export default {
  CRITICAL_NOTIFICATION_TYPES,
  NOTIFICATION_TYPE_GROUPS,
  shouldBypassDigest,
  getNotificationGroup,
  groupNotificationsForDigest,
  calculateNextDigestTime,
  shouldReceiveDigest,
  getDigestSummaryText
};