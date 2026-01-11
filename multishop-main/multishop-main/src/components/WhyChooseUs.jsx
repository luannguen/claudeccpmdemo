import React from "react";
import { motion } from "framer-motion";
import { Leaf, Award, ShieldCheck, Sparkles } from "lucide-react";
import { useLiveEditContext } from "@/components/cms/LiveEditContext";
import { EditableTextV2, EditableButtonV2, EditableArrayItem } from "@/components/cms/EditableSectionV2";

const defaultFeatures = [
  {
    icon: Leaf,
    title: "100% Hữu Cơ Organic",
    subtitle: "KHÔNG HÓA CHẤT",
    description: "Canh tác hoàn toàn tự nhiên, không sử dụng thuốc trừ sâu, phân bón hóa học hay chất kích thích tăng trưởng. Được chứng nhận bởi tổ chức quốc tế."
  },
  {
    icon: ShieldCheck,
    title: "Cam Kết Không Dư Lượng",
    subtitle: "AN TOÀN TUYỆT ĐỐI",
    description: "Mọi sản phẩm đều được kiểm nghiệm kỹ lưỡng, đảm bảo không có dư lượng hóa chất độc hại. Chứng nhận VietGAP và GlobalGAP."
  },
  {
    icon: Award,
    title: "Tươi Mới Mỗi Ngày",
    subtitle: "TỪ VƯỜN ĐẾN BÀN",
    description: "Thu hoạch vào buổi sáng sớm và giao hàng trong ngày, giữ trọn dinh dưỡng và độ tươi ngon tự nhiên nhất cho gia đình bạn."
  }
];

