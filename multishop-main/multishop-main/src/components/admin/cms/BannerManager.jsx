/**
 * BannerManager - Quản lý banners và promotions
 * 
 * Features:
 * - CRUD banners
 * - Schedule banners (start/end date)
 * - Link to campaigns
 * - Multiple banner types (hero, promotional, popup)
 */

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Image, Calendar, Link as LinkIcon, Eye, EyeOff,
  Edit3, Trash2, Copy, ChevronDown, Clock, Tag, Loader2,
  Check, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useSiteConfig, useSiteConfigMutation } from "@/components/hooks/useCMSPages";
import { cn } from "@/lib/utils";
import moment from "moment";

// Banner types
const BANNER_TYPES = [
  { value: 'hero', label: 'Hero Slide', icon: Image },
  { value: 'promotional', label: 'Banner Khuyến Mãi', icon: Tag },
  { value: 'popup', label: 'Popup', icon: Calendar },
  { value: 'inline', label: 'Banner Nội Tuyến', icon: LinkIcon }
];

// Default banner template
const DEFAULT_BANNER = {
  id: '',
  type: 'promotional',
  title: '',
  subtitle: '',
  description: '',
  image_url: '',
  cta_text: '',
  cta_link: '',
  discount_text: '',
  is_active: true,
  start_date: null,
  end_date: null,
  campaign_id: null,
  order: 0
};

