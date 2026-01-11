import React from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { useLiveEditContext } from "@/components/cms/LiveEditContext";
import { EditableTextV2, EditableButtonV2 } from "@/components/cms/EditableSectionV2";

export default function PromotionalBanner() {
  // Live Edit
  const { isEditMode } = useLiveEditContext();
  
  return (
    <section className="relative py-16 md:py-20 overflow-hidden bg-gradient-to-br from-green-400 via-green-500 to-green-600">
      {/* Floating Animation Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            initial={{ opacity: 0, scale: 0, rotate: 0 }}
            animate={{ 
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
              rotate: [0, 180, 360],
              y: [-20, -80, -120],
              x: [0, 30, -20]
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              delay: i * 0.8,
              ease: "easeInOut"
            }}
            style={{
              left: `${15 + i * 12}%`,
              top: `${20 + (i % 3) * 25}%`
            }}
          >
            <Sparkles className="w-6 h-6 text-white/60" />
          </motion.div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          {/* Main Offer Text */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5, rotateX: 45 }}
            whileInView={{ opacity: 1, scale: 1, rotateX: 0 }}
            transition={{ duration: 1.2, delay: 0.2, type: "spring", stiffness: 100 }}
            viewport={{ once: true }}
            className="mb-4 section-editable"
          >
            <EditableTextV2
              sectionKey="promotional_banner"
              fieldPath="discount_text"
              defaultValue="GIẢM 30%"
              className="text-6xl md:text-7xl lg:text-8xl font-extrabold text-white"
              style={{ fontFamily: 'var(--font-sans)', textShadow: '2px 2px 8px rgba(0,0,0,0.5)' }}
              style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.5)' }}
              as="h2"
              label="Giảm giá"
            />
          </motion.div>

          {/* Subtitle */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="space-y-2 section-editable"
          >
            <EditableTextV2
              sectionKey="promotional_banner"
              fieldPath="subtitle"
              defaultValue="Ưu Đãi Đặc Biệt Cho Khách Hàng Mới"
              className="font-sans text-xl md:text-2xl font-light text-white/90 tracking-wide"
              as="p"
              label="Phụ đề"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
            >
              <EditableTextV2
                sectionKey="promotional_banner"
                fieldPath="description"
                defaultValue="Đặt hàng ngay hôm nay và nhận gói rau củ tươi ngon + Miễn phí giao hàng"
                className="font-sans text-lg md:text-xl font-semibold text-white"
                as="p"
                label="Mô tả"
              />
            </motion.div>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.8 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.8, type: "spring", stiffness: 150 }}
            viewport={{ once: true }}
            className="pt-6"
          >
            <motion.div
              whileHover={{ 
                scale: 1.05, 
                boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
              }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex"
            >
              <EditableButtonV2
                sectionKey="promotional_banner"
                fieldPath="cta_text"
                defaultValue="NHẬN ƯU ĐÃI NGAY"
                className="group bg-black/80 backdrop-blur-sm text-white px-8 py-4 rounded-full font-sans font-medium hover:bg-[#FF9800] transition-all duration-300 shadow-xl border border-white/20 flex items-center justify-center gap-3 mx-auto"
                onClick={() => window.dispatchEvent(new CustomEvent('open-booking-modal'))}
                label="Nút CTA"
              />
            </motion.div>
          </motion.div>

          {/* Decorative Elements */}
          <motion.div
            initial={{ opacity: 0, rotate: -90 }}
            whileInView={{ opacity: 1, rotate: 0 }}
            transition={{ duration: 1, delay: 1 }}
            viewport={{ once: true }}
            className="flex justify-center items-center gap-4 pt-4"
          >
            <div className="w-16 h-0.5 bg-white/30"></div>
            <Sparkles className="w-6 h-6 text-white/60" />
            <div className="w-16 h-0.5 bg-white/30"></div>
          </motion.div>
        </motion.div>
      </div>

      {/* Additional Floating Petals */}
      <motion.div
        initial={{ opacity: 0, y: 100, rotate: 45 }}
        animate={{ 
          opacity: [0.3, 0.7, 0.3],
          y: [100, -20, -50],
          rotate: [45, -45, 45]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-10 right-10 w-8 h-8 bg-white/20 rounded-full blur-sm"
      />
      
      <motion.div
        initial={{ opacity: 0, y: 50, rotate: -30 }}
        animate={{ 
          opacity: [0.2, 0.5, 0.2],
          y: [50, -30, -60],
          rotate: [-30, 30, -30]
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
        className="absolute bottom-20 left-20 w-6 h-6 bg-white/15 rounded-full blur-sm"
      />
    </section>
  );
}