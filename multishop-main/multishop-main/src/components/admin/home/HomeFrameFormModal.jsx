/**
 * HomeFrameFormModal - Form chỉnh sửa một frame
 */

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Icon } from "@/components/ui/AnimatedIcon";
import EnhancedModal from "@/components/EnhancedModal";
import FrameBackgroundUploader from "./FrameBackgroundUploader";
import CTAButtonEditor from "./CTAButtonEditor";

export default function HomeFrameFormModal({ frame, isCreateMode = false, onSave, onClose }) {
  const [formData, setFormData] = useState({
    title: frame?.title || '',
    subtitle: frame?.subtitle || '',
    background_type: frame?.background_type || 'image',
    background_url: frame?.background_url || '',
    background_url_mobile: frame?.background_url_mobile || '',
    content: frame?.content || {},
    cta_primary: frame?.cta_primary || { text: '', link: '', color: '#7CB342' },
    cta_secondary: frame?.cta_secondary || { text: '', link: '' },
    desktop_config: frame?.desktop_config || {},
    mobile_config: frame?.mobile_config || {},
    is_active: frame?.is_active ?? true,
  });

  const [isSaving, setIsSaving] = useState(false);
  
  // Determine frame order for title
  const frameOrder = isCreateMode ? 'mới' : frame?.order;

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value }
    }));
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      await onSave(formData);
    } finally {
      setIsSaving(false);
    }
  };

  // State để control active tab - tránh re-render gây đóng modal
  const [activeTab, setActiveTab] = useState("content");

  return (
    <EnhancedModal
      isOpen={true}
      onClose={onClose}
      title={isCreateMode ? 'Tạo Frame Mới' : `Chỉnh sửa Frame ${frameOrder}`}
      maxWidth="4xl"
    >
      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="content">Nội dung</TabsTrigger>
            <TabsTrigger value="background">Background</TabsTrigger>
            <TabsTrigger value="cta">CTA</TabsTrigger>
            <TabsTrigger value="responsive">Responsive</TabsTrigger>
          </TabsList>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-4 p-6">
          {/* Visibility Toggle */}
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3">
              <Icon.Eye size={20} className="text-blue-600" />
              <div>
                <Label className="font-medium text-gray-900">Hiển thị frame trên trang chủ</Label>
                <p className="text-xs text-gray-600 mt-1">
                  Bật để frame này được hiển thị cho người dùng
                </p>
              </div>
            </div>
            <Switch
              checked={formData.is_active}
              onCheckedChange={(v) => handleChange('is_active', v)}
            />
          </div>
          
          <div>
            <Label>Tiêu đề</Label>
            <Input
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Tiêu đề chính của frame"
            />
          </div>
          <div>
            <Label>Mô tả ngắn</Label>
            <Textarea
              value={formData.subtitle}
              onChange={(e) => handleChange('subtitle', e.target.value)}
              placeholder="Mô tả ngắn gọn"
              rows={3}
            />
          </div>
          
          {/* Frame-specific content editors */}
          <div className="border-t pt-4 mt-4">
            <h4 className="font-medium mb-3 text-gray-700">Nội dung chi tiết</h4>
            
            {/* Trust Badges */}
            <TrustBadgesEditor
              badges={formData.content?.trust_badges || []}
              onChange={(badges) => handleChange('content', { ...formData.content, trust_badges: badges })}
            />
            
            {/* Process Items */}
            <div className="mt-4">
              <ProcessItemsEditor
                items={formData.content?.process_items || []}
                onChange={(items) => handleChange('content', { ...formData.content, process_items: items })}
              />
            </div>
            
            {/* Stats */}
            <div className="mt-4">
              <StatsEditor
                stats={formData.content?.stats || []}
                onChange={(stats) => handleChange('content', { ...formData.content, stats: stats })}
              />
            </div>
            
            {/* Exit Links (for exit frame) */}
            <div className="mt-4">
              <ExitLinksEditor
                links={formData.content?.exit_links || []}
                onChange={(links) => handleChange('content', { ...formData.content, exit_links: links })}
              />
            </div>
          </div>
        </TabsContent>

        {/* Background Tab */}
        <TabsContent value="background" className="space-y-4 p-6">
          <div>
            <Label>Loại background</Label>
            <Select
              value={formData.background_type}
              onValueChange={(v) => handleChange('background_type', v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="image">Hình ảnh</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="gradient">Gradient</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <FrameBackgroundUploader
            type={formData.background_type}
            desktopUrl={formData.background_url}
            mobileUrl={formData.background_url_mobile}
            onDesktopChange={(url) => handleChange('background_url', url)}
            onMobileChange={(url) => handleChange('background_url_mobile', url)}
          />
        </TabsContent>

        {/* CTA Tab */}
        <TabsContent value="cta" className="space-y-6 p-6">
          <CTAButtonEditor
            label="CTA Chính"
            cta={formData.cta_primary}
            onChange={(newCta) => handleChange('cta_primary', newCta)}
          />

          <CTAButtonEditor
            label="CTA Phụ (Desktop only)"
            cta={formData.cta_secondary}
            onChange={(newCta) => handleChange('cta_secondary', newCta)}
          />
        </TabsContent>

        {/* Responsive Tab */}
        <TabsContent value="responsive" className="space-y-6 p-6">
          <div className="p-4 bg-blue-50 rounded-lg space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Icon.Presentation size={18} />
              Desktop Config
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <Label>Parallax effect</Label>
                <Switch
                  checked={formData.desktop_config?.parallax_enabled ?? true}
                  onCheckedChange={(v) => handleNestedChange('desktop_config', 'parallax_enabled', v)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Video enabled</Label>
                <Switch
                  checked={formData.desktop_config?.video_enabled ?? true}
                  onCheckedChange={(v) => handleNestedChange('desktop_config', 'video_enabled', v)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Counter animation</Label>
                <Switch
                  checked={formData.desktop_config?.counter_animation ?? true}
                  onCheckedChange={(v) => handleNestedChange('desktop_config', 'counter_animation', v)}
                />
              </div>
            </div>
          </div>

          <div className="p-4 bg-green-50 rounded-lg space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Icon.Phone size={18} />
              Mobile Config
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <Label>Swipe hint</Label>
                <Switch
                  checked={formData.mobile_config?.show_swipe_hint ?? true}
                  onCheckedChange={(v) => handleNestedChange('mobile_config', 'show_swipe_hint', v)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Simplified text</Label>
                <Switch
                  checked={formData.mobile_config?.simplified_text ?? false}
                  onCheckedChange={(v) => handleNestedChange('mobile_config', 'simplified_text', v)}
                />
              </div>
            </div>
          </div>
        </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3 px-6 pb-6 pt-4 border-t">
        <Button variant="outline" onClick={onClose}>
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSaving}
          className="bg-[#7CB342] hover:bg-[#689F38]"
        >
          {isSaving ? <Icon.Spinner size={18} className="mr-2" /> : null}
          {isCreateMode ? 'Tạo Frame' : 'Lưu thay đổi'}
        </Button>
      </div>
    </EnhancedModal>
  );
}

// Exit Links Editor (for Frame 4 - Exit/Contact)
function ExitLinksEditor({ links, onChange }) {
  const addLink = () => {
    onChange([...links, { text: '', link: '', icon: 'ArrowRight' }]);
  };

  const updateLink = (index, field, value) => {
    const updated = [...links];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeLink = (index) => {
    onChange(links.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Exit Links (Frame Exit/Contact)</Label>
        <Button size="sm" variant="outline" onClick={addLink}>
          <Icon.Plus size={14} className="mr-1" /> Thêm
        </Button>
      </div>
      {links.map((link, index) => (
        <div key={index} className="flex gap-2 items-center p-2 bg-gray-50 rounded">
          <Input
            value={link.icon}
            onChange={(e) => updateLink(index, 'icon', e.target.value)}
            placeholder="Icon"
            className="w-28"
          />
          <Input
            value={link.text}
            onChange={(e) => updateLink(index, 'text', e.target.value)}
            placeholder="Text"
            className="flex-1"
          />
          <Input
            value={link.link}
            onChange={(e) => updateLink(index, 'link', e.target.value)}
            placeholder="/Services"
            className="w-32"
          />
          <Button size="icon" variant="ghost" onClick={() => removeLink(index)}>
            <Icon.X size={16} />
          </Button>
        </div>
      ))}
      {links.length === 0 && (
        <p className="text-sm text-gray-500 italic">Chưa có link nào</p>
      )}
    </div>
  );
}

// Trust Badges Editor
function TrustBadgesEditor({ badges, onChange }) {
  const addBadge = () => {
    onChange([...badges, { icon: 'CheckCircle', text: '', color: '#7CB342' }]);
  };

  const updateBadge = (index, field, value) => {
    const updated = [...badges];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeBadge = (index) => {
    onChange(badges.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Trust Badges</Label>
        <Button size="sm" variant="outline" onClick={addBadge}>
          <Icon.Plus size={14} className="mr-1" /> Thêm
        </Button>
      </div>
      {badges.map((badge, index) => (
        <div key={index} className="flex gap-2 items-center p-2 bg-gray-50 rounded">
          <Input
            value={badge.icon}
            onChange={(e) => updateBadge(index, 'icon', e.target.value)}
            placeholder="Icon name"
            className="w-32"
          />
          <Input
            value={badge.text}
            onChange={(e) => updateBadge(index, 'text', e.target.value)}
            placeholder="Text"
            className="flex-1"
          />
          <Input
            type="color"
            value={badge.color}
            onChange={(e) => updateBadge(index, 'color', e.target.value)}
            className="w-12 h-9 p-1"
          />
          <Button size="icon" variant="ghost" onClick={() => removeBadge(index)}>
            <Icon.X size={16} />
          </Button>
        </div>
      ))}
    </div>
  );
}

// Process Items Editor
function ProcessItemsEditor({ items, onChange }) {
  const addItem = () => {
    onChange([...items, { icon: 'Leaf', title: '', description: '', color: '#7CB342' }]);
  };

  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeItem = (index) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Process Items</Label>
        <Button size="sm" variant="outline" onClick={addItem}>
          <Icon.Plus size={14} className="mr-1" /> Thêm
        </Button>
      </div>
      {items.map((item, index) => (
        <div key={index} className="p-3 bg-gray-50 rounded space-y-2">
          <div className="flex gap-2">
            <Input
              value={item.icon}
              onChange={(e) => updateItem(index, 'icon', e.target.value)}
              placeholder="Icon"
              className="w-24"
            />
            <Input
              value={item.title}
              onChange={(e) => updateItem(index, 'title', e.target.value)}
              placeholder="Tiêu đề"
              className="flex-1"
            />
            <Button size="icon" variant="ghost" onClick={() => removeItem(index)}>
              <Icon.X size={16} />
            </Button>
          </div>
          <Textarea
            value={item.description}
            onChange={(e) => updateItem(index, 'description', e.target.value)}
            placeholder="Mô tả"
            rows={2}
          />
        </div>
      ))}
    </div>
  );
}

// Stats Editor
function StatsEditor({ stats, onChange }) {
  const addStat = () => {
    onChange([...stats, { icon: 'Star', value: 0, suffix: '', label: '' }]);
  };

  const updateStat = (index, field, value) => {
    const updated = [...stats];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeStat = (index) => {
    onChange(stats.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Statistics</Label>
        <Button size="sm" variant="outline" onClick={addStat}>
          <Icon.Plus size={14} className="mr-1" /> Thêm
        </Button>
      </div>
      {stats.map((stat, index) => (
        <div key={index} className="flex gap-2 items-center p-2 bg-gray-50 rounded">
          <Input
            value={stat.icon}
            onChange={(e) => updateStat(index, 'icon', e.target.value)}
            placeholder="Icon"
            className="w-24"
          />
          <Input
            type="number"
            value={stat.value}
            onChange={(e) => updateStat(index, 'value', parseInt(e.target.value) || 0)}
            placeholder="Giá trị"
            className="w-24"
          />
          <Input
            value={stat.suffix}
            onChange={(e) => updateStat(index, 'suffix', e.target.value)}
            placeholder="+"
            className="w-16"
          />
          <Input
            value={stat.label}
            onChange={(e) => updateStat(index, 'label', e.target.value)}
            placeholder="Label"
            className="flex-1"
          />
          <Button size="icon" variant="ghost" onClick={() => removeStat(index)}>
            <Icon.X size={16} />
          </Button>
        </div>
      ))}
    </div>
  );
}