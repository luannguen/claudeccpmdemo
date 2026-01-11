/**
 * UI Patterns Library - Zero Farm Design System v1.0
 * 
 * Reusable UI patterns and component styles following design tokens.
 * 
 * USAGE:
 * import { patterns, getButtonClasses, getCardClasses } from '@/components/design-system/patterns';
 */

import { colors, typography, spacing, shadows, borderRadius, transitions, components } from './tokens';

// ========== BUTTON PATTERNS ==========
export const buttonPatterns = {
  // Base button styles
  base: `
    inline-flex items-center justify-center gap-2
    font-semibold text-sm
    min-h-[44px] px-4 py-2
    rounded-xl
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    active:scale-[0.98]
  `,
  
  // Variants
  variants: {
    primary: 'bg-[#7CB342] hover:bg-[#689F38] text-white focus:ring-[#7CB342]/50 shadow-md hover:shadow-lg',
    secondary: 'bg-white border-2 border-[#7CB342] text-[#7CB342] hover:bg-[#7CB342] hover:text-white focus:ring-[#7CB342]/50',
    accent: 'bg-[#FF9800] hover:bg-[#F57C00] text-white focus:ring-[#FF9800]/50 shadow-md hover:shadow-lg',
    danger: 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500/50',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 focus:ring-gray-500/50',
    outline: 'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500/50',
    link: 'bg-transparent text-[#7CB342] hover:text-[#689F38] hover:underline p-0 min-h-0',
  },
  
  // Sizes
  sizes: {
    xs: 'min-h-[32px] px-2.5 py-1 text-xs rounded-lg',
    sm: 'min-h-[36px] px-3 py-1.5 text-sm rounded-lg',
    md: 'min-h-[44px] px-4 py-2 text-sm rounded-xl',
    lg: 'min-h-[52px] px-6 py-3 text-base rounded-xl',
    xl: 'min-h-[60px] px-8 py-4 text-lg rounded-2xl',
  },
};

// ========== CARD PATTERNS ==========
export const cardPatterns = {
  base: `
    bg-white rounded-2xl
    transition-all duration-200
  `,
  
  variants: {
    default: 'shadow-md',
    elevated: 'shadow-lg hover:shadow-xl',
    bordered: 'border border-gray-200',
    flat: 'bg-gray-50',
    interactive: 'shadow-md hover:shadow-lg cursor-pointer',
  },
  
  padding: {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  },
};

// ========== INPUT PATTERNS ==========
export const inputPatterns = {
  base: `
    w-full min-h-[44px] px-3 py-2
    bg-white border border-gray-200 rounded-lg
    text-gray-900 placeholder:text-gray-400
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-[#7CB342]/30 focus:border-[#7CB342]
    disabled:bg-gray-100 disabled:cursor-not-allowed
  `,
  
  variants: {
    default: '',
    error: 'border-red-500 focus:border-red-500 focus:ring-red-500/30',
    success: 'border-green-500 focus:border-green-500 focus:ring-green-500/30',
  },
  
  sizes: {
    sm: 'min-h-[36px] px-2.5 py-1.5 text-sm',
    md: 'min-h-[44px] px-3 py-2 text-base',
    lg: 'min-h-[52px] px-4 py-3 text-lg',
  },
};

// ========== BADGE PATTERNS ==========
export const badgePatterns = {
  base: `
    inline-flex items-center gap-1
    px-2.5 py-0.5
    text-xs font-semibold
    rounded-full
  `,
  
  variants: {
    default: 'bg-gray-100 text-gray-700',
    primary: 'bg-[#7CB342]/10 text-[#7CB342]',
    accent: 'bg-[#FF9800]/10 text-[#FF9800]',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    error: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
    outline: 'bg-transparent border border-current',
  },
};

// ========== TYPOGRAPHY PATTERNS ==========
export const textPatterns = {
  // Headings
  h1: 'text-4xl sm:text-5xl font-bold text-[#0F0F0F] leading-tight',
  h2: 'text-3xl sm:text-4xl font-bold text-[#0F0F0F] leading-tight',
  h3: 'text-2xl sm:text-3xl font-bold text-[#0F0F0F] leading-snug',
  h4: 'text-xl sm:text-2xl font-semibold text-[#0F0F0F] leading-snug',
  h5: 'text-lg sm:text-xl font-semibold text-[#0F0F0F]',
  h6: 'text-base sm:text-lg font-semibold text-[#0F0F0F]',
  
  // Body text
  body: 'text-base text-gray-700 leading-relaxed',
  bodySmall: 'text-sm text-gray-600 leading-relaxed',
  bodyLarge: 'text-lg text-gray-700 leading-relaxed',
  
  // Utility text
  caption: 'text-xs text-gray-500',
  label: 'text-sm font-medium text-gray-700',
  overline: 'text-xs font-semibold uppercase tracking-wider text-gray-500',
  
  // Special
  lead: 'text-lg sm:text-xl text-gray-600 leading-relaxed',
  muted: 'text-gray-500',
  link: 'text-[#7CB342] hover:text-[#689F38] hover:underline cursor-pointer transition-colors',
};

