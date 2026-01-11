/**
 * Bottom Navigation Module
 * 
 * Context-aware bottom navigation system cho mobile.
 * 
 * Exports:
 * - BottomNavBar: Main component
 * - useBottomNav: Hook quản lý state
 * - Config utilities: getNavItemsForPage, getPageConfig
 */

// Main component
export { BottomNavBar, default } from './BottomNavBar';

// Hook
export { useBottomNav } from './useBottomNav';

// Item component
export { BottomNavItem } from './BottomNavItem';

// Config utilities
export { 
  getNavItemsForPage, 
  getPageConfig, 
  getPageTheme,
  FIXED_ITEMS,
  CONTEXT_ITEMS,
  PAGE_CONTEXT_CONFIG,
  DEFAULT_CONTEXT_CONFIG
} from './bottomNavConfig';