import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Heart, MessageCircle, UserPlus, Award, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const NOTIFICATION_ICONS = {
  like: Heart,
  comment: MessageCircle,
  mention: MessageCircle,
  follow: UserPlus,
  reply: MessageCircle,
  achievement: Award
};

export default function NotificationBell({ currentUser }) {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', currentUser?.email],
    queryFn: async () => {
      if (!currentUser) return [];
      const all = await base44.entities.Notification.list('-created_date', 50);
      return all.filter(n => n.recipient_email === currentUser.email);
    },
    enabled: !!currentUser,
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id) => base44.entities.Notification.update(id, { is_read: true }),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
    }
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleNotificationClick = (notification) => {
    if (!notification.is_read) {
      markAsReadMutation.mutate(notification.id);
    }
    if (notification.link) {
      window.location.href = notification.link;
    }
  };

  if (!currentUser) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-10 h-10 rounded-full bg-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
      >
        <Bell className="w-5 h-5 text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs font-bold flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute right-0 top-12 w-80 md:w-96 bg-white rounded-2xl shadow-2xl z-50 max-h-[500px] overflow-hidden flex flex-col"
            >
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-bold text-gray-900">Thông báo</h3>
              </div>

              <div className="flex-1 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">Chưa có thông báo</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {notifications.map((notification) => {
                      const Icon = NOTIFICATION_ICONS[notification.type] || Bell;
                      return (
                        <button
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification)}
                          className={`w-full p-4 hover:bg-gray-50 transition-colors text-left ${
                            !notification.is_read ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="flex gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                              notification.type === 'like' ? 'bg-red-100' :
                              notification.type === 'comment' ? 'bg-blue-100' :
                              notification.type === 'follow' ? 'bg-green-100' :
                              notification.type === 'achievement' ? 'bg-yellow-100' :
                              'bg-gray-100'
                            }`}>
                              <Icon className={`w-5 h-5 ${
                                notification.type === 'like' ? 'text-red-600' :
                                notification.type === 'comment' ? 'text-blue-600' :
                                notification.type === 'follow' ? 'text-green-600' :
                                notification.type === 'achievement' ? 'text-yellow-600' :
                                'text-gray-600'
                              }`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-900">
                                <strong>{notification.actor_name}</strong> {notification.message}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {formatDistanceToNow(new Date(notification.created_date), { addSuffix: true, locale: vi })}
                              </p>
                            </div>
                            {!notification.is_read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}