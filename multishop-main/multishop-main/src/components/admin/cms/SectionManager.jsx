/**
 * SectionManager - Quản lý các sections của trang trong Admin CMS
 * 
 * Features:
 * - View/Edit tất cả sections của trang
 * - Toggle visibility - LƯU VÀO section_visibility_content
 * - Edit content inline
 * 
 * FIXED: Đồng bộ visibility với SiteConfig.section_visibility_content
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye, EyeOff, Edit3, ChevronDown, ChevronRight, Save,
  GripVertical, Image, Type, List, Settings, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useSiteConfig, useSiteConfigMutation } from "@/components/hooks/useCMSPages";
import { SECTION_LABELS, DEFAULT_SECTION_VISIBILITY } from "@/components/cms/SectionVisibilityManager";
import { DEFAULT_SECTION_DATA } from "@/components/cms/liveEditTypes";
import { cn } from "@/lib/utils";
import { showAdminAlert } from "@/components/AdminAlert";

// Section type icons
const SECTION_ICONS = {
  hero: Image,
  why_choose_us: List,
  product_specialty: List,
  what_we_do: List,
  promotional_banner: Image,
  testimonials: List,
  categories: List,
  brand_partners: Image,
  team_founder: Image,
  expertise_pillars: List,
  team_members: List,
  contact_info: Type,
  default: Settings
};

// Pages with their sections
const PAGE_SECTIONS = {
  home: ['hero', 'why_choose_us', 'product_specialty', 'what_we_do', 'promotional_banner', 'testimonials', 'categories', 'brand_partners'],
  team: ['team_page', 'team_founder', 'expertise_pillars', 'team_members'],
  contact: ['contact_page', 'contact_info', 'contact_form', 'contact_faq', 'contact_map']
};

export default function SectionManager({ page = 'home' }) {
  const { data: config, isLoading, refetch } = useSiteConfig();
  const saveMutation = useSiteConfigMutation();
  
  const [expandedSection, setExpandedSection] = useState(null);
  const [localData, setLocalData] = useState({});
  const [savingSection, setSavingSection] = useState(null);

  const sections = PAGE_SECTIONS[page] || PAGE_SECTIONS.home;

  // Get section visibility from section_visibility_content
  const getVisibility = (sectionKey) => {
    const visibilityData = config?.section_visibility_content || {};
    // Check if explicitly set, otherwise use default
    if (visibilityData.hasOwnProperty(sectionKey)) {
      return visibilityData[sectionKey] !== false;
    }
    return DEFAULT_SECTION_VISIBILITY[sectionKey] !== false;
  };

  // Toggle visibility - save to section_visibility_content
  const toggleVisibility = async (sectionKey) => {
    try {
      const currentVisibility = config?.section_visibility_content || {};
      const newValue = !getVisibility(sectionKey);
      
      const newVisibility = {
        ...currentVisibility,
        [sectionKey]: newValue
      };
      
      await saveMutation.mutateAsync({
        section_visibility_content: newVisibility
      });
      
      showAdminAlert(
        newValue ? `✅ Đã bật hiển thị ${SECTION_LABELS[sectionKey]}` : `🔴 Đã ẩn ${SECTION_LABELS[sectionKey]}`,
        newValue ? 'success' : 'info'
      );
    } catch (error) {
      showAdminAlert('❌ Lỗi khi thay đổi trạng thái', 'error');
    }
  };

  // Get section content
  const getSectionContent = (sectionKey) => {
    const contentKey = `${sectionKey}_content`;
    return config?.[contentKey] || DEFAULT_SECTION_DATA[sectionKey] || {};
  };

  // Update local section data
  const updateLocalData = (sectionKey, field, value) => {
    setLocalData(prev => ({
      ...prev,
      [sectionKey]: {
        ...(prev[sectionKey] || getSectionContent(sectionKey)),
        [field]: value
      }
    }));
  };

  // Save section changes
  const saveSection = async (sectionKey) => {
    const contentKey = `${sectionKey}_content`;
    const data = localData[sectionKey];
    
    if (!data) return;
    
    setSavingSection(sectionKey);
    try {
      // Merge with existing content
      const existingContent = config?.[contentKey] || {};
      const mergedContent = { ...existingContent, ...data };
      
      await saveMutation.mutateAsync({
        [contentKey]: mergedContent
      });
      
      setLocalData(prev => {
        const newData = { ...prev };
        delete newData[sectionKey];
        return newData;
      });
      
      showAdminAlert(`✅ Đã lưu ${SECTION_LABELS[sectionKey]}`, 'success');
    } catch (error) {
      showAdminAlert('❌ Lỗi khi lưu', 'error');
    } finally {
      setSavingSection(null);
    }
  };

  // Cancel section changes
  const cancelSection = (sectionKey) => {
    setLocalData(prev => {
      const newData = { ...prev };
      delete newData[sectionKey];
      return newData;
    });
    setExpandedSection(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-[#7CB342] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">
            Trang: <span className="font-medium capitalize">{page}</span> • {sections.length} sections
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Làm mới
        </Button>
      </div>

      {/* Section list */}
      <div className="space-y-3">
        {sections.map((sectionKey, index) => {
          const isVisible = getVisibility(sectionKey);
          const isExpanded = expandedSection === sectionKey;
          const Icon = SECTION_ICONS[sectionKey] || SECTION_ICONS.default;
          const label = SECTION_LABELS[sectionKey] || sectionKey;
          const content = localData[sectionKey] || getSectionContent(sectionKey);
          const hasLocalChanges = !!localData[sectionKey];
          const isSaving = savingSection === sectionKey;

          return (
            <motion.div
              key={sectionKey}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={cn(
                "transition-all duration-200",
                !isVisible && "opacity-60 bg-gray-50",
                isExpanded && "ring-2 ring-[#7CB342]"
              )}>
                <CardHeader className="py-3 px-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <GripVertical className="w-4 h-4 text-gray-300 cursor-move" />
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center",
                        isVisible ? "bg-[#7CB342]/10 text-[#7CB342]" : "bg-gray-100 text-gray-400"
                      )}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className={cn(
                          "font-medium text-sm",
                          !isVisible && "text-gray-400 line-through"
                        )}>
                          {label}
                        </h4>
                        <p className="text-xs text-gray-400">{sectionKey}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Visibility status badge */}
                      <span className={cn(
                        "text-xs px-2 py-1 rounded-full",
                        isVisible ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                      )}>
                        {isVisible ? "Đang hiện" : "Đang ẩn"}
                      </span>
                      
                      {/* Visibility toggle */}
                      <Switch
                        checked={isVisible}
                        onCheckedChange={() => toggleVisibility(sectionKey)}
                        className="data-[state=checked]:bg-[#7CB342]"
                      />
                      
                      {/* Expand/collapse */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedSection(isExpanded ? null : sectionKey)}
                        className="h-8 w-8 p-0"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {/* Expanded content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <CardContent className="pt-0 pb-4 px-4 border-t">
                        <SectionContentEditor
                          sectionKey={sectionKey}
                          content={content}
                          onChange={(field, value) => updateLocalData(sectionKey, field, value)}
                        />
                        
                        {/* Actions */}
                        <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => cancelSection(sectionKey)}
                          >
                            Hủy
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => saveSection(sectionKey)}
                            disabled={!hasLocalChanges || isSaving}
                            className="bg-[#7CB342] hover:bg-[#689F38]"
                          >
                            {isSaving ? (
                              <Loader2 className="w-4 h-4 animate-spin mr-1" />
                            ) : (
                              <Save className="w-4 h-4 mr-1" />
                            )}
                            Lưu
                          </Button>
                        </div>
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// Section content editor component
function SectionContentEditor({ sectionKey, content, onChange }) {
  const fields = getEditableFields(sectionKey);

  return (
    <div className="space-y-4 pt-4">
      {fields.map((field) => (
        <div key={field.key}>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {field.label}
          </label>
          
          {field.type === 'text' && (
            <Input
              value={content[field.key] || ''}
              onChange={(e) => onChange(field.key, e.target.value)}
              placeholder={field.placeholder}
            />
          )}
          
          {field.type === 'textarea' && (
            <Textarea
              value={content[field.key] || ''}
              onChange={(e) => onChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              rows={3}
            />
          )}
          
          {field.type === 'image' && (
            <div className="flex gap-2">
              <Input
                value={content[field.key] || ''}
                onChange={(e) => onChange(field.key, e.target.value)}
                placeholder="https://..."
                className="flex-1"
              />
              {content[field.key] && (
                <div className="w-12 h-12 rounded-lg overflow-hidden border">
                  <img 
                    src={content[field.key]} 
                    alt="" 
                    className="w-full h-full object-cover"
                    onError={(e) => e.target.src = '/placeholder.png'}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      ))}
      
      {fields.length === 0 && (
        <p className="text-sm text-gray-500 italic">
          Section này chưa có các trường có thể chỉnh sửa. Sử dụng Live Edit trên trang client để chỉnh sửa.
        </p>
      )}
    </div>
  );
}

// Get editable fields for each section type
function getEditableFields(sectionKey) {
  const fieldMappings = {
    team_page: [
      { key: 'badge', label: 'Badge', type: 'text', placeholder: 'Đội Ngũ Của Chúng Tôi' },
      { key: 'title', label: 'Tiêu đề', type: 'text', placeholder: 'Người Sáng Lập & Chuyên Gia' },
      { key: 'subtitle', label: 'Phụ đề', type: 'textarea', placeholder: 'Mô tả...' }
    ],
    team_founder: [
      { key: 'name', label: 'Tên Founder', type: 'text', placeholder: 'Ông Trần Thanh Liêm' },
      { key: 'title', label: 'Chức danh', type: 'text', placeholder: 'Nhà Sáng Lập & CEO' },
      { key: 'story', label: 'Câu chuyện', type: 'textarea', placeholder: 'Với hơn 15 năm...' },
      { key: 'image_url', label: 'Ảnh Founder', type: 'image', placeholder: 'URL ảnh' }
    ],
    expertise_pillars: [
      { key: 'title', label: 'Tiêu đề Section', type: 'text', placeholder: 'Triết Lý Của Chúng Tôi' }
    ],
    team_members: [
      { key: 'title', label: 'Tiêu đề Section', type: 'text', placeholder: 'Đội Ngũ Chuyên Gia' }
    ],
    promotional_banner: [
      { key: 'discount_text', label: 'Text Giảm Giá', type: 'text', placeholder: 'GIẢM 30%' },
      { key: 'subtitle', label: 'Tiêu đề phụ', type: 'text', placeholder: 'Ưu Đãi Đặc Biệt' },
      { key: 'description', label: 'Mô tả', type: 'textarea', placeholder: 'Đặt hàng ngay...' },
      { key: 'cta_text', label: 'Nút CTA', type: 'text', placeholder: 'NHẬN ƯU ĐÃI NGAY' }
    ],
    hero: [
      { key: 'urgency_title', label: 'Tiêu đề Urgency', type: 'text', placeholder: 'ƯU ĐÃI TUẦN ĐẦU' },
      { key: 'urgency_text', label: 'Nội dung Urgency', type: 'textarea', placeholder: 'Đặt hàng ngay...' }
    ],
    why_choose_us: [
      { key: 'badge', label: 'Badge', type: 'text' },
      { key: 'title', label: 'Tiêu đề', type: 'text' },
      { key: 'title_highlight', label: 'Highlight', type: 'text' },
      { key: 'description', label: 'Mô tả', type: 'textarea' },
      { key: 'cta_text', label: 'Nút CTA', type: 'text' }
    ],
    contact_page: [
      { key: 'badge', label: 'Badge', type: 'text' },
      { key: 'title', label: 'Tiêu đề', type: 'text' },
      { key: 'subtitle', label: 'Phụ đề', type: 'textarea' }
    ],
    product_specialty: [
      { key: 'title', label: 'Tiêu đề', type: 'text' },
      { key: 'title_highlight', label: 'Highlight', type: 'text' },
      { key: 'description', label: 'Mô tả', type: 'textarea' }
    ],
    what_we_do: [
      { key: 'badge', label: 'Badge', type: 'text' },
      { key: 'title', label: 'Tiêu đề', type: 'text' },
      { key: 'title_highlight', label: 'Highlight', type: 'text' },
      { key: 'description', label: 'Mô tả', type: 'textarea' },
      { key: 'left_image', label: 'Ảnh trái', type: 'image' },
      { key: 'right_image', label: 'Ảnh phải', type: 'image' },
      { key: 'cta_text', label: 'Nút CTA', type: 'text' }
    ],
    testimonials: [
      { key: 'badge', label: 'Badge', type: 'text' },
      { key: 'title', label: 'Tiêu đề', type: 'text' },
      { key: 'title_highlight', label: 'Highlight', type: 'text' },
      { key: 'description', label: 'Mô tả', type: 'textarea' }
    ],
    categories: [
      { key: 'badge', label: 'Badge', type: 'text' },
      { key: 'title', label: 'Tiêu đề', type: 'text' },
      { key: 'title_highlight', label: 'Highlight', type: 'text' },
      { key: 'description', label: 'Mô tả', type: 'textarea' }
    ]
  };

  return fieldMappings[sectionKey] || [];
}