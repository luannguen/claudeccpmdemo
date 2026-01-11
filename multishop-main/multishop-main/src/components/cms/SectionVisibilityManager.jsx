/**
 * SectionVisibilityManager - Quản lý ẩn/hiện sections
 * 
 * Cho phép:
 * - Toggle visibility của sections trên trang
 * - Lưu trạng thái vào SiteConfig
 * - Sync giữa live edit và admin
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Settings, ChevronDown, ChevronUp, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useLiveEditContext } from "./LiveEditContext";

// Default visibility settings
export const DEFAULT_SECTION_VISIBILITY = {
  hero: true,
  why_choose_us: true,
  product_specialty: true,
  what_we_do: true,
  promotional_banner: true,
  testimonials: true,
  categories: true,
  brand_partners: true,
  newsletter: true,
  // Team page
  team_page: true,
  team_founder: true,
  expertise_pillars: true,
  team_members: true,
  // Contact page
  contact_page: true,
  contact_info: true,
  contact_form: true,
  contact_faq: true,
  contact_map: true
};

// Section labels for UI
export const SECTION_LABELS = {
  hero: "Hero Banner",
  why_choose_us: "Tại Sao Chọn Chúng Tôi",
  product_specialty: "Đặc Sản Sản Phẩm",
  what_we_do: "Những Gì Chúng Tôi Làm",
  promotional_banner: "Banner Khuyến Mãi",
  testimonials: "Đánh Giá Khách Hàng",
  categories: "Danh Mục Sản Phẩm",
  brand_partners: "Đối Tác Thương Hiệu",
  newsletter: "Đăng Ký Nhận Tin",
  team_page: "Header Trang Team",
  team_founder: "Giới Thiệu Founder",
  expertise_pillars: "Triết Lý / Trụ Cột",
  team_members: "Đội Ngũ Chuyên Gia",
  contact_page: "Header Trang Liên Hệ",
  contact_info: "Thông Tin Liên Hệ",
  contact_form: "Form Liên Hệ",
  contact_faq: "Câu Hỏi Thường Gặp",
  contact_map: "Bản Đồ"
};

// ========== VISIBILITY CONTEXT HOOK ==========
export function useSectionVisibility() {
  const { getSectionFieldValue, updateSectionField } = useLiveEditContext();
  
  const getVisibility = (sectionKey) => {
    const visibility = getSectionFieldValue('section_visibility', sectionKey, DEFAULT_SECTION_VISIBILITY[sectionKey]);
    return visibility !== false; // Default to visible
  };

  const setVisibility = (sectionKey, visible) => {
    updateSectionField('section_visibility', sectionKey, visible);
  };

  const toggleVisibility = (sectionKey) => {
    const current = getVisibility(sectionKey);
    setVisibility(sectionKey, !current);
  };

  return { getVisibility, setVisibility, toggleVisibility };
}

// ========== SECTION VISIBILITY TOGGLE (Inline) ==========
export function SectionVisibilityToggle({ sectionKey, className = "" }) {
  const { isEditMode } = useLiveEditContext();
  const { getVisibility, toggleVisibility } = useSectionVisibility();
  
  if (!isEditMode) return null;

  const isVisible = getVisibility(sectionKey);
  const label = SECTION_LABELS[sectionKey] || sectionKey;

  return (
    <button
      onClick={() => toggleVisibility(sectionKey)}
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
        isVisible 
          ? "bg-[#7CB342] text-white" 
          : "bg-gray-200 text-gray-500",
        className
      )}
      title={isVisible ? `Ẩn ${label}` : `Hiện ${label}`}
    >
      {isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
      {isVisible ? "Đang hiện" : "Đang ẩn"}
    </button>
  );
}

// ========== SECTION VISIBILITY PANEL (Floating) ==========
export function SectionVisibilityPanel({ sections = [], className = "" }) {
  const { isEditMode } = useLiveEditContext();
  const { getVisibility, setVisibility } = useSectionVisibility();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isEditMode) return null;

  const visibleCount = sections.filter(s => getVisibility(s)).length;

  return (
    <motion.div
      initial={false}
      animate={{ height: isExpanded ? "auto" : "48px" }}
      className={cn(
        "fixed right-4 top-36 z-[100] bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden",
        isExpanded ? "w-72" : "w-auto",
        className
      )}
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-[#7CB342]" />
          <span className="font-medium text-sm text-gray-700">
            Sections ({visibleCount}/{sections.length})
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>

      {/* Section list */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="border-t border-gray-100 max-h-96 overflow-y-auto"
          >
            {sections.map((sectionKey) => {
              const label = SECTION_LABELS[sectionKey] || sectionKey;
              const isVisible = getVisibility(sectionKey);

              return (
                <div
                  key={sectionKey}
                  className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-3 h-3 text-gray-300 cursor-move" />
                    <span className={cn(
                      "text-sm",
                      isVisible ? "text-gray-700" : "text-gray-400 line-through"
                    )}>
                      {label}
                    </span>
                  </div>
                  <Switch
                    checked={isVisible}
                    onCheckedChange={(checked) => setVisibility(sectionKey, checked)}
                    className="data-[state=checked]:bg-[#7CB342]"
                  />
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ========== CONDITIONAL SECTION WRAPPER ==========
export function ConditionalSection({ sectionKey, children, fallback = null }) {
  const { isEditMode } = useLiveEditContext();
  const { getVisibility } = useSectionVisibility();

  const isVisible = getVisibility(sectionKey);

  // In edit mode, always show but with overlay if hidden
  if (isEditMode) {
    return (
      <div className={cn("relative", !isVisible && "opacity-40")}>
        {children}
        
        {/* Hidden overlay indicator */}
        {!isVisible && (
          <div className="absolute inset-0 bg-gray-100/50 flex items-center justify-center pointer-events-none rounded-xl">
            <div className="bg-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-gray-500">
              <EyeOff className="w-4 h-4" />
              <span className="text-sm font-medium">Section đang ẩn</span>
            </div>
          </div>
        )}
        
        {/* Visibility toggle button */}
        <SectionVisibilityToggle 
          sectionKey={sectionKey} 
          className="absolute top-2 right-2 z-10"
        />
      </div>
    );
  }

  // In normal mode, hide if not visible
  if (!isVisible) {
    return fallback;
  }

  return children;
}

export default {
  useSectionVisibility,
  SectionVisibilityToggle,
  SectionVisibilityPanel,
  ConditionalSection,
  DEFAULT_SECTION_VISIBILITY,
  SECTION_LABELS
};