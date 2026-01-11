/**
 * useReferralCheckout Hook
 * Hooks Layer - Referral code handling during checkout
 * 
 * @module features/referral/hooks/useReferralCheckout
 */

import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { memberRepository } from '../data';
import { normalizeCode } from '../domain';

// Cookie helpers
const REFERRAL_COOKIE_KEY = 'referral_code';
const REFERRAL_COOKIE_DAYS = 30;

function setCookie(name, value, days) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

function getCookie(name) {
  const nameEQ = name + '=';
  const ca = document.cookie.split(';');
  for (let c of ca) {
    while (c.charAt(0) === ' ') c = c.substring(1);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length);
  }
  return null;
}

function deleteCookie(name) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
}

// Export cookie helpers
export const getReferralCodeFromCookie = () => getCookie(REFERRAL_COOKIE_KEY);
export const clearReferralCookie = () => deleteCookie(REFERRAL_COOKIE_KEY);
export const hasReferralCode = () => !!getCookie(REFERRAL_COOKIE_KEY);

/**
 * Hook for managing referral code during checkout
 */
export function useReferralCheckout() {
  const [referralCode, setReferralCode] = useState(null);
  const [referrer, setReferrer] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState(null);
  
  // Validate and set referral code
  const validateReferralCode = useCallback(async (code) => {
    if (!code) return false;
    
    setIsValidating(true);
    setError(null);
    
    try {
      const normalized = normalizeCode(code);
      const member = await memberRepository.getActiveByCode(normalized);
      
      if (!member) {
        setError('Mã giới thiệu không hợp lệ');
        clearReferralCookie();
        setReferralCode(null);
        setReferrer(null);
        return false;
      }
      
      // Check self-referral
      const user = await base44.auth.me().catch(() => null);
      if (user && user.email === member.user_email) {
        setError('Không thể dùng mã của chính mình');
        setReferralCode(null);
        setReferrer(null);
        return false;
      }
      
      // Valid code
      setReferralCode(normalized);
      setReferrer({
        id: member.id,
        name: member.full_name,
        email: member.user_email,
        code: member.referral_code
      });
      
      // Save to cookie
      setCookie(REFERRAL_COOKIE_KEY, normalized, REFERRAL_COOKIE_DAYS);
      
      return true;
    } catch (err) {
      console.error('Error validating referral code:', err);
      setError('Lỗi khi kiểm tra mã');
      return false;
    } finally {
      setIsValidating(false);
    }
  }, []);
  
  // Load code from cookie on mount
  useEffect(() => {
    const code = getCookie(REFERRAL_COOKIE_KEY);
    if (code) {
      validateReferralCode(code);
    }
  }, [validateReferralCode]);
  
  // Apply custom code
  const applyCustomCode = useCallback(async (code) => {
    return await validateReferralCode(code);
  }, [validateReferralCode]);
  
  // Remove code
  const removeReferralCode = useCallback(() => {
    clearReferralCookie();
    setReferralCode(null);
    setReferrer(null);
    setError(null);
  }, []);
  
  return {
    referralCode,
    referrer,
    isValidating,
    error,
    hasReferralCode: !!referralCode,
    applyCustomCode,
    removeReferralCode,
    validateReferralCode
  };
}

/**
 * Validate and save referral code from URL
 * Used by ReferralLinkHandler
 */
export async function validateAndSaveReferralCode(code) {
  if (!code || code.length < 4) {
    return { valid: false, error: 'Mã không hợp lệ' };
  }
  
  try {
    const normalized = normalizeCode(code);
    const member = await memberRepository.getActiveByCode(normalized);
    
    if (!member) {
      return { valid: false, error: 'Mã giới thiệu không tồn tại' };
    }
    
    // Check self-referral
    const user = await base44.auth.me().catch(() => null);
    if (user && user.email === member.user_email) {
      return { valid: false, error: 'Không thể dùng mã của chính mình' };
    }
    
    // Save to cookie
    setCookie(REFERRAL_COOKIE_KEY, normalized, REFERRAL_COOKIE_DAYS);
    
    return {
      valid: true,
      referrer: {
        name: member.full_name,
        code: member.referral_code,
        email: member.user_email
      }
    };
  } catch (error) {
    console.error('Error validating referral code:', error);
    return { valid: false, error: 'Lỗi khi kiểm tra mã' };
  }
}

export default useReferralCheckout;