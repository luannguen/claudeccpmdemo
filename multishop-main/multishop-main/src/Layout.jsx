import React, { useMemo, useEffect } from "react";
import { useLocation } from "react-router-dom";

// Providers
import QueryClientProvider from "@/components/QueryClientProvider";
import AuthProvider from "@/components/AuthProvider";
import { ToastProvider } from "@/components/NotificationToast";
import ErrorBoundary from "@/components/ErrorBoundary";

// Layout Component
import ClientLayout from "@/components/layout/ClientLayout";

// PWA Support
import PWAManifestInjector from "@/components/PWAManifestInjector";

// Email Module Event Handlers
import { initializeEmailEventHandlers } from "@/components/features/email/events/registerHandlers";

// Design System - Global Font
import { generateCSSVariables } from "@/components/design-system/tokens";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();

  // Initialize email event handlers (once)
  useEffect(() => {
    initializeEmailEventHandlers();
  }, []);

  // Load Inter font via link tag (more reliable than @import in style tag)
  useEffect(() => {
    const fontLink = document.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap';
    fontLink.rel = 'stylesheet';
    fontLink.id = 'inter-font';
    
    if (!document.getElementById('inter-font')) {
      document.head.appendChild(fontLink);
    }
    
    return () => {
      // Don't remove on cleanup - font should persist
    };
  }, []);

  // ✅ Check if admin/standalone page (no client layout)
  const isAdminPage = useMemo(() => {
    const standalonePages = [
      'Admin', 'SuperAdmin', 'Shop', 'Tenant',
      'Marketplace', 'ShopStorefront', 'Features',
      'TesterPortal', 'TesterDashboardPage', 'TesterProfilePage'
    ];
    
    const isStandalone = standalonePages.some(keyword => 
      currentPageName?.includes(keyword)
    );
    
    const isAdminByPath = location.pathname.toLowerCase().includes('admin') ||
                          location.pathname.toLowerCase().includes('shop') ||
                          location.pathname.toLowerCase().includes('tenant') ||
                          location.pathname.toLowerCase().includes('super') ||
                          location.pathname.toLowerCase().includes('tester');
    
    return isStandalone || isAdminByPath;
  }, [currentPageName, location.pathname]);

  // Global Design System Styles
  const globalStyles = `
    /* ========== DESIGN SYSTEM - GLOBAL FONT ========== */
    :root {
      /* Font Family */
      --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      --font-serif: 'Playfair Display', Georgia, 'Times New Roman', serif;
      --font-mono: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
      
      /* Primary Colors */
      --color-primary-50: #f2f8e8;
      --color-primary-100: #e5f1d1;
      --color-primary-500: #7CB342;
      --color-primary-600: #639035;
      --color-primary-700: #4a6c28;
      
      /* Accent Colors */
      --color-accent-500: #FF9800;
      
      /* Semantic Colors */
      --color-success: #22c55e;
      --color-warning: #f59e0b;
      --color-error: #ef4444;
      --color-info: #3b82f6;
      
      /* Text Colors */
      --color-text-primary: #0F0F0F;
      --color-text-secondary: #4b5563;
      --color-text-tertiary: #9ca3af;
      
      /* Border */
      --color-border: #e5e7eb;
      
      /* Shadows */
      --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
      --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
      --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
      --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
      
      /* Border Radius */
      --radius-sm: 0.125rem;
      --radius-md: 0.375rem;
      --radius-lg: 0.5rem;
      --radius-xl: 0.75rem;
      --radius-2xl: 1rem;
      --radius-full: 9999px;
      
      /* Transitions */
      --transition-fast: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
      --transition-normal: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
      --transition-slow: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
      
      /* Component Tokens */
      --button-min-height: 44px;
      --input-min-height: 44px;
      --nav-height: 64px;
      --bottom-nav-height: 64px;
    }
    
    /* Apply Inter font globally */
    html, body {
      font-family: var(--font-sans);
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      text-rendering: optimizeLegibility;
    }
    
    /* Apply to all elements */
    *, *::before, *::after {
      font-family: inherit;
    }
    
    /* Headings can use serif for accent */
    .font-serif {
      font-family: var(--font-serif);
    }
    
    /* Code elements use mono */
    code, pre, kbd, samp {
      font-family: var(--font-mono);
    }
  `;

  // ✅ Admin pages - minimal wrapper
  if (isAdminPage) {
    return (
      <ErrorBoundary>
        <QueryClientProvider>
          <AuthProvider>
            <ToastProvider>
              <style>{globalStyles}</style>
              <PWAManifestInjector />
              {children}
            </ToastProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    );
  }

  // ✅ Client pages - full layout
  return (
    <ErrorBoundary>
      <QueryClientProvider>
        <AuthProvider>
          <ToastProvider>
            <style>{globalStyles}</style>
            <PWAManifestInjector />
            <ClientLayout currentPageName={currentPageName}>
              {children}
            </ClientLayout>
          </ToastProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}