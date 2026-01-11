/**
 * RoleFormModal - Modal tạo/sửa role
 */

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const ROLE_COLORS = [
  '#DC2626', '#EA580C', '#D97706', '#CA8A04',
  '#65A30D', '#16A34A', '#059669', '#0D9488',
  '#0891B2', '#0284C7', '#2563EB', '#4F46E5',
  '#7C3AED', '#9333EA', '#C026D3', '#DB2777',
  '#6B7280'
];

export default function RoleFormModal({ role, onClose, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState({
    name: '',
    display_name: '',
    description: '',
    level: 50,
    color: '#7C3AED'
  });

  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name || '',
        display_name: role.display_name || '',
        description: role.description || '',
        level: role.level || 50,
        color: role.color || '#7C3AED'
      });
    }
  }, [role]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[120] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${formData.color}20` }}
            >
              <Shield className="w-5 h-5" style={{ color: formData.color }} />
            </div>
            <h3 className="text-xl font-serif font-bold text-[#0F0F0F]">
              {role ? 'Sửa Role' : 'Tạo Role Mới'}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mã Role (không dấu, viết thường) *
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value.toLowerCase().replace(/\s/g, '_')})}
              placeholder="vd: content_editor"
              required
              disabled={role?.is_system}
            />
            {role?.is_system && (
              <p className="text-xs text-amber-600 mt-1">Không thể thay đổi mã role hệ thống</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên Hiển Thị *
            </label>
            <Input
              value={formData.display_name}
              onChange={(e) => setFormData({...formData, display_name: e.target.value})}
              placeholder="vd: Biên Tập Viên"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô Tả
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Mô tả ngắn về role này..."
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cấp Độ (Level)
            </label>
            <Input
              type="number"
              min={1}
              max={99}
              value={formData.level}
              onChange={(e) => setFormData({...formData, level: parseInt(e.target.value) || 50})}
            />
            <p className="text-xs text-gray-500 mt-1">
              Số cao = quyền cao hơn (Admin=100, User=10)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Màu Hiển Thị
            </label>
            <div className="flex flex-wrap gap-2">
              {ROLE_COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({...formData, color})}
                  className={`w-8 h-8 rounded-lg transition-transform ${
                    formData.color === color ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Hủy
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1 bg-[#7CB342] hover:bg-[#689F38]"
            >
              {isSubmitting ? 'Đang lưu...' : (role ? 'Cập Nhật' : 'Tạo Role')}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}