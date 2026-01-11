/**
 * Chatbot Rate Limiter
 * 
 * Prevents spam and abuse
 * Architecture: Service Layer
 */

import { success, failure, ErrorCodes } from '@/components/data/types';

// ========== CONFIG ==========

const RATE_CONFIG = {
  maxPerMinute: 20,
  maxPerHour: 100,
  cooldownMinutes: 5,
  storageKey: 'chatbot_rate_limit'
};

// ========== RATE LIMIT OPERATIONS ==========

/**
 * Get rate limit state from storage
 */
function getRateLimitState(userEmail) {
  try {
    const key = `${RATE_CONFIG.storageKey}_${userEmail || 'anon'}`;
    const state = JSON.parse(localStorage.getItem(key) || '{}');
    return state;
  } catch (e) {
    return {};
  }
}

/**
 * Save rate limit state
 */
function saveRateLimitState(userEmail, state) {
  try {
    const key = `${RATE_CONFIG.storageKey}_${userEmail || 'anon'}`;
    localStorage.setItem(key, JSON.stringify(state));
  } catch (e) {
    // Silent fail
  }
}

/**
 * Check if user is rate limited
 * @returns {Result<{ allowed: boolean, retryAfter?: number, reason?: string }>}
 */
export function checkRateLimit(userEmail) {
  const now = Date.now();
  const state = getRateLimitState(userEmail);
  
  // Check cooldown
  if (state.cooldownUntil && now < state.cooldownUntil) {
    const retryAfter = Math.ceil((state.cooldownUntil - now) / 1000);
    return success({
      allowed: false,
      retryAfter,
      reason: 'cooldown',
      message: `Bạn đang bị giới hạn. Vui lòng đợi ${retryAfter} giây.`
    });
  }
  
  // Clean old entries
  const oneMinuteAgo = now - 60 * 1000;
  const oneHourAgo = now - 60 * 60 * 1000;
  
  const recentMessages = (state.messages || []).filter(t => t > oneMinuteAgo);
  const hourlyMessages = (state.messages || []).filter(t => t > oneHourAgo);
  
  // Check per-minute limit
  if (recentMessages.length >= RATE_CONFIG.maxPerMinute) {
    // Apply cooldown
    const cooldownUntil = now + RATE_CONFIG.cooldownMinutes * 60 * 1000;
    saveRateLimitState(userEmail, {
      ...state,
      cooldownUntil,
      spamCount: (state.spamCount || 0) + 1
    });
    
    return success({
      allowed: false,
      retryAfter: RATE_CONFIG.cooldownMinutes * 60,
      reason: 'minute_limit',
      message: `Bạn đã gửi quá nhiều tin nhắn. Vui lòng đợi ${RATE_CONFIG.cooldownMinutes} phút.`
    });
  }
  
  // Check per-hour limit
  if (hourlyMessages.length >= RATE_CONFIG.maxPerHour) {
    return success({
      allowed: false,
      retryAfter: 60 * 60 - Math.floor((now - hourlyMessages[0]) / 1000),
      reason: 'hour_limit',
      message: 'Bạn đã đạt giới hạn tin nhắn trong giờ. Vui lòng thử lại sau.'
    });
  }
  
  return success({ allowed: true });
}

/**
 * Record a message (call after successful send)
 */
export function recordMessage(userEmail) {
  const now = Date.now();
  const state = getRateLimitState(userEmail);
  
  // Keep only last hour of messages
  const oneHourAgo = now - 60 * 60 * 1000;
  const messages = (state.messages || []).filter(t => t > oneHourAgo);
  messages.push(now);
  
  saveRateLimitState(userEmail, {
    ...state,
    messages,
    lastMessage: now
  });
}

/**
 * Get rate limit stats
 */
export function getRateLimitStats(userEmail) {
  const now = Date.now();
  const state = getRateLimitState(userEmail);
  
  const oneMinuteAgo = now - 60 * 1000;
  const oneHourAgo = now - 60 * 60 * 1000;
  
  const recentMessages = (state.messages || []).filter(t => t > oneMinuteAgo);
  const hourlyMessages = (state.messages || []).filter(t => t > oneHourAgo);
  
  return {
    messagesThisMinute: recentMessages.length,
    messagesThisHour: hourlyMessages.length,
    limitPerMinute: RATE_CONFIG.maxPerMinute,
    limitPerHour: RATE_CONFIG.maxPerHour,
    isCooldown: state.cooldownUntil && now < state.cooldownUntil,
    spamCount: state.spamCount || 0
  };
}

/**
 * Reset rate limit (for admin)
 */
export function resetRateLimit(userEmail) {
  const key = `${RATE_CONFIG.storageKey}_${userEmail || 'anon'}`;
  localStorage.removeItem(key);
  return success(true);
}

export default {
  checkRateLimit,
  recordMessage,
  getRateLimitStats,
  resetRateLimit,
  RATE_CONFIG
};