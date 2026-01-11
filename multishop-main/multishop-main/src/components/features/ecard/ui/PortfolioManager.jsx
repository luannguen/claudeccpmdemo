/**
 * PortfolioManager - Manage user's portfolios
 * UI Layer - Presentation only
 * 
 * @module features/ecard/ui
 */

import React, { useState } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Icon } from '@/components/ui/AnimatedIcon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useMyPortfolios, usePortfolioStats } from '../hooks/usePortfolio';
import { useToast } from '@/components/NotificationToast';
import { useConfirmDialog } from '@/components/hooks/useConfirmDialog';
import PortfolioCard, { CATEGORY_CONFIG } from './PortfolioCard';

const INITIAL_FORM = {
  title: '',
  short_description: '',
  description: '',
  cover_image: '',
  category: 'project',
  tags: [],
  skills: [],
  external_link: '',
  client_name: '',
  status: 'draft'
};

export default function PortfolioManager({ profileId }) {
  const { 
    portfolios, 
    isLoading, 
    create, 
    update, 
    delete: deleteItem,
    reorder,
    toggleFeatured,
    isCreating,
    isUpdating,
    isDeleting
  } = useMyPortfolios();
  
  const { data: stats } = usePortfolioStats(profileId);
  const { addToast } = useToast();
  const { showConfirm, ConfirmDialogComponent } = useConfirmDialog();
  
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [tagInput, setTagInput] = useState('');
  const [skillInput, setSkillInput] = useState('');

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({ ...INITIAL_FORM, profile_id: profileId });
    setShowFormModal(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title || '',
      short_description: item.short_description || '',
      description: item.description || '',
      cover_image: item.cover_image || '',
      category: item.category || 'project',
      tags: item.tags || [],
      skills: item.skills || [],
      external_link: item.external_link || '',
      client_name: item.client_name || '',
      status: item.status || 'draft',
      profile_id: item.profile_id
    });
    setShowFormModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.title) {
      addToast('Vui lòng nhập tiêu đề', 'warning');
      return;
    }

    try {
      if (editingItem) {
        await update(editingItem.id, formData);
        addToast('Đã cập nhật portfolio', 'success');
      } else {
        await create(formData);
        addToast('Đã tạo portfolio mới', 'success');
      }
      setShowFormModal(false);
      setFormData(INITIAL_FORM);
      setEditingItem(null);
    } catch (err) {
      addToast('Có lỗi xảy ra', 'error');
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await showConfirm({
      title: 'Xóa portfolio',
      message: 'Bạn có chắc muốn xóa portfolio này?',
      type: 'danger',
      confirmText: 'Xóa'
    });

    if (confirmed) {
      try {
        await deleteItem(id);
        addToast('Đã xóa portfolio', 'success');
      } catch (err) {
        addToast('Không thể xóa', 'error');
      }
    }
  };

  const handleToggleFeatured = async (id) => {
    try {
      await toggleFeatured(id);
      addToast('Đã cập nhật trạng thái nổi bật', 'success');
    } catch (err) {
      addToast('Không thể cập nhật', 'error');
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const removeTag = (tag) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData({ ...formData, skills: [...formData.skills, skillInput.trim()] });
      setSkillInput('');
    }
  };

  const removeSkill = (skill) => {
    setFormData({ ...formData, skills: formData.skills.filter(s => s !== skill) });
  };

  return (
    <div className="space-y-6">
      {ConfirmDialogComponent}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard icon="Folder" label="Tổng" value={stats.total} color="blue" />
          <StatsCard icon="Eye" label="Đã xuất bản" value={stats.published} color="green" />
          <StatsCard icon="Star" label="Nổi bật" value={stats.featured} color="amber" />
          <StatsCard icon="Heart" label="Lượt thích" value={stats.totalLikes} color="pink" />
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Portfolio của tôi</h3>
        <Button 
          onClick={handleOpenCreate}
          className="bg-[#7CB342] hover:bg-[#689F38] text-white"
        >
          <Icon.Plus size={16} className="mr-2" />
          Thêm portfolio
        </Button>
      </div>

      {/* Portfolio Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Icon.Spinner size={32} className="text-[#7CB342]" />
        </div>
      ) : portfolios.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border">
          <Icon.Folder size={48} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">Chưa có portfolio nào</p>
          <Button onClick={handleOpenCreate}>
            <Icon.Plus size={16} className="mr-2" />
            Tạo portfolio đầu tiên
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolios.map((item, idx) => (
            <PortfolioCard
              key={item.id}
              portfolio={item}
              index={idx}
              showActions
              onEdit={handleOpenEdit}
              onDelete={handleDelete}
              onToggleFeatured={handleToggleFeatured}
            />
          ))}
        </div>
      )}

      {/* Form Modal */}
      <Dialog open={showFormModal} onOpenChange={setShowFormModal}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Chỉnh sửa portfolio' : 'Thêm portfolio mới'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label>Tiêu đề *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Tên dự án/sản phẩm"
              />
            </div>

            <div>
              <Label>Mô tả ngắn</Label>
              <Input
                value={formData.short_description}
                onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                placeholder="1-2 câu mô tả"
              />
            </div>

            <div>
              <Label>Mô tả chi tiết</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Mô tả đầy đủ về dự án..."
                rows={4}
              />
            </div>

            <div>
              <Label>Ảnh bìa (URL)</Label>
              <Input
                value={formData.cover_image}
                onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Danh mục</Label>
                <Select 
                  value={formData.category}
                  onValueChange={(v) => setFormData({ ...formData, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
                      <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Trạng thái</Label>
                <Select 
                  value={formData.status}
                  onValueChange={(v) => setFormData({ ...formData, status: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Nháp</SelectItem>
                    <SelectItem value="published">Xuất bản</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Tags</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="Nhập tag"
                  className="flex-1"
                />
                <Button type="button" variant="outline" onClick={addTag}>Thêm</Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {formData.tags.map((tag, idx) => (
                  <Badge key={idx} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                    {tag} ×
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label>Kỹ năng/Công nghệ</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  placeholder="React, Node.js..."
                  className="flex-1"
                />
                <Button type="button" variant="outline" onClick={addSkill}>Thêm</Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {formData.skills.map((skill, idx) => (
                  <Badge key={idx} variant="outline" className="cursor-pointer" onClick={() => removeSkill(skill)}>
                    {skill} ×
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label>Link external</Label>
              <Input
                value={formData.external_link}
                onChange={(e) => setFormData({ ...formData, external_link: e.target.value })}
                placeholder="https://github.com/..."
              />
            </div>

            <div>
              <Label>Khách hàng (optional)</Label>
              <Input
                value={formData.client_name}
                onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                placeholder="Tên công ty/cá nhân"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFormModal(false)}>
              Hủy
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isCreating || isUpdating}
              className="bg-[#7CB342] hover:bg-[#689F38] text-white"
            >
              {(isCreating || isUpdating) ? <Icon.Spinner size={16} /> : (editingItem ? 'Lưu' : 'Tạo')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatsCard({ icon, label, value, color }) {
  const IconComponent = Icon[icon];
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    pink: 'bg-pink-50 text-pink-600'
  };
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className={`inline-flex p-2 rounded-lg ${colorClasses[color]} mb-2`}>
        {IconComponent && <IconComponent size={20} />}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}

export { StatsCard };