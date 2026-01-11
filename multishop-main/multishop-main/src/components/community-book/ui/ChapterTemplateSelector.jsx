/**
 * ChapterTemplateSelector - Select template when creating chapter
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@/components/ui/AnimatedIcon';
import { TEMPLATE_LIST } from '../domain/chapterTemplates';

const ICON_MAP = {
  FileText: <Icon.FileText size={24} />,
  BookOpen: <Icon.FileText size={24} />,
  Feather: <Icon.Edit size={24} />,
  Lightbulb: <Icon.Lightbulb size={24} />,
  GraduationCap: <Icon.Award size={24} />,
  Zap: <Icon.Zap size={24} />,
  ChefHat: <Icon.Star size={24} />
};

export default function ChapterTemplateSelector({ onSelect, selectedId }) {
  return (
    <div className="space-y-3">
      <h4 className="font-medium text-gray-900">Chọn mẫu chương</h4>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {TEMPLATE_LIST.map((template) => (
          <motion.button
            key={template.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(template)}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              selectedId === template.id
                ? 'border-[#7CB342] bg-[#7CB342]/5'
                : 'border-gray-100 hover:border-gray-200 bg-white'
            }`}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 ${
              selectedId === template.id
                ? 'bg-[#7CB342]/20 text-[#7CB342]'
                : 'bg-gray-100 text-gray-500'
            }`}>
              {ICON_MAP[template.icon] || <Icon.FileText size={24} />}
            </div>
            <h5 className="font-medium text-gray-900 text-sm">{template.name}</h5>
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{template.description}</p>
          </motion.button>
        ))}
      </div>
    </div>
  );
}