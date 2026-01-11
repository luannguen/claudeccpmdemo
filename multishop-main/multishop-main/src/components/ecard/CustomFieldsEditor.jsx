/**
 * CustomFieldsEditor - Quản lý custom fields cho E-Card
 * UI Component
 */

import React, { useState } from 'react';
import { Icon } from '@/components/ui/AnimatedIcon';
import { useConfirmDialog } from '@/components/hooks/useConfirmDialog';

export default function CustomFieldsEditor({ customFields = [], onChange }) {
  const [fields, setFields] = useState(customFields);
  const [isAdding, setIsAdding] = useState(false);
  const [newField, setNewField] = useState({ label: '', value: '', icon: 'Info' });
  const { showConfirm } = useConfirmDialog();

  const handleAdd = () => {
    if (!newField.label.trim() || !newField.value.trim()) return;
    
    const updated = [...fields, newField];
    setFields(updated);
    onChange(updated);
    setNewField({ label: '', value: '', icon: 'Info' });
    setIsAdding(false);
  };

  const handleRemove = async (index) => {
    const confirmed = await showConfirm({
      title: 'Xóa trường',
      message: 'Bạn có chắc muốn xóa trường này?',
      type: 'warning',
      confirmText: 'Xóa'
    });

    if (confirmed) {
      const updated = fields.filter((_, i) => i !== index);
      setFields(updated);
      onChange(updated);
    }
  };

  const ICON_OPTIONS = ['Info', 'Star', 'Award', 'Zap', 'Heart', 'Globe', 'Phone', 'Mail'];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Trường tùy chỉnh
        </label>
        <button
          type="button"
          onClick={() => setIsAdding(!isAdding)}
          className="text-sm text-[#7CB342] hover:text-[#689F38] flex items-center gap-1"
        >
          <Icon.Plus size={16} />
          Thêm
        </button>
      </div>

      {/* Existing Fields */}
      <div className="space-y-2">
        {fields.map((field, index) => {
          const FieldIcon = Icon[field.icon] || Icon.Info;
          return (
            <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
              <FieldIcon size={16} className="text-gray-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{field.label}</p>
                <p className="text-xs text-gray-600">{field.value}</p>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
              >
                <Icon.Trash size={16} className="text-red-600" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Add New Field */}
      {isAdding && (
        <div className="p-3 bg-blue-50 rounded-lg space-y-2">
          <input
            type="text"
            value={newField.label}
            onChange={(e) => setNewField({ ...newField, label: e.target.value })}
            placeholder="Tên trường (vd: Zalo, Viber...)"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          
          <input
            type="text"
            value={newField.value}
            onChange={(e) => setNewField({ ...newField, value: e.target.value })}
            placeholder="Giá trị"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />

          <select
            value={newField.icon}
            onChange={(e) => setNewField({ ...newField, icon: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            {ICON_OPTIONS.map(icon => (
              <option key={icon} value={icon}>{icon}</option>
            ))}
          </select>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleAdd}
              className="flex-1 px-3 py-2 bg-[#7CB342] text-white rounded-lg text-sm hover:bg-[#689F38] transition-colors"
            >
              Thêm
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setNewField({ label: '', value: '', icon: 'Info' });
              }}
              className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300 transition-colors"
            >
              Hủy
            </button>
          </div>
        </div>
      )}

      {fields.length === 0 && !isAdding && (
        <p className="text-sm text-gray-500 text-center py-3">
          Chưa có trường tùy chỉnh
        </p>
      )}
    </div>
  );
}