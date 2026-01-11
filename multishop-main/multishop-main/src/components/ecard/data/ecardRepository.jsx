/**
 * E-Card Repository - Data Access Layer
 * Handles all E-Card profile data operations
 */

import { base44 } from '@/api/base44Client';
import { DEFAULT_THEME_COLOR, DESIGN_TEMPLATES } from '../types';
import { generateInviteQRCodeUrl, generateInviteCode } from '../domain/inviteCodeGenerator';

/**
 * Generate QR code URL for a profile using invite link system
 * @param {Object} profile - EcardProfile object
 * @returns {string} QR code image URL
 */
const generateQRCodeUrl = async (profile) => {
  // If INTRO mode and experience present, build QR to Experience page
  if (profile?.qr_mode === 'INTRO' && profile?.experience_id) {
    try {
      const exps = await base44.entities.Experience.filter({ id: profile.experience_id });
      const exp = Array.isArray(exps) && exps.length ? exps[0] : null;
      if (exp?.is_active && exp?.code) {
        // Use base app URL, not preview URL
        const baseUrl = window.location.origin.includes('preview-sandbox') 
          ? window.location.origin 
          : window.location.origin;
        const link = `${baseUrl}/Experience?code=${encodeURIComponent(exp.code)}`;
        console.log('[ecardRepository] Generating QR for Experience:', link);
        return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(link)}`;
      }
    } catch (err) {
      console.error('[ecardRepository] Error fetching experience for QR:', err);
    }
  }
  // Fallback to invite link QR
  return generateInviteQRCodeUrl(profile);
};

/**
 * Ensure profile has QR code, generate if missing or regenerate with invite link
 * OPTIMIZED: Non-blocking QR generation - returns profile immediately, updates QR in background
 */
const QR_REGEN_FIELDS = ['public_url_slug'];

const computeInviteExpiry = (ttlDays) => {
  const days = Number.isFinite(ttlDays) && ttlDays > 0 ? ttlDays : 30;
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
};

/**
 * Check if QR needs regeneration
 */
const needsQRRegeneration = (profile) => {
  if (!profile.qr_code_url) return true;
  if (!profile.invite_expires_at) return true;
  return new Date(profile.invite_expires_at) <= new Date();
};

/**
 * Regenerate QR in background (non-blocking)
 * Returns immediately, updates DB asynchronously
 */
const regenerateQRInBackground = (profile) => {
  // Fire and forget - don't await
  (async () => {
    try {
      const qrCodeUrl = await generateQRCodeUrl(profile);
      const nowIso = new Date().toISOString();
      const expiresAt = computeInviteExpiry(profile.invite_ttl_days);
      await base44.entities.EcardProfile.update(profile.id, {
        qr_code_url: qrCodeUrl,
        qr_last_generated_at: nowIso,
        invite_expires_at: expiresAt
      });
      console.log('[ecardRepository] QR regenerated in background');
    } catch (err) {
      console.error('[ecardRepository] Background QR regen failed:', err);
    }
  })();
};

const ensureQRCode = async (profile, forceRegenerate = false) => {
  const shouldRegen = forceRegenerate || needsQRRegeneration(profile);

  if (shouldRegen) {
    if (forceRegenerate) {
      // Only block when explicitly forced (e.g., user clicks "Regenerate QR")
      const qrCodeUrl = await generateQRCodeUrl(profile);
      const nowIso = new Date().toISOString();
      const expiresAt = computeInviteExpiry(profile.invite_ttl_days);
      const updates = {
        qr_code_url: qrCodeUrl,
        qr_last_generated_at: nowIso,
        active_invite_code: null,
        invite_expires_at: expiresAt
      };
      const updated = await base44.entities.EcardProfile.update(profile.id, updates);
      return { ...profile, ...updated };
    } else {
      // Non-blocking: return profile immediately, regenerate QR in background
      regenerateQRInBackground(profile);
      return profile;
    }
  }
  return profile;
};

/**
 * Get or create ecard profile for user
 */
export const getOrCreateProfile = async (user) => {
  const profiles = await base44.entities.EcardProfile.filter({ user_id: user.id });

  if (profiles.length > 0) {
    // Ensure existing profile has valid QR (only when missing/expired)
    return ensureQRCode(profiles[0]);
  }

  // Create new profile - QR will be generated once then cached with expiry
  const slug = `${user.email.split('@')[0]}-${Date.now()}`.toLowerCase();

  const newProfile = await base44.entities.EcardProfile.create({
    user_id: user.id,
    public_url_slug: slug,
    display_name: user.full_name || user.email.split('@')[0],
    design_template: DESIGN_TEMPLATES[0],
    theme_color: DEFAULT_THEME_COLOR,
    is_public: true,
    view_count: 0,
    contact_visibility: { phone: true, email: true, website: true, address: false },
    social_links: [],
    custom_fields: [],
    invite_ttl_days: 30
  });

  // Generate and cache QR with expiry
  return ensureQRCode(newProfile, true);
};

/**
 * Update ecard profile
 */
export const updateProfile = async (profileId, updates) => {
  if (!profileId) {
    throw new Error('Profile ID is required');
  }
  
  // Clean up updates - remove undefined values
  const cleanUpdates = {};
  Object.keys(updates).forEach(key => {
    if (updates[key] !== undefined) {
      cleanUpdates[key] = updates[key];
    }
  });
  
  const updated = await base44.entities.EcardProfile.update(profileId, cleanUpdates);

  // Regenerate QR if fields that affect invite/link changed or if explicitly requested
  const shouldRegen = 'public_url_slug' in cleanUpdates || 'invite_ttl_days' in cleanUpdates || updates?.regenerateQr === true;
  if (shouldRegen) {
    const refreshed = await regenerateQRCode({ ...updated });
    return { ...updated, qr_code_url: refreshed };
  }

  return updated;
};

/**
 * Get profile by slug (public access)
 */
export const getProfileBySlug = async (slug) => {
  const profiles = await base44.entities.EcardProfile.filter({ public_url_slug: slug, is_public: true });

  if (profiles.length === 0) {
    throw new Error('Profile not found');
  }

  // Ensure QR is valid (regen only if missing/expired) and increment view count atomically
  let profile = profiles[0];
  profile = await ensureQRCode(profile);

  await base44.entities.EcardProfile.update(profile.id, { view_count: (profile.view_count || 0) + 1 });

  return profile;
};

/**
 * Regenerate QR code for a profile with new invite code
 * @param {Object} profile - Full profile object
 * @param {boolean} forceExperienceUrl - Force use Experience URL even if not in INTRO mode
 */
export const regenerateQRCode = async (profile, forceExperienceUrl = false) => {
  let qrCodeUrl;
  
  // Check if we should generate Experience-based QR
  if ((profile?.qr_mode === 'INTRO' || forceExperienceUrl) && profile?.experience_id) {
    try {
      const exps = await base44.entities.Experience.filter({ id: profile.experience_id });
      const exp = Array.isArray(exps) && exps.length ? exps[0] : null;
      if (exp?.is_active && exp?.code) {
        const baseUrl = window.location.origin;
        const link = `${baseUrl}/Experience?code=${encodeURIComponent(exp.code)}`;
        console.log('[regenerateQRCode] Generating Experience QR:', link);
        qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(link)}`;
      }
    } catch (err) {
      console.error('[regenerateQRCode] Error:', err);
    }
  }
  
  // Fallback to invite link if no Experience QR
  if (!qrCodeUrl) {
    qrCodeUrl = await generateInviteQRCodeUrl(profile);
  }
  
  const nowIso = new Date().toISOString();
  const expiresAt = computeInviteExpiry(profile.invite_ttl_days);
  await base44.entities.EcardProfile.update(profile.id, {
    qr_code_url: qrCodeUrl,
    qr_last_generated_at: nowIso,
    invite_expires_at: expiresAt
  });
  return qrCodeUrl;
};

/**
 * Search public profiles
 */
export const searchProfiles = async (query) => {
  if (!query || query.length < 2) return [];

  const allProfiles = await base44.entities.EcardProfile.filter({
    is_public: true
  });

  const lowerQuery = query.toLowerCase();
  return allProfiles.filter(profile => 
    profile.display_name?.toLowerCase().includes(lowerQuery) ||
    profile.company_name?.toLowerCase().includes(lowerQuery) ||
    profile.title_profession?.toLowerCase().includes(lowerQuery)
  ).slice(0, 20);
};