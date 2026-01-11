/**
 * SiteConfigEditor - Editor cấu hình website (CMS)
 * 
 * CHỈ bao gồm các cấu hình liên quan đến CMS/nội dung:
 * - Thông tin website (tên, slogan, logo)
 * - Hero section
 * - Footer
 * - SEO defaults
 * - Features toggle (trang/tính năng)
 * 
 * NOTE: Thông tin liên hệ, giờ làm việc, mạng xã hội => Admin Settings
 */

import React, { useState, useEffect } from "react";
import { 
  Save, Globe, Image, Settings, Loader2, RefreshCw,
  Search, Layout, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSiteConfig, useSiteConfigMutation } from "@/components/hooks/useCMSPages";
import { showAdminAlert } from "@/components/AdminAlert";

export default function SiteConfigEditor() {
  const { data: config, isLoading } = useSiteConfig();
  const saveMutation = useSiteConfigMutation();
  
  const [formData, setFormData] = useState(null);
  const [activeTab, setActiveTab] = useState('general');
  const [hasChanges, setHasChanges] = useState(false);

  // Init form data from config
  useEffect(() => {
    if (config) {
      setFormData(config);
      setHasChanges(false);
    }
  }, [config]);

  const updateField = (path, value) => {
    setFormData(prev => {
      const keys = path.split('.');
      const newData = { ...prev };
      let current = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      
      return newData;
    });
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      await saveMutation.mutateAsync(formData);
      setHasChanges(false);
      showAdminAlert('✅ Đã lưu cấu hình!', 'success');
    } catch (error) {
      showAdminAlert('❌ Lỗi khi lưu', 'error');
    }
  };

  const handleReset = () => {
    setFormData(config);
    setHasChanges(false);
  };

  if (isLoading || !formData) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-[#7CB342] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Cấu Hình Website</h2>
          <p className="text-gray-600 mt-1">Quản lý thông tin chung và nội dung website</p>
        </div>
        <div className="flex items-center gap-3">
          {hasChanges && (
            <Button variant="outline" onClick={handleReset} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Hoàn tác
            </Button>
          )}
          <Button 
            onClick={handleSave} 
            disabled={!hasChanges || saveMutation.isPending}
            className="bg-[#7CB342] hover:bg-[#689F38] gap-2"
          >
            {saveMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Lưu thay đổi
          </Button>
        </div>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Thông tin liên hệ, giờ làm việc, mạng xã hội được quản lý trong <strong>Cài Đặt Hệ Thống</strong>.
        </AlertDescription>
      </Alert>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-xl grid-cols-4">
          <TabsTrigger value="general" className="gap-2">
            <Globe className="w-4 h-4" />
            Chung
          </TabsTrigger>
          <TabsTrigger value="hero" className="gap-2">
            <Layout className="w-4 h-4" />
            Hero
          </TabsTrigger>
          <TabsTrigger value="seo" className="gap-2">
            <Search className="w-4 h-4" />
            SEO
          </TabsTrigger>
          <TabsTrigger value="features" className="gap-2">
            <Settings className="w-4 h-4" />
            Tính năng
          </TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="mt-6">
          <div className="bg-white rounded-xl border p-6 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên Website
                </label>
                <Input
                  value={formData.site_name || ''}
                  onChange={(e) => updateField('site_name', e.target.value)}
                  placeholder="Zero Farm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slogan
                </label>
                <Input
                  value={formData.site_tagline || ''}
                  onChange={(e) => updateField('site_tagline', e.target.value)}
                  placeholder="Nông Sản Sạch - Từ Trang Trại Đến Bàn Ăn"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả website
              </label>
              <Textarea
                value={formData.site_description || ''}
                onChange={(e) => updateField('site_description', e.target.value)}
                placeholder="Mô tả ngắn gọn về website..."
                rows={3}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Image className="w-4 h-4 inline mr-2" />
                  Logo URL
                </label>
                <div className="flex gap-2">
                  <Input
                    value={formData.logo_url || ''}
                    onChange={(e) => updateField('logo_url', e.target.value)}
                    placeholder="https://..."
                    className="flex-1"
                  />
                  {formData.logo_url && (
                    <div className="w-12 h-12 border rounded-lg overflow-hidden">
                      <img src={formData.logo_url} alt="Logo" className="w-full h-full object-contain" />
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Favicon URL
                </label>
                <Input
                  value={formData.favicon_url || ''}
                  onChange={(e) => updateField('favicon_url', e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>

            {/* Footer Config */}
            <div className="border-t pt-6">
              <h3 className="font-medium text-gray-900 mb-4">Cấu hình Footer</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Copyright Text
                  </label>
                  <Input
                    value={formData.footer_config?.copyright_text || ''}
                    onChange={(e) => updateField('footer_config.copyright_text', e.target.value)}
                    placeholder="© 2024 Zero Farm. All rights reserved."
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h4 className="font-medium text-gray-900">Hiển thị Newsletter</h4>
                    <p className="text-sm text-gray-500">Form đăng ký nhận tin ở footer</p>
                  </div>
                  <Switch
                    checked={formData.footer_config?.show_newsletter || false}
                    onCheckedChange={(checked) => updateField('footer_config.show_newsletter', checked)}
                  />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Hero Tab */}
        <TabsContent value="hero" className="mt-6">
          <div className="bg-white rounded-xl border p-6 space-y-6">
            <p className="text-sm text-gray-500 mb-4">
              Cấu hình mặc định cho Hero section. Nội dung chi tiết có thể chỉnh sửa qua Live Edit.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiêu đề Hero
                </label>
                <Input
                  value={formData.hero_config?.title || ''}
                  onChange={(e) => updateField('hero_config.title', e.target.value)}
                  placeholder="Nông Sản Sạch Từ Đà Lạt"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phụ đề Hero
                </label>
                <Input
                  value={formData.hero_config?.subtitle || ''}
                  onChange={(e) => updateField('hero_config.subtitle', e.target.value)}
                  placeholder="Từ trang trại đến bàn ăn..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nút CTA
                </label>
                <Input
                  value={formData.hero_config?.cta_text || ''}
                  onChange={(e) => updateField('hero_config.cta_text', e.target.value)}
                  placeholder="Khám Phá Ngay"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link CTA
                </label>
                <Input
                  value={formData.hero_config?.cta_link || ''}
                  onChange={(e) => updateField('hero_config.cta_link', e.target.value)}
                  placeholder="/Services"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ảnh nền Hero
              </label>
              <Input
                value={formData.hero_config?.background_image || ''}
                onChange={(e) => updateField('hero_config.background_image', e.target.value)}
                placeholder="https://..."
              />
              {formData.hero_config?.background_image && (
                <div className="mt-2 h-32 rounded-lg overflow-hidden border">
                  <img 
                    src={formData.hero_config.background_image} 
                    alt="Hero background" 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* SEO Tab */}
        <TabsContent value="seo" className="mt-6">
          <div className="bg-white rounded-xl border p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title Suffix
              </label>
              <Input
                value={formData.seo_defaults?.title_suffix || ''}
                onChange={(e) => updateField('seo_defaults.title_suffix', e.target.value)}
                placeholder=" | Zero Farm"
              />
              <p className="text-xs text-gray-500 mt-1">Sẽ được thêm vào cuối tiêu đề mỗi trang</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta Description mặc định
              </label>
              <Textarea
                value={formData.seo_defaults?.default_description || ''}
                onChange={(e) => updateField('seo_defaults.default_description', e.target.value)}
                placeholder="Mô tả mặc định cho các trang không có meta description riêng"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Keywords mặc định
              </label>
              <Input
                value={formData.seo_defaults?.default_keywords || ''}
                onChange={(e) => updateField('seo_defaults.default_keywords', e.target.value)}
                placeholder="nông sản sạch, rau hữu cơ, organic, đà lạt"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                OG Image mặc định
              </label>
              <Input
                value={formData.seo_defaults?.og_image || ''}
                onChange={(e) => updateField('seo_defaults.og_image', e.target.value)}
                placeholder="https://zerofarm.vn/og-image.jpg"
              />
            </div>
          </div>
        </TabsContent>

        {/* Features Tab */}
        <TabsContent value="features" className="mt-6">
          <div className="bg-white rounded-xl border p-6 space-y-4">
            <p className="text-sm text-gray-600 mb-4">
              Bật/tắt các trang và tính năng của website
            </p>

            <div className="grid gap-4">
              {[
                { key: 'enable_blog', label: 'Trang Blog', desc: 'Cho phép hiển thị trang blog và bài viết', icon: '📝' },
                { key: 'enable_community', label: 'Trang Cộng Đồng', desc: 'Cho phép người dùng đăng bài và tương tác', icon: '👥' },
                { key: 'enable_preorder', label: 'Trang Bán Trước', desc: 'Cho phép đặt hàng trước các sản phẩm theo lot', icon: '🌱' },
                { key: 'enable_referral', label: 'Chương Trình Giới Thiệu', desc: 'Cho phép giới thiệu bạn bè nhận hoa hồng', icon: '🎁' },
                { key: 'enable_chat', label: 'Chat Hỗ Trợ', desc: 'Cho phép chat hỗ trợ khách hàng', icon: '💬' }
              ].map(feature => (
                <div key={feature.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{feature.icon}</span>
                    <div>
                      <h4 className="font-medium text-gray-900">{feature.label}</h4>
                      <p className="text-sm text-gray-500">{feature.desc}</p>
                    </div>
                  </div>
                  <Switch
                    checked={formData.features?.[feature.key] || false}
                    onCheckedChange={(checked) => updateField(`features.${feature.key}`, checked)}
                    className="data-[state=checked]:bg-[#7CB342]"
                  />
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}