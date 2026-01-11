/**
 * BirthdayWidget - Shows upcoming birthdays
 * UI Layer - Presentation only
 * 
 * @module features/ecard/ui
 */

import React from 'react';
import { Icon } from '@/components/ui/AnimatedIcon';
import { useBirthdayReminders } from '../hooks/useBirthdayReminders';
import { motion, AnimatePresence } from 'framer-motion';

export default function BirthdayWidget({ onSendWish, maxItems = 5 }) {
  const { upcomingBirthdays, todayBirthdays, isLoading, hasTodayBirthdays } = useBirthdayReminders(7);

  if (isLoading) {
    return null;
  }

  if (upcomingBirthdays.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-4 border border-pink-100"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
          <Icon.Gift size={16} className="text-pink-600" />
        </div>
        <h4 className="font-semibold text-gray-900">Sinh nhật sắp tới</h4>
        {hasTodayBirthdays && (
          <span className="px-2 py-0.5 bg-pink-500 text-white text-xs rounded-full animate-pulse">
            Hôm nay!
          </span>
        )}
      </div>

      <div className="space-y-2">
        <AnimatePresence>
          {upcomingBirthdays.slice(0, maxItems).map((conn, idx) => (
            <motion.div
              key={conn.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-center justify-between p-2 bg-white rounded-lg"
            >
              <div className="flex items-center gap-3">
                {conn.target_avatar ? (
                  <img
                    src={conn.target_avatar}
                    alt={conn.target_name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-400 flex items-center justify-center text-white text-sm font-bold">
                    {conn.target_name?.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900 text-sm">{conn.target_name}</p>
                  <p className="text-xs text-gray-500">
                    {conn.days_until_birthday === 0
                      ? '🎂 Hôm nay!'
                      : conn.days_until_birthday === 1
                        ? '🎁 Ngày mai'
                        : `${conn.days_until_birthday} ngày nữa`
                    }
                  </p>
                </div>
              </div>

              <button
                onClick={() => onSendWish?.(conn)}
                className="px-3 py-1.5 bg-pink-100 text-pink-600 rounded-lg text-xs font-medium hover:bg-pink-200 transition-colors flex items-center gap-1"
              >
                <Icon.Gift size={12} />
                Chúc mừng
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {upcomingBirthdays.length > maxItems && (
          <p className="text-xs text-gray-500 text-center pt-1">
            +{upcomingBirthdays.length - maxItems} sinh nhật khác
          </p>
        )}
      </div>
    </motion.div>
  );
}

/**
 * Compact birthday badge for ConnectionCard
 */
export function BirthdayBadge({ connection, onClick }) {
  if (!connection.target_birthday) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const birthday = new Date(connection.target_birthday);
  const thisYear = new Date(
    today.getFullYear(),
    birthday.getMonth(),
    birthday.getDate()
  );

  if (thisYear < today) {
    thisYear.setFullYear(today.getFullYear() + 1);
  }

  const daysUntil = Math.ceil((thisYear - today) / (1000 * 60 * 60 * 24));

  if (daysUntil > 7) return null;

  const isToday = daysUntil === 0;

  return (
    <button
      onClick={onClick}
      className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 transition-colors ${
        isToday
          ? 'bg-pink-500 text-white animate-pulse'
          : 'bg-pink-100 text-pink-600 hover:bg-pink-200'
      }`}
    >
      🎂
      {isToday ? 'Hôm nay!' : `${daysUntil} ngày`}
    </button>
  );
}