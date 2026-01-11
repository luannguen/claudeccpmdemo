/**
 * Design Tokens - Zero Farm Design System v1.0
 * 
 * USAGE:
 * import { colors, spacing, typography, shadows, borderRadius, transitions, breakpoints } from '@/components/design-system/tokens';
 * 
 * FONT: Inter (System Font Stack Fallback)
 * 
 * PRINCIPLES:
 * - Consistency: Dùng token, không hardcode
 * - Accessibility: WCAG 2.1 AA compliant
 * - Mobile-first: Responsive design
 * - Performance: CSS variables for runtime updates
 */

// ========== COLORS ==========
export const colors = {
  // Brand Colors
  primary: {
    50: '#f2f8e8',
    100: '#e5f1d1',
    200: '#cbE3a3',
    300: '#b1d575',
    400: '#97c747',
    500: '#7CB342', // Main brand color
    600: '#639035',
    700: '#4a6c28',
    800: '#31481b',
    900: '#18240d',
  },
  
  // Secondary/Accent Colors
  accent: {
    50: '#fff8e1',
    100: '#ffecb3',
    200: '#ffe082',
    300: '#ffd54f',
    400: '#ffca28',
    500: '#FF9800', // Accent/CTA color
    600: '#fb8c00',
    700: '#f57c00',
    800: '#ef6c00',
    900: '#e65100',
  },
  
  // Neutral/Gray Scale
  gray: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
    950: '#0F0F0F', // Dark text
  },
  
  // Semantic Colors
  semantic: {
    success: '#22c55e',
    successLight: '#dcfce7',
    warning: '#f59e0b',
    warningLight: '#fef3c7',
    error: '#ef4444',
    errorLight: '#fee2e2',
    info: '#3b82f6',
    infoLight: '#dbeafe',
  },
  
  // Background Colors
  background: {
    primary: '#ffffff',
    secondary: '#f9fafb',
    tertiary: '#f3f4f6',
    dark: '#0F0F0F',
  },
  
  // Text Colors
  text: {
    primary: '#0F0F0F',
    secondary: '#4b5563',
    tertiary: '#9ca3af',
    inverse: '#ffffff',
    muted: '#6b7280',
  },
  
  // Border Colors
  border: {
    default: '#e5e7eb',
    light: '#f3f4f6',
    dark: '#d1d5db',
    focus: '#7CB342',
  },
};

// ========== TYPOGRAPHY ==========
export const typography = {
  // Font Family - Inter as primary
  fontFamily: {
    sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    serif: "'Playfair Display', Georgia, 'Times New Roman', serif",
    mono: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
  },
  
  // Font Sizes (rem based, 1rem = 16px)
  fontSize: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
    '6xl': '3.75rem',  // 60px
  },
  
  // Font Weights
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  
  // Line Heights
  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
  
  // Letter Spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
};

// ========== SPACING ==========
export const spacing = {
  0: '0',
  px: '1px',
  0.5: '0.125rem',  // 2px
  1: '0.25rem',     // 4px
  1.5: '0.375rem',  // 6px
  2: '0.5rem',      // 8px
  2.5: '0.625rem',  // 10px
  3: '0.75rem',     // 12px
  3.5: '0.875rem',  // 14px
  4: '1rem',        // 16px
  5: '1.25rem',     // 20px
  6: '1.5rem',      // 24px
  7: '1.75rem',     // 28px
  8: '2rem',        // 32px
  9: '2.25rem',     // 36px
  10: '2.5rem',     // 40px
  11: '2.75rem',    // 44px (min touch target)
  12: '3rem',       // 48px
  14: '3.5rem',     // 56px
  16: '4rem',       // 64px
  20: '5rem',       // 80px
  24: '6rem',       // 96px
  28: '7rem',       // 112px
  32: '8rem',       // 128px
  36: '9rem',       // 144px
  40: '10rem',      // 160px
  44: '11rem',      // 176px
  48: '12rem',      // 192px
  52: '13rem',      // 208px
  56: '14rem',      // 224px
  60: '15rem',      // 240px
  64: '16rem',      // 256px
  72: '18rem',      // 288px
  80: '20rem',      // 320px
  96: '24rem',      // 384px
};

