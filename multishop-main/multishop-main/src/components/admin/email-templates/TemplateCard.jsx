import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Send, Edit, CheckCircle, Trash2 } from 'lucide-react';
import { TEMPLATE_TYPES } from '@/components/hooks/useAdminEmailTemplates';

export default function TemplateCard({ template, onEdit, onDelete, onPreview, onTest, onSetDefault }) {
  const typeInfo = TEMPLATE_TYPES.find(t => t.value === template.type) || TEMPLATE_TYPES[0];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all border border-gray-200"
    >
      {/* Preview Image */}
      {template.preview_image && (
        <div className="h-48 overflow-hidden bg-gray-100">
          <img
            src={template.preview_image}
            alt={template.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{typeInfo.icon}</span>
              <h3 className="font-bold text-lg">{template.name}</h3>
              {template.is_default && (
                <span className="px-2 py-0.5 bg-[#7CB342] text-white rounded-full text-xs font-medium">
                  Mặc định
                </span>
              )}
              {!template.is_active && (
                <span className="px-2 py-0.5 bg-gray-400 text-white rounded-full text-xs font-medium">
                  Tắt
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-2">{template.subject}</p>
            {template.description && (
              <p className="text-xs text-gray-500">{template.description}</p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
          <div>
            <p className="text-xs text-gray-500">Loại</p>
            <p className="text-sm font-medium">{typeInfo.label}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Đã dùng</p>
            <p className="text-sm font-medium">{template.usage_count || 0} lần</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onPreview(template)}
            className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 flex items-center justify-center gap-1"
          >
            <Eye className="w-4 h-4" />
            Xem
          </button>
          <button
            onClick={() => onTest(template)}
            className="flex-1 px-3 py-2 bg-green-50 text-green-600 rounded-lg text-sm font-medium hover:bg-green-100 flex items-center justify-center gap-1"
          >
            <Send className="w-4 h-4" />
            Test
          </button>
          <button
            onClick={() => onEdit(template)}
            className="px-3 py-2 bg-gray-50 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100"
          >
            <Edit className="w-4 h-4" />
          </button>
          {!template.is_default && (
            <button
              onClick={() => onSetDefault(template)}
              className="px-3 py-2 bg-[#7CB342]/10 text-[#7CB342] rounded-lg text-sm font-medium hover:bg-[#7CB342]/20"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => onDelete(template)}
            className="px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}