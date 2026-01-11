/**
 * Invite Decision Tree - Domain logic for invite acceptance
 * 
 * Determines the correct flow based on environment and auth state
 * 
 * Decision Tree:
 * 1. Validate invite code (INVALID/EXPIRED/USED)
 * 2. Detect environment (standalone/browser/webview)
 * 3. Check auth status
 * 4. Return appropriate action/state
 */

import { 
  isSocialWebview, 
  isStandalonePWA, 
  getWebviewType,
  isZaloWebview 
} from '../utils/webviewDetector';

// ============================================
// INVITE STATUS ENUM
// ============================================

export const InviteStatus = {
  CHECKING: 'CHECKING',
  INVALID: 'INVALID',
  EXPIRED: 'EXPIRED',
  USED: 'USED',
  SELF: 'SELF',
  NEED_LOGIN: 'NEED_LOGIN',
  ACCEPTING: 'ACCEPTING',
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR'
};

// ============================================
// ENVIRONMENT DETECTION
// ============================================

export const Environment = {
  PWA_STANDALONE: 'pwa_standalone',
  BROWSER_ANDROID: 'browser_android',
  BROWSER_IOS: 'browser_ios',
  BROWSER_DESKTOP: 'browser_desktop',
  WEBVIEW_ZALO_IOS: 'webview_zalo_ios',
  WEBVIEW_ZALO_ANDROID: 'webview_zalo_android',
  WEBVIEW_FACEBOOK: 'webview_facebook',
  WEBVIEW_OTHER: 'webview_other'
};

/**
 * Detect current environment
 * @returns {string} Environment type
 */
export const detectEnvironment = () => {
  const ua = navigator.userAgent || '';
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
  const isAndroid = /Android/i.test(ua);
  
  // Check PWA standalone first
  if (isStandalonePWA()) {
    return Environment.PWA_STANDALONE;
  }
  
  // Check social webviews
  if (isSocialWebview()) {
    const webviewType = getWebviewType();
    
    if (webviewType === 'zalo') {
      return isIOS ? Environment.WEBVIEW_ZALO_IOS : Environment.WEBVIEW_ZALO_ANDROID;
    }
    if (webviewType === 'facebook') {
      return Environment.WEBVIEW_FACEBOOK;
    }
    return Environment.WEBVIEW_OTHER;
  }
  
  // Regular browser
  if (isIOS) return Environment.BROWSER_IOS;
  if (isAndroid) return Environment.BROWSER_ANDROID;
  return Environment.BROWSER_DESKTOP;
};

// ============================================
// DECISION TREE LOGIC
// ============================================

/**
 * @typedef {Object} DecisionResult
 * @property {string} status - InviteStatus
 * @property {string} environment - Environment type
 * @property {boolean} canShowGoogleLogin - Whether Google login can be shown
 * @property {boolean} shouldBlockWebview - Whether to show webview blocker
 * @property {string|null} errorMessage - Error message if any
 * @property {Object|null} inviterProfile - Profile data
 * @property {string[]} availableActions - Available user actions
 */

/**
 * Main decision function
 * @param {Object} params
 * @param {string} params.inviteCode - The invite code
 * @param {Object|null} params.validationResult - Result from code validation
 * @param {boolean} params.isAuthenticated - Is user logged in
 * @param {Object|null} params.currentUser - Current user data
 * @param {Object|null} params.inviterProfile - Inviter profile data
 * @returns {DecisionResult}
 */
