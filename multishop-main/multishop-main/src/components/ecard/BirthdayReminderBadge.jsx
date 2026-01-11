/**
 * BirthdayReminderBadge - Hiển thị reminder sinh nhật cho connection
 * UI Component
 */

import React from 'react';
import { Icon } from '@/components/ui/AnimatedIcon';

export default function BirthdayReminderBadge({ connection }) {
  if (!connection.birthday) return null;

  const birthday = new Date(connection.birthday);
  const today = new Date();
  
  // Check if birthday is coming (within 7 days)
  const daysUntilBirthday = Math.ceil(
    (new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate()) - today) / (1000 * 60 * 60 * 24)
  );

  const isUpcoming = daysUntilBirthday >= 0 && daysUntilBirthday <= 7;
  const isToday = daysUntilBirthday === 0;

  if (!isUpcoming) return null;

  return (
    <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
      isToday 
        ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white animate-pulse'
        : 'bg-pink-100 text-pink-700'
    }`}>
      <Icon.Gift size={12} />
      {isToday ? '🎉 Sinh nhật hôm nay!' : `🎂 Còn ${daysUntilBirthday} ngày`}
    </div>
  );
}