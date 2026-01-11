# Design Tokens - Complete Token System

> **Version**: 1.0.0  
> **Last Updated**: 2026-01-08  
> **Scope**: Spacing, Colors, Typography, Shadows, Border Radius, Z-Index

---

## 1. Color Tokens

### 1.1. Primary (Brand)
```css
--color-primary-50:  #F5F3FF;
--color-primary-100: #EDE9FE;
--color-primary-200: #DDD6FE;
--color-primary-300: #C4B5FD;
--color-primary-400: #A78BFA;
--color-primary-500: #8B5CF6;
--color-primary-600: #7C3AED; /* Main brand color */
--color-primary-700: #6D28D9;
--color-primary-800: #5B21B6;
--color-primary-900: #4C1D95;
```

### 1.2. Semantic Colors
```css
/* Success */
--color-success: #10B981;
--color-success-light: #D1FAE5;
--color-success-dark: #059669;

/* Error */
--color-error: #EF4444;
--color-error-light: #FEE2E2;
--color-error-dark: #DC2626;

/* Warning */
--color-warning: #F59E0B;
--color-warning-light: #FEF3C7;
--color-warning-dark: #D97706;

/* Info */
--color-info: #3B82F6;
--color-info-light: #DBEAFE;
--color-info-dark: #2563EB;
```

### 1.3. Neutral (Gray Scale)
```css
--color-white: #FFFFFF;
--color-gray-50:  #F9FAFB;  /* Background */
--color-gray-100: #F3F4F6;  /* Surface */
--color-gray-200: #E5E7EB;  /* Border */
--color-gray-300: #D1D5DB;  /* Border hover */
--color-gray-400: #9CA3AF;  /* Placeholder */
--color-gray-500: #6B7280;  /* Text secondary */
--color-gray-600: #4B5563;  /* Text tertiary */
--color-gray-700: #374151;
--color-gray-800: #1F2937;
--color-gray-900: #111827;  /* Text primary */
--color-black: #000000;
```

### 1.4. Module-Specific Colors
```css
/* E-Card */
--color-ecard: #10B981; /* Green */

/* Shop */
--color-shop: #3B82F6; /* Blue */

/* Referral */
--color-referral: #F59E0B; /* Amber */

/* Admin */
--color-admin: #7C3AED; /* Violet */
```

---

## 2. Spacing Tokens

### 2.1. Base Unit: 4px
```css
--space-0:  0px;
--space-1:  4px;
--space-2:  8px;
--space-3:  12px;
--space-4:  16px;   /* Default */
--space-5:  20px;
--space-6:  24px;
--space-8:  32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
--space-20: 80px;
--space-24: 96px;
```

### 2.2. Component Spacing
| Component | Padding | Gap |
|-----------|---------|-----|
| Button (sm) | 8px 12px | - |
| Button (md) | 12px 16px | - |
| Button (lg) | 16px 24px | - |
| Card | 24px | 16px |
| Modal | 24px | 20px |
| Form field | - | 8px (label-input) |

---

## 3. Typography Tokens

### 3.1. Font Families
```css
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
```

### 3.2. Font Sizes
```css
--text-xs:   12px;  /* 0.75rem */
--text-sm:   14px;  /* 0.875rem */
--text-base: 16px;  /* 1rem */
--text-lg:   18px;  /* 1.125rem */
--text-xl:   20px;  /* 1.25rem */
--text-2xl:  24px;  /* 1.5rem */
--text-3xl:  30px;  /* 1.875rem */
--text-4xl:  36px;  /* 2.25rem */
```

### 3.3. Line Heights
```css
--leading-none: 1;
--leading-tight: 1.25;
--leading-snug: 1.375;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
--leading-loose: 2;
```

### 3.4. Font Weights
```css
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
--font-extrabold: 800;
```

---

## 4. Shadow Tokens

### 4.1. Elevation Levels
```css
--shadow-sm:  0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md:  0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
--shadow-lg:  0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
--shadow-xl:  0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
```

