/**
 * Home Page - Trang chủ với Scroll-Driven Storytelling
 * 
 * HOME-F01: 5 frames fullscreen với cross-dissolve backgrounds
 * - Frame 0: Trust (intro)
 * - Frame 1: Process 
 * - Frame 2: Social Proof
 * - Frame 3: CTA
 * - Frame 4: Exit/Contact
 * 
 * Sau scroll stage là các content sections thông thường.
 */
import React from "react";

// Scroll-driven stage - 5 frames fullscreen
import ScrollDrivenStage from "@/components/pages/home/ScrollDrivenStage";

// Regular content sections (sau scroll stage)
import HomeContentSection from "@/components/pages/home/HomeContentSection";

export default function Home() {
  return (
    <main className="relative">
      {/* Scroll-driven 5-frame storytelling */}
      <ScrollDrivenStage />
      
      {/* Regular content sections */}
      <HomeContentSection />
    </main>
  );
}