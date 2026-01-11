/**
 * ShareLink Repository - Data access for short links
 * Data Layer - API calls only
 * 
 * @module features/ecard/data
 */

import { base44 } from '@/api/base44Client';

/**
 * Generate a unique short code
 */
function generateShortCode() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Get all share links for a user
 */
export async function getShareLinks(userEmail) {
  const links = await base44.entities.ShareLink.filter(
    { user_email: userEmail },
    '-created_date',
    50
  );
  return links || [];
}

/**
 * Get share links for a specific profile
 */
export async function getProfileShareLinks(profileId) {
  const links = await base44.entities.ShareLink.filter(
    { profile_id: profileId },
    '-created_date',
    20
  );
  return links || [];
}

/**
 * Get a share link by short code
 */
export async function getByShortCode(shortCode) {
  const links = await base44.entities.ShareLink.filter(
    { short_code: shortCode },
    '-created_date',
    1
  );
  return links?.[0] || null;
}

/**
 * Create a new share link
 */
export async function createShareLink(data) {
  // Generate unique short code
  let shortCode = generateShortCode();
  let attempts = 0;
  
  // Check for uniqueness
  while (attempts < 5) {
    const existing = await getByShortCode(shortCode);
    if (!existing) break;
    shortCode = generateShortCode();
    attempts++;
  }
  
  // Build the link data
  const linkData = {
    profile_id: data.profile_id,
    user_email: data.user_email,
    short_code: shortCode,
    original_url: data.original_url,
    title: data.title || '',
    utm_source: data.utm_source || '',
    utm_medium: data.utm_medium || '',
    utm_campaign: data.utm_campaign || '',
    click_count: 0,
    unique_clicks: 0,
    click_history: [],
    qr_style: data.qr_style || {
      foreground: '#000000',
      background: '#FFFFFF',
      style: 'square'
    },
    is_active: true
  };
  
  if (data.expires_at) {
    linkData.expires_at = data.expires_at;
  }
  
  return base44.entities.ShareLink.create(linkData);
}

/**
 * Update a share link
 */
export async function updateShareLink(id, data) {
  return base44.entities.ShareLink.update(id, data);
}

/**
 * Track a click on a share link
 */
export async function trackClick(shortCode, isUnique = false) {
  const link = await getByShortCode(shortCode);
  if (!link) return null;
  
  const today = new Date().toISOString().split('T')[0];
  const now = new Date().toISOString();
  
  // Update click history
  let clickHistory = link.click_history || [];
  const todayEntry = clickHistory.find(h => h.date === today);
  
  if (todayEntry) {
    todayEntry.count++;
  } else {
    clickHistory.push({ date: today, count: 1 });
    // Keep only last 30 days
    if (clickHistory.length > 30) {
      clickHistory = clickHistory.slice(-30);
    }
  }
  
  const updateData = {
    click_count: (link.click_count || 0) + 1,
    last_clicked_at: now,
    click_history: clickHistory
  };
  
  if (isUnique) {
    updateData.unique_clicks = (link.unique_clicks || 0) + 1;
  }
  
  return base44.entities.ShareLink.update(link.id, updateData);
}

/**
 * Delete a share link
 */
export async function deleteShareLink(id) {
  return base44.entities.ShareLink.delete(id);
}

/**
 * Get link analytics summary
 */
export async function getLinkAnalytics(userEmail) {
  const links = await getShareLinks(userEmail);
  
  let totalClicks = 0;
  let totalUniqueClicks = 0;
  const sourceBreakdown = {};
  
  links.forEach(link => {
    totalClicks += link.click_count || 0;
    totalUniqueClicks += link.unique_clicks || 0;
    
    const source = link.utm_source || 'direct';
    sourceBreakdown[source] = (sourceBreakdown[source] || 0) + (link.click_count || 0);
  });
  
  return {
    totalLinks: links.length,
    activeLinks: links.filter(l => l.is_active).length,
    totalClicks,
    totalUniqueClicks,
    sourceBreakdown,
    topLinks: links.sort((a, b) => (b.click_count || 0) - (a.click_count || 0)).slice(0, 5)
  };
}

export const shareLinkRepository = {
  getShareLinks,
  getProfileShareLinks,
  getByShortCode,
  createShareLink,
  updateShareLink,
  trackClick,
  deleteShareLink,
  getLinkAnalytics
};

export default shareLinkRepository;