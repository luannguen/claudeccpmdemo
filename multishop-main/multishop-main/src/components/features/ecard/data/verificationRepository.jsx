/**
 * Verification Repository
 * Data Layer - API calls only
 * 
 * @module features/ecard/data
 */

import { base44 } from '@/api/base44Client';

/**
 * Get pending verification requests (admin)
 */
export const getPendingRequests = async (limit = 50) => {
  return base44.entities.VerificationRequest.filter(
    { status: 'pending' },
    '-created_date',
    limit
  );
};

/**
 * Get all verification requests with optional status filter
 */
export const getRequests = async (status = null, limit = 100) => {
  if (status) {
    return base44.entities.VerificationRequest.filter(
      { status },
      '-created_date',
      limit
    );
  }
  return base44.entities.VerificationRequest.list('-created_date', limit);
};

/**
 * Get user's verification requests
 */
export const getUserRequests = async (userEmail) => {
  return base44.entities.VerificationRequest.filter(
    { user_email: userEmail },
    '-created_date',
    20
  );
};

/**
 * Create verification request
 */
export const createRequest = async (data) => {
  return base44.entities.VerificationRequest.create(data);
};

/**
 * Approve verification request
 */
export const approveRequest = async (requestId, adminEmail, adminNotes = '') => {
  const request = await base44.entities.VerificationRequest.filter({ id: requestId });
  if (!request || request.length === 0) return null;
  
  const req = request[0];
  
  // Update request status
  await base44.entities.VerificationRequest.update(requestId, {
    status: 'approved',
    reviewed_by: adminEmail,
    reviewed_at: new Date().toISOString(),
    admin_notes: adminNotes
  });
  
  // Add badge to profile
  const profiles = await base44.entities.EcardProfile.filter({ id: req.profile_id });
  if (profiles && profiles.length > 0) {
    const profile = profiles[0];
    const badgeType = `${req.type}_verified`;
    const currentBadges = profile.verification_badges || [];
    
    if (!currentBadges.includes(badgeType)) {
      const newBadges = [...currentBadges, badgeType];
      await base44.entities.EcardProfile.update(req.profile_id, {
        verification_badges: newBadges,
        verification_status: 'verified',
        verification_date: new Date().toISOString(),
        verified_by: adminEmail
      });
    }
  }
  
  return { success: true };
};

/**
 * Reject verification request
 */
export const rejectRequest = async (requestId, adminEmail, reason) => {
  await base44.entities.VerificationRequest.update(requestId, {
    status: 'rejected',
    reviewed_by: adminEmail,
    reviewed_at: new Date().toISOString(),
    rejection_reason: reason
  });
  
  return { success: true };
};

/**
 * Add badge directly (admin)
 */
export const addBadge = async (profileId, badge, adminEmail) => {
  const profiles = await base44.entities.EcardProfile.filter({ id: profileId });
  if (!profiles || profiles.length === 0) return null;
  
  const profile = profiles[0];
  const currentBadges = profile.verification_badges || [];
  
  if (!currentBadges.includes(badge)) {
    await base44.entities.EcardProfile.update(profileId, {
      verification_badges: [...currentBadges, badge],
      verification_status: 'verified',
      verification_date: new Date().toISOString(),
      verified_by: adminEmail
    });
  }
  
  return { success: true };
};

/**
 * Remove badge (admin)
 */
export const removeBadge = async (profileId, badge) => {
  const profiles = await base44.entities.EcardProfile.filter({ id: profileId });
  if (!profiles || profiles.length === 0) return null;
  
  const profile = profiles[0];
  const currentBadges = profile.verification_badges || [];
  const newBadges = currentBadges.filter(b => b !== badge);
  
  await base44.entities.EcardProfile.update(profileId, {
    verification_badges: newBadges,
    verification_status: newBadges.length > 0 ? 'verified' : 'unverified'
  });
  
  return { success: true };
};

export const verificationRepository = {
  getPendingRequests,
  getRequests,
  getUserRequests,
  createRequest,
  approveRequest,
  rejectRequest,
  addBadge,
  removeBadge
};

export default verificationRepository;