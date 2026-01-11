import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, Award, ArrowRight, MapPin, Users, ShieldCheck } from "lucide-react";
import { Icon } from "@/components/ui/AnimatedIcon.jsx";
import { useSiteSettings } from "@/components/cms/useSiteConfig";
import { useLiveEditContext } from "@/components/cms/LiveEditContext";
import { EditableTextV2 } from "@/components/cms/EditableSectionV2";

const defaultSlides = [
  {
    id: 1,
    image_url: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=2560&q=90",
    headline: "Trang Trại Organic #1 Việt Nam",
    subheading: "Rau Củ Quả Sạch - An Toàn - Không Dư Lượng",
    description: "Trải nghiệm sản phẩm nông nghiệp hữu cơ cao cấp từ Zero Farm. 100% Organic, Không Thuốc Trừ Sâu, Cam Kết Không Dư Lượng Độc Hại.",
    cta_text: "ĐẶT HÀNG NGAY",
    isH1: true,
  },
  {
    id: 2,
    image_url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=2560&q=90",
    headline: "Canh Tác Theo Tiêu Chuẩn Organic",
    subheading: "Chứng Nhận VietGAP & GlobalGAP",
    description: "Quy trình sản xuất khép kín, kiểm soát chặt chẽ từ giống, đất trồng đến thu hoạch. Đảm bảo chất lượng cao nhất cho sức khỏe gia đình bạn.",
    cta_text: "TÌM HIỂU QUY TRÌNH",
    isH1: false,
  },
  {
    id: 3,
    image_url: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=2560&q=90",
    headline: "Giao Hàng Tận Nhà Trong Ngày",
    subheading: "Tươi Ngon Từ Vườn Đến Bàn Ăn",
    description: "Sản phẩm được thu hoạch mỗi sáng và giao đến tay bạn cùng ngày. Giữ trọn dinh dưỡng và độ tươi tự nhiên.",
    cta_text: "XEM SẢN PHẨM",
    isH1: false,
  }
];

// Trust indicators data
const trustIndicators = [
  { icon: Users, text: "5000+ Khách Hàng", color: "text-white" },
  { icon: Award, text: "Chứng Nhận VietGAP", color: "text-[#7CB342]" },
  { icon: MapPin, text: "3 Trang Trại Đà Lạt", color: "text-white" }
];

