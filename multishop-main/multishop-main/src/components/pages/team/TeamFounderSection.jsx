/**
 * TeamFounderSection - Section giới thiệu người sáng lập
 * Uses unified LiveEditContext with EditableTextV2/EditableImageV2
 */
import React from "react";
import { motion } from "framer-motion";
import { 
  EditableTextV2, 
  EditableImageV2,
  EditableSectionWrapper 
} from "@/components/cms/EditableSectionV2";
import { EditableStringArray } from "@/components/cms/EditableArrayV2";
import { useLiveEditContext } from "@/components/cms/LiveEditContext";
import { Sparkles } from "lucide-react";

const SECTION_KEY = "team_founder";

// Default founder data
const DEFAULT_FOUNDER = {
  name: "Ông Trần Thanh Liêm",
  title: "Nhà Sáng Lập & CEO",
  story: "Với hơn 15 năm kinh nghiệm trong ngành nông nghiệp hữu cơ, tôi đã xây dựng Zero Farm với tâm huyết mang đến những sản phẩm sạch, an toàn cho mọi gia đình Việt.",
  image_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&q=90",
  commitments: [
    "Canh tác 100% hữu cơ, không hóa chất độc hại",
    "Hệ thống tưới nhỏ giọt và nhà kính tiêu chuẩn quốc tế",
    "Kiểm nghiệm nghiêm ngặt, chứng nhận VietGAP & GlobalGAP"
  ]
};

export default function TeamFounderSection({ founder: propFounder }) {
  const { isEditMode, getSectionFieldValue } = useLiveEditContext();
  
  // Merge prop data with saved data
  const founder = propFounder || DEFAULT_FOUNDER;
  
  // Get editable values
  const name = getSectionFieldValue(SECTION_KEY, "name", founder.name || DEFAULT_FOUNDER.name);
  const title = getSectionFieldValue(SECTION_KEY, "title", founder.title || DEFAULT_FOUNDER.title);
  const story = getSectionFieldValue(SECTION_KEY, "story", founder.story || DEFAULT_FOUNDER.story);
  const imageUrl = getSectionFieldValue(SECTION_KEY, "image_url", founder.image_url || DEFAULT_FOUNDER.image_url);
  // Get commitments from saved data or use defaults
  const savedCommitments = getSectionFieldValue(SECTION_KEY, "commitments", null);
  const commitments = savedCommitments || founder.commitments || DEFAULT_FOUNDER.commitments;

  // Get signature from name
  const signature = name ? name.split(' ').slice(-2).join(' ') : "Quang Minh";

  return (
    <EditableSectionWrapper sectionKey={SECTION_KEY} label="Thông tin Founder">
      <section className="mb-24">
        <div className="grid lg:grid-cols-12 gap-12 items-center bg-white rounded-3xl p-8 lg:p-12 shadow-2xl shadow-[#7CB342]/10 border border-[#7CB342]/20">
          {/* Founder Image */}
          <motion.div 
            className="lg:col-span-5"
            initial={{ opacity: 0, scale: 0.8, x: -50 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
          >
            <div className="rounded-3xl overflow-hidden shadow-xl aspect-[4/5]">
              <EditableImageV2
                sectionKey={SECTION_KEY}
                fieldPath="image_url"
                defaultValue={founder.image_url || DEFAULT_FOUNDER.image_url}
                alt={`${name} - ${title}`}
                className="w-full h-full object-cover object-center"
                label="Ảnh Founder"
              />
            </div>
          </motion.div>
          
          {/* Founder's Story */}
          <motion.div 
            className="lg:col-span-7"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
          >
            <EditableTextV2
              sectionKey={SECTION_KEY}
              fieldPath="name"
              defaultValue={founder.name || DEFAULT_FOUNDER.name}
              className="font-serif text-3xl lg:text-4xl font-bold text-[#0F0F0F] mb-2 block"
              as="h2"
              label="Tên Founder"
            />
            
            <EditableTextV2
              sectionKey={SECTION_KEY}
              fieldPath="title"
              defaultValue={founder.title || DEFAULT_FOUNDER.title}
              className="font-sans text-lg text-[#7CB342] font-medium mb-6 block"
              as="p"
              label="Chức danh"
            />
            
            <div className="space-y-6 font-sans text-gray-700 leading-relaxed text-base lg:text-lg">
              <EditableTextV2
                sectionKey={SECTION_KEY}
                fieldPath="story"
                defaultValue={founder.story || DEFAULT_FOUNDER.story}
                className="block"
                as="p"
                multiline
                label="Câu chuyện"
              />

              {/* Editable commitments list */}
              <EditableCommitmentsList 
                sectionKey={SECTION_KEY}
                fieldPath="commitments"
                defaultValue={commitments}
              />
            </div>

            {/* Signature */}
            <p className="font-serif text-3xl text-[#7CB342] mt-8">
              {signature}
            </p>
          </motion.div>
        </div>
      </section>
    </EditableSectionWrapper>
  );
}

// Editable Commitments List Component
function EditableCommitmentsList({ sectionKey, fieldPath, defaultValue = [] }) {
  const { isEditMode } = useLiveEditContext();
  
  // Render item with sparkle icon
  const renderCommitment = (commitment, idx) => (
    <li key={idx} className="flex items-start">
      <Sparkles className="w-5 h-5 text-[#7CB342] mr-3 mt-1 flex-shrink-0" />
      <span>{commitment}</span>
    </li>
  );

  return (
    <div>
      <h3 className="font-serif text-xl lg:text-2xl font-semibold text-[#0F0F0F] mb-4 border-l-4 border-[#7CB342] pl-4">
        Cam Kết Với Chất Lượng
      </h3>
      <EditableStringArray
        sectionKey={sectionKey}
        fieldPath={fieldPath}
        defaultValue={defaultValue}
        className="space-y-3 list-none pl-2 text-base"
        itemClassName="flex items-start"
        renderItem={renderCommitment}
        placeholder="Thêm cam kết mới..."
        label="Danh sách cam kết"
        addLabel="Thêm cam kết"
      />
    </div>
  );
}