/**
 * Invite Code Generator - Domain Layer
 * Generate & validate invite codes for E-Card connections
 * 
 * Format: base64url({payload}.{signature})
 * Payload: { i: inviter_id, s: slug, e: expiry, n: nonce }
 */

// Simple HMAC-like signature using browser crypto (client-side safe)
const SECRET_SUFFIX = 'ecard_invite_v1';

/**
 * Generate a simple hash signature
 */
const generateSignature = (payload) => {
  const str = JSON.stringify(payload) + SECRET_SUFFIX;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
};

/**
 * Base64url encode (URL-safe base64)
 */
const base64urlEncode = (str) => {
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

/**
 * Base64url decode
 */
const base64urlDecode = (str) => {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) {
    str += '=';
  }
  return atob(str);
};

/**
 * Generate random nonce
 */
const generateNonce = () => {
  return Math.random().toString(36).substring(2, 10);
};

/**
 * Generate invite code for a profile
 * @param {Object} profile - EcardProfile object
 * @param {number} expiryDays - Days until expiry (default 7)
 * @returns {string} Invite code
 */
export const generateInviteCode = (profile, expiryDays = 7) => {
  if (!profile || !profile.user_id || !profile.public_url_slug) {
    throw new Error('Invalid profile for invite code generation');
  }

  const payload = {
    i: profile.user_id,           // inviter user id
    s: profile.public_url_slug,   // slug for fallback
    e: Math.floor(Date.now() / 1000) + (expiryDays * 24 * 60 * 60), // expiry timestamp
    n: generateNonce()            // nonce for uniqueness
  };

  const sig = generateSignature(payload);
  const encoded = base64urlEncode(JSON.stringify({ ...payload, sig }));
  
  return encoded;
};

/**
 * Decode invite code to payload
 * @param {string} code - Invite code
 * @returns {Object|null} Decoded payload or null if invalid
 */
export const decodeInviteCode = (code) => {
  try {
    if (!code || typeof code !== 'string') {
      return null;
    }

    const decoded = base64urlDecode(code);
    const payload = JSON.parse(decoded);
    
    // Validate required fields
    if (!payload.i || !payload.s || !payload.e || !payload.sig) {
      return null;
    }

    return payload;
  } catch (error) {
    console.warn('Failed to decode invite code:', error.message);
    return null;
  }
};

/**
 * Validate invite code signature
 * @param {string} code - Invite code
 * @returns {boolean} True if valid
 */
export const validateInviteCode = (code) => {
  const payload = decodeInviteCode(code);
  if (!payload) return false;

  // Extract signature and recreate payload without it
  const { sig, ...payloadWithoutSig } = payload;
  const expectedSig = generateSignature(payloadWithoutSig);

  return sig === expectedSig;
};

/**
 * Check if invite code is expired
 * @param {string} code - Invite code
 * @returns {boolean} True if expired
 */
export const isInviteExpired = (code) => {
  const payload = decodeInviteCode(code);
  if (!payload) return true;

  const now = Math.floor(Date.now() / 1000);
  return payload.e < now;
};

/**
 * Get inviter info from invite code
 * @param {string} code - Invite code
 * @returns {Object|null} { inviterId, slug, expiresAt }
 */
export const getInviteInfo = (code) => {
  const payload = decodeInviteCode(code);
  if (!payload) return null;

  return {
    inviterId: payload.i,
    slug: payload.s,
    expiresAt: new Date(payload.e * 1000),
    nonce: payload.n
  };
};

/**
 * Generate full invite link URL
 * @param {Object} profile - EcardProfile object
 * @param {string} baseUrl - Base URL (optional, defaults to current origin)
 * @returns {string} Full invite URL
 */
export const generateInviteLink = (profile, baseUrl = null) => {
  const code = generateInviteCode(profile);
  const base = baseUrl || window.location.origin;
  return `${base}/InviteAccept?code=${code}`;
};

/**
 * Generate QR code URL with invite link
 * @param {Object} profile - EcardProfile object
 * @returns {string} QR code image URL
 */
export const generateInviteQRCodeUrl = (profile) => {
  const inviteLink = generateInviteLink(profile);
  // Use free QR code API
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(inviteLink)}`;
};

/**
 * Check if a string looks like an invite code vs old slug format
 * @param {string} value - String to check
 * @returns {boolean} True if invite code format
 */
export const isInviteCodeFormat = (value) => {
  if (!value || typeof value !== 'string') return false;
  
  // Invite codes are base64url and typically longer than slugs
  // Slugs are lowercase alphanumeric with hyphens
  const isSlugFormat = /^[a-z0-9-]+$/.test(value);
  
  // Try to decode - if it works, it's likely an invite code
  if (!isSlugFormat) {
    const decoded = decodeInviteCode(value);
    return decoded !== null;
  }
  
  return false;
};

export default {
  generateInviteCode,
  decodeInviteCode,
  validateInviteCode,
  isInviteExpired,
  getInviteInfo,
  generateInviteLink,
  generateInviteQRCodeUrl,
  isInviteCodeFormat
};