// ========== LAYOUT PATTERNS ==========
export const layoutPatterns = {
  // Container
  container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  containerNarrow: 'max-w-4xl mx-auto px-4 sm:px-6 lg:px-8',
  containerWide: 'max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8',
  
  // Sections
  section: 'py-12 sm:py-16 lg:py-20',
  sectionSmall: 'py-8 sm:py-12',
  sectionLarge: 'py-16 sm:py-24 lg:py-32',
  
  // Grid
  grid2: 'grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6',
  grid3: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6',
  grid4: 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6',
  
  // Flex
  flexCenter: 'flex items-center justify-center',
  flexBetween: 'flex items-center justify-between',
  flexStart: 'flex items-center justify-start',
  flexEnd: 'flex items-center justify-end',
  flexCol: 'flex flex-col',
  
  // Stack
  stackSm: 'space-y-2',
  stackMd: 'space-y-4',
  stackLg: 'space-y-6',
  stackXl: 'space-y-8',
};

// ========== STATE PATTERNS ==========
export const statePatterns = {
  // Loading
  loading: {
    spinner: 'animate-spin rounded-full border-2 border-gray-200 border-t-[#7CB342]',
    pulse: 'animate-pulse bg-gray-200 rounded',
    skeleton: 'animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded',
  },
  
  // Empty state
  empty: {
    container: 'text-center py-12 px-4',
    icon: 'w-16 h-16 mx-auto mb-4 text-gray-300',
    title: 'text-lg font-medium text-gray-900 mb-2',
    description: 'text-sm text-gray-500 mb-6',
  },
  
  // Error state
  error: {
    container: 'text-center py-12 px-4',
    icon: 'w-16 h-16 mx-auto mb-4 text-red-400',
    title: 'text-lg font-medium text-gray-900 mb-2',
    description: 'text-sm text-gray-500 mb-6',
  },
};

// ========== HELPER FUNCTIONS ==========

/**
 * Generate button class string
 */
export const getButtonClasses = (variant = 'primary', size = 'md', className = '') => {
  return `${buttonPatterns.base} ${buttonPatterns.variants[variant] || buttonPatterns.variants.primary} ${buttonPatterns.sizes[size] || buttonPatterns.sizes.md} ${className}`.trim();
};

/**
 * Generate card class string
 */
export const getCardClasses = (variant = 'default', padding = 'lg', className = '') => {
  return `${cardPatterns.base} ${cardPatterns.variants[variant] || cardPatterns.variants.default} ${cardPatterns.padding[padding] || cardPatterns.padding.lg} ${className}`.trim();
};

/**
 * Generate input class string
 */
export const getInputClasses = (variant = 'default', size = 'md', className = '') => {
  return `${inputPatterns.base} ${inputPatterns.variants[variant] || ''} ${inputPatterns.sizes[size] || inputPatterns.sizes.md} ${className}`.trim();
};

/**
 * Generate badge class string
 */
export const getBadgeClasses = (variant = 'default', className = '') => {
  return `${badgePatterns.base} ${badgePatterns.variants[variant] || badgePatterns.variants.default} ${className}`.trim();
};

// ========== PRODUCT CARD PATTERN (Special) ==========
export const productCardPattern = {
  container: `
    bg-white rounded-2xl shadow-md
    overflow-hidden
    transition-all duration-300
    hover:shadow-lg hover:-translate-y-1
    group
  `,
  
  imageWrapper: `
    relative aspect-square
    bg-gray-100
    overflow-hidden
  `,
  
  image: `
    w-full h-full object-cover
    transition-transform duration-500
    group-hover:scale-105
  `,
  
  content: 'p-4',
  
  title: 'font-semibold text-[#0F0F0F] line-clamp-2 mb-1',
  
  price: 'text-lg font-bold text-[#7CB342]',
  
  priceOriginal: 'text-sm text-gray-400 line-through',
  
  badge: {
    hot: 'absolute top-2 left-2 bg-[#FF9800] text-white px-2 py-1 rounded-full text-xs font-bold',
    sale: 'absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold',
    new: 'absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold',
  },
  
  actions: 'absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity',
  
  actionButton: `
    w-10 h-10 rounded-full
    bg-white/90 shadow-md
    flex items-center justify-center
    hover:bg-[#7CB342] hover:text-white
    transition-colors
  `,
};

// ========== EXPORT ALL ==========
export const patterns = {
  button: buttonPatterns,
  card: cardPatterns,
  input: inputPatterns,
  badge: badgePatterns,
  text: textPatterns,
  layout: layoutPatterns,
  state: statePatterns,
  productCard: productCardPattern,
};

export default patterns;