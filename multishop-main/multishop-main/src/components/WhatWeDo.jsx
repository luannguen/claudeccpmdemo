import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Leaf, Award, Heart } from "lucide-react";
import { useLiveEditContext } from "@/components/cms/LiveEditContext";
import { EditableTextV2, EditableButtonV2, EditableArrayItem } from "@/components/cms/EditableSectionV2";

const features = [
  {
    icon: ShieldCheck,
    title: "Công Nghệ Canh Tác Hiện Đại",
    description: "Hệ thống tưới nhỏ giọt tự động, nhà kính tiêu chuẩn Nhật Bản"
  },
  {
    icon: Leaf,
    title: "100% Phân Bón Hữu Cơ",
    description: "Sử dụng phân compost tự nhiên, không hóa chất độc hại"
  },
  {
    icon: Award,
    title: "Chứng Nhận VietGAP & GlobalGAP",
    description: "Đạt tiêu chuẩn nông nghiệp an toàn quốc tế từ năm 2015"
  },
  {
    icon: Heart,
    title: "Tận Tâm Với Khách Hàng",
    description: "Dịch vụ tư vấn dinh dưỡng và giao hàng tận nhà miễn phí"
  }
];

const LeafDecoration = () => (
  <motion.svg 
    initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
    whileInView={{ opacity: 0.6, rotate: 0, scale: 1 }}
    transition={{ duration: 2, ease: "easeOut" }}
    viewport={{ once: true }}
    width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#7CB342]"
  >
    <path d="M10 40C15 20 35 10 50 15C55 17 60 22 65 30" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.6"/>
    <path d="M50 15C52 12 58 8 65 12C70 15 75 22 80 35" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.6"/>
    <path d="M65 30C68 25 75 20 85 25C90 28 95 35 100 50" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.6"/>
    <path d="M20 50C25 45 35 40 45 45C50 48 55 55 60 70" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.6"/>
    <path d="M45 45C48 42 55 38 65 42C70 45 75 52 80 65" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.6"/>
    <ellipse cx="25" cy="35" rx="8" ry="12" fill="currentColor" opacity="0.3" transform="rotate(-30 25 35)"/>
    <ellipse cx="55" cy="25" rx="6" ry="10" fill="currentColor" opacity="0.3" transform="rotate(-45 55 25)"/>
    <ellipse cx="75" cy="45" rx="7" ry="11" fill="currentColor" opacity="0.3" transform="rotate(-60 75 45)"/>
    <ellipse cx="35" cy="55" rx="5" ry="9" fill="currentColor" opacity="0.3" transform="rotate(-20 35 55)"/>
  </motion.svg>
);

export default function WhatWeDo() {
  // Live Edit
  const { isEditMode } = useLiveEditContext();
  
  return (
    <section className="py-16 md:py-20 lg:py-24 bg-white relative overflow-hidden">
      {/* Enhanced Background Decorations */}
      <motion.div 
        initial={{ opacity: 0, x: -200, rotate: -45 }}
        whileInView={{ opacity: 0.2, x: 0, rotate: 0 }}
        transition={{ duration: 2, ease: "easeOut" }}
        viewport={{ once: true }}
        className="absolute top-10 left-10"
      >
        <LeafDecoration />
      </motion.div>
      <motion.div 
        initial={{ opacity: 0, x: 200, rotate: 45 }}
        whileInView={{ opacity: 0.2, x: 0, rotate: 180 }}
        transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
        viewport={{ once: true }}
        className="absolute bottom-10 right-10 transform"
      >
        <LeafDecoration />
      </motion.div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 80, scale: 0.8 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut", type: "spring", stiffness: 100 }}
          viewport={{ once: true }}
          className="text-center mb-16 section-editable"
        >
          <motion.div 
            initial={{ opacity: 0, letterSpacing: "0.1em" }}
            whileInView={{ opacity: 1, letterSpacing: "0.3em" }}
            transition={{ duration: 1, delay: 0.3 }}
            viewport={{ once: true }}
            className="mb-4"
          >
            <EditableTextV2
              sectionKey="what_we_do"
              fieldPath="badge"
              defaultValue="Phương Pháp Canh Tác Bền Vững"
              className="font-sans text-sm text-gray-500 tracking-wider uppercase"
              as="p"
              label="Badge"
            />
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 50, skewX: 10 }}
            whileInView={{ opacity: 1, y: 0, skewX: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#0F0F0F] leading-tight mb-6"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            <EditableTextV2
              sectionKey="what_we_do"
              fieldPath="title"
              defaultValue="Cam Kết Zero Farm"
              className="text-[#0F0F0F]"
              as="span"
              label="Tiêu đề"
            />
            <br />
            <motion.span 
              initial={{ opacity: 0, scale: 0.5, color: "#7CB342" }}
              whileInView={{ opacity: 1, scale: 1, color: "#7CB342" }}
              transition={{ duration: 1.2, delay: 0.8, ease: "easeOut" }}
              viewport={{ once: true }}
            >
              <EditableTextV2
                sectionKey="what_we_do"
                fieldPath="title_highlight"
                defaultValue="An Toàn Là Trên Hết"
                className="text-[#7CB342]"
                as="span"
                label="Highlight"
              />
            </motion.span>
          </motion.h2>
          <motion.div 
            initial={{ opacity: 0, y: 30, filter: 'blur(5px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 1, delay: 1, ease: "easeOut" }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <EditableTextV2
              sectionKey="what_we_do"
              fieldPath="description"
              defaultValue="Chào mừng bạn đến với Zero Farm - trang trại organic cao cấp tại Đà Lạt."
              className="text-lg text-gray-600 leading-relaxed"
              as="p"
              multiline
              label="Mô tả"
            />
          </motion.div>
        </motion.div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Image */}
          <motion.div
            initial={{ opacity: 0, x: -150, rotate: -15, scale: 0.7 }}
            whileInView={{ opacity: 1, x: 0, rotate: 0, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut", type: "spring", stiffness: 80 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="lg:col-span-3 flex justify-center lg:justify-start"
          >
            <motion.div 
              whileHover={{ boxShadow: "0 30px 60px rgba(124, 179, 66, 0.3)" }}
              className="w-48 h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 rounded-full overflow-hidden shadow-lg"
            >
              <img
                src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&q=90"
                alt="Trang trại rau củ organic tại Đà Lạt - Zero Farm"
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
              />
            </motion.div>
          </motion.div>

          {/* Center Features */}
          <div className="lg:col-span-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {features.map((feature, index) => (
                <EditableArrayItem 
                  key={feature.title} 
                  index={index} 
                  sectionKey="what_we_do_features"
                  label={`Feature ${index + 1}`}
                >
                  <motion.div
                    initial={{ 
                      opacity: 0, 
                      y: 100, 
                      scale: 0.7,
                      rotateX: index % 2 === 0 ? 45 : -45,
                      rotateY: index % 2 === 0 ? -20 : 20
                    }}
                    whileInView={{ 
                      opacity: 1, 
                      y: 0, 
                      scale: 1,
                      rotateX: 0,
                      rotateY: 0
                    }}
                    transition={{ 
                      duration: 1.5, 
                      delay: index * 0.2,
                      type: "spring",
                      stiffness: 100,
                      damping: 15
                    }}
                    viewport={{ once: true }}
                    whileHover={{ 
                      scale: 1.08, 
                      y: -10,
                      rotateZ: index % 2 === 0 ? 2 : -2,
                      boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
                    }}
                    className="flex items-start gap-4 group cursor-pointer"
                  >
                    {/* Icon */}
                    <motion.div 
                      initial={{ scale: 0, rotate: -360 }}
                      whileInView={{ scale: 1, rotate: 0 }}
                      transition={{ 
                        duration: 1, 
                        delay: index * 0.2 + 0.3,
                        type: "spring",
                        stiffness: 300
                      }}
                      viewport={{ once: true }}
                      whileHover={{ 
                        rotate: 180, 
                        scale: 1.3,
                        backgroundColor: "#7CB342"
                      }}
                      className="w-12 h-12 bg-[#E8F5E9] rounded-full flex items-center justify-center group-hover:bg-[#7CB342] transition-all duration-500"
                    >
                      <feature.icon className="w-6 h-6 text-[#7CB342] group-hover:text-white transition-colors duration-300" />
                    </motion.div>
                    
                    {/* Content */}
                    <div>
                      <EditableTextV2
                        sectionKey="what_we_do"
                        fieldPath={`features[${index}].title`}
                        defaultValue={feature.title}
                        className="text-xl font-semibold text-[#0F0F0F] mb-2 group-hover:text-[#7CB342] transition-colors duration-300 block"
                        style={{ fontFamily: 'var(--font-sans)' }}
                        as="h3"
                        label={`Tiêu đề ${index + 1}`}
                      />
                      <EditableTextV2
                        sectionKey="what_we_do"
                        fieldPath={`features[${index}].description`}
                        defaultValue={feature.description}
                        className="font-sans text-sm text-gray-600 leading-relaxed block"
                        as="p"
                        label={`Mô tả ${index + 1}`}
                      />
                    </div>
                  </motion.div>
                </EditableArrayItem>
              ))}
            </div>
          </div>

          {/* Right Image */}
          <motion.div
            initial={{ opacity: 0, x: 150, rotate: 15, scale: 0.7 }}
            whileInView={{ opacity: 1, x: 0, rotate: 0, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut", type: "spring", stiffness: 80, delay: 0.3 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.1, rotate: -5 }}
            className="lg:col-span-3 flex justify-center lg:justify-end"
          >
            <motion.div 
              whileHover={{ boxShadow: "0 30px 60px rgba(255, 152, 0, 0.3)" }}
              className="w-48 h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 rounded-full overflow-hidden shadow-lg"
            >
              <img
                src="https://images.unsplash.com/photo-1595855759920-86582396756a?w=800&q=90"
                alt="Sản phẩm rau củ tươi ngon tại Zero Farm"
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
              />
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, delay: 1.5, ease: "easeOut" }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <motion.div
            whileHover={{ scale: 1.1, boxShadow: "0 20px 40px rgba(124, 179, 66, 0.3)" }}
            whileTap={{ scale: 0.95 }}
          >
            <EditableButtonV2
              sectionKey="what_we_do"
              fieldPath="cta_text"
              defaultValue="Đặt Hàng Ngay Hôm Nay"
              className="bg-gradient-to-r from-[#7CB342] to-[#FF9800] text-white px-8 py-4 rounded-full font-sans font-semibold hover:from-[#FF9800] hover:to-[#7CB342] transition-all duration-300 shadow-lg text-lg"
              onClick={() => window.dispatchEvent(new CustomEvent('open-booking-modal'))}
              label="Nút CTA"
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}