### 4.2. Colored Shadows
```css
/* Primary shadow (hover effects) */
--shadow-primary: 0 4px 14px 0 rgba(124, 58, 237, 0.39);

/* Success */
--shadow-success: 0 4px 14px 0 rgba(16, 185, 129, 0.39);
```

---

## 5. Border Radius Tokens

```css
--radius-none: 0;
--radius-sm:   4px;   /* Small elements */
--radius-md:   6px;   /* Buttons, inputs */
--radius-lg:   8px;   /* Cards */
--radius-xl:   12px;  /* Modals */
--radius-2xl:  16px;  /* Large cards */
--radius-3xl:  24px;  /* Hero sections */
--radius-full: 9999px; /* Pills, avatars */
```

### Usage
| Element | Radius |
|---------|--------|
| Button | md (6px) |
| Input | md (6px) |
| Card | lg (8px) |
| Modal | xl (12px) |
| Badge/Pill | full |
| Avatar | full |

---

## 6. Transition Tokens

```css
--transition-fast:   150ms ease-in-out;
--transition-base:   200ms ease-in-out;
--transition-medium: 300ms ease-in-out;
--transition-slow:   500ms ease-in-out;
```

### Animation Curves
```css
--ease-in:     cubic-bezier(0.4, 0, 1, 1);
--ease-out:    cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

---

## 7. Opacity Tokens

```css
--opacity-0:   0;
--opacity-10:  0.1;
--opacity-20:  0.2;
--opacity-50:  0.5;   /* Disabled */
--opacity-60:  0.6;   /* Hover */
--opacity-75:  0.75;  /* Backdrop */
--opacity-90:  0.9;
--opacity-100: 1;
```

---

## 8. Breakpoint Tokens

```css
--breakpoint-sm:  640px;
--breakpoint-md:  768px;
--breakpoint-lg:  1024px;
--breakpoint-xl:  1280px;
--breakpoint-2xl: 1536px;
```

---

## 9. Container Tokens

```css
--container-sm:  640px;
--container-md:  768px;
--container-lg:  1024px;
--container-xl:  1280px;
--container-2xl: 1536px;
--container-full: 100%;
```

---

## 10. Grid Tokens

```css
--grid-cols-1:  repeat(1, minmax(0, 1fr));
--grid-cols-2:  repeat(2, minmax(0, 1fr));
--grid-cols-3:  repeat(3, minmax(0, 1fr));
--grid-cols-4:  repeat(4, minmax(0, 1fr));
--grid-cols-6:  repeat(6, minmax(0, 1fr));
--grid-cols-12: repeat(12, minmax(0, 1fr));
```

---

## 11. Border Width Tokens

```css
--border-0: 0px;
--border-1: 1px;  /* Default */
--border-2: 2px;  /* Emphasis */
--border-4: 4px;  /* Heavy emphasis */
--border-8: 8px;
```

---

## 12. Icon Size Tokens

```css
--icon-xs:  12px;
--icon-sm:  16px;  /* Inline với text */
--icon-md:  20px;  /* Buttons, cards */
--icon-lg:  24px;
--icon-xl:  32px;  /* Headers */
--icon-2xl: 40px;
--icon-3xl: 48px;
--icon-hero: 64px; /* Empty states */
```

---

## Usage Example

```jsx
// Tailwind CSS (recommended)
<Button className="
  px-4 py-3           // space-4
  rounded-lg          // radius-lg
  shadow-md           // shadow-md
  text-base           // text-base
  font-medium         // font-medium
  bg-violet-600       // color-primary-600
  hover:bg-violet-700 // color-primary-700
  transition-base     // transition-base
">

// CSS Variables
<div style={{
  padding: 'var(--space-4)',
  borderRadius: 'var(--radius-lg)',
  boxShadow: 'var(--shadow-md)',
  backgroundColor: 'var(--color-primary-600)'
}}>
```

---

> **Ghi nhớ**: Spacing base 4px, primary Violet-600, shadows 4 levels, radius lg cho cards, z-index scale 0-250.