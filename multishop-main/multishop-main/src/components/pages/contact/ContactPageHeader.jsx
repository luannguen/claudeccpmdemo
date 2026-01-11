/**
 * ContactPageHeader - Header cho trang liên hệ
 * Uses unified LiveEditContext
 */
import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { EditableTextV2 } from "@/components/cms/EditableSectionV2";

export default function ContactPageHeader({ title, subtitle }) {
  return (
    <div className="text-center mb-16 section-editable">
      <motion.div 
        initial={{ opacity: 0, scale: 0, rotate: -180 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: 0.8, delay: 0.2, type: "spring", stiffness: 200 }}
        className="inline-flex items-center gap-2 bg-[#7CB342]/10 rounded-full px-4 py-2 mb-6"
      >
        <Sparkles className="w-4 h-4 text-[#7CB342]" />
        <EditableTextV2
          sectionKey="contact_page"
          fieldPath="badge"
          defaultValue="Liên Hệ Với Chúng Tôi"
          className="font-sans text-sm text-[#7CB342] font-medium"
          as="span"
          label="Badge"
        />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.4 }}
        className="mb-4"
      >
        <EditableTextV2
          sectionKey="contact_page"
          fieldPath="title"
          defaultValue={title}
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#0F0F0F]"
          as="h1"
          label="Tiêu đề trang"
        />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.6 }}
      >
        <EditableTextV2
          sectionKey="contact_page"
          fieldPath="subtitle"
          defaultValue={subtitle}
          className="font-sans text-lg text-gray-600 max-w-3xl mx-auto"
          as="p"
          multiline
          label="Mô tả trang"
        />
      </motion.div>
    </div>
  );
}