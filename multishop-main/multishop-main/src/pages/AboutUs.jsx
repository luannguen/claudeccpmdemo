/**
 * About Us Page - Trang Về Chúng Tôi
 * 
 * Cấu trúc tương tự trang chủ, focus vào giới thiệu công ty.
 */
import React from "react";

// Section components
import AboutHeroSection from "@/components/pages/about/AboutHeroSection";
import AboutContentSection from "@/components/pages/about/AboutContentSection";

export default function AboutUs() {
  return (
    <div>
      <AboutHeroSection />
      <AboutContentSection />
    </div>
  );
}