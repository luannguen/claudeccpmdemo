/**
 * Notification Bell Base Component - v2.0
 * Click to open full modal directly (not dropdown)
 * Simple bell icon with badge
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Bell } from 'lucide-react';

export function NotificationBellBase({
  unreadCount = 0,
  urgentCount = 0,
  isLoading = false,
  onOpenFullModal,
  theme = 'default',
  className = ''
}) {
  const bellClass = theme === 'admin' 
    ? 'p-2 hover:bg-white/10 rounded-lg transition-colors'
    : 'w-10 h-10 rounded-full bg-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center';

  const handleClick = () => {
    if (onOpenFullModal) {
      onOpenFullModal();
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Bell Button - Opens modal directly */}
      <button
        onClick={handleClick}
        className={bellClass}
        aria-label="Notifications"
      >
        <Bell className={`w-6 h-6 ${
          urgentCount > 0 ? 'text-red-400 animate-bounce' : 
          theme === 'admin' ? 'text-gray-300' : 
          'text-gray-700'
        }`} />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full text-xs font-bold flex items-center justify-center text-white ${
              urgentCount > 0 ? 'bg-red-500 animate-pulse' : 'bg-blue-500'
            }`}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
      </button>
    </div>
  );
}

export default NotificationBellBase;