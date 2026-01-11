/**
 * PartnerManager - Quản lý đối tác thương hiệu
 * 
 * Features:
 * - CRUD partners
 * - Logo management
 * - Partner categories
 * - Order/priority
 */

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Plus, Image, Edit3, Trash2, ExternalLink, GripVertical,
  Loader2, Check, Building2, Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useSiteConfig, useSiteConfigMutation } from "@/components/hooks/useCMSPages";
import { cn } from "@/lib/utils";

// Partner categories
const PARTNER_CATEGORIES = [
  { value: 'certification', label: 'Chứng Nhận' },
  { value: 'distributor', label: 'Nhà Phân Phối' },
  { value: 'supplier', label: 'Nhà Cung Cấp' },
  { value: 'technology', label: 'Công Nghệ' },
  { value: 'media', label: 'Truyền Thông' },
  { value: 'other', label: 'Khác' }
];

// Default partner template
const DEFAULT_PARTNER = {
  id: '',
  name: '',
  logo_url: '',
  website_url: '',
  category: 'other',
  description: '',
  is_featured: false,
  is_active: true,
  order: 0
};

export default function PartnerManager() {
  const { data: config, isLoading } = useSiteConfig();
  const saveMutation = useSiteConfigMutation();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');

  // Get partners from config
  const partners = useMemo(() => {
    return config?.partners_content || [];
  }, [config]);

  // Filter partners
  const filteredPartners = useMemo(() => {
    if (filterCategory === 'all') return partners;
    return partners.filter(p => p.category === filterCategory);
  }, [partners, filterCategory]);

  // Create/Update partner
  const handleSave = async (partnerData) => {
    const newPartners = [...partners];
    
    if (editingPartner) {
      const index = newPartners.findIndex(p => p.id === editingPartner.id);
      if (index >= 0) {
        newPartners[index] = { ...partnerData, id: editingPartner.id };
      }
    } else {
      newPartners.push({
        ...partnerData,
        id: `partner_${Date.now()}`,
        order: newPartners.length
      });
    }
    
    await saveMutation.mutateAsync({ partners_content: newPartners });
    setIsFormOpen(false);
    setEditingPartner(null);
  };

  // Delete partner
  const handleDelete = async (partnerId) => {
    if (!confirm('Bạn có chắc muốn xóa đối tác này?')) return;
    
    const newPartners = partners.filter(p => p.id !== partnerId);
    await saveMutation.mutateAsync({ partners_content: newPartners });
  };

  // Toggle partner active status
  const handleToggleActive = async (partnerId) => {
    const newPartners = partners.map(p => 
      p.id === partnerId ? { ...p, is_active: !p.is_active } : p
    );
    await saveMutation.mutateAsync({ partners_content: newPartners });
  };

  // Toggle featured status
  const handleToggleFeatured = async (partnerId) => {
    const newPartners = partners.map(p => 
      p.id === partnerId ? { ...p, is_featured: !p.is_featured } : p
    );
    await saveMutation.mutateAsync({ partners_content: newPartners });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-[#7CB342] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Đối Tác Thương Hiệu</h2>
          <p className="text-sm text-gray-500">
            {partners.length} đối tác • {partners.filter(p => p.is_featured).length} nổi bật
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Danh mục" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              {PARTNER_CATEGORIES.map(cat => (
                <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            onClick={() => { setEditingPartner(null); setIsFormOpen(true); }}
            className="bg-[#7CB342] hover:bg-[#689F38] gap-2"
          >
            <Plus className="w-4 h-4" />
            Thêm Đối Tác
          </Button>
        </div>
      </div>

      {/* Partners Grid */}
      {filteredPartners.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có đối tác nào</h3>
            <p className="text-gray-500 mb-6">Thêm đối tác đầu tiên để hiển thị trên website</p>
            <Button 
              onClick={() => { setEditingPartner(null); setIsFormOpen(true); }}
              className="bg-[#7CB342] hover:bg-[#689F38]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Thêm Đối Tác
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredPartners.map((partner, index) => {
            const categoryInfo = PARTNER_CATEGORIES.find(c => c.value === partner.category);

            return (
              <motion.div
                key={partner.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.03 }}
              >
                <Card className={cn(
                  "relative group transition-all hover:shadow-lg",
                  !partner.is_active && "opacity-50"
                )}>
                  {/* Featured badge */}
                  {partner.is_featured && (
                    <div className="absolute -top-2 -right-2 z-10">
                      <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center shadow">
                        <Star className="w-3 h-3 text-yellow-800 fill-current" />
                      </div>
                    </div>
                  )}

                  <CardContent className="p-4">
                    {/* Logo */}
                    <div className="h-20 flex items-center justify-center bg-gray-50 rounded-lg mb-3">
                      {partner.logo_url ? (
                        <img 
                          src={partner.logo_url} 
                          alt={partner.name}
                          className="max-h-16 max-w-full object-contain"
                        />
                      ) : (
                        <Building2 className="w-10 h-10 text-gray-300" />
                      )}
                    </div>

                    {/* Name */}
                    <h4 className="font-medium text-sm text-gray-900 text-center mb-1 line-clamp-1">
                      {partner.name || 'Chưa có tên'}
                    </h4>

                    {/* Category */}
                    <div className="text-center mb-3">
                      <Badge variant="outline" className="text-xs">
                        {categoryInfo?.label || partner.category}
                      </Badge>
                    </div>

                    {/* Actions - show on hover */}
                    <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleToggleFeatured(partner.id)}
                        title={partner.is_featured ? "Bỏ nổi bật" : "Đánh dấu nổi bật"}
                      >
                        <Star className={cn(
                          "w-3.5 h-3.5",
                          partner.is_featured && "fill-yellow-400 text-yellow-400"
                        )} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => { setEditingPartner(partner); setIsFormOpen(true); }}
                        title="Chỉnh sửa"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(partner.id)}
                        title="Xóa"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Partner Form Modal */}
      <PartnerFormModal
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditingPartner(null); }}
        partner={editingPartner}
        onSave={handleSave}
        isSaving={saveMutation.isPending}
      />
    </div>
  );
}

