/**
 * DesignDocFormModal - Form tạo/sửa Design Document
 */
import React, { useState, useEffect } from 'react';
import EnhancedModal from '@/components/EnhancedModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/AnimatedIcon.jsx';
import { CATEGORY_CONFIG, STATUS_CONFIG } from '@/components/hooks/useDesignDocs';
import ReactMarkdown from 'react-markdown';
import { X } from 'lucide-react';

const DEFAULT_DOC = {
  slug: '',
  name: '',
  category: 'rules',
  title: '',
  description: '',
  content: '',
  version: '1.0.0',
  status: 'draft',
  priority: 0,
  tags: []
};

export default function DesignDocFormModal({ isOpen, onClose, doc, onSave, isSaving }) {
  const [formData, setFormData] = useState(DEFAULT_DOC);
  const [activeTab, setActiveTab] = useState('edit');
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (doc) {
      setFormData({
        ...DEFAULT_DOC,
        ...doc,
        tags: doc.tags || []
      });
    } else {
      setFormData(DEFAULT_DOC);
    }
  }, [doc, isOpen]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleSubmit = async () => {
    await onSave(formData);
    onClose();
  };

  const generateSlug = () => {
    const slug = formData.title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 50);
    handleChange('slug', slug);
    handleChange('name', `${slug.toUpperCase()}.md`);
  };

  return (
    <EnhancedModal
      isOpen={isOpen}
      onClose={onClose}
      title={doc ? `Chỉnh sửa: ${doc.title}` : 'Tạo Document Mới'}
      maxWidth="6xl"
    >
      <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
        {/* Basic Info */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Tiêu đề *</Label>
            <Input
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="VD: UI/UX Design Rules"
              onBlur={() => !formData.slug && generateSlug()}
            />
          </div>
          <div className="space-y-2">
            <Label>Slug</Label>
            <Input
              value={formData.slug}
              onChange={(e) => handleChange('slug', e.target.value)}
              placeholder="ui_ux_rules"
              className="font-mono"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Tên File</Label>
            <Input
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="UI_UX_RULES.md"
              className="font-mono"
            />
          </div>
          <div className="space-y-2">
            <Label>Danh mục</Label>
            <Select value={formData.category} onValueChange={(v) => handleChange('category', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
                  <SelectItem key={key} value={key}>
                    {cfg.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Trạng thái</Label>
            <Select value={formData.status} onValueChange={(v) => handleChange('status', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                  <SelectItem key={key} value={key}>
                    {cfg.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Version</Label>
            <Input
              value={formData.version}
              onChange={(e) => handleChange('version', e.target.value)}
              placeholder="1.0.0"
            />
          </div>
          <div className="space-y-2">
            <Label>Priority (số nhỏ lên trước)</Label>
            <Input
              type="number"
              value={formData.priority}
              onChange={(e) => handleChange('priority', parseInt(e.target.value) || 0)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Mô tả ngắn</Label>
          <Textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Tóm tắt nội dung document..."
            rows={2}
          />
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <Label>Tags</Label>
          <div className="flex gap-2">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="Thêm tag..."
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
            />
            <Button type="button" variant="outline" onClick={handleAddTag}>
              <Icon.Plus size={16} />
            </Button>
          </div>
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <button onClick={() => handleRemoveTag(tag)} className="ml-1 hover:text-red-500">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Content Editor */}
        <div className="space-y-2">
          <Label>Nội dung (Markdown)</Label>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="edit">
                <Icon.Edit size={14} className="mr-1" /> Soạn thảo
              </TabsTrigger>
              <TabsTrigger value="preview">
                <Icon.Eye size={14} className="mr-1" /> Xem trước
              </TabsTrigger>
            </TabsList>
            <TabsContent value="edit" className="mt-2">
              <Textarea
                value={formData.content}
                onChange={(e) => handleChange('content', e.target.value)}
                placeholder="# Tiêu đề&#10;&#10;## Section 1&#10;Nội dung..."
                rows={20}
                className="font-mono text-sm"
              />
            </TabsContent>
            <TabsContent value="preview" className="mt-2">
              <div className="border rounded-lg p-4 min-h-[400px] max-h-[500px] overflow-y-auto prose prose-sm max-w-none">
                <ReactMarkdown>{formData.content || '*Chưa có nội dung*'}</ReactMarkdown>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!formData.title || !formData.content || isSaving}
            className="bg-violet-600 hover:bg-violet-700"
          >
            {isSaving ? (
              <>
                <Icon.Spinner size={16} className="mr-2" /> Đang lưu...
              </>
            ) : (
              <>
                <Icon.Save size={16} className="mr-2" /> {doc ? 'Cập nhật' : 'Tạo mới'}
              </>
            )}
          </Button>
        </div>
      </div>
    </EnhancedModal>
  );
}