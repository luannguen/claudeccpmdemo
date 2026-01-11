/**
 * HomeHeroSection - Hero section cho trang chủ
 */
import React from "react";
import Hero from "@/components/Hero";
import TransitionCircle from "@/components/TransitionCircle";

export default function HomeHeroSection() {
  return (
    <div className="relative">
      <Hero />
      <TransitionCircle />
    </div>
  );
}