/**
 * System Event Handler - System domain
 * 
 * Handles: system.maintenance, system.alert, system.feature_announcement
 */

import { notificationEngine } from '../../../core/notificationEngine';
import { SystemEvents } from '../../../types/EventTypes';
import { createPageUrl } from '@/utils';

/**
 * Handle system maintenance notification
 */
export const handleMaintenance = async (payload) => {
  const { startTime, endTime, message, affectedServices } = payload;

  console.log('🔧 [SystemEventHandler] system.maintenance');

  const formattedStart = new Date(startTime).toLocaleString('vi-VN');
  const formattedEnd = endTime ? new Date(endTime).toLocaleString('vi-VN') : 'Chưa xác định';

  // Admin notification
  await notificationEngine.create({
    actor: 'admin',
    type: 'system_maintenance',
    recipients: null,
    payload: {
      title: '🔧 Bảo Trì Hệ Thống',
      message: message || `Hệ thống sẽ bảo trì từ ${formattedStart} đến ${formattedEnd}`,
      link: null,
      priority: 'urgent',
      metadata: {
        start_time: startTime,
        end_time: endTime,
        affected_services: affectedServices
      }
    }
  });
};

/**
 * Handle system alert
 */
export const handleSystemAlert = async (payload) => {
  const { title, message, severity, link } = payload;

  console.log('🚨 [SystemEventHandler] system.alert:', severity);

  const priority = severity === 'critical' ? 'urgent' : 
                   severity === 'high' ? 'high' : 'normal';

  // Admin notification
  await notificationEngine.create({
    actor: 'admin',
    type: 'system_alert',
    recipients: null,
    payload: {
      title: `🚨 ${title || 'Cảnh Báo Hệ Thống'}`,
      message: message || 'Có vấn đề cần chú ý',
      link,
      priority,
      metadata: {
        severity,
        alert_type: 'system'
      }
    }
  });
};

/**
 * Handle feature announcement
 */
export const handleFeatureAnnouncement = async (payload) => {
  const { title, message, featureName, link, targetUsers } = payload;

  console.log('✨ [SystemEventHandler] system.feature_announcement:', featureName);

  // Broadcast to users
  await notificationEngine.create({
    actor: 'client',
    type: 'system',
    recipients: targetUsers || null, // null = broadcast
    payload: {
      title: `✨ ${title || 'Tính Năng Mới!'}`,
      message: message || `Khám phá tính năng mới: ${featureName}`,
      link: link || createPageUrl('Home'),
      priority: 'normal',
      metadata: {
        feature_name: featureName,
        announcement_type: 'feature'
      }
    }
  });

  // Admin notification
  await notificationEngine.create({
    actor: 'admin',
    type: 'feature_announcement_sent',
    recipients: null,
    payload: {
      title: '📢 Đã Gửi Thông Báo Tính Năng',
      message: `Thông báo "${title}" đã được gửi${targetUsers ? ` đến ${targetUsers.length} người dùng` : ' (broadcast)'}`,
      link: createPageUrl('AdminNotifications'),
      priority: 'low',
      metadata: {
        feature_name: featureName,
        target_count: targetUsers?.length || 'all'
      }
    }
  });
};

/**
 * Register all system event handlers
 */
export const registerSystemHandlers = (registry) => {
  registry.register(SystemEvents.MAINTENANCE, handleMaintenance, { priority: 10 });
  registry.register(SystemEvents.ALERT, handleSystemAlert, { priority: 10 });
  registry.register(SystemEvents.FEATURE_ANNOUNCEMENT, handleFeatureAnnouncement, { priority: 5 });
  
  console.log('✅ System event handlers registered');
};

export default {
  handleMaintenance,
  handleSystemAlert,
  handleFeatureAnnouncement,
  registerSystemHandlers
};