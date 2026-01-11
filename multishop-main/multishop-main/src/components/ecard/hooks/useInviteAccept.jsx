/**
 * Hook: useInviteAccept
 * Handle invite code acceptance flow with deferred context
 */

import { useState, useEffect, useCallback } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/NotificationToast';
import * as inviteCodeGenerator from '../domain/inviteCodeGenerator';
import * as ecardRepository from '../data/ecardRepository';
import * as connectionRepository from '../data/connectionRepository';

const PENDING_INVITE_KEY = 'ecard_pending_invite';

// Safe toast wrapper
const useSafeToast = () => {
  try {
    return useToast();
  } catch {
    return { addToast: () => {} };
  }
};

/**
 * Save pending invite to localStorage
 */
const savePendingInvite = (code, source = 'qr_scan') => {
  try {
    localStorage.setItem(PENDING_INVITE_KEY, JSON.stringify({
      code,
      timestamp: Date.now(),
      source
    }));
  } catch (error) {
    console.warn('Failed to save pending invite:', error);
  }
};

/**
 * Get pending invite from localStorage
 */
const getPendingInvite = () => {
  try {
    const stored = localStorage.getItem(PENDING_INVITE_KEY);
    if (!stored) return null;
    
    const data = JSON.parse(stored);
    
    // Check if too old (24 hours)
    const age = Date.now() - data.timestamp;
    if (age > 24 * 60 * 60 * 1000) {
      clearPendingInvite();
      return null;
    }
    
    return data;
  } catch (error) {
    return null;
  }
};

/**
 * Clear pending invite
 */
const clearPendingInvite = () => {
  try {
    localStorage.removeItem(PENDING_INVITE_KEY);
  } catch (error) {
    console.warn('Failed to clear pending invite:', error);
  }
};

/**
 * Main hook for invite acceptance
 */