export default function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Lấy config từ CMS
  const { contact } = useSiteSettings();
  
  // Live Edit
  const { isEditMode, getSectionData } = useLiveEditContext();
  const sectionData = getSectionData?.('hero') || {};
  
  // Merge slides from CMS or use defaults
  const slides = sectionData?.slides?.length > 0 ? sectionData.slides : defaultSlides;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const goToSlide = (slideIndex) => {
    setCurrentIndex(slideIndex);
  };

  const currentSlide = slides[currentIndex];

  return (
    <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Background Images */}
      <AnimatePresence initial={false}>
        <motion.div
          key={currentIndex}
          className="absolute inset-0 w-full h-full"
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        >
          <img
            src={currentSlide.image_url}
            alt={`${currentSlide.headline} - Zero Farm Trang Trại Organic Sạch Không Dư Lượng`}
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
      </AnimatePresence>
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent z-10" />

      {/* Content */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 sm:pt-36 md:pt-40 pb-16 sm:pb-20">
        <div className="w-full max-w-6xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-white space-y-6 sm:space-y-8"
            >
              {/* Main Headline - Inter Font */}
              {currentSlide.isH1 ? (
                <h1 className="font-sans font-bold leading-[1.1] text-white text-[clamp(2rem,8vw,5rem)]" style={{ fontFamily: 'var(--font-sans)' }}>
                  {currentSlide.headline}
                  <br />
                  <span className="block text-[#7CB342] enhanced-glow-text mt-4 sm:mt-6 text-[0.85em] font-semibold">
                    {currentSlide.subheading}
                  </span>
                </h1>
              ) : (
                <h2 className="font-sans font-bold leading-[1.1] text-white text-[clamp(2rem,8vw,5rem)]" style={{ fontFamily: 'var(--font-sans)' }}>
                  {currentSlide.headline}
                  <br />
                  <span className="block text-[#7CB342] enhanced-glow-text mt-4 sm:mt-6 text-[0.85em] font-semibold">
                    {currentSlide.subheading}
                  </span>
                </h2>
              )}

              {/* Description - Inter Font */}
              <p className="text-gray-100 text-[clamp(1.125rem,4vw,1.5rem)] font-normal leading-relaxed max-w-4xl" style={{ fontFamily: 'var(--font-sans)' }}>
                {currentSlide.description}
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
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 pt-4 sm:pt-6">
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('open-booking-modal'))}
                  className="group bg-gradient-to-r from-[#7CB342] to-[#FF9800] text-white px-6 sm:px-8 lg:px-10 py-4 sm:py-5 rounded-full font-sans font-semibold text-sm sm:text-base lg:text-lg hover:from-[#FF9800] hover:to-[#7CB342] transition-all duration-500 hover:scale-105 shadow-2xl hover:shadow-[#7CB342]/30 flex items-center justify-center gap-2 sm:gap-3 min-h-[48px] sm:min-h-[56px] lg:min-h-[60px] w-full sm:w-auto"
                >
                  <span className="text-center leading-tight">
                    {currentSlide.cta_text}
                  </span>
                  <Icon.ArrowRight size={24} hover />
                </button>
                
                <button
                  onClick={() => window.location.href = `tel:${contact.hotline?.replace(/\s/g, '')}`}
                  className="group bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 px-6 sm:px-8 py-4 sm:py-5 rounded-full font-sans font-semibold text-sm sm:text-base lg:text-lg hover:bg-white hover:text-[#0F0F0F] transition-all duration-500 flex items-center justify-center gap-2 sm:gap-3 min-h-[48px] sm:min-h-[56px] lg:min-h-[60px] w-full sm:w-auto"
                >
                  <span className="whitespace-nowrap">Hotline: {contact.hotline}</span>
                </button>
              </div>

              {/* Urgency Element */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1 }}
                className="bg-black/30 backdrop-blur-sm rounded-2xl p-4 sm:p-6 max-w-sm sm:max-w-md border border-[#7CB342]/30 section-editable"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon.Sparkles size={16} className="text-[#7CB342]" />
                  <EditableTextV2
                    sectionKey="hero"
                    fieldPath="urgency_title"
                    defaultValue="ƯU ĐÃI TUẦN ĐẦU"
                    className="text-[#7CB342] font-medium text-xs sm:text-sm"
                    as="span"
                    label="Tiêu đề ưu đãi"
                  />
                </div>
                <EditableTextV2
                  sectionKey="hero"
                  fieldPath="urgency_text"
                  defaultValue="Đặt hàng ngay hôm nay và nhận giảm 20% cho đơn đầu tiên + Miễn phí giao hàng"
                  className="text-white/90 text-xs sm:text-sm leading-relaxed"
                  as="p"
                  multiline
                  label="Nội dung ưu đãi"
                />
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Dots */}
      <div className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 z-30 flex gap-2 sm:gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
              currentIndex === index ? "bg-white scale-125" : "bg-white/50 hover:bg-white"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Enhanced CSS */}
      <style jsx>{`
        .enhanced-glow-text {
          text-shadow: 
            0 0 5px rgba(124, 179, 66, 0.5),
            0 0 15px rgba(124, 179, 66, 0.3);
          filter: drop-shadow(0 0 4px rgba(124, 179, 66, 0.3));
        }
        
        @media (max-width: 640px) {
          .enhanced-glow-text {
            text-shadow: 
              0 0 3px rgba(124, 179, 66, 0.6),
              0 0 8px rgba(124, 179, 66, 0.4);
            filter: drop-shadow(0 0 2px rgba(124, 179, 66, 0.4));
          }
        }
      `}</style>
    </section>
  );
}