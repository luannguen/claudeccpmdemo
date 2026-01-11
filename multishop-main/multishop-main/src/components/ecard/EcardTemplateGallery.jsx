/**
 * EcardTemplateGallery - Template design gallery
 * Feature Enhancement #5
 */

import React, { useState } from "react";
import { Icon } from "@/components/ui/AnimatedIcon";
import { motion } from "framer-motion";
import { useToast } from "@/components/NotificationToast";

const templates = [
  { 
    id: 'minimal', 
    name: 'Minimal', 
    preview: 'bg-white border-2 border-gray-200',
    description: 'Đơn giản, tối giản',
    colors: ['bg-white', 'bg-gray-900', 'bg-gray-50']
  },
  { 
    id: 'nature', 
    name: 'Nature', 
    preview: 'bg-gradient-to-br from-green-400 to-green-600',
    description: 'Xanh tự nhiên',
    colors: ['bg-green-100', 'bg-green-500', 'bg-green-900']
  },
  { 
    id: 'professional', 
    name: 'Professional', 
    preview: 'bg-gradient-to-br from-blue-500 to-indigo-600',
    description: 'Chuyên nghiệp, sang trọng',
    colors: ['bg-blue-100', 'bg-blue-600', 'bg-indigo-900']
  },
  { 
    id: 'creative', 
    name: 'Creative', 
    preview: 'bg-gradient-to-br from-purple-500 to-pink-500',
    description: 'Sáng tạo, nổi bật',
    colors: ['bg-purple-100', 'bg-pink-500', 'bg-purple-900']
  },
  { 
    id: 'elegant', 
    name: 'Elegant', 
    preview: 'bg-gradient-to-br from-amber-400 to-orange-500',
    description: 'Thanh lịch, tinh tế',
    colors: ['bg-amber-50', 'bg-orange-500', 'bg-amber-900']
  },
];

export default function EcardTemplateGallery({ currentTemplate, onSelectTemplate }) {
  const [selected, setSelected] = useState(currentTemplate || 'minimal');
  const { addToast } = useToast();

  const handleSelect = (templateId) => {
    setSelected(templateId);
    onSelectTemplate?.(templateId);
    addToast('Đã áp dụng template mới', 'success');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">Chọn Template</h3>
        <Icon.Sparkles size={20} className="text-[#7CB342]" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((template, index) => (
          <motion.button
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => handleSelect(template.id)}
            className={`relative p-4 rounded-xl border-2 transition-all text-left ${
              selected === template.id
                ? 'border-[#7CB342] bg-[#7CB342]/5 shadow-lg'
                : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
            }`}
          >
            {/* Preview */}
            <div className={`w-full h-32 ${template.preview} rounded-lg mb-3 relative overflow-hidden`}>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full" />
              </div>
            </div>

            {/* Info */}
            <div>
              <p className="font-bold text-gray-900 mb-1">{template.name}</p>
              <p className="text-sm text-gray-600 mb-2">{template.description}</p>

              {/* Color Palette */}
              <div className="flex gap-2">
                {template.colors.map((color, i) => (
                  <div key={i} className={`w-6 h-6 ${color} rounded-full border-2 border-white shadow-sm`} />
                ))}
              </div>
            </div>

            {/* Selected Badge */}
            {selected === template.id && (
              <div className="absolute top-2 right-2 bg-[#7CB342] text-white rounded-full p-1.5">
                <Icon.Check size={16} />
              </div>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}