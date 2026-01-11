/**
 * ScrollDrivenStage - Main container cho scroll-driven storytelling
 * 
 * 100dvh stage với 5 frames, cross-dissolve backgrounds, scroll tracking
 * Fixed viewport + sticky backgrounds
 */

import React, { useRef } from "react";
import { motion, useScroll } from "framer-motion";
import { useScrollProgress } from "./useScrollProgress";
import { useResponsiveFrameConfig } from "./useResponsiveFrameConfig";
import { useReducedMotion } from "./useReducedMotion";
import { useHomeFrames } from "@/components/hooks/useHomeFrames";
import BackgroundStack from "./backgrounds/BackgroundStack";
import ScrollIndicator from "./ScrollIndicator";
import SwipeHint from "./SwipeHint";

// Import dynamic frame component
import DynamicFrame from "./frames/DynamicFrame";

// Default frames nếu chưa có data từ DB
const DEFAULT_FRAMES = [
  {
    frame_id: 'frame_0', order: 0, is_active: true,
    title: 'Trang trại Organic #1 Việt Nam',
    subtitle: 'Từ trang trại đến bàn ăn – không dư lượng, chỉ có sức khỏe',
    background_url: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1920&q=80',
    background_url_mobile: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&q=80',
    content: { trust_badges: [{ icon: 'Leaf', text: '100% Organic', color: '#7CB342' }, { icon: 'Award', text: 'Chứng nhận VietGAP', color: '#FF9800' }, { icon: 'Users', text: '5000+ Khách hàng', color: '#4CAF50' }] }
  },
  {
    frame_id: 'frame_1', order: 1, is_active: true,
    title: 'Quy trình canh tác khép kín',
    subtitle: 'Từ hạt giống đến bàn ăn - mọi bước đều có kiểm soát',
    background_url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&q=80',
    content: { process_items: [{ icon: 'Leaf', title: 'Canh tác hữu cơ', description: 'Không thuốc trừ sâu', color: '#7CB342' }, { icon: 'ShieldCheck', title: 'Kiểm soát dư lượng', description: 'Test định kỳ', color: '#2196F3' }, { icon: 'Award', title: 'Thu hoạch chuẩn', description: 'Đúng mùa, đúng độ chín', color: '#FF9800' }] },
    desktop_config: { icon_size: 64 }
  },
  {
    frame_id: 'frame_2', order: 2, is_active: true,
    title: 'Con số nói lên tất cả',
    subtitle: 'Được tin tưởng bởi hàng ngàn gia đình Việt',
    background_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1920&q=80',
    content: { stats: [{ value: 5000, suffix: '+', label: 'Khách hàng', icon: 'Users' }, { value: 3, suffix: '', label: 'Trang trại', icon: 'MapPin' }, { value: 100, suffix: '%', label: 'Organic', icon: 'Leaf' }, { value: 5, suffix: '+', label: 'Năm kinh nghiệm', icon: 'Award' }], certifications: [{ name: 'VietGAP' }, { name: 'OCOP 4 sao' }] },
    desktop_config: { counter_animation: true }
  },
  {
    frame_id: 'frame_3', order: 3, is_active: true,
    title: 'Sẵn sàng cho bữa ăn lành mạnh?',
    subtitle: 'Giao hàng tận nơi, tươi mới mỗi ngày',
    background_url: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=1920&q=80',
    content: { promo_badge: 'Giảm 10% đơn đầu tiên' },
    cta_primary: { text: 'Đặt hàng ngay', link: '/Services', color: '#7CB342' },
    cta_secondary: { text: 'Xem sản phẩm', link: '/Services' }
  },
  {
    frame_id: 'frame_4', order: 4, is_active: true,
    title: 'Liên hệ với chúng tôi',
    subtitle: 'Chúng tôi luôn sẵn sàng tư vấn',
    background_url: 'https://images.unsplash.com/photo-1495107334309-fcf20504a5ab?w=1920&q=80',
    content: { contact: { phone: '098 765 4321', email: 'info@zerofarm.vn' }, promo: { text: 'Giảm 10% đơn đầu', code: 'WELCOME10', show: true }, exit_links: [{ text: 'Sản phẩm', link: '/Services', icon: 'ShoppingBag' }, { text: 'Blog', link: '/Blog', icon: 'FileText' }, { text: 'Cộng đồng', link: '/Community', icon: 'Users' }, { text: 'Liên hệ', link: '/Contact', icon: 'Mail' }] }
  }
];