// Partner Form Modal
function PartnerFormModal({ isOpen, onClose, partner, onSave, isSaving }) {
  const [formData, setFormData] = useState(DEFAULT_PARTNER);

  React.useEffect(() => {
    if (partner) {
      setFormData({ ...DEFAULT_PARTNER, ...partner });
    } else {
      setFormData({ ...DEFAULT_PARTNER });
    }
  }, [partner, isOpen]);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!formData.name) {
      alert('Vui lòng nhập tên đối tác');
      return;
    }
    onSave(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {partner ? 'Chỉnh Sửa Đối Tác' : 'Thêm Đối Tác Mới'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Tên đối tác *
            </label>
            <Input
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="VietGAP, GlobalGAP..."
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Danh mục
            </label>
            <Select value={formData.category} onValueChange={(v) => updateField('category', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PARTNER_CATEGORIES.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Logo URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              URL Logo
            </label>
            <div className="flex gap-2">
              <Input
                value={formData.logo_url}
                onChange={(e) => updateField('logo_url', e.target.value)}
                placeholder="https://..."
                className="flex-1"
              />
              {formData.logo_url && (
                <div className="w-12 h-12 rounded border flex items-center justify-center bg-gray-50">
                  <img 
                    src={formData.logo_url} 
                    alt="" 
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Website URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Website
            </label>
            <Input
              value={formData.website_url}
              onChange={(e) => updateField('website_url', e.target.value)}
              placeholder="https://..."
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Mô tả ngắn
            </label>
            <Input
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Mô tả về đối tác..."
            />
          </div>

          {/* Toggles */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-sm text-gray-900">Đối tác nổi bật</h4>
                <p className="text-xs text-gray-500">Hiển thị với biểu tượng ngôi sao</p>
              </div>
              <Switch
                checked={formData.is_featured}
                onCheckedChange={(v) => updateField('is_featured', v)}
                className="data-[state=checked]:bg-yellow-400"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-sm text-gray-900">Kích hoạt</h4>
                <p className="text-xs text-gray-500">Hiển thị trên website</p>
              </div>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(v) => updateField('is_active', v)}
                className="data-[state=checked]:bg-[#7CB342]"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSaving}
            className="bg-[#7CB342] hover:bg-[#689F38]"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Check className="w-4 h-4 mr-2" />
            )}
            {partner ? 'Cập Nhật' : 'Thêm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}