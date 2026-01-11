/**
 * Birthday Repository
 * Data layer - Birthday-related queries and updates
 * 
 * @module features/ecard/data
 */

import { base44 } from '@/api/base44Client';

/**
 * Calculate days until birthday
 */
function calculateDaysUntil(birthdayStr) {
  if (!birthdayStr) return -1;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const birthday = new Date(birthdayStr);
  const thisYear = new Date(
    today.getFullYear(),
    birthday.getMonth(),
    birthday.getDate()
  );
  
  if (thisYear < today) {
    thisYear.setFullYear(today.getFullYear() + 1);
  }
  
  return Math.ceil((thisYear - today) / (1000 * 60 * 60 * 24));
}

/**
 * Get connections with upcoming birthdays (next N days)
 */
async function getUpcomingBirthdays(userEmail, days = 7) {
  const connections = await base44.entities.UserConnection.filter({
    created_by: userEmail,
    birthday_reminder_enabled: true
  }, '-created_date', 500);
  
  const upcoming = (connections || [])
    .filter(conn => {
      if (!conn.target_birthday) return false;
      const daysUntil = calculateDaysUntil(conn.target_birthday);
      return daysUntil >= 0 && daysUntil <= days;
    })
    .map(conn => ({
      ...conn,
      days_until_birthday: calculateDaysUntil(conn.target_birthday)
    }))
    .sort((a, b) => a.days_until_birthday - b.days_until_birthday);

  return upcoming;
}

/**
 * Get today's birthdays
 */
async function getTodayBirthdays(userEmail) {
  return getUpcomingBirthdays(userEmail, 0);
}

/**
 * Update birthday for a connection
 */
async function updateBirthday(connectionId, birthday) {
  return base44.entities.UserConnection.update(connectionId, {
    target_birthday: birthday
  });
}

/**
 * Toggle birthday reminder
 */
async function toggleReminder(connectionId, enabled) {
  return base44.entities.UserConnection.update(connectionId, {
    birthday_reminder_enabled: enabled
  });
}

/**
 * Mark birthday wish as sent
 */
async function markWishSent(connectionId) {
  return base44.entities.UserConnection.update(connectionId, {
    last_birthday_wish_sent: new Date().toISOString()
  });
}

/**
 * Get all connections with birthdays (for admin stats)
 */
async function getConnectionsWithBirthdays(userEmail) {
  const connections = await base44.entities.UserConnection.filter({
    created_by: userEmail
  }, '-created_date', 1000);
  
  return (connections || []).filter(c => c.target_birthday);
}

export const birthdayRepository = {
  calculateDaysUntil,
  getUpcomingBirthdays,
  getTodayBirthdays,
  updateBirthday,
  toggleReminder,
  markWishSent,
  getConnectionsWithBirthdays
};