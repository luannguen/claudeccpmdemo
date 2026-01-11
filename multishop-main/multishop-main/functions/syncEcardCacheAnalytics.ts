/**
 * Scheduled task: Sync EcardCache analytics summary
 * Schedule: Daily at 2:00 AM
 * 
 * Updates analytics_summary in EcardCache for all users
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
    // Get all EcardCache records
    const caches = await base44.asServiceRole.entities.EcardCache.list('', 5000);
    
    if (!caches || caches.length === 0) {
      return Response.json({
        success: true,
        message: 'No caches to update',
        updated: 0
      });
    }
    
    const now = new Date();
    const date7d = new Date(now);
    date7d.setDate(now.getDate() - 7);
    const date30d = new Date(now);
    date30d.setDate(now.getDate() - 30);
    
    const updates = [];
    
    for (const cache of caches) {
      try {
        // Get analytics for 7d and 30d
        const analytics30d = await base44.asServiceRole.entities.EcardAnalytics.filter({
          user_id: cache.user_id,
          date: { $gte: date30d.toISOString().split('T')[0] }
        });
        
        const analytics7d = await base44.asServiceRole.entities.EcardAnalytics.filter({
          user_id: cache.user_id,
          date: { $gte: date7d.toISOString().split('T')[0] }
        });
        
        // Aggregate
        const views_30d = (analytics30d || []).reduce((sum, a) => sum + (a.views || 0), 0);
        const views_7d = (analytics7d || []).reduce((sum, a) => sum + (a.views || 0), 0);
        const connections_7d = (analytics7d || []).reduce((sum, a) => sum + (a.connections_made || 0), 0);
        const connections_30d = (analytics30d || []).reduce((sum, a) => sum + (a.connections_made || 0), 0);
        
        // Calculate conversion rate
        const conversion_rate = views_30d > 0 
          ? Number(((connections_30d / views_30d) * 100).toFixed(2))
          : 0;
        
        // Determine top source
        const sourceBreakdown = { qr: 0, direct_link: 0, search: 0, referral: 0 };
        (analytics30d || []).forEach(a => {
          const bd = a.source_breakdown || {};
          sourceBreakdown.qr += bd.qr || 0;
          sourceBreakdown.direct_link += bd.direct_link || 0;
          sourceBreakdown.search += bd.search || 0;
          sourceBreakdown.referral += bd.referral || 0;
        });
        
        const topSource = Object.entries(sourceBreakdown)
          .sort((a, b) => b[1] - a[1])[0][0];
        
        // Determine trend (compare first 15d vs last 15d of 30d period)
        const first15d = (analytics30d || []).slice(0, 15);
        const last15d = (analytics30d || []).slice(15);
        const firstSum = first15d.reduce((sum, a) => sum + (a.views || 0), 0);
        const lastSum = last15d.reduce((sum, a) => sum + (a.views || 0), 0);
        
        let trend = 'stable';
        if (lastSum > firstSum * 1.1) trend = 'up';
        else if (lastSum < firstSum * 0.9) trend = 'down';
        
        // Update cache
        await base44.asServiceRole.entities.EcardCache.update(cache.id, {
          analytics_summary: {
            views_7d,
            views_30d,
            connections_7d,
            connections_30d,
            conversion_rate,
            top_source: topSource,
            trend
          }
        });
        
        updates.push(cache.user_email);
      } catch (err) {
        console.error(`Failed to update cache for ${cache.user_email}:`, err);
      }
    }
    
    return Response.json({
      success: true,
      updated: updates.length,
      total: caches.length
    });
    
  } catch (error) {
    console.error('Analytics sync failed:', error);
    return Response.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
});