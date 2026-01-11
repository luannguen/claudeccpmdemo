/**
 * Scheduled task: Process and send scheduled messages
 * Schedule: Every 5 minutes
 * 
 * Backend function - Service role level
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  
  // Verify admin
  const user = await base44.auth.me();
  if (user && user.role !== 'admin') {
    return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
  }

  try {
    const now = new Date().toISOString();
    
    // Get all scheduled messages that are due
    const scheduledMessages = await base44.asServiceRole.entities.ConnectionMessage.filter({
      is_scheduled: true
    }, 'scheduled_at', 100);
    
    // Filter only messages that are due
    const dueMessages = (scheduledMessages || []).filter(msg => 
      msg.scheduled_at && 
      msg.scheduled_at <= now && 
      !msg.sent_at
    );
    
    if (dueMessages.length === 0) {
      return Response.json({
        success: true,
        message: 'No scheduled messages to process',
        processed: 0
      });
    }
    
    let processed = 0;
    let errors = 0;
    
    for (const msg of dueMessages) {
      try {
        // Mark as sent
        await base44.asServiceRole.entities.ConnectionMessage.update(msg.id, {
          is_scheduled: false,
          sent_at: now
        });
        
        // Create notification for receiver
        await base44.asServiceRole.entities.Notification.create({
          user_email: msg.receiver_user_id, // Assuming this stores email
          type: 'new_message',
          title: 'Tin nhắn mới',
          message: `${msg.sender_name || 'Ai đó'} đã gửi tin nhắn cho bạn`,
          action_url: '/my-ecard?tab=connections',
          priority: 'normal',
          read: false
        });
        
        processed++;
      } catch (err) {
        console.error(`Failed to process message ${msg.id}:`, err);
        errors++;
      }
    }
    
    return Response.json({
      success: true,
      processed,
      errors,
      total: dueMessages.length
    });
    
  } catch (error) {
    console.error('Scheduled messages processing failed:', error);
    return Response.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
});