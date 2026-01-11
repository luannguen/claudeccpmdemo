/**
 * Recommendation Repository - Data access for connection recommendations
 * Data Layer - API calls only
 * 
 * @module features/ecard/data
 */

import { base44 } from '@/api/base44Client';
import { calculateMatchScore, generateMatchReasons } from '../domain/connectionMatcher';

/**
 * Get recommendations for a user
 */
export async function getRecommendations(userEmail, limit = 10) {
  const recommendations = await base44.entities.ConnectionRecommendation.filter(
    { user_email: userEmail, status: 'pending' },
    '-score',
    limit
  );
  return recommendations || [];
}

/**
 * Generate new recommendations for a user
 * @param {string} userId - User ID
 * @param {string} userEmail - User email
 * @param {Object} userProfile - User's EcardProfile
 * @param {Array} existingConnectionIds - IDs of existing connections
 */
export async function generateRecommendations(userId, userEmail, userProfile, existingConnectionIds = []) {
  // Get all public profiles (excluding self and existing connections)
  const allProfiles = await base44.entities.EcardProfile.filter(
    { is_public: true },
    '-view_count',
    100
  );
  
  // Filter candidates
  const candidates = (allProfiles || []).filter(profile => {
    // Exclude self
    if (profile.user_id === userId) return false;
    
    // Exclude existing connections
    if (existingConnectionIds.includes(profile.user_id)) return false;
    
    return true;
  });
  
  // Calculate scores and generate recommendations
  const recommendations = [];
  const now = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  
  for (const candidate of candidates) {
    // Find mutual connections (simplified - would need actual connection data)
    const mutualIds = []; // TODO: Implement actual mutual connection lookup
    
    const score = calculateMatchScore(userProfile, candidate, mutualIds);
    
    // Only recommend if score > 20
    if (score < 20) continue;
    
    const matchReasons = generateMatchReasons(userProfile, candidate, mutualIds);
    
    recommendations.push({
      user_id: userId,
      user_email: userEmail,
      recommended_profile_id: candidate.id,
      recommended_user_id: candidate.user_id,
      recommended_name: candidate.display_name,
      recommended_avatar: candidate.profile_image_url,
      recommended_title: candidate.title_profession,
      recommended_company: candidate.company_name,
      recommended_slug: candidate.public_url_slug,
      score,
      match_reasons: matchReasons,
      status: 'pending',
      generated_at: now,
      expires_at: expiresAt
    });
  }
  
  // Sort by score and take top N
  recommendations.sort((a, b) => b.score - a.score);
  const topRecommendations = recommendations.slice(0, 20);
  
  // Clear old pending recommendations
  await clearOldRecommendations(userEmail);
  
  // Save new recommendations
  if (topRecommendations.length > 0) {
    await base44.entities.ConnectionRecommendation.bulkCreate(topRecommendations);
  }
  
  return topRecommendations;
}

/**
 * Clear old/expired recommendations
 */
export async function clearOldRecommendations(userEmail) {
  const oldRecs = await base44.entities.ConnectionRecommendation.filter(
    { user_email: userEmail, status: 'pending' },
    '-created_date',
    100
  );
  
  const now = new Date().toISOString();
  
  for (const rec of oldRecs || []) {
    // Delete if expired or older than 7 days
    if (rec.expires_at && rec.expires_at < now) {
      await base44.entities.ConnectionRecommendation.delete(rec.id);
    }
  }
}

/**
 * Dismiss a recommendation
 */
export async function dismissRecommendation(id) {
  return base44.entities.ConnectionRecommendation.update(id, {
    status: 'dismissed',
    acted_at: new Date().toISOString()
  });
}

/**
 * Accept a recommendation (mark as accepted, actual connection happens elsewhere)
 */
export async function acceptRecommendation(id) {
  return base44.entities.ConnectionRecommendation.update(id, {
    status: 'accepted',
    acted_at: new Date().toISOString()
  });
}

/**
 * Get recommendation stats for a user
 */
export async function getRecommendationStats(userEmail) {
  const all = await base44.entities.ConnectionRecommendation.filter(
    { user_email: userEmail },
    '-created_date',
    100
  );
  
  const stats = {
    total: all?.length || 0,
    pending: 0,
    accepted: 0,
    dismissed: 0
  };
  
  (all || []).forEach(rec => {
    if (rec.status === 'pending') stats.pending++;
    else if (rec.status === 'accepted') stats.accepted++;
    else if (rec.status === 'dismissed') stats.dismissed++;
  });
  
  return stats;
}

export const recommendationRepository = {
  getRecommendations,
  generateRecommendations,
  clearOldRecommendations,
  dismissRecommendation,
  acceptRecommendation,
  getRecommendationStats
};

export default recommendationRepository;