export const makeDecision = ({
  inviteCode,
  validationResult,
  isAuthenticated,
  currentUser,
  inviterProfile
}) => {
  const environment = detectEnvironment();
  const isZaloIOS = environment === Environment.WEBVIEW_ZALO_IOS;
  const isWebview = environment.startsWith('webview_');
  
  // Base result
  const baseResult = {
    environment,
    canShowGoogleLogin: !isZaloIOS && !isWebview,
    shouldBlockWebview: false,
    errorMessage: null,
    inviterProfile,
    availableActions: []
  };
  
  // Step 1: Check invite validity
  if (!inviteCode) {
    return {
      ...baseResult,
      status: InviteStatus.INVALID,
      errorMessage: 'Mã mời không hợp lệ',
      availableActions: ['go_home']
    };
  }
  
  if (validationResult?.status === 'expired') {
    return {
      ...baseResult,
      status: InviteStatus.EXPIRED,
      errorMessage: 'Mã mời đã hết hạn. Vui lòng yêu cầu mã mới.',
      availableActions: ['go_home', 'request_new']
    };
  }
  
  if (validationResult?.status === 'used') {
    return {
      ...baseResult,
      status: InviteStatus.USED,
      errorMessage: 'Mã mời đã được sử dụng.',
      availableActions: ['go_home']
    };
  }
  
  if (validationResult?.status === 'invalid') {
    return {
      ...baseResult,
      status: InviteStatus.INVALID,
      errorMessage: 'Mã mời không hợp lệ hoặc đã bị thay đổi.',
      availableActions: ['go_home']
    };
  }
  
  // Step 2: Check environment - block webview login
  if (isWebview && !isAuthenticated) {
    return {
      ...baseResult,
      status: InviteStatus.NEED_LOGIN,
      shouldBlockWebview: true,
      errorMessage: null,
      availableActions: isZaloIOS 
        ? ['copy_link', 'open_safari_instructions']
        : ['open_browser', 'copy_link']
    };
  }
  
  // Step 3: Check self-connection
  if (isAuthenticated && currentUser?.id === inviterProfile?.user_id) {
    return {
      ...baseResult,
      status: InviteStatus.SELF,
      errorMessage: 'Bạn không thể kết nối với chính mình',
      availableActions: ['view_my_ecard']
    };
  }
  
  // Step 4: Check authentication
  if (!isAuthenticated) {
    return {
      ...baseResult,
      status: InviteStatus.NEED_LOGIN,
      shouldBlockWebview: false,
      availableActions: ['login', 'view_profile']
    };
  }
  
  // Step 5: Ready to accept
  return {
    ...baseResult,
    status: InviteStatus.CHECKING,
    availableActions: ['accept', 'view_profile']
  };
};

// ============================================
// ERROR MESSAGES CONFIG
// ============================================

export const ErrorMessages = {
  [InviteStatus.INVALID]: {
    title: 'Mã mời không hợp lệ',
    description: 'Link kết nối không đúng định dạng hoặc đã bị thay đổi.',
    icon: 'AlertCircle',
    color: 'red'
  },
  [InviteStatus.EXPIRED]: {
    title: 'Mã mời đã hết hạn',
    description: 'Link kết nối này đã hết hạn sử dụng. Vui lòng yêu cầu người gửi chia sẻ lại.',
    icon: 'Clock',
    color: 'orange'
  },
  [InviteStatus.USED]: {
    title: 'Đã kết nối trước đó',
    description: 'Bạn đã sử dụng link này để kết nối rồi.',
    icon: 'CheckCircle',
    color: 'blue'
  },
  [InviteStatus.SELF]: {
    title: 'Đây là E-Card của bạn',
    description: 'Bạn không thể kết nối với chính mình.',
    icon: 'Info',
    color: 'amber'
  },
  [InviteStatus.ERROR]: {
    title: 'Có lỗi xảy ra',
    description: 'Không thể hoàn tất kết nối. Vui lòng thử lại sau.',
    icon: 'AlertTriangle',
    color: 'red'
  }
};

// ============================================
// ACTION HANDLERS CONFIG
// ============================================

export const ActionConfig = {
  go_home: {
    label: 'Về trang chủ',
    icon: 'Home',
    variant: 'default'
  },
  request_new: {
    label: 'Yêu cầu mã mới',
    icon: 'RefreshCw',
    variant: 'outline'
  },
  copy_link: {
    label: 'Sao chép link',
    icon: 'Copy',
    variant: 'default'
  },
  open_browser: {
    label: 'Mở bằng Chrome',
    icon: 'Globe',
    variant: 'default'
  },
  open_safari_instructions: {
    label: 'Hướng dẫn mở Safari',
    icon: 'ExternalLink',
    variant: 'outline'
  },
  login: {
    label: 'Đăng nhập để kết nối',
    icon: 'User',
    variant: 'default'
  },
  accept: {
    label: 'Kết nối ngay',
    icon: 'UserPlus',
    variant: 'default'
  },
  view_profile: {
    label: 'Xem thông tin',
    icon: 'Eye',
    variant: 'outline'
  },
  view_my_ecard: {
    label: 'Xem E-Card của tôi',
    icon: 'User',
    variant: 'default'
  }
};

export default {
  InviteStatus,
  Environment,
  detectEnvironment,
  makeDecision,
  ErrorMessages,
  ActionConfig
};