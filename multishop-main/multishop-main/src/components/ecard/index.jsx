
/**
 * E-Card Module - Public API
 * Export only public interfaces
 */

// Hooks
export { 
  useEcardProfile, 
  usePublicEcardProfile, 
  useEcardSearch 
} from './hooks/useEcardProfile';

export { 
  useConnections, 
  useConnectionRequests 
} from './hooks/useConnections';

export { 
  useGifts 
} from './hooks/useGifts';

export { 
  useInviteAccept,
  usePendingInvite
} from './hooks/useInviteAccept';

// Types & Constants
export {
  CARE_LEVELS,
  CARE_LEVEL_CONFIG,
  CONNECTION_METHODS,
  CONNECTION_STATUS,
  GIFT_STATUS,
  DESIGN_TEMPLATES,
  DEFAULT_THEME_COLOR,
  GIFT_EXPIRY_DAYS
} from './types';

// Domain validators (for forms)
export { validateProfile, validateGiftValue } from './domain/validators';

// Invite code generator (for QR/links)
export { 
  generateInviteCode,
  generateInviteLink,
  generateInviteQRCodeUrl,
  validateInviteCode,
  isInviteExpired,
  getInviteInfo,
  isInviteCodeFormat
} from './domain/inviteCodeGenerator';

// Decision Tree (invite flow logic)
export {
  InviteStatus,
  Environment,
  detectEnvironment,
  makeDecision,
  ErrorMessages,
  ActionConfig
} from './domain/inviteDecisionTree';

// UI Components 
export { default as InviteErrorState } from './ui/InviteErrorState';
export { default as InviteSuccessState } from './ui/InviteSuccessState';

// Modals (kế thừa EnhancedModal)
export { default as ConnectionDetailModal } from './ui/ConnectionDetailModal';
export { default as RedeemGiftModal } from './ui/RedeemGiftModal';
export { default as EcardSearchModal } from './ui/EcardSearchModal';
export { default as ViewEcardModal } from './ui/ViewEcardModal';
export { default as ConnectionChatTab } from './ui/ConnectionChatTab';
