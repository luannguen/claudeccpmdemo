/**
 * Process Loyalty Points Expiration
 * 
 * Chạy định kỳ để expire điểm hết hạn
 * Trigger: Cron job hoặc manual call
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Service role để xử lý
    const accounts = await base44.asServiceRole.entities.LoyaltyAccount.list('-updated_date', 500);
    const now = new Date();
    let processedCount = 0;
    let totalExpired = 0;
    
    for (const account of accounts) {
      const history = account.points_history || [];
      let expiredPoints = 0;
      
      const updatedHistory = history.map(entry => {
        if (entry.type === 'earned' && entry.expiration_date && entry.points > 0) {
          const expDate = new Date(entry.expiration_date);
          if (expDate <= now) {
            expiredPoints += entry.points;
            return { ...entry, points: 0, expired: true };
          }
        }
        return entry;
      });
      
      if (expiredPoints > 0) {
        updatedHistory.push({
          date: new Date().toISOString(),
          points: -expiredPoints,
          type: 'expired',
          description: 'Điểm hết hạn tự động'
        });
        
        const newTotalPoints = Math.max(0, account.total_points - expiredPoints);
        
        // Calculate expiring soon & next expiration
        const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        let expiringPoints = 0;
        let nextExpiration = null;
        
        updatedHistory.forEach(entry => {
          if (entry.type === 'earned' && entry.expiration_date && entry.points > 0) {
            const expDate = new Date(entry.expiration_date);
            if (expDate > now && expDate <= thirtyDaysLater) {
              expiringPoints += entry.points;
              if (!nextExpiration || expDate < new Date(nextExpiration)) {
                nextExpiration = entry.expiration_date;
              }
            }
          }
        });
        
        await base44.asServiceRole.entities.LoyaltyAccount.update(account.id, {
          total_points: newTotalPoints,
          points_history: updatedHistory,
          points_expiring_soon: expiringPoints,
          next_expiration_date: nextExpiration
        });
        
        processedCount++;
        totalExpired += expiredPoints;
        
        // Notify user if expired
        if (expiredPoints > 0) {
          await base44.asServiceRole.entities.Notification.create({
            recipient_email: account.user_email,
            type: 'loyalty_points_expired',
            title: '⏰ Điểm loyalty đã hết hạn',
            message: `${expiredPoints} điểm của bạn đã hết hạn. Hãy sử dụng điểm trước khi mất nhé!`,
            priority: 'normal'
          });
        }
      }
    }
    
    return Response.json({
      success: true,
      processedAccounts: processedCount,
      totalExpiredPoints: totalExpired,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});