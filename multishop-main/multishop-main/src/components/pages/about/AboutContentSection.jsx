/**
 * AboutContentSection - Các section nội dung của trang Về Chúng Tôi
 * Đầy đủ các thành phần như trang chủ
 */
import React from "react";
import WhyChooseUs from "@/components/WhyChooseUs";
import CategoriesSection from "@/components/CategoriesSection";
import ProductSpecialty from "@/components/ProductSpecialty";
import WhatWeDo from "@/components/WhatWeDo";
import PromotionalBanner from "@/components/PromotionalBanner";
import BrandPartners from "@/components/BrandPartners";
import TestimonialsSection from "@/components/TestimonialsSection";
import AboutMissionSection from "@/components/pages/about/AboutMissionSection";
import AboutValuesSection from "@/components/pages/about/AboutValuesSection";

export default function AboutContentSection() {
  return (
    <>
      {/* Mission & Values - Đặc trưng trang About */}
      <div className="bg-[#FDFCF9] relative">
        <AboutMissionSection />
        <AboutValuesSection />
      </div>

      {/* Why Choose Us */}
      <div className="bg-[#FDFCF9] relative">
        <WhyChooseUs />
      </div>

      {/* Categories & Products */}
      <CategoriesSection />
      <ProductSpecialty />

      {/* What We Do, Banner, Partners, Testimonials */}
      <div className="bg-[#FDFCF9] relative">
        <WhatWeDo />
        <PromotionalBanner />
        <BrandPartners />
        <TestimonialsSection />
      </div>
    </>
  );
}