// ========== SHADOWS ==========
export const shadows = {
  none: 'none',
  xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  DEFAULT: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  
  // Colored shadows
  primary: '0 4px 14px 0 rgba(124, 179, 66, 0.39)',
  accent: '0 4px 14px 0 rgba(255, 152, 0, 0.39)',
  error: '0 4px 14px 0 rgba(239, 68, 68, 0.39)',
};

// ========== BORDER RADIUS ==========
export const borderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  DEFAULT: '0.25rem', // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px',
};

// ========== TRANSITIONS ==========
export const transitions = {
  // Duration
  duration: {
    75: '75ms',
    100: '100ms',
    150: '150ms',
    200: '200ms',
    300: '300ms',
    500: '500ms',
    700: '700ms',
    1000: '1000ms',
  },
  
  // Timing Functions
  timing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  
  // Common Transitions
  common: {
    fast: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    normal: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    colors: 'color, background-color, border-color, text-decoration-color, fill, stroke 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    opacity: 'opacity 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    transform: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

// ========== BREAKPOINTS ==========
export const breakpoints = {
  xs: '320px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// ========== Z-INDEX ==========
export const zIndex = {
  auto: 'auto',
  0: 0,
  10: 10,
  20: 20,
  30: 30,
  40: 40,
  50: 50,
  dropdown: 100,
  sticky: 200,
  modal: 300,
  popover: 400,
  tooltip: 500,
  toast: 600,
  overlay: 700,
};

// ========== COMPONENT SPECIFIC TOKENS ==========
export const components = {
  // Button
  button: {
    minHeight: '44px',
    paddingX: spacing[4],
    paddingY: spacing[2],
    borderRadius: borderRadius.xl,
    fontWeight: typography.fontWeight.semibold,
  },
  
  // Input
  input: {
    minHeight: '44px',
    paddingX: spacing[3],
    paddingY: spacing[2],
    borderRadius: borderRadius.lg,
    borderColor: colors.border.default,
    focusBorderColor: colors.primary[500],
  },
  
  // Card
  card: {
    borderRadius: borderRadius['2xl'],
    padding: spacing[6],
    shadow: shadows.md,
    background: colors.background.primary,
  },
  
  // Modal
  modal: {
    borderRadius: borderRadius['2xl'],
    padding: spacing[6],
    shadow: shadows['2xl'],
    maxWidth: {
      sm: '24rem',
      md: '28rem',
      lg: '32rem',
      xl: '36rem',
      '2xl': '42rem',
      '3xl': '48rem',
      '4xl': '56rem',
      '5xl': '64rem',
      '6xl': '72rem',
      '7xl': '80rem',
      full: '100%',
    },
  },
  
  // Badge
  badge: {
    paddingX: spacing[2.5],
    paddingY: spacing[0.5],
    borderRadius: borderRadius.full,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
  
  // Avatar
  avatar: {
    sizes: {
      xs: '1.5rem',   // 24px
      sm: '2rem',     // 32px
      md: '2.5rem',   // 40px
      lg: '3rem',     // 48px
      xl: '4rem',     // 64px
      '2xl': '5rem',  // 80px
      '3xl': '6rem',  // 96px
    },
    borderRadius: borderRadius.full,
  },
  
  // Navigation
  nav: {
    height: '64px',
    mobileHeight: '56px',
    padding: spacing[4],
  },
  
  // Bottom Navigation
  bottomNav: {
    height: '64px',
    iconSize: '24px',
    labelSize: typography.fontSize.xs,
  },
};

// ========== CSS VARIABLES GENERATOR ==========
export const generateCSSVariables = () => `
:root {
  /* Font Family */
  --font-sans: ${typography.fontFamily.sans};
  --font-serif: ${typography.fontFamily.serif};
  --font-mono: ${typography.fontFamily.mono};
  
  /* Primary Colors */
  --color-primary-50: ${colors.primary[50]};
  --color-primary-100: ${colors.primary[100]};
  --color-primary-200: ${colors.primary[200]};
  --color-primary-300: ${colors.primary[300]};
  --color-primary-400: ${colors.primary[400]};
  --color-primary-500: ${colors.primary[500]};
  --color-primary-600: ${colors.primary[600]};
  --color-primary-700: ${colors.primary[700]};
  --color-primary-800: ${colors.primary[800]};
  --color-primary-900: ${colors.primary[900]};
  
  /* Accent Colors */
  --color-accent-500: ${colors.accent[500]};
  
  /* Semantic Colors */
  --color-success: ${colors.semantic.success};
  --color-warning: ${colors.semantic.warning};
  --color-error: ${colors.semantic.error};
  --color-info: ${colors.semantic.info};
  
  /* Text Colors */
  --color-text-primary: ${colors.text.primary};
  --color-text-secondary: ${colors.text.secondary};
  --color-text-tertiary: ${colors.text.tertiary};
  
  /* Border */
  --color-border: ${colors.border.default};
  
  /* Shadows */
  --shadow-sm: ${shadows.sm};
  --shadow-md: ${shadows.md};
  --shadow-lg: ${shadows.lg};
  --shadow-xl: ${shadows.xl};
  
  /* Border Radius */
  --radius-sm: ${borderRadius.sm};
  --radius-md: ${borderRadius.md};
  --radius-lg: ${borderRadius.lg};
  --radius-xl: ${borderRadius.xl};
  --radius-2xl: ${borderRadius['2xl']};
  --radius-full: ${borderRadius.full};
  
  /* Transitions */
  --transition-fast: ${transitions.common.fast};
  --transition-normal: ${transitions.common.normal};
  --transition-slow: ${transitions.common.slow};
  
  /* Component Tokens */
  --button-min-height: ${components.button.minHeight};
  --input-min-height: ${components.input.minHeight};
  --nav-height: ${components.nav.height};
  --bottom-nav-height: ${components.bottomNav.height};
}
`;

// ========== TAILWIND CSS CLASS HELPERS ==========
export const tw = {
  // Text
  textPrimary: 'text-[#0F0F0F]',
  textSecondary: 'text-gray-600',
  textMuted: 'text-gray-500',
  
  // Background
  bgPrimary: 'bg-white',
  bgSecondary: 'bg-gray-50',
  bgTertiary: 'bg-gray-100',
  
  // Brand
  brandPrimary: 'bg-[#7CB342]',
  brandAccent: 'bg-[#FF9800]',
  textBrand: 'text-[#7CB342]',
  textAccent: 'text-[#FF9800]',
  
  // Border
  borderDefault: 'border-gray-200',
  borderFocus: 'focus:border-[#7CB342] focus:ring-[#7CB342]/30',
  
  // Button variants
  btnPrimary: 'bg-[#7CB342] hover:bg-[#689F38] text-white',
  btnSecondary: 'bg-white border-2 border-[#7CB342] text-[#7CB342] hover:bg-[#7CB342] hover:text-white',
  btnAccent: 'bg-[#FF9800] hover:bg-[#F57C00] text-white',
  btnGhost: 'bg-transparent hover:bg-gray-100 text-gray-700',
  
  // Touch target
  touchTarget: 'min-h-[44px] min-w-[44px]',
  
  // Card
  card: 'bg-white rounded-2xl shadow-md',
  cardHover: 'hover:shadow-lg transition-shadow',
  
  // Container
  container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
};

export default {
  colors,
  typography,
  spacing,
  shadows,
  borderRadius,
  transitions,
  breakpoints,
  zIndex,
  components,
  generateCSSVariables,
  tw,
};