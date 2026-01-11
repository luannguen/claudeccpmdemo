import React from 'react';
import { Mail, Loader2 } from 'lucide-react';
import TemplateCard from './TemplateCard';

export default function TemplatesList({
  templates,
  isLoading,
  onEdit,
  onDelete,
  onPreview,
  onTest,
  onSetDefault,
  onAddNew
}) {
  if (isLoading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-12 h-12 text-[#7CB342] animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Đang tải templates...</p>
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl shadow-lg">
        <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-bold mb-2">Chưa có template nào</h3>
        <p className="text-gray-600 mb-6">Tạo template đầu tiên để bắt đầu</p>
        <button
          onClick={onAddNew}
          className="px-6 py-3 bg-[#7CB342] text-white rounded-xl font-medium hover:bg-[#FF9800] transition-colors"
        >
          Tạo Template
        </button>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {templates.map(template => (
        <TemplateCard
          key={template.id}
          template={template}
          onEdit={onEdit}
          onDelete={onDelete}
          onPreview={onPreview}
          onTest={onTest}
          onSetDefault={onSetDefault}
        />
      ))}
    </div>
  );
}