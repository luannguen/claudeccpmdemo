/**
 * AboutHeroSection - Hero section cho trang Về Chúng Tôi
 * Có banner image giống trang chủ
 */
import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Leaf, Heart, Users, Award, MapPin } from "lucide-react";
import { useSiteSettings } from "@/components/cms/useSiteConfig";

// Banner image
const ABOUT_BANNER = "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=2560&q=90";

// Trust indicators
const trustIndicators = [
  { icon: Users, text: "5000+ Khách Hàng", color: "text-white" },
  { icon: Award, text: "Chứng Nhận VietGAP", color: "text-[#7CB342]" },
  { icon: MapPin, text: "3 Trang Trại Đà Lạt", color: "text-white" }
];

export default function AboutHeroSection() {
  const { siteName } = useSiteSettings();

  return (
    <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Banner Background Image */}
      <motion.div
        className="absolute inset-0 w-full h-full"
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      >
        <img
          src={ABOUT_BANNER}
          alt="Về Chúng Tôi - Trang Trại Organic"
          className="w-full h-full object-cover object-center"
          style={{
            objectPosition: 'center center',
            objectFit: 'cover',
            width: '100%',
            height: '100%',
            minHeight: '100vh',
            maxWidth: '100vw'
          }}
        />
      </motion.div>
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent z-10" />

      {/* Content */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 sm:pt-36 md:pt-40 pb-16 sm:pb-20">
        <div className="w-full max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-white space-y-6 sm:space-y-8"
          >
            {/* Main Headline */}
            <h1 className="font-sans font-bold leading-[1.1] text-white text-[clamp(2rem,8vw,5rem)]" style={{ fontFamily: 'var(--font-sans)' }}>
              Câu Chuyện Của Chúng Tôi
              <br />
              <span className="block text-[#7CB342] mt-4 sm:mt-6 text-[0.85em] font-semibold" style={{ textShadow: '0 0 15px rgba(124, 179, 66, 0.3)' }}>
                {siteName || "Farmer Smart"} - Nông Nghiệp Hữu Cơ Bền Vững
              </span>
            </h1>

            {/* Description */}
            <p className="text-gray-100 text-[clamp(1.125rem,4vw,1.5rem)] font-normal leading-relaxed max-w-4xl" style={{ fontFamily: 'var(--font-sans)' }}>
              Chúng tôi tin rằng thực phẩm sạch không chỉ là sản phẩm, 
              mà còn là lời cam kết với sức khỏe của bạn và tương lai của hành tinh.
            </p>
            
            {/* Trust Indicators */}
            <div className="flex flex-wrap gap-4 sm:gap-6 pt-2 sm:pt-4">
              {trustIndicators.map((indicator, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="flex items-center gap-2"
                >
                  <indicator.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${indicator.color}`} />
                  <span className="text-xs sm:text-sm font-medium text-white/90">{indicator.text}</span>
                </motion.div>
              ))}
            </div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl pt-6"
            >
              {[
                { icon: Leaf, value: "100%", label: "Organic", color: "text-[#7CB342]" },
                { icon: Users, value: "10K+", label: "Khách Hàng", color: "text-blue-400" },
                { icon: Heart, value: "5+", label: "Năm Kinh Nghiệm", color: "text-red-400" },
                { icon: Sparkles, value: "200+", label: "Sản Phẩm", color: "text-[#FF9800]" }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 text-center border border-white/20"
                >
                  <stat.icon className={`w-6 h-6 sm:w-8 sm:h-8 ${stat.color} mx-auto mb-2`} />
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs sm:text-sm text-white/70">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Navigation Dots - decorative */}
      <div className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 z-30 flex gap-2 sm:gap-3">
        <span className="w-8 h-2 bg-[#7CB342] rounded-full" />
        <span className="w-2 h-2 bg-white/50 rounded-full" />
        <span className="w-2 h-2 bg-white/50 rounded-full" />
      </div>
    </section>
  );
}