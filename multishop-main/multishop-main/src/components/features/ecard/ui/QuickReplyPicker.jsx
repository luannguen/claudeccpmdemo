/**
 * QuickReplyPicker - Pick and use quick reply templates
 * UI Layer - Presentation only
 * 
 * @module features/ecard/ui
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@/components/ui/AnimatedIcon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CATEGORY_LABELS = {
  all: 'Tất cả',
  greeting: 'Chào hỏi',
  thanks: 'Cảm ơn',
  follow_up: 'Theo dõi',
  birthday: 'Sinh nhật',
  custom: 'Tùy chỉnh'
};

const CATEGORY_ICONS = {
  greeting: 'MessageCircle',
  thanks: 'Heart',
  follow_up: 'Clock',
  birthday: 'Gift',
  custom: 'Edit'
};

export default function QuickReplyPicker({
  templates = [],
  onSelect,
  onCreate,
  categoryCounts = {},
  isCreating = false
}) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ title: '', content: '', category: 'custom' });

  const filteredTemplates = category === 'all' 
    ? templates 
    : templates.filter(t => t.category === category);

  const handleSelect = (template) => {
    onSelect(template);
    setOpen(false);
  };

  const handleCreate = async () => {
    if (!newTemplate.title || !newTemplate.content) return;
    await onCreate(newTemplate);
    setNewTemplate({ title: '', content: '', category: 'custom' });
    setShowCreateModal(false);
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-1.5 text-gray-500 hover:text-gray-700">
            <Icon.Zap size={16} />
            Mẫu nhanh
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0 z-[200]" align="start">
          {/* Category tabs */}
          <div className="flex gap-1 p-2 border-b overflow-x-auto">
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setCategory(key)}
                className={`px-2 py-1 text-xs rounded-lg whitespace-nowrap transition-colors ${
                  category === key 
                    ? 'bg-[#7CB342]/10 text-[#558B2F] font-medium' 
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {label}
                {key !== 'all' && categoryCounts[key] > 0 && (
                  <span className="ml-1 text-gray-400">({categoryCounts[key]})</span>
                )}
              </button>
            ))}
          </div>

          {/* Templates list */}
          <div className="max-h-60 overflow-y-auto p-2">
            <AnimatePresence mode="popLayout">
              {filteredTemplates.length === 0 ? (
                <div className="text-center py-6 text-gray-400 text-sm">
                  Chưa có mẫu nào
                </div>
              ) : (
                filteredTemplates.map((template, idx) => {
                  const CategoryIcon = Icon[CATEGORY_ICONS[template.category]] || Icon.MessageCircle;
                  
                  return (
                    <motion.button
                      key={template.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ delay: idx * 0.03 }}
                      onClick={() => handleSelect(template)}
                      className="w-full text-left p-2 rounded-lg hover:bg-gray-50 transition-colors group"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <CategoryIcon size={14} className="text-gray-400" />
                        <span className="font-medium text-sm text-gray-800 group-hover:text-[#558B2F]">
                          {template.title}
                        </span>
                        {template.is_system && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">
                            Hệ thống
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2">
                        {template.content}
                      </p>
                    </motion.button>
                  );
                })
              )}
            </AnimatePresence>
          </div>

          {/* Create new */}
          <div className="border-t p-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 text-[#558B2F]"
              onClick={() => {
                setOpen(false);
                setShowCreateModal(true);
              }}
            >
              <Icon.Plus size={16} />
              Tạo mẫu mới
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Create Template Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tạo mẫu trả lời nhanh</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Tên mẫu</label>
              <Input
                value={newTemplate.title}
                onChange={(e) => setNewTemplate({ ...newTemplate, title: e.target.value })}
                placeholder="VD: Cảm ơn khách hàng"
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Danh mục</label>
              <Select
                value={newTemplate.category}
                onValueChange={(v) => setNewTemplate({ ...newTemplate, category: v })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="greeting">Chào hỏi</SelectItem>
                  <SelectItem value="thanks">Cảm ơn</SelectItem>
                  <SelectItem value="follow_up">Theo dõi</SelectItem>
                  <SelectItem value="birthday">Sinh nhật</SelectItem>
                  <SelectItem value="custom">Tùy chỉnh</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Nội dung</label>
              <Textarea
                value={newTemplate.content}
                onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                placeholder="Nhập nội dung mẫu..."
                className="mt-1"
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Hủy
            </Button>
            <Button
              onClick={handleCreate}
              disabled={isCreating || !newTemplate.title || !newTemplate.content}
              className="bg-[#7CB342] hover:bg-[#689F38] text-white"
            >
              {isCreating ? <Icon.Spinner size={16} /> : 'Tạo mẫu'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}