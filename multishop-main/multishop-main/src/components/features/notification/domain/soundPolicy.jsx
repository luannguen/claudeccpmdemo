/**
 * Sound Policy
 * Rules for when to play notification sounds
 */

import { priorityManager } from '../core/priorityManager';

/**
 * Default sound URLs
 */
export const DEFAULT_SOUNDS = {
  urgent: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZSA0PVqvn77BdGAg+ltryxm8jBS6Azvj',
  high: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZSA0PVqvn77BdGAg+ltryxm8jBS6Azvj',
  normal: null, // No sound for normal
  low: null     // No sound for low
};

/**
 * Get sound URL for notification
 */
export const getSoundUrl = (notification, customSounds = {}) => {
  const priority = notification.priority;
  
  // Check custom sounds first
  if (customSounds[priority]) {
    return customSounds[priority];
  }
  
  // Use default
  return DEFAULT_SOUNDS[priority];
};

/**
 * Should play sound based on rules
 */
export const shouldPlaySound = (notification, { soundEnabled = true, appFocused = true }) => {
  // Respect user preference
  if (!soundEnabled) return false;
  
  // Only play when app is focused (avoid annoyance)
  if (!appFocused) return false;
  
  // Check priority config
  return priorityManager.shouldPlaySound(notification);
};

/**
 * Get sound volume based on priority
 */
export const getSoundVolume = (notification) => {
  const volumeMap = {
    urgent: 0.8,
    high: 0.6,
    normal: 0.4,
    low: 0.2
  };
  
  return volumeMap[notification.priority] || 0.5;
};

export const soundPolicy = {
  DEFAULT_SOUNDS,
  getSoundUrl,
  shouldPlaySound,
  getSoundVolume
};

export default soundPolicy;