/**
 * DynamicFrame - Universal frame component render động từ DB data
 * 
 * Thay thế Frame0-4 cố định, render bất kỳ frame nào dựa trên content
 */

import React from "react";
import { motion, useTransform } from "framer-motion";
import { Icon } from "@/components/ui/AnimatedIcon";
import CTAButton from "../CTAButton";

export default function DynamicFrame({ 
  frame, 
  index,
  totalFrames,
  scrollYProgress, 
  isMobile,
  prefersReducedMotion 
}) {
  // Tính toán scroll range cho frame này
  const frameSize = 1 / totalFrames;
  const frameStart = index * frameSize;
  const frameEnd = (index + 1) * frameSize;
  
  const fadeOverlap = 0.05;
  
  // OPACITY LOGIC - Frame 0 phải hiển thị ngay từ scroll=0
  const opacity = useTransform(
    scrollYProgress,
    index === 0 
      ? [0, frameEnd - fadeOverlap, frameEnd]
      : index === totalFrames - 1
        ? [frameStart - fadeOverlap, frameStart, 1]
        : [frameStart - fadeOverlap, frameStart, frameEnd, frameEnd + fadeOverlap],
    index === 0
      ? [1, 1, 0] // Frame 0: START at opacity=1
      : index === totalFrames - 1
        ? [0, 1, 1]
        : [0, 1, 1, 0]
  );
  
  // Scale animation
  const scale = useTransform(
    scrollYProgress,
    index === 0
      ? [0, frameEnd - fadeOverlap, frameEnd]
      : index === totalFrames - 1
        ? [frameStart - fadeOverlap, frameStart, 1]
        : [frameStart - fadeOverlap, frameStart, frameEnd, frameEnd + fadeOverlap],
    index === 0
      ? [1, 1, 0.98]
      : index === totalFrames - 1
        ? prefersReducedMotion ? [1, 1, 1] : [0.98, 1, 1]
        : prefersReducedMotion ? [1, 1, 1, 1] : [0.98, 1, 1, 0.98]
  );
  
  // Y position animation
  const y = useTransform(
    scrollYProgress,
    index === 0
      ? [0, frameEnd - fadeOverlap, frameEnd]
      : index === totalFrames - 1
        ? [frameStart - fadeOverlap, frameStart, 1]
        : [frameStart - fadeOverlap, frameStart, frameEnd, frameEnd + fadeOverlap],
    index === 0
      ? [0, 0, -20]
      : index === totalFrames - 1
        ? prefersReducedMotion ? [0, 0, 0] : [20, 0, 0]
        : prefersReducedMotion ? [0, 0, 0, 0] : [20, 0, 0, -20]
  );
  
  const content = frame.content || {};
  
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
      style={{ opacity }}
    >
      <motion.div
        className="w-full max-w-5xl px-6 md:px-12 text-center pointer-events-auto"
        style={{ scale, y }}
      >
        {/* Title */}
        {frame.title && (
          <motion.h1 
            className="text-3xl md:text-5xl lg:text-7xl font-bold text-white mb-4 md:mb-6 drop-shadow-2xl"
            style={{ 
              textShadow: '0 4px 20px rgba(0,0,0,0.5), 0 0 40px rgba(0,0,0,0.3)'
            }}
          >
            {frame.title}
          </motion.h1>
        )}
        
        {/* Subtitle */}
        {frame.subtitle && (
          <motion.p 
            className="text-base md:text-xl lg:text-2xl text-white/90 mb-6 md:mb-10 max-w-3xl mx-auto drop-shadow-lg"
            style={{
              textShadow: '0 2px 10px rgba(0,0,0,0.7)'
            }}
          >
            {frame.subtitle}
          </motion.p>
        )}
        
        {/* Trust Badges */}
        {content.trust_badges && content.trust_badges.length > 0 && (
          <div className="flex flex-wrap justify-center gap-3 md:gap-6 mb-8">
            {content.trust_badges.map((badge, idx) => {
              const BadgeIcon = Icon[badge.icon] || Icon.CheckCircle;
              return (
                <motion.div
                  key={idx}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20"
                  whileHover={{ scale: 1.05 }}
                >
                  <BadgeIcon size={isMobile ? 16 : 20} style={{ color: badge.color }} />
                  <span className="text-white text-sm md:text-base font-medium">{badge.text}</span>
                </motion.div>
              );
            })}
          </div>
        )}
        
        {/* Process Items */}
        {content.process_items && content.process_items.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 max-w-4xl mx-auto">
            {content.process_items.map((item, idx) => {
              const ItemIcon = Icon[item.icon] || Icon.Leaf;
              return (
                <motion.div
                  key={idx}
                  className="bg-white/10 backdrop-blur-md rounded-2xl p-4 md:p-6 border border-white/20"
                  whileHover={{ scale: 1.05, y: -5 }}
                >
                  <ItemIcon size={isMobile ? 32 : 48} className="mx-auto mb-3" style={{ color: item.color }} />
                  <h4 className="text-white font-bold text-base md:text-lg mb-2">{item.title}</h4>
                  <p className="text-white/80 text-sm">{item.description}</p>
                </motion.div>
              );
            })}
          </div>
        )}
        
        {/* Stats */}
        {content.stats && content.stats.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8 max-w-4xl mx-auto">
            {content.stats.map((stat, idx) => {
              const StatIcon = Icon[stat.icon] || Icon.Star;
              return (
                <motion.div
                  key={idx}
                  className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20"
                  whileHover={{ scale: 1.05 }}
                >
                  <StatIcon size={24} className="mx-auto mb-2 text-white/90" />
                  <div className="text-2xl md:text-4xl font-bold text-white mb-1">
                    {stat.value}{stat.suffix}
                  </div>
                  <div className="text-white/70 text-xs md:text-sm">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        )}
        
        {/* Exit Links */}
        {content.exit_links && content.exit_links.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8 max-w-3xl mx-auto">
            {content.exit_links.map((link, idx) => {
              const LinkIcon = Icon[link.icon] || Icon.ArrowRight;
              return (
                <a
                  key={idx}
                  href={link.link}
                  className="bg-white/10 backdrop-blur-md rounded-xl p-3 md:p-4 border border-white/20 hover:bg-white/20 transition-all text-white flex flex-col items-center gap-2"
                >
                  <LinkIcon size={isMobile ? 20 : 24} />
                  <span className="text-xs md:text-sm font-medium">{link.text}</span>
                </a>
              );
            })}
          </div>
        )}
        
        {/* CTA Buttons */}
        {(frame.cta_primary?.text || frame.cta_secondary?.text) && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {frame.cta_primary?.text && (
              <CTAButton cta={frame.cta_primary} isMobile={isMobile} />
            )}
            {frame.cta_secondary?.text && !isMobile && (
              <CTAButton cta={frame.cta_secondary} isMobile={isMobile} />
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}