export function useInviteAccept(inviteCode) {
  const queryClient = useQueryClient();
  const { addToast } = useSafeToast();
  const [inviteInfo, setInviteInfo] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authCheckComplete, setAuthCheckComplete] = useState(false);

  // Validate invite code AND auto-save for later
  useEffect(() => {
    if (!inviteCode) {
      setValidationError('Mã mời không hợp lệ');
      return;
    }

    // Check if it's invite code format or old slug format
    if (!inviteCodeGenerator.isInviteCodeFormat(inviteCode)) {
      // Fallback: treat as slug (backward compat)
      setInviteInfo({
        isLegacySlug: true,
        slug: inviteCode
      });
      // Auto-save pending invite for guests
      savePendingInvite(inviteCode, 'link_share');
      return;
    }

    // Validate signature
    if (!inviteCodeGenerator.validateInviteCode(inviteCode)) {
      setValidationError('Mã mời không hợp lệ hoặc đã bị thay đổi');
      return;
    }

    // Check expiry
    if (inviteCodeGenerator.isInviteExpired(inviteCode)) {
      setValidationError('Mã mời đã hết hạn');
      return;
    }

    // Get invite info
    const info = inviteCodeGenerator.getInviteInfo(inviteCode);
    setInviteInfo(info);
    setValidationError(null);
    
    // Auto-save pending invite for guests (will be processed after login)
    savePendingInvite(inviteCode, 'qr_scan');
  }, [inviteCode]);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authenticated = await base44.auth.isAuthenticated();
        setIsAuthenticated(authenticated);
        
        if (authenticated) {
          const user = await base44.auth.me();
          setCurrentUser(user);
        }
      } catch (error) {
        setIsAuthenticated(false);
        setCurrentUser(null);
      } finally {
        setAuthCheckComplete(true);
      }
    };
    
    checkAuth();
  }, []);

  // Fetch inviter profile
  const { data: inviterProfile, isLoading: loadingProfile, error: profileError } = useQuery({
    queryKey: ['inviterProfile', inviteInfo?.slug || inviteInfo?.inviterId],
    queryFn: async () => {
      if (inviteInfo?.isLegacySlug) {
        return ecardRepository.getProfileBySlug(inviteInfo.slug);
      }
      
      if (inviteInfo?.slug) {
        return ecardRepository.getProfileBySlug(inviteInfo.slug);
      }
      
      return null;
    },
    enabled: !!inviteInfo && !validationError,
    staleTime: 5 * 60 * 1000
  });

  // Accept connection mutation
  const acceptMutation = useMutation({
    mutationFn: async () => {
      // Check auth status first
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) {
        throw new Error('NOT_AUTHENTICATED');
      }
      
      // Get fresh user data
      const user = await base44.auth.me();
      if (!user) {
        throw new Error('NOT_AUTHENTICATED');
      }
      
      if (!inviterProfile) {
        throw new Error('Không tìm thấy thông tin người mời');
      }
      
      // Check if trying to connect to self
      if (user.id === inviterProfile.user_id) {
        throw new Error('Không thể kết nối với chính mình');
      }
      
      // Create bidirectional connection
      return connectionRepository.createBidirectionalConnection(
        user.id,
        inviterProfile
      );
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['userConnections'] });
      clearPendingInvite();
      
      if (result.isNew) {
        addToast(`Đã kết nối với ${inviterProfile?.display_name}!`, 'success');
      } else {
        addToast('Đã kết nối trước đó', 'info');
      }
    },
    onError: (error) => {
      // Don't show toast for auth error - let UI handle redirect
      if (error.message === 'NOT_AUTHENTICATED') {
        return;
      }
      addToast(error.message || 'Không thể kết nối', 'error');
    }
  });

  // Save for deferred acceptance (when not logged in)
  const saveForLater = useCallback(() => {
    if (inviteCode) {
      savePendingInvite(inviteCode, 'link_share');
      return true;
    }
    return false;
  }, [inviteCode]);

  // Redirect to login with callback
  const redirectToLogin = useCallback(() => {
    saveForLater();
    const currentUrl = window.location.href;
    base44.auth.redirectToLogin(currentUrl);
  }, [saveForLater]);

  // Accept connection
  const acceptInvite = useCallback(async () => {
    // Check auth status fresh
    const isAuth = await base44.auth.isAuthenticated();
    
    if (!isAuth) {
      saveForLater();
      redirectToLogin();
      return { success: false, reason: 'not_authenticated' };
    }
    
    try {
      const result = await acceptMutation.mutateAsync();
      return { success: true, result };
    } catch (error) {
      if (error.message === 'NOT_AUTHENTICATED') {
        saveForLater();
        redirectToLogin();
        return { success: false, reason: 'not_authenticated' };
      }
      return { success: false, reason: error.message };
    }
  }, [acceptMutation, redirectToLogin, saveForLater]);

  return {
    // State
    inviteInfo,
    validationError,
    isAuthenticated,
    currentUser,
    inviterProfile,
    authCheckComplete,
    
    // Loading states
    isLoading: loadingProfile || !authCheckComplete,
    isAccepting: acceptMutation.isPending,
    
    // Actions
    acceptInvite,
    saveForLater,
    redirectToLogin,
    
    // Result
    acceptResult: acceptMutation.data,
    acceptError: acceptMutation.error
  };
}

/**
 * Hook to check and process pending invite after login
 */
export function usePendingInvite() {
  const queryClient = useQueryClient();
  const { addToast } = useSafeToast();
  const [pendingInvite, setPendingInvite] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Check for pending invite on mount
  useEffect(() => {
    const pending = getPendingInvite();
    setPendingInvite(pending);
  }, []);

  // Process pending invite
  const processPendingInvite = useCallback(async () => {
    if (!pendingInvite?.code) return { success: false };
    
    setIsProcessing(true);
    
    try {
      // Check auth
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) {
        setIsProcessing(false);
        return { success: false, reason: 'not_authenticated' };
      }
      
      const user = await base44.auth.me();
      
      // Get invite info
      let slug;
      if (inviteCodeGenerator.isInviteCodeFormat(pendingInvite.code)) {
        const info = inviteCodeGenerator.getInviteInfo(pendingInvite.code);
        slug = info?.slug;
      } else {
        slug = pendingInvite.code; // Legacy slug format
      }
      
      if (!slug) {
        throw new Error('Invalid invite code');
      }
      
      // Get inviter profile
      const inviterProfile = await ecardRepository.getProfileBySlug(slug);
      
      // Check self-connection
      if (user.id === inviterProfile.user_id) {
        clearPendingInvite();
        setIsProcessing(false);
        return { success: false, reason: 'self_connection' };
      }
      
      // Create connection
      const result = await connectionRepository.createBidirectionalConnection(
        user.id,
        inviterProfile
      );
      
      // Clear pending and notify
      clearPendingInvite();
      setPendingInvite(null);
      queryClient.invalidateQueries({ queryKey: ['userConnections'] });
      
      if (result.isNew) {
        addToast(`Đã tự động kết nối với ${inviterProfile.display_name}!`, 'success');
      }
      
      setIsProcessing(false);
      return { success: true, result, inviterProfile };
      
    } catch (error) {
      console.error('Failed to process pending invite:', error);
      clearPendingInvite();
      setPendingInvite(null);
      setIsProcessing(false);
      return { success: false, reason: error.message };
    }
  }, [pendingInvite, queryClient, addToast]);

  // Clear pending
  const clearPending = useCallback(() => {
    clearPendingInvite();
    setPendingInvite(null);
  }, []);

  return {
    pendingInvite,
    isProcessing,
    processPendingInvite,
    clearPending,
    hasPendingInvite: !!pendingInvite
  };
}

