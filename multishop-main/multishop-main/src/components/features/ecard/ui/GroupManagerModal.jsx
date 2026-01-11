/**
 * GroupManagerModal - CRUD for connection groups
 * UI Layer - Uses EnhancedModal
 * 
 * @module features/ecard/ui
 */

import React, { useState } from 'react';
import EnhancedModal from '@/components/EnhancedModal';
import { Icon } from '@/components/ui/AnimatedIcon';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useConnectionGroups } from '../hooks/useConnectionGroups';
import { useConfirmDialog } from '@/components/hooks/useConfirmDialog';
import { motion, AnimatePresence } from 'framer-motion';

const PRESET_COLORS = [
  '#7CB342', '#4CAF50', '#009688', '#00BCD4', '#2196F3',
  '#3F51B5', '#673AB7', '#9C27B0', '#E91E63', '#F44336',
  '#FF5722', '#FF9800', '#FFC107', '#795548'
];

const PRESET_ICONS = [
  'Users', 'Briefcase', 'Home', 'Heart', 'Star',
  'Award', 'Flag', 'Bookmark', 'Tag', 'Zap'
];

export default function GroupManagerModal({ isOpen, onClose }) {
  const { groups, createGroup, updateGroup, deleteGroup, isLoading, isMutating } = useConnectionGroups();
  const { showConfirm } = useConfirmDialog();
  
  const [editingGroup, setEditingGroup] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    color: '#7CB342',
    icon: 'Users',
    description: ''
  });

  const resetForm = () => {
    setFormData({ name: '', color: '#7CB342', icon: 'Users', description: '' });
    setEditingGroup(null);
    setIsCreating(false);
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditingGroup(null);
    setFormData({ name: '', color: '#7CB342', icon: 'Users', description: '' });
  };

  const handleEdit = (group) => {
    setEditingGroup(group);
    setIsCreating(false);
    setFormData({
      name: group.name,
      color: group.color || '#7CB342',
      icon: group.icon || 'Users',
      description: group.description || ''
    });
  };

  const handleDelete = async (group) => {
    if (group.is_default) return;
    
    const confirmed = await showConfirm({
      title: 'Xóa nhóm',
      message: `Xóa nhóm "${group.name}"? Các liên hệ trong nhóm sẽ không bị xóa.`,
      type: 'danger',
      confirmText: 'Xóa'
    });
    
    if (confirmed) {
      deleteGroup(group.id);
    }
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) return;
    
    if (editingGroup) {
      updateGroup(editingGroup.id, formData);
    } else {
      createGroup(formData.name, formData.color, formData.icon, formData.description);
    }
    resetForm();
  };

  return (
    <EnhancedModal
      isOpen={isOpen}
      onClose={onClose}
      title="Quản lý nhóm liên hệ"
      maxWidth="lg"
    >
      <div className="p-6">
        {/* Create/Edit Form */}
        {(isCreating || editingGroup) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-50 rounded-xl p-4 mb-6"
          >
            <h4 className="font-medium text-gray-900 mb-4">
              {editingGroup ? 'Sửa nhóm' : 'Tạo nhóm mới'}
            </h4>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Tên nhóm *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="VD: Đồng nghiệp, Khách hàng..."
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-2 block">Màu sắc</label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-7 h-7 rounded-full transition-transform ${
                        formData.color === color ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-2 block">Icon</label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_ICONS.map(iconName => {
                    const IconComp = Icon[iconName];
                    return (
                      <button
                        key={iconName}
                        onClick={() => setFormData({ ...formData, icon: iconName })}
                        className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                          formData.icon === iconName
                            ? 'bg-gray-900 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <IconComp size={18} />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-1 block">Mô tả (tùy chọn)</label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Mô tả ngắn về nhóm..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={resetForm}>
                  Hủy
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!formData.name.trim() || isMutating}
                  className="bg-[#7CB342] hover:bg-[#689F38]"
                >
                  {isMutating ? <Icon.Spinner size={16} /> : editingGroup ? 'Lưu' : 'Tạo nhóm'}
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Groups List */}
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-gray-900">Danh sách nhóm ({groups.length})</h4>
          {!isCreating && !editingGroup && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCreate}
              className="gap-1.5"
            >
              <Icon.Plus size={16} />
              Tạo nhóm
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Icon.Spinner size={32} />
          </div>
        ) : groups.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Icon.Users size={48} className="mx-auto mb-2 text-gray-300" />
            <p>Chưa có nhóm nào</p>
            <p className="text-sm">Tạo nhóm để phân loại liên hệ</p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {groups.map((group, idx) => {
                const IconComp = Icon[group.icon] || Icon.Users;
                return (
                  <motion.div
                    key={group.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center justify-between p-3 bg-white border rounded-xl hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                        style={{ backgroundColor: group.color }}
                      >
                        <IconComp size={20} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{group.name}</p>
                        <p className="text-xs text-gray-500">
                          {group.member_count || 0} liên hệ
                          {group.description && ` • ${group.description}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(group)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Icon.Edit size={16} />
                      </button>
                      {!group.is_default && (
                        <button
                          onClick={() => handleDelete(group)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Icon.Trash size={16} />
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </EnhancedModal>
  );
}