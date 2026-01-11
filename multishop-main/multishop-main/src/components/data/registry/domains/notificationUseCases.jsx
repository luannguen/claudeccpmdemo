/**
 * Notification Domain Use Cases
 */

export const notificationUseCases = [
  {
    id: 'notification.listForUser',
    domain: 'notification',
    description: 'Thông báo của user',
    input: 'string (email)',
    output: 'Result<NotificationDTO[]>',
    service: 'notificationRepository.listForUser',
    hook: 'useRealTimeNotifications',
    component: 'NotificationBell'
  },
  {
    id: 'notification.markAsRead',
    domain: 'notification',
    description: 'Đánh dấu đã đọc',
    input: 'string (id)',
    output: 'Result<void>',
    service: 'notificationRepository.markAsRead',
    hook: 'useNotificationActions',
    component: 'NotificationModal'
  },
  {
    id: 'notification.adminList',
    domain: 'notification',
    description: 'Thông báo admin',
    input: 'void',
    output: 'Result<AdminNotificationDTO[]>',
    service: 'adminNotificationRepository.listAll',
    hook: 'useAdminNotifications',
    component: 'AdminNotificationBell'
  },
  {
    id: 'notification.create',
    domain: 'notification',
    description: 'Tạo thông báo',
    input: 'NotificationCreateDTO',
    output: 'Result<NotificationDTO>',
    service: 'notificationRepository.createNotification',
    hook: 'useCreateNotification',
    component: 'NotificationService'
  }
];