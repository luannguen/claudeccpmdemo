import React from "react";
import ChatBot from "@/components/ChatBot";
import ShoppingCartWidget from "@/components/ShoppingCart";
import BackToTop from "@/components/BackToTop";
import ReviewWidget from "@/components/ReviewWidget";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import SeoSchema from "@/components/SeoSchema";
import { BottomNavBar } from "@/components/bottomnav";

export default function LayoutWidgets({ showBottomNav, currentPageName }) {
  return (
    <>
      <SeoSchema />
      <ChatBot />
      <ShoppingCartWidget />
      {!showBottomNav && <BackToTop />}
      <ReviewWidget />
      <PWAInstallPrompt />
      
      {/* Context-aware Bottom Nav - Mobile only, all pages except Home */}
      {showBottomNav && (
        <div className="lg:hidden">
          <BottomNavBar currentPageName={currentPageName} />
        </div>
      )}
    </>
  );
}