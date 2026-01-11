import React, { useState, useEffect } from "react";
import { Icon } from "@/components/ui/AnimatedIcon.jsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/NotificationToast";

export default function GeneralSettings() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  // Fetch SiteConfig
  const { data: siteConfig, isLoading } = useQuery({
    queryKey: ['site-config-general'],
    queryFn: async () => {
      const configs = await base44.entities.SiteConfig.filter({ config_key: 'main' });
      return configs[0] || null;
    }
  });

  // Local state for form
  const [formData, setFormData] = useState({
    site_name: '',
    contact_phone: '',
    contact_email: '',
    contact_address: '',
    facebook: '',
    instagram: ''
  });

  // Load config vào form
  useEffect(() => {
    if (siteConfig) {
      setFormData({
        site_name: siteConfig.site_name || '',
        contact_phone: siteConfig.contact_info?.phone || '',
        contact_email: siteConfig.contact_info?.email || '',
        contact_address: siteConfig.contact_info?.address || '',
        facebook: siteConfig.social_links?.facebook || '',
        instagram: siteConfig.social_links?.instagram || ''
      });
    }
  }, [siteConfig]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const user = await base44.auth.me();
      
      const configData = {
        config_key: 'main',
        site_name: data.site_name,
        contact_info: {
          ...(siteConfig?.contact_info || {}),
          phone: data.contact_phone,
          email: data.contact_email,
          address: data.contact_address
        },
        social_links: {
          ...(siteConfig?.social_links || {}),
          facebook: data.facebook,
          instagram: data.instagram
        }
      };

      if (siteConfig) {
        return await base44.entities.SiteConfig.update(siteConfig.id, configData);
      } else {
        return await base44.entities.SiteConfig.create(configData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-config-general'] });
      addToast('Đã lưu cài đặt thành công', 'success');
    },
    onError: (error) => {
      addToast('Không thể lưu cài đặt: ' + error.message, 'error');
    }
  });

  const handleSave = () => {
    saveMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Icon.Spinner size={32} className="text-[#7CB342]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-[#0F0F0F] mb-4">Thông Tin Trang Trại</h3>
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tên Trang Trại</label>
              <Input
                value={formData.site_name}
                onChange={(e) => setFormData({ ...formData, site_name: e.target.value })}
                placeholder="Zero Farm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hotline</label>
              <Input
                type="tel"
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                placeholder="098 765 4321"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Liên Hệ</label>
            <Input
              type="email"
              value={formData.contact_email}
              onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
              placeholder="info@zerofarm.vn"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Địa Chỉ</label>
            <Textarea
              value={formData.contact_address}
              onChange={(e) => setFormData({ ...formData, contact_address: e.target.value })}
              rows={3}
              placeholder="Đường Trần Hưng Đạo, Phường 10, Đà Lạt, Lâm Đồng"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Facebook</label>
              <Input
                type="url"
                value={formData.facebook}
                onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                placeholder="https://facebook.com/zerofarm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Instagram</label>
              <Input
                type="url"
                value={formData.instagram}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                placeholder="https://instagram.com/zerofarm"
              />
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="bg-[#7CB342] hover:bg-[#5a8f31]"
          >
            {saveMutation.isPending ? (
              <>
                <Icon.Spinner className="mr-2" />
                Đang lưu...
              </>
            ) : (
              <>
                <Icon.Save className="mr-2" />
                Lưu Thay Đổi
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}