export default function BannerManager() {
  const { data: config, isLoading } = useSiteConfig();
  const saveMutation = useSiteConfigMutation();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [filterType, setFilterType] = useState('all');

  // Get banners from config
  const banners = useMemo(() => {
    return config?.banners_content || [];
  }, [config]);

  // Filter banners
  const filteredBanners = useMemo(() => {
    if (filterType === 'all') return banners;
    return banners.filter(b => b.type === filterType);
  }, [banners, filterType]);

  // Check if banner is currently active (within date range)
  const isBannerActive = (banner) => {
    if (!banner.is_active) return false;
    const now = moment();
    if (banner.start_date && moment(banner.start_date).isAfter(now)) return false;
    if (banner.end_date && moment(banner.end_date).isBefore(now)) return false;
    return true;
  };

  // Create/Update banner
  const handleSave = async (bannerData) => {
    const newBanners = [...banners];
    
    if (editingBanner) {
      // Update existing
      const index = newBanners.findIndex(b => b.id === editingBanner.id);
      if (index >= 0) {
        newBanners[index] = { ...bannerData, id: editingBanner.id };
      }
    } else {
      // Create new
      newBanners.push({
        ...bannerData,
        id: `banner_${Date.now()}`,
        order: newBanners.length
      });
    }
    
    await saveMutation.mutateAsync({ banners_content: newBanners });
    setIsFormOpen(false);
    setEditingBanner(null);
  };

  // Delete banner
  const handleDelete = async (bannerId) => {
    if (!confirm('Bạn có chắc muốn xóa banner này?')) return;
    
    const newBanners = banners.filter(b => b.id !== bannerId);
    await saveMutation.mutateAsync({ banners_content: newBanners });
  };

  // Toggle banner active status
  const handleToggleActive = async (bannerId) => {
    const newBanners = banners.map(b => 
      b.id === bannerId ? { ...b, is_active: !b.is_active } : b
    );
    await saveMutation.mutateAsync({ banners_content: newBanners });
  };

  // Duplicate banner
  const handleDuplicate = async (banner) => {
    const newBanner = {
      ...banner,
      id: `banner_${Date.now()}`,
      title: `${banner.title} (copy)`,
      is_active: false,
      order: banners.length
    };
    await saveMutation.mutateAsync({ banners_content: [...banners, newBanner] });
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
          <h2 className="text-xl font-bold text-gray-900">Quản Lý Banners</h2>
          <p className="text-sm text-gray-500">
            {banners.length} banners • {banners.filter(b => isBannerActive(b)).length} đang hoạt động
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Loại banner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              {BANNER_TYPES.map(type => (
                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            onClick={() => { setEditingBanner(null); setIsFormOpen(true); }}
            className="bg-[#7CB342] hover:bg-[#689F38] gap-2"
          >
            <Plus className="w-4 h-4" />
            Tạo Banner
          </Button>
        </div>
      </div>

      {/* Banner Grid */}
      {filteredBanners.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Image className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có banner nào</h3>
            <p className="text-gray-500 mb-6">Tạo banner đầu tiên để quảng bá sản phẩm</p>
            <Button 
              onClick={() => { setEditingBanner(null); setIsFormOpen(true); }}
              className="bg-[#7CB342] hover:bg-[#689F38]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Tạo Banner Mới
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredBanners.map((banner, index) => {
            const isActive = isBannerActive(banner);
            const typeInfo = BANNER_TYPES.find(t => t.value === banner.type);

            return (
              <motion.div
                key={banner.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={cn(
                  "overflow-hidden transition-all",
                  !isActive && "opacity-60"
                )}>
                  {/* Banner preview image */}
                  <div className="relative h-40 bg-gray-100">
                    {banner.image_url ? (
                      <img 
                        src={banner.image_url} 
                        alt={banner.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Image className="w-12 h-12 text-gray-300" />
                      </div>
                    )}
                    
                    {/* Type badge */}
                    <Badge className="absolute top-2 left-2 bg-white/90 text-gray-700">
                      {typeInfo?.label || banner.type}
                    </Badge>
                    
                    {/* Status badge */}
                    <Badge className={cn(
                      "absolute top-2 right-2",
                      isActive ? "bg-green-500" : "bg-gray-500"
                    )}>
                      {isActive ? "Đang hiện" : "Đã ẩn"}
                    </Badge>
                  </div>

                  <CardContent className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                      {banner.title || 'Chưa có tiêu đề'}
                    </h3>
                    {banner.discount_text && (
                      <p className="text-[#7CB342] font-bold text-sm mb-2">{banner.discount_text}</p>
                    )}
                    <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                      {banner.description || banner.subtitle || 'Chưa có mô tả'}
                    </p>

                    {/* Date range */}
                    {(banner.start_date || banner.end_date) && (
                      <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                        <Clock className="w-3 h-3" />
                        {banner.start_date && moment(banner.start_date).format('DD/MM')}
                        {' - '}
                        {banner.end_date ? moment(banner.end_date).format('DD/MM/YYYY') : 'Không giới hạn'}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-3 border-t">
                      <Switch
                        checked={banner.is_active}
                        onCheckedChange={() => handleToggleActive(banner.id)}
                        className="data-[state=checked]:bg-[#7CB342]"
                      />
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDuplicate(banner)}
                          title="Nhân bản"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => { setEditingBanner(banner); setIsFormOpen(true); }}
                          title="Chỉnh sửa"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleDelete(banner.id)}
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Banner Form Modal */}
      <BannerFormModal
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditingBanner(null); }}
        banner={editingBanner}
        onSave={handleSave}
        isSaving={saveMutation.isPending}
      />
    </div>
  );
}

// Banner Form Modal
function BannerFormModal({ isOpen, onClose, banner, onSave, isSaving }) {
  const [formData, setFormData] = useState(DEFAULT_BANNER);

  React.useEffect(() => {
    if (banner) {
      setFormData({ ...DEFAULT_BANNER, ...banner });
    } else {
      setFormData({ ...DEFAULT_BANNER });
    }
  }, [banner, isOpen]);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!formData.title) {
      alert('Vui lòng nhập tiêu đề banner');
      return;
    }
    onSave(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {banner ? 'Chỉnh Sửa Banner' : 'Tạo Banner Mới'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Loại Banner
            </label>
            <Select value={formData.type} onValueChange={(v) => updateField('type', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BANNER_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Tiêu đề *
            </label>
            <Input
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="Tiêu đề banner..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Discount text */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Text Giảm Giá
              </label>
              <Input
                value={formData.discount_text}
                onChange={(e) => updateField('discount_text', e.target.value)}
                placeholder="GIẢM 30%"
              />
            </div>

            {/* Subtitle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Phụ đề
              </label>
              <Input
                value={formData.subtitle}
                onChange={(e) => updateField('subtitle', e.target.value)}
                placeholder="Ưu đãi đặc biệt..."
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Mô tả
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Mô tả chi tiết..."
              rows={3}
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              URL Hình Ảnh
            </label>
            <div className="flex gap-2">
              <Input
                value={formData.image_url}
                onChange={(e) => updateField('image_url', e.target.value)}
                placeholder="https://..."
                className="flex-1"
              />
              {formData.image_url && (
                <div className="w-16 h-10 rounded overflow-hidden border">
                  <img src={formData.image_url} alt="" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* CTA Text */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Nút CTA
              </label>
              <Input
                value={formData.cta_text}
                onChange={(e) => updateField('cta_text', e.target.value)}
                placeholder="XEM NGAY"
              />
            </div>

            {/* CTA Link */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Link CTA
              </label>
              <Input
                value={formData.cta_link}
                onChange={(e) => updateField('cta_link', e.target.value)}
                placeholder="/Services"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Ngày bắt đầu
              </label>
              <Input
                type="date"
                value={formData.start_date || ''}
                onChange={(e) => updateField('start_date', e.target.value)}
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Ngày kết thúc
              </label>
              <Input
                type="date"
                value={formData.end_date || ''}
                onChange={(e) => updateField('end_date', e.target.value)}
              />
            </div>
          </div>

          {/* Active switch */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Kích hoạt Banner</h4>
              <p className="text-sm text-gray-500">Banner sẽ hiển thị trên website</p>
            </div>
            <Switch
              checked={formData.is_active}
              onCheckedChange={(v) => updateField('is_active', v)}
              className="data-[state=checked]:bg-[#7CB342]"
            />
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
            {banner ? 'Cập Nhật' : 'Tạo Banner'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}