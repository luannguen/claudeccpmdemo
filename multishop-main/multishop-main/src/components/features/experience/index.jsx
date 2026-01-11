/**
 * Experience Module - Public API
 * 
 * Immersive Intro feature for QR → E-Card flow
 * 
 * @module features/experience
 */

// Hooks (public)
export { useExperience } from './hooks/useExperience';
export { useExperiencePlayer } from './hooks/useExperiencePlayer';

// UI Components (public)
export { default as ExperienceIntroView } from './ui/ExperienceIntroView';

// Types (public)
export * from './types/ExperienceDTO';

// Domain rules (public subset)
export { isValidUrl, getCtaTarget } from './domain/rules';

// Feature flags (public)
export { 
  isIntroEnabledForUser, 
  getFeatureFlagStatus,
  FLAG_INTRO_ENABLED,
  CANARY_ROLLOUT_PERCENTAGE
} from './domain/featureFlags';

// Data repository (public subset - for ecard integration)
export { experienceRepository } from './data/experienceRepository';