// Export utility functions for checking pending invites (no hooks)
export const hasPendingInviteCode = () => {
  const stored = localStorage.getItem(PENDING_INVITE_KEY);
  if (!stored) return false;
  
  try {
    const data = JSON.parse(stored);
    const age = Date.now() - data.timestamp;
    return age < 24 * 60 * 60 * 1000; // Within 24 hours
  } catch {
    return false;
  }
};

/**
 * Process pending invite on login - standalone function (no hooks)
 * Use this in AuthProvider context where ToastProvider may not be available
 * NOTE: Uses base44.auth.me() to avoid permission denied on User.filter()
 */
export const processPendingInviteOnLogin = async () => {
  console.log('🔗 Processing pending invite after login...');
  
  const stored = localStorage.getItem(PENDING_INVITE_KEY);
  if (!stored) {
    return { success: false, error: 'No pending invite' };
  }
  
  try {
    const data = JSON.parse(stored);
    const code = data.code;
    
    if (!code) {
      return { success: false, error: 'Invalid stored data' };
    }
    
    // Check auth
    const isAuth = await base44.auth.isAuthenticated();
    if (!isAuth) {
      return { success: false, error: 'Not authenticated' };
    }
    
    const user = await base44.auth.me();
    if (!user || !user.id) {
      return { success: false, error: 'User not found' };
    }
    
    // Get invite info - handle both invite code and legacy slug formats
    let slug;
    try {
      if (inviteCodeGenerator.isInviteCodeFormat(code)) {
        const info = inviteCodeGenerator.getInviteInfo(code);
        slug = info?.slug;
      } else {
        slug = code; // Legacy slug format
      }
    } catch (decodeError) {
      console.error('Failed to decode invite code:', decodeError);
      // Try as legacy slug directly
      slug = code;
    }
    
    if (!slug) {
      clearPendingInvite();
      return { success: false, error: 'Invalid invite code' };
    }
    
    // Get inviter profile
    let inviterProfile;
    try {
      inviterProfile = await ecardRepository.getProfileBySlug(slug);
    } catch (profileError) {
      console.error('Failed to get inviter profile:', profileError);
      clearPendingInvite();
      return { success: false, error: 'Profile not found' };
    }
    
    if (!inviterProfile || !inviterProfile.user_id) {
      clearPendingInvite();
      return { success: false, error: 'Invalid inviter profile' };
    }
    
    // Check self-connection
    if (user.id === inviterProfile.user_id) {
      clearPendingInvite();
      return { success: false, reason: 'self_connection' };
    }
    
    // Create connection
    const result = await connectionRepository.createBidirectionalConnection(
      user.id,
      inviterProfile
    );
    
    // Clear pending
    clearPendingInvite();
    
    console.log('✅ Pending invite processed successfully:', inviterProfile.display_name);
    return { success: true, result, inviterProfile };
    
  } catch (error) {
    console.error('Failed to process pending invite:', error);
    clearPendingInvite();
    return { success: false, error: error.message };
  }
};

export default useInviteAccept;