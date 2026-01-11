import React from 'react';

// ✅ Global CSS styles cho Layout - Áp dụng Design System
export default function LayoutStyles() {
  return (
    <>
      {/* Google Fonts - Inter (Primary) + Playfair Display (Accent) */}
      <link
        rel="preconnect"
        href="https://fonts.googleapis.com"
      />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <style>{`
      /* ========== DESIGN SYSTEM TOKENS ========== */
      :root {
        /* Font Families */
        --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        --font-serif: 'Playfair Display', Georgia, 'Times New Roman', serif;
        --font-mono: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
        
        /* Brand Colors */
        --obsidian: #0F0F0F;
        --shell: #F5F9F3;
        --green: #7CB342;
        --orange: #FF9800;
        
        /* Primary Colors */
        --color-primary-50: #f2f8e8;
        --color-primary-100: #e5f1d1;
        --color-primary-500: #7CB342;
        --color-primary-600: #639035;
        --color-primary-700: #4a6c28;
        
        /* Typography Scale */
        --font-h1: clamp(2.5rem, 5vw, 4rem);
        --font-h2: clamp(1.75rem, 3.5vw, 2.75rem);
        --font-h3: clamp(1.25rem, 2.5vw, 1.75rem);
        --font-body: clamp(1rem, 1.6vw, 1.125rem);
        --font-small: 0.875rem;
        --font-xs: 0.75rem;
        
        /* Font Weights */
        --font-weight-light: 300;
        --font-weight-normal: 400;
        --font-weight-medium: 500;
        --font-weight-semibold: 600;
        --font-weight-bold: 700;
        --font-weight-extrabold: 800;
        
        /* Line Heights */
        --line-height-tight: 1.25;
        --line-height-normal: 1.5;
        --line-height-relaxed: 1.625;
        --line-height-loose: 2;
        
        /* Letter Spacing */
        --letter-spacing-tight: -0.025em;
        --letter-spacing-normal: 0;
        --letter-spacing-wide: 0.025em;
      }

      /* ========== GLOBAL STYLES ========== */
      *, *::before, *::after {
        box-sizing: border-box;
      }

      html, body {
        font-family: var(--font-sans);
        font-size: 16px;
        line-height: var(--line-height-normal);
        text-rendering: optimizeLegibility;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        font-feature-settings: 'kern' 1, 'liga' 1;
      }

      /* Font class utilities */
      .font-sans { font-family: var(--font-sans) !important; }
      .font-serif { font-family: var(--font-serif) !important; }
      .font-mono { font-family: var(--font-mono) !important; }
      
      /* Typography utilities */
      h1, h2, h3, h4, h5, h6 {
        font-family: var(--font-sans);
        font-weight: var(--font-weight-semibold);
        line-height: var(--line-height-tight);
        letter-spacing: var(--letter-spacing-tight);
      }
      
      p, span, div, li, a, button, input, textarea, select {
        font-family: var(--font-sans);
      }
      
      /* Force Inter on common tailwind classes */
      .font-sans, [class*="font-sans"] {
        font-family: var(--font-sans) !important;
      }
      
      /* Ensure all text elements use Inter by default */
      .text-sm, .text-base, .text-lg, .text-xl, .text-2xl, .text-3xl, .text-4xl, .text-5xl, .text-6xl {
        font-family: var(--font-sans);
      }
      
      /* Button and interactive elements */
      button, .btn, [role="button"] {
        font-family: var(--font-sans);
        font-weight: var(--font-weight-medium);
      }
      
      /* Cards and containers */
      .card, .modal, .dialog {
        font-family: var(--font-sans);
      }
      
      /* ========== GLOBAL FONT OVERRIDE - UNIFIED DESIGN SYSTEM ========== */
      /* 
       * ALL CLIENT PAGES USE INTER FONT FROM DESIGN TOKENS
       * To change font project-wide, edit only --font-sans variable above
       */
      
      /* Override all Tailwind font-serif classes */
      .font-serif,
      [class*="font-serif"] {
        font-family: var(--font-sans) !important;
      }
      
      /* Override inline styles that might use different fonts */
      [style*="font-family"],
      [style*="Playfair"],
      [style*="Georgia"],
      [style*="Times"] {
        font-family: var(--font-sans) !important;
      }
      
      /* All elements use Inter - Comprehensive selector */
      html, body,
      h1, h2, h3, h4, h5, h6,
      p, span, div, a, label, 
      li, ul, ol, td, th, dd, dt,
      input, textarea, select, button,
      article, section, aside, main, header, footer, nav,
      .title, .heading, .subtitle, .description,
      .badge, .tag, .chip, .card, .modal, .dialog,
      [class*="title"], [class*="heading"], [class*="text-"],
      [class*="font-"], [class*="leading-"] {
        font-family: var(--font-sans) !important;
      }
      
      /* Force font on all descendant elements */
      body, body * {
        font-family: var(--font-sans) !important;
      }
      
      /* Client pages specific - ensure all sections use Inter */
      .section-editable,
      .section-editable *,
      [data-live-edit],
      [data-live-edit] *,
      [data-section],
      [data-section] * {
        font-family: var(--font-sans) !important;
      }
      
      /* Hero, CTA, Feature sections */
      [class*="hero"],
      [class*="cta"],
      [class*="feature"],
      [class*="testimonial"],
      [class*="banner"],
      [class*="promo"] {
        font-family: var(--font-sans) !important;
      }
      
      /* Product pages */
      .product-card,
      .product-detail,
      .product-grid,
      [class*="product"] {
        font-family: var(--font-sans) !important;
      }
      
      /* PreOrder / Community / All client pages */
      [class*="preorder"],
      [class*="community"],
      [class*="blog"],
      [class*="contact"] {
        font-family: var(--font-sans) !important;
      }

      .glass-nav {
        backdrop-filter: blur(20px);
        background: rgba(245, 249, 243, 0.95);
        border-bottom: 1px solid rgba(124, 179, 66, 0.1);
      }

      .nav-transition {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        will-change: transform, opacity;
      }

      .sparkle-animation {
        animation: sparkle 3s ease-in-out infinite;
      }

      @keyframes sparkle {
        0%, 100% { opacity: 0.6; transform: scale(1) rotate(0deg); }
        50% { opacity: 1; transform: scale(1.1) rotate(180deg); }
      }

      .glow-text {
        text-shadow: 0 0 20px rgba(124, 179, 66, 0.3);
      }

      .text-shadow-dark {
        text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
      }

      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .animate-fadeInUp {
        animation: fadeInUp 0.5s ease-out forwards;
      }

      @media (prefers-reduced-motion: reduce) {
        *, html {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
          scroll-behavior: auto !important;
        }
      }

      img {
        image-rendering: -webkit-optimize-contrast;
        image-rendering: optimize-contrast;
      }

      img[loading="lazy"] {
        opacity: 0;
        transition: opacity 0.3s;
      }

      img[loading="lazy"].loaded {
        opacity: 1;
      }

      @media (max-width: 375px) {
        button[class*="bg-gradient-to-r"],
        button[class*="bg-[#7CB342]"],
        button[class*="bg-black/80"] {
          min-height: 44px;
          padding: 0.75rem 1.25rem !important;
          font-size: clamp(0.9rem, 4.5vw, 1rem) !important;
          max-width: 100%;
          height: auto;
          white-space: normal;
          line-height: 1.3;
          text-align: center;
        }

        button[class*="bg-gradient-to-r"] {
          padding: 1rem 1.5rem !important;
        }
      }
    `}</style>
    </>
  );
}