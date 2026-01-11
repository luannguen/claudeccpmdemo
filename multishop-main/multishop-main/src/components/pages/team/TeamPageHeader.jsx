/**
 * TeamPageHeader - Header section của trang Team
 * Uses EditableTextV2 for live editing support
 */
import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { EditableTextV2, EditableSectionWrapper } from "@/components/cms/EditableSectionV2";
import { useLiveEditContext } from "@/components/cms/LiveEditContext";

const SECTION_KEY = "team_page";

export default function TeamPageHeader({ title: propTitle, subtitle: propSubtitle }) {
  const { getSectionFieldValue } = useLiveEditContext();

  // Get values with fallbacks
  const badge = getSectionFieldValue(SECTION_KEY, "badge", "Đội Ngũ Của Chúng Tôi");
  const title = getSectionFieldValue(SECTION_KEY, "title", propTitle || "Người Sáng Lập & Chuyên Gia");
  const subtitle = getSectionFieldValue(SECTION_KEY, "subtitle", propSubtitle || "Gặp gỡ đội ngũ chuyên gia tận tâm đằng sau mỗi sản phẩm organic chất lượng cao.");

  return (
    <EditableSectionWrapper sectionKey={SECTION_KEY} label="Header Trang">
      <div className="text-center mb-16">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="inline-flex items-center gap-2 bg-[#7CB342]/10 text-[#7CB342] px-4 py-2 rounded-full mb-6"
        >
          <Sparkles className="w-4 h-4" />
          <EditableTextV2
            sectionKey={SECTION_KEY}
            fieldPath="badge"
            defaultValue="Đội Ngũ Của Chúng Tôi"
            className="text-sm font-medium"
            as="span"
            label="Badge"
            richText={false}
          />
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
          <EditableTextV2
            sectionKey={SECTION_KEY}
            fieldPath="title"
            defaultValue={propTitle || "Người Sáng Lập & Chuyên Gia"}
            className="text-4xl lg:text-5xl font-bold text-[#0F0F0F] mb-6 block"
            as="h1"
            label="Tiêu đề trang"
          />
        </motion.div>

        {/* Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="max-w-2xl mx-auto"
        >
          <EditableTextV2
            sectionKey={SECTION_KEY}
            fieldPath="subtitle"
            defaultValue={propSubtitle || "Gặp gỡ đội ngũ chuyên gia tận tâm đằng sau mỗi sản phẩm organic chất lượng cao."}
            className="text-lg text-gray-600 leading-relaxed block"
            as="p"
            multiline
            label="Phụ đề"
          />
        </motion.div>
      </div>
    </EditableSectionWrapper>
  );
}