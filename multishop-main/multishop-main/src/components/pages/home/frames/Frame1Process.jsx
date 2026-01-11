/**
 * Frame1Process - "Quy trình - không phải lời nói" (20-40% scroll)
 */

import React from "react";
import { motion, useTransform } from "framer-motion";
import { Icon } from "@/components/ui/AnimatedIcon";

// Default process items
const DEFAULT_PROCESS = [
  { icon: 'Leaf', title: 'Canh tác hữu cơ', description: 'Không thuốc trừ sâu, không hóa chất', color: '#7CB342' },
  { icon: 'ShieldCheck', title: 'Kiểm soát dư lượng', description: 'Test định kỳ bởi phòng lab độc lập', color: '#2196F3' },
  { icon: 'Award', title: 'Thu hoạch đúng chuẩn', description: 'Đúng mùa, đúng thời điểm chín tự nhiên', color: '#FF9800' }
];

export default function Frame1Process({ 
  frame, 
  scrollYProgress,
  currentFrame,
  isMobile,
  prefersReducedMotion 
}) {
  const isActive = currentFrame === 1;
  
  // Animation: fade in tại 20-40%
  const opacity = useTransform(scrollYProgress, [0.18, 0.22, 0.36, 0.4], [0, 1, 1, 0]);
  const scale = prefersReducedMotion ? 1 : useTransform(scrollYProgress, [0.18, 0.25], [0.95, 1]);
  
  const processItems = frame?.content?.process_items || DEFAULT_PROCESS;
  const title = frame?.title || "Quy trình canh tác khép kín";
  const subtitle = frame?.subtitle || "Từ hạt giống đến bàn ăn - mọi bước đều có kiểm soát";
  
  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center px-4 md:px-8"
      style={{ opacity, scale }}
    >
      {/* Section badge */}
      <motion.div 
        className="mb-4"
        initial={{ opacity: 0, y: -10 }}
        animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0 }}
        transition={{ delay: 0.2 }}
      >
        <span className="text-[#7CB342] text-sm font-semibold tracking-wider uppercase">
          Quy trình của chúng tôi
        </span>
      </motion.div>
      
      {/* Title */}
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 md:mb-4 text-center drop-shadow-2xl">
        {title}
      </h2>
      
      {/* Subtitle */}
      <p className="text-base md:text-lg lg:text-xl text-white/90 mb-8 md:mb-12 text-center max-w-2xl drop-shadow-lg">
        {subtitle}
      </p>
      
      {/* Process Items */}
      <div className={`grid gap-4 md:gap-6 w-full max-w-5xl ${
        isMobile ? 'grid-cols-1 max-w-md' : 'grid-cols-3'
      }`}>
        {processItems.map((item, index) => {
          const IconComponent = Icon[item.icon] || Icon.Leaf;
          const iconSize = isMobile ? 40 : (frame?.desktop_config?.icon_size || 56);
          
          return (
            <motion.div
              key={index}
              className="flex flex-col items-center text-center bg-white/10 backdrop-blur-md p-5 md:p-7 rounded-2xl border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-300"
              initial={{ opacity: 0, y: 30 }}
              animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ delay: 0.3 + index * 0.15, duration: 0.5 }}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              {/* Step number */}
              <div className="absolute -top-3 -left-3 w-8 h-8 bg-[#7CB342] rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                {index + 1}
              </div>
              
              <div 
                className="mb-4 p-4 rounded-full bg-white/20 relative"
                style={{ color: item.color }}
              >
                <IconComponent size={iconSize} />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-white mb-2">
                {item.title}
              </h3>
              <p className="text-sm md:text-base text-white/80 leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          );
        })}
      </div>
      
      {/* Connection line (desktop only) */}
      {!isMobile && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[60%] h-0.5 bg-gradient-to-r from-transparent via-white/20 to-transparent -z-10" />
      )}
    </motion.div>
  );
}