import React, { useState, useMemo, useCallback } from "react";
import { useLocation } from "react-router-dom";

// Data hooks
import { useCurrentUser, useMyTenant, useIsAdmin } from "./useLayoutData";
import { useScrollEffect, useSmoothScroll, useLayoutEvents } from "./useLayoutEvents";

// UI Components
import LayoutStyles from "./LayoutStyles";
import LayoutNavbar from "./LayoutNavbar";
import LayoutMobileMenu from "./LayoutMobileMenu";
import LayoutFooter from "./LayoutFooter";
import LayoutModals from "./LayoutModals";
import LayoutWidgets from "./LayoutWidgets";
import LoadingScreen from "@/components/LoadingScreen";

// Live Edit System
import { LiveEditContextProvider } from "@/components/cms/LiveEditContext";
import { LiveEditToolbarV2 } from "@/components/cms/LiveEditToolbarV2";

// AI Personalization Engine
import AIPersonalizationEngine from "@/components/ai/AIPersonalizationEngine";

// Chatbot Module (Enhanced with Multi-Agent)
import { ChatbotEnhanced } from "@/components/chatbot";

// Referral Link Handler
import ReferralLinkHandler from "@/components/referral/ReferralLinkHandler";

// E-Card Offline Support
import { OfflineStatusBar } from "@/components/features/ecard";

export default function ClientLayout({ children, currentPageName }) {
  const location = useLocation();
  
  // ✅ UI State
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollDirection, setScrollDirection] = useState('up'); // 'up' | 'down'
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // ✅ Modal States
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [initialService, setInitialService] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutCartItems, setCheckoutCartItems] = useState([]);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isWishlistModalOpen, setIsWishlistModalOpen] = useState(false);

  // ✅ Data Hooks
  const { data: currentUser } = useCurrentUser();
  const { data: myTenant } = useMyTenant(currentUser?.email);
  const isAdmin = useIsAdmin(currentUser);

  // ✅ Show bottom nav on all pages except Home (mobile only)
  const showBottomNav = useMemo(() => {
    return currentPageName !== 'Home';
  }, [currentPageName]);

  // ✅ Only show footer on AboutUs page
  const showFooter = useMemo(() => {
    return currentPageName === 'AboutUs';
  }, [currentPageName]);

  // ✅ Chỉ enable auto-hide navbar trên trang Home
  const enableNavbarAutoHide = currentPageName === 'Home';
  
  // ✅ Event Hooks
  useScrollEffect(setIsScrolled, enableNavbarAutoHide ? setScrollDirection : null);
  useSmoothScroll();
  useLayoutEvents({
    setIsBookingOpen,
    setInitialService,
    setIsCheckoutOpen,
    setCheckoutCartItems,
    setIsNotificationModalOpen,
    setIsWishlistModalOpen
  });

  // ✅ Callbacks
  const handleLoadingComplete = useCallback(() => {
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <LoadingScreen onLoadingComplete={handleLoadingComplete} />;
  }

  return (
    <LiveEditContextProvider>
      <div className="min-h-screen bg-[#F5F9F3] leading-relaxed" style={{ fontFamily: "var(--font-sans)" }}>
        <LayoutStyles />

        {/* Offline Status Bar - Shows when offline or has pending changes */}
        <OfflineStatusBar />

        <LayoutNavbar
          isScrolled={isScrolled}
          scrollDirection={scrollDirection}
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
          currentUser={currentUser}
          setIsUserMenuOpen={setIsUserMenuOpen}
          enableAutoHide={enableNavbarAutoHide}
        />

        <LayoutMobileMenu
          isOpen={isMenuOpen}
          setIsOpen={setIsMenuOpen}
          currentUser={currentUser}
          setIsUserMenuOpen={setIsUserMenuOpen}
        />

        <main className="relative" role="main">
          {children}
        </main>

        {showFooter && (
          <LayoutFooter currentUser={currentUser} isAdmin={isAdmin} />
        )}

        <LayoutWidgets showBottomNav={showBottomNav} currentPageName={currentPageName} />

        <LayoutModals
          isBookingOpen={isBookingOpen}
          setIsBookingOpen={setIsBookingOpen}
          initialService={initialService}
          setInitialService={setInitialService}
          isCheckoutOpen={isCheckoutOpen}
          setIsCheckoutOpen={setIsCheckoutOpen}
          checkoutCartItems={checkoutCartItems}
          setCheckoutCartItems={setCheckoutCartItems}
          isNotificationModalOpen={isNotificationModalOpen}
          setIsNotificationModalOpen={setIsNotificationModalOpen}
          isWishlistModalOpen={isWishlistModalOpen}
          setIsWishlistModalOpen={setIsWishlistModalOpen}
          isUserMenuOpen={isUserMenuOpen}
          setIsUserMenuOpen={setIsUserMenuOpen}
          currentUser={currentUser}
          isAdmin={isAdmin}
        />

        {/* Referral Link Handler - Auto-capture ref codes */}
        <ReferralLinkHandler />
        
        {/* Live Edit Toolbar for Admin */}
        <LiveEditToolbarV2 />
        
        {/* AI Personalization Engine - Chạy ngầm theo dõi user */}
        <AIPersonalizationEngine />
        
        {/* Chatbot - RBAC-secured Multi-Agent AI Assistant */}
        <ChatbotEnhanced enableAIContext={true} hideOnMobile={true} />
      </div>
    </LiveEditContextProvider>
  );
}