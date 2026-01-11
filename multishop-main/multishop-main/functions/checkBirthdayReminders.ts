/**
 * Scheduled task: Check and send birthday reminders
 * Schedule: Daily at 8:00 AM
 * 
 * Backend function - Service role level
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  
  // Verify admin user is calling (for scheduled task security)
  const user = await base44.auth.me();
  if (user && user.role !== 'admin') {
    return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
  }

  try {
    // Get all connections with birthdays enabled
    const allConnections = await base44.asServiceRole.entities.UserConnection.filter({
      birthday_reminder_enabled: true
    }, '-created_date', 5000);

    if (!allConnections || allConnections.length === 0) {
      return Response.json({
        success: true,
        message: 'No connections with birthdays',
        birthdaysToday: 0,
        birthdaysTomorrow: 0
      });
    }
    
    const today = new Date();
    const todayStr = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = `${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;
    
    const birthdaysToday = [];
    const birthdaysTomorrow = [];
    
    allConnections.forEach(conn => {
      if (!conn.target_birthday) return;
      
      const bday = new Date(conn.target_birthday);
      const bdayStr = `${String(bday.getMonth() + 1).padStart(2, '0')}-${String(bday.getDate()).padStart(2, '0')}`;
      
      if (bdayStr === todayStr) {
        birthdaysToday.push(conn);
      } else if (bdayStr === tomorrowStr) {
        birthdaysTomorrow.push(conn);
      }
    });
    
    // Create notifications for users
    const notifications = [];
    
    // Group by owner
    const todayByOwner = groupBy(birthdaysToday, 'created_by');
    const tomorrowByOwner = groupBy(birthdaysTomorrow, 'created_by');
    
    for (const [email, connections] of Object.entries(todayByOwner)) {
      const names = connections.map(c => c.target_name).join(', ');
      notifications.push({
        user_email: email,
        type: 'birthday_today',
        title: '🎂 Sinh nhật hôm nay!',
        message: `${names} có sinh nhật hôm nay. Đừng quên gửi lời chúc!`,
        action_url: '/my-ecard?tab=connections',
        priority: 'high',
        read: false
      });
    }
    
    for (const [email, connections] of Object.entries(tomorrowByOwner)) {
      const names = connections.map(c => c.target_name).join(', ');
      notifications.push({
        user_email: email,
        type: 'birthday_tomorrow',
        title: '🎁 Sinh nhật ngày mai',
        message: `${names} có sinh nhật ngày mai. Chuẩn bị lời chúc nhé!`,
        action_url: '/my-ecard?tab=connections',
        priority: 'normal',
        read: false
      });
    }
    
    // Create notifications in bulk
    if (notifications.length > 0) {
      await base44.asServiceRole.entities.Notification.bulkCreate(notifications);
    }
    
    return Response.json({
      success: true,
      birthdaysToday: birthdaysToday.length,
      birthdaysTomorrow: birthdaysTomorrow.length,
      notificationsSent: notifications.length,
      usersNotified: Object.keys({ ...todayByOwner, ...tomorrowByOwner }).length
    });
    
  } catch (error) {
    console.error('Birthday check failed:', error);
    return Response.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
});

function groupBy(arr, key) {
  return arr.reduce((acc, item) => {
    const k = item[key];
    if (!acc[k]) acc[k] = [];
    acc[k].push(item);
    return acc;
  }, {});
}