/**
 * InviteContributorModal - Modal to invite contributors to a book
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@/components/ui/AnimatedIcon';
import { ROLE_LABELS, getRoleBadge, getPermissionLabel, getDefaultPermissions } from '../domain/contributorRules';

export default function InviteContributorModal({
  isOpen,
  onClose,
  onInvite,
  invitableRoles = ['contributor', 'viewer'],
  isLoading = false
}) {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: 'contributor',
    note: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const result = await onInvite(formData);
    if (result) {
      setFormData({ email: '', name: '', role: 'contributor', note: '' });
      onClose();
    }
  };

  const selectedRolePermissions = getDefaultPermissions(formData.role);
  const roleBadge = getRoleBadge(formData.role);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={e => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Icon.UserPlus size={24} className="text-[#7CB342]" />
              Mời Cộng Tác Viên
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <Icon.X size={20} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="email@example.com"
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                  errors.email 
                    ? 'border-red-300 focus:border-red-500' 
                    : 'border-gray-200 focus:border-[#7CB342]'
                }`}
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email}</p>
              )}
            </div>

            {/* Name (optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên hiển thị
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Tên người được mời"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342] transition-colors"
              />
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vai trò
              </label>
              <div className="space-y-2">
                {invitableRoles.map(role => {
                  const badge = getRoleBadge(role);
                  const isSelected = formData.role === role;
                  
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => handleChange('role', role)}
                      className={`w-full p-3 rounded-xl border-2 text-left transition-all ${
                        isSelected 
                          ? 'border-[#7CB342] bg-[#7CB342]/5' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{badge.icon}</span>
                        <span className="font-medium">{ROLE_LABELS[role]}</span>
                        {isSelected && (
                          <Icon.CheckCircle size={16} className="text-[#7CB342] ml-auto" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Permissions Preview */}
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Quyền hạn của {ROLE_LABELS[formData.role]}:
              </p>
              <div className="flex flex-wrap gap-1">
                {Object.entries(selectedRolePermissions).map(([perm, enabled]) => (
                  <span
                    key={perm}
                    className={`text-xs px-2 py-1 rounded-full ${
                      enabled 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-200 text-gray-400 line-through'
                    }`}
                  >
                    {getPermissionLabel(perm)}
                  </span>
                ))}
              </div>
            </div>

            {/* Note */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lời nhắn (tùy chọn)
              </label>
              <textarea
                value={formData.note}
                onChange={(e) => handleChange('note', e.target.value)}
                placeholder="Gửi lời nhắn kèm lời mời..."
                rows={2}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342] transition-colors resize-none"
              />
            </div>
          </form>

          {/* Footer */}
          <div className="p-4 border-t border-gray-100 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border-2 border-gray-200 rounded-xl font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex-1 py-3 bg-gradient-to-r from-[#7CB342] to-[#558B2F] text-white rounded-xl font-medium hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Icon.Spinner size={20} />
                  Đang gửi...
                </>
              ) : (
                <>
                  <Icon.Send size={20} />
                  Gửi Lời Mời
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}