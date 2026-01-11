/**
 * TeamExpertisePillars - Section triết lý / trụ cột chuyên môn
 * Full Live Edit support
 */
import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Droplets, Beaker, Leaf, Award, Heart } from "lucide-react";
import { 
  EditableTextV2, 
  EditableSectionWrapper,
  EditableArrayItem 
} from "@/components/cms/EditableSectionV2";
import { useLiveEditContext } from "@/components/cms/LiveEditContext";

const SECTION_KEY = "expertise_pillars";

// Icon mapping
const ICON_MAP = {
  ShieldCheck,
  Droplets,
  Beaker,
  Leaf,
  Award,
  Heart
};

// Default pillars
const DEFAULT_PILLARS = [
  {
    icon: "ShieldCheck",
    title: "Chứng Nhận Quốc Tế",
    description: "Đạt chuẩn VietGAP và GlobalGAP, cam kết chất lượng cao nhất cho mọi sản phẩm."
  },
  {
    icon: "Droplets",
    title: "Công Nghệ Tiên Tiến",
    description: "Hệ thống tưới nhỏ giọt tự động, nhà kính hiện đại theo tiêu chuẩn Nhật Bản."
  },
  {
    icon: "Beaker",
    title: "Kiểm Nghiệm Nghiêm Ngặt",
    description: "Mọi sản phẩm đều được kiểm tra kỹ lưỡng trước khi giao đến khách hàng."
  }
];

export default function TeamExpertisePillars({ pillars: propPillars }) {
  const { isEditMode, getSectionFieldValue } = useLiveEditContext();
  
  // Use prop pillars or defaults
  const pillars = propPillars?.length > 0 ? propPillars : DEFAULT_PILLARS;

  // Get section title
  const sectionTitle = getSectionFieldValue(SECTION_KEY, "title", "Triết Lý Của Chúng Tôi");

  return (
    <EditableSectionWrapper sectionKey={SECTION_KEY} label="Triết Lý">
      <section className="mb-24 text-center">
        <EditableTextV2
          sectionKey={SECTION_KEY}
          fieldPath="title"
          defaultValue="Triết Lý Của Chúng Tôi"
          className="font-serif text-3xl font-bold text-[#0F0F0F] mb-12 block"
          as="h2"
          label="Tiêu đề section"
        />
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {pillars.map((pillar, index) => {
            // Get icon component
            const IconComponent = typeof pillar.icon === 'string' 
              ? ICON_MAP[pillar.icon] || ShieldCheck 
              : pillar.icon || ShieldCheck;
            
            return (
              <EditableArrayItem
                key={pillar.title || index}
                index={index}
                sectionKey={SECTION_KEY}
                label={`Trụ cột ${index + 1}`}
              >
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 + 0.5, ease: "easeOut" }}
                  className="bg-white p-8 rounded-3xl shadow-lg border border-[#7CB342]/20 flex flex-col items-center hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="w-16 h-16 bg-[#7CB342]/10 rounded-full flex items-center justify-center mb-4">
                    <IconComponent className="w-8 h-8 text-[#7CB342]" />
                  </div>
                  
                  <EditableTextV2
                    sectionKey={SECTION_KEY}
                    fieldPath={`pillars[${index}].title`}
                    defaultValue={pillar.title}
                    className="font-serif text-xl font-semibold text-[#0F0F0F] mb-2 block"
                    as="h3"
                    label={`Tiêu đề ${index + 1}`}
                  />
                  
                  <EditableTextV2
                    sectionKey={SECTION_KEY}
                    fieldPath={`pillars[${index}].description`}
                    defaultValue={pillar.description}
                    className="text-gray-600 text-sm text-center leading-relaxed block"
                    as="p"
                    multiline
                    label={`Mô tả ${index + 1}`}
                  />
                </motion.div>
              </EditableArrayItem>
            );
          })}
        </div>
      </section>
    </EditableSectionWrapper>
  );
}