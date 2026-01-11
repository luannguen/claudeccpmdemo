/**
 * Analytics Repository
 * Data layer - API calls for EcardAnalytics entity
 * 
 * @module features/ecard/data
 */

import { base44 } from '@/api/base44Client';

/**
 * Get analytics records by date range
 */
async function getByDateRange(userId, startDate, endDate) {
  const records = await base44.entities.EcardAnalytics.filter({
    user_id: userId,
    date: { $gte: startDate, $lte: endDate }
  }, '-date', 100);
  return records || [];
}

/**
 * Get or create today's analytics record
 */
async function getOrCreateToday(userId, userEmail) {
  const today = new Date().toISOString().split('T')[0];
  
  const existing = await base44.entities.EcardAnalytics.filter({
    user_id: userId,
    date: today
  });
  
  if (existing?.length > 0) {
    return existing[0];
  }
  
  // Create new record for today
  const newRecord = await base44.entities.EcardAnalytics.create({
    user_id: userId,
    user_email: userEmail,
    date: today,
    views: 0,
    unique_views: 0,
    qr_scans: 0,
    link_clicks: 0,
    connections_made: 0,
    gifts_received: 0,
    shares: 0,
    source_breakdown: { qr: 0, direct_link: 0, search: 0, referral: 0 }
  });
  
  return newRecord;
}

/**
 * Increment a specific metric
 */
async function incrementMetric(analyticsId, metric, amount = 1) {
  const current = await base44.entities.EcardAnalytics.filter({ id: analyticsId });
  if (!current?.length) return null;
  
  const currentValue = current[0][metric] || 0;
  return base44.entities.EcardAnalytics.update(analyticsId, {
    [metric]: currentValue + amount
  });
}

/**
 * Update source breakdown
 */
async function updateSourceBreakdown(analyticsId, source) {
  const current = await base44.entities.EcardAnalytics.filter({ id: analyticsId });
  if (!current?.length) return null;
  
  const breakdown = { ...current[0].source_breakdown } || { qr: 0, direct_link: 0, search: 0, referral: 0 };
  breakdown[source] = (breakdown[source] || 0) + 1;
  
  return base44.entities.EcardAnalytics.update(analyticsId, {
    source_breakdown: breakdown
  });
}

/**
 * Get aggregated stats for a period
 */
async function getAggregatedStats(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const data = await getByDateRange(
    userId,
    startDate.toISOString().split('T')[0],
    new Date().toISOString().split('T')[0]
  );
  
  return data.reduce((acc, day) => ({
    views: acc.views + (day.views || 0),
    unique_views: acc.unique_views + (day.unique_views || 0),
    connections: acc.connections + (day.connections_made || 0),
    gifts: acc.gifts + (day.gifts_received || 0),
    shares: acc.shares + (day.shares || 0),
    qr_scans: acc.qr_scans + (day.qr_scans || 0)
  }), { views: 0, unique_views: 0, connections: 0, gifts: 0, shares: 0, qr_scans: 0 });
}

/**
 * Track a view event
 */
async function trackView(userId, userEmail, source = 'direct_link') {
  const analytics = await getOrCreateToday(userId, userEmail);
  
  await Promise.all([
    incrementMetric(analytics.id, 'views'),
    updateSourceBreakdown(analytics.id, source)
  ]);
  
  return analytics;
}

/**
 * Track connection made
 */
async function trackConnection(userId, userEmail) {
  const analytics = await getOrCreateToday(userId, userEmail);
  return incrementMetric(analytics.id, 'connections_made');
}

/**
 * Track share event
 */
async function trackShare(userId, userEmail) {
  const analytics = await getOrCreateToday(userId, userEmail);
  return incrementMetric(analytics.id, 'shares');
}

export const analyticsRepository = {
  getByDateRange,
  getOrCreateToday,
  incrementMetric,
  updateSourceBreakdown,
  getAggregatedStats,
  trackView,
  trackConnection,
  trackShare
};