export default function ScrollDrivenStage() {
  const stageRef = useRef(null);
  const { scrollYProgress, currentFrame } = useScrollProgress(stageRef);
  const { isMobile, isTablet, isDesktop } = useResponsiveFrameConfig();
  const prefersReducedMotion = useReducedMotion();
  
  // Fetch frames data
  const { data: frames = [], isLoading, error } = useHomeFrames();
  
  // Scroll to frame khi click indicator
  const handleFrameClick = (frameIndex) => {
    if (!stageRef.current) return;
    
    const scrollProgress = frameIndex * 0.2;
    const stageHeight = stageRef.current.scrollHeight;
    const targetScroll = scrollProgress * (stageHeight - window.innerHeight);
    
    window.scrollTo({
      top: stageRef.current.offsetTop + targetScroll,
      behavior: 'smooth'
    });
  };
  
  // Dùng default frames nếu không có data hoặc lỗi
  // useHomeFrames() lấy tất cả frames active, sorted by order - không giới hạn số lượng
  const activeFrames = (frames && frames.length > 0) 
    ? [...frames].sort((a, b) => a.order - b.order)
    : DEFAULT_FRAMES;
  
  // Loading state với background
  if (isLoading) {
    return (
      <div className="relative w-full" style={{ height: '100vh' }}>
        <div className="fixed inset-0 w-full h-full bg-gray-900">
          <img 
            src={DEFAULT_FRAMES[0].background_url}
            alt=""
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="text-white flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-[#7CB342] border-t-transparent rounded-full animate-spin" />
              <p className="text-lg font-medium">Đang tải...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div
      ref={stageRef}
      className="relative w-full"
      style={{ height: `${activeFrames.length * 100}vh` }} // Dynamic: N frames x 100vh
    >
      {/* Sticky viewport - NỀN CỐ ĐỊNH */}
      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden">
        {/* Background layers với cross-dissolve */}
        <BackgroundStack
          frames={activeFrames}
          scrollYProgress={scrollYProgress}
          isMobile={isMobile}
        />
        
        {/* Content layer - KHUNG NỘI DUNG */}
        <div className="absolute inset-0 z-10 w-full h-full">
          {activeFrames.map((frame, index) => (
            <DynamicFrame
              key={frame.frame_id}
              frame={frame}
              index={index}
              totalFrames={activeFrames.length}
              scrollYProgress={scrollYProgress}
              currentFrame={currentFrame}
              isMobile={isMobile}
              isTablet={isTablet}
              isDesktop={isDesktop}
              prefersReducedMotion={prefersReducedMotion}
            />
          ))}
        </div>
        
        {/* Scroll indicator (desktop only) - BÊN PHẢI */}
        {!isMobile && (
          <ScrollIndicator 
            currentFrame={currentFrame} 
            onFrameClick={handleFrameClick}
            totalFrames={activeFrames.length}
          />
        )}
        
        {/* Swipe hint (mobile only) - DƯỚI */}
        {isMobile && currentFrame < activeFrames.length - 1 && (
          <SwipeHint currentFrame={currentFrame} />
        )}
        
        {/* Scroll down hint - Frame đầu tiên */}
        {currentFrame === 0 && (
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            <p className="text-white/70 text-sm">Cuộn xuống để khám phá</p>
            <motion.div
              className="w-6 h-10 border-2 border-white/50 rounded-full p-1"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <motion.div
                className="w-2 h-2 bg-white rounded-full mx-auto"
                animate={{ y: [0, 16, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// No longer needed - DynamicFrame handles all frames universally