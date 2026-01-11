/**
 * Process Scheduled Gifts
 * Daily job to check scheduled gifts and make them redeemable
 * 
 * Schedule: Daily at 00:00
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Admin-only function
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString().split('T')[0];

    // Get all gifts that should be redeemable today
    const allGifts = await base44.asServiceRole.entities.GiftTransaction.list();
    
    const giftsToProcess = allGifts.filter(gift => {
      // Must be sent and scheduled
      if (gift.status !== 'sent' || gift.delivery_mode !== 'scheduled') {
        return false;
      }
      
      // Check if scheduled date is today or earlier
      if (!gift.scheduled_delivery_date) return false;
      
      const scheduledDate = new Date(gift.scheduled_delivery_date);
      scheduledDate.setHours(0, 0, 0, 0);
      
      return scheduledDate <= today;
    });

    const results = [];

    for (const gift of giftsToProcess) {
      try {
        // Update to redeemable
        await base44.asServiceRole.entities.GiftTransaction.update(gift.id, {
          status: 'redeemable'
        });

        // Notify receiver
        await base44.asServiceRole.entities.Notification.create({
          recipient_email: gift.receiver_email,
          type: 'gift',
          actor_email: gift.sender_email,
          actor_name: gift.sender_name,
          title: '🎁 Quà của bạn đã sẵn sàng!',
          message: `${gift.sender_name} đã gửi quà ${gift.item_name} cho bạn`,
          link: '/my-ecard?tab=gifts',
          priority: 'high'
        });

        results.push({
          giftId: gift.id,
          status: 'processed',
          receiver: gift.receiver_name
        });
      } catch (error) {
        results.push({
          giftId: gift.id,
          status: 'error',
          error: error.message
        });
      }
    }

    return Response.json({
      success: true,
      processed: giftsToProcess.length,
      results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return Response.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
});