export default function WhyChooseUs() {
  // Live Edit
  const { isEditMode, getSectionFieldValue } = useLiveEditContext();
  
  const features = defaultFeatures;
  
  return (
    <section id="why-us" className="pt-20 md:pt-24 lg:pt-28 pb-16 md:pb-20 lg:pb-24 bg-gradient-to-b from-[#F5F9F3] to-white relative overflow-hidden">
      {/* Enhanced Background Decorations */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.3, rotate: 45 }}
        whileInView={{ opacity: 0.1, scale: 1, rotate: 0 }}
        transition={{ duration: 2.5, ease: "easeOut", delay: 0.3 }}
        viewport={{ once: true }}
        className="absolute bottom-10 left-10"
      >
        <div className="w-96 h-96 bg-[#7CB342] rounded-full blur-3xl" />
      </motion.div>

      <div className="mx-auto my-1 px-6 max-w-7xl lg:px-8">
        <div className="grid grid-cols-1 items-center">
          {/* Centered Content */}
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9, rotateX: 15 }}
            whileInView={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
            transition={{ duration: 1.2, ease: "easeOut", type: "spring", stiffness: 100 }}
            viewport={{ once: true }}
            className="space-y-8 text-center"
          >
            {/* Header */}
            <div className="section-editable">
              <motion.div 
                initial={{ opacity: 0, scale: 0, rotate: -180 }}
                whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 0.8, delay: 0.2, type: "spring", stiffness: 200 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 bg-[#7CB342]/10 rounded-full px-4 py-2 mb-6"
              >
                <Sparkles className="w-4 h-4 text-[#7CB342]" />
                <EditableTextV2
                  sectionKey="why_choose_us"
                  fieldPath="badge"
                  defaultValue="TRANG TRẠI ORGANIC HÀNG ĐẦU VIỆT NAM"
                  className="font-sans text-sm text-[#7CB342] font-medium uppercase tracking-wider"
                  as="span"
                  label="Badge"
                />
              </motion.div>
              
              <motion.h2 
                initial={{ opacity: 0, y: 50, skewY: 5 }}
                whileInView={{ opacity: 1, y: 0, skewY: 0 }}
                transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
                viewport={{ once: true }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                <EditableTextV2
                  sectionKey="why_choose_us"
                  fieldPath="title"
                  defaultValue="Tại Sao Chọn"
                  className="text-[#0F0F0F]"
                  as="span"
                  label="Tiêu đề"
                />
                <br />
                <EditableTextV2
                  sectionKey="why_choose_us"
                  fieldPath="title_highlight"
                  defaultValue="Zero Farm?"
                  className="text-[#7CB342]"
                  as="span"
                  label="Highlight"
                />
              </motion.h2>
              
              <motion.div 
                initial={{ opacity: 0, y: 30, filter: 'blur(5px)' }}
                whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
                viewport={{ once: true }}
                className="mb-8 max-w-3xl mx-auto"
              >
                <EditableTextV2
                  sectionKey="why_choose_us"
                  fieldPath="description"
                  defaultValue="Trang trại organic cao cấp tại Đà Lạt với hơn 10 năm kinh nghiệm."
                  className="font-sans text-lg text-gray-600 leading-relaxed"
                  as="p"
                  multiline
                  label="Mô tả"
                />
              </motion.div>
            </div>

            {/* Features List */}
            <div className="space-y-8 max-w-2xl mx-auto text-left">
              {features.map((feature, index) => (
                <EditableArrayItem 
                  key={feature.title} 
                  index={index} 
                  sectionKey="why_choose_us_features"
                  label={`Feature ${index + 1}`}
                >
                  <motion.div
                    initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100, rotateY: index % 2 === 0 ? -30 : 30, scale: 0.8 }}
                    whileInView={{ opacity: 1, x: 0, rotateY: 0, scale: 1 }}
                    transition={{ 
                      duration: 1.2, 
                      delay: index * 0.3,
                      type: "spring",
                      stiffness: 100,
                      damping: 15
                    }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.05, x: 10 }}
                    className="flex items-start gap-4 group cursor-pointer"
                  >
                    {/* Icon */}
                    <motion.div 
                      initial={{ scale: 0, rotate: -180 }}
                      whileInView={{ scale: 1, rotate: 0 }}
                      transition={{ duration: 0.8, delay: index * 0.3 + 0.2, type: "spring", stiffness: 200 }}
                      viewport={{ once: true }}
                      whileHover={{ rotate: 360, scale: 1.2 }}
                      className="w-14 h-14 bg-[#FF9800]/10 rounded-2xl flex items-center justify-center group-hover:bg-[#FF9800] transition-all duration-500 flex-shrink-0"
                    >
                      <feature.icon className="w-7 h-7 text-[#FF9800] group-hover:text-white transition-colors duration-300" />
                    </motion.div>
                    
                    {/* Content */}
                    <div className="flex-1">
                      <EditableTextV2
                        sectionKey="why_choose_us"
                        fieldPath={`features[${index}].title`}
                        defaultValue={feature.title}
                        className="text-xl font-semibold text-[#0F0F0F] mb-1 group-hover:text-[#7CB342] transition-colors duration-300 block"
                        style={{ fontFamily: 'var(--font-sans)' }}
                        as="h3"
                        label={`Tiêu đề ${index + 1}`}
                      />
                      <EditableTextV2
                        sectionKey="why_choose_us"
                        fieldPath={`features[${index}].subtitle`}
                        defaultValue={feature.subtitle}
                        className="font-sans text-sm font-medium text-[#7CB342] uppercase tracking-wider mb-2 block"
                        as="p"
                        label={`Phụ đề ${index + 1}`}
                      />
                      <EditableTextV2
                        sectionKey="why_choose_us"
                        fieldPath={`features[${index}].description`}
                        defaultValue={feature.description}
                        className="font-sans text-gray-600 leading-relaxed block"
                        as="p"
                        multiline
                        label={`Mô tả ${index + 1}`}
                      />
                    </div>
                  </motion.div>
                </EditableArrayItem>
              ))}
            </div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.5 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 1, delay: 1.2, type: "spring", stiffness: 150 }}
              viewport={{ once: true }}
              className="pt-4"
            >
              <motion.div
                whileHover={{ scale: 1.1, boxShadow: "0 20px 40px rgba(124, 179, 66, 0.3)" }}
                whileTap={{ scale: 0.95 }}
              >
                <EditableButtonV2
                  sectionKey="why_choose_us"
                  fieldPath="cta_text"
                  defaultValue="Đặt Hàng Ngay"
                  className="bg-[#7CB342] text-white px-8 py-4 rounded-full font-sans font-medium hover:bg-[#FF9800] transition-all duration-300 shadow-lg"
                  onClick={() => window.dispatchEvent(new CustomEvent('open-booking-modal'))}
                  label="Nút CTA"
                />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}