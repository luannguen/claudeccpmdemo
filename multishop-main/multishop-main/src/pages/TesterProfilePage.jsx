/**
 * TesterProfilePage - Trang Profile cá nhân cho Tester
 * 
 * Cho phép tester cập nhật:
 * - Tên hiển thị
 * - Số điện thoại
 * - Địa chỉ
 * - Ảnh đại diện
 * - Môi trường test ưu tiên
 * - Thông tin browser/device
 */

import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  ArrowLeft, User, Phone, MapPin, Camera, Save, Loader2,
  Globe, Monitor, Bell, CheckCircle
} from "lucide-react";
import { Icon } from "@/components/ui/AnimatedIcon.jsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/NotificationToast";
import { base44 } from "@/api/base44Client";

// Hooks
import { useTesterPortal } from "@/components/hooks/useTesterPortal";
import { testerProfileService } from "@/components/services/testerService";

// Image validation constants
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export default function TesterProfilePage() {
  const { addToast } = useToast();
  const fileInputRef = useRef(null);

  const {
    user,
    isLoading: isLoadingAuth,
    isAuthenticated,
    testerEmail,
    testerName,
    profile,
    isLoadingProfile,
    refreshProfile
  } = useTesterPortal();

  const [formData, setFormData] = useState({
    display_name: '',
    phone: '',
    address: '',
    bio: '',
    preferred_environment: 'staging',
    default_browser_info: '',
    notifications_enabled: true
  });

  const [avatarUrl, setAvatarUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize form data from profile
  useEffect(() => {
    if (profile) {
      setFormData({
        display_name: profile.display_name || testerName || '',
        phone: profile.phone || '',
        address: profile.address || '',
        bio: profile.bio || '',
        preferred_environment: profile.preferred_environment || 'staging',
        default_browser_info: profile.default_browser_info || '',
        notifications_enabled: profile.notifications_enabled !== false
      });
      setAvatarUrl(profile.avatar_url || '');
    }
  }, [profile, testerName]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const validateImage = (file) => {
    if (!file) return { valid: false, error: 'Không có file được chọn' };
    
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return { 
        valid: false, 
        error: 'Định dạng không hỗ trợ. Chỉ chấp nhận: JPG, PNG, GIF, WebP' 
      };
    }

    if (file.size > MAX_IMAGE_SIZE) {
      return { 
        valid: false, 
        error: `Kích thước file quá lớn. Tối đa ${MAX_IMAGE_SIZE / 1024 / 1024}MB` 
      };
    }

    return { valid: true };
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImage(file);
    if (!validation.valid) {
      addToast(validation.error, 'error');
      return;
    }

    setIsUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setAvatarUrl(file_url);
      setHasChanges(true);
      addToast('Đã tải ảnh lên thành công', 'success');
    } catch (error) {
      console.error('Upload error:', error);
      addToast('Không thể tải ảnh lên. Vui lòng thử lại', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    // Validate
    if (!formData.display_name.trim()) {
      addToast('Tên hiển thị không được để trống', 'error');
      return;
    }

    // Phone validation (Vietnam format)
    if (formData.phone && !/^(0|\+84)[0-9]{9,10}$/.test(formData.phone.replace(/\s/g, ''))) {
      addToast('Số điện thoại không hợp lệ', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const result = await testerProfileService.upsert({
        user_email: testerEmail,
        display_name: formData.display_name.trim(),
        phone: formData.phone?.trim() || null,
        address: formData.address?.trim() || null,
        bio: formData.bio?.trim() || null,
        preferred_environment: formData.preferred_environment,
        default_browser_info: formData.default_browser_info?.trim() || null,
        notifications_enabled: formData.notifications_enabled,
        avatar_url: avatarUrl || null
      });

      if (result.success) {
        addToast('Đã lưu thông tin thành công', 'success');
        setHasChanges(false);
        if (refreshProfile) refreshProfile();
      } else {
        addToast(result.message || 'Không thể lưu thông tin', 'error');
      }
    } catch (error) {
      console.error('Save error:', error);
      addToast('Đã xảy ra lỗi khi lưu', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingAuth || isLoadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Icon.Spinner className="w-8 h-8 text-violet-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="p-8 text-center">
          <User className="w-12 h-12 text-violet-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Vui lòng đăng nhập</h2>
          <p className="text-gray-500 mb-4">Bạn cần đăng nhập để xem profile</p>
          <Link to={createPageUrl('TesterPortal')}>
            <Button>Đến Tester Portal</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <Link to={createPageUrl('TesterPortal')}>
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Quay lại Portal
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-violet-500" />
              <h1 className="text-lg font-bold text-gray-900">Profile Cá Nhân</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* Avatar Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-violet-500" />
                Ảnh đại diện
              </CardTitle>
              <CardDescription>
                Tải lên ảnh đại diện. Chấp nhận JPG, PNG, GIF, WebP. Tối đa 5MB.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="relative">
                  {avatarUrl ? (
                    <img 
                      src={avatarUrl} 
                      alt="Avatar" 
                      className="w-24 h-24 rounded-full object-cover border-4 border-violet-100"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-violet-100 flex items-center justify-center">
                      <User className="w-10 h-10 text-violet-400" />
                    </div>
                  )}
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    </div>
                  )}
                </div>
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ALLOWED_IMAGE_TYPES.join(',')}
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    {isUploading ? 'Đang tải...' : 'Chọn ảnh'}
                  </Button>
                  {avatarUrl && (
                    <Button 
                      variant="ghost" 
                      className="ml-2 text-red-500"
                      onClick={() => { setAvatarUrl(''); setHasChanges(true); }}
                    >
                      Xóa ảnh
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-violet-500" />
                Thông tin cơ bản
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="display_name">Tên hiển thị *</Label>
                <Input
                  id="display_name"
                  value={formData.display_name}
                  onChange={(e) => handleInputChange('display_name', e.target.value)}
                  placeholder="Nhập tên hiển thị"
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={testerEmail}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-400 mt-1">Email không thể thay đổi</p>
              </div>

              <div>
                <Label htmlFor="phone">Số điện thoại</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="0912345678"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Địa chỉ</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Nhập địa chỉ của bạn"
                    className="pl-10"
                    rows={2}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="bio">Giới thiệu</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Viết vài dòng giới thiệu về bản thân..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Testing Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="w-5 h-5 text-violet-500" />
                Tùy chọn Testing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="environment">Môi trường test ưu tiên</Label>
                <Select 
                  value={formData.preferred_environment}
                  onValueChange={(v) => handleInputChange('preferred_environment', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn môi trường" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="staging">Staging</SelectItem>
                    <SelectItem value="production">Production</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="browser">Thông tin Browser/Device</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="browser"
                    value={formData.default_browser_info}
                    onChange={(e) => handleInputChange('default_browser_info', e.target.value)}
                    placeholder="Chrome 120 / MacOS 14 / Windows 11..."
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-violet-500" />
                  <div>
                    <p className="font-medium">Nhận thông báo</p>
                    <p className="text-sm text-gray-500">Nhận thông báo khi có test case mới hoặc cần test lại</p>
                  </div>
                </div>
                <Switch
                  checked={formData.notifications_enabled}
                  onCheckedChange={(v) => handleInputChange('notifications_enabled', v)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end gap-3">
            <Link to={createPageUrl('TesterPortal')}>
              <Button variant="outline">Hủy</Button>
            </Link>
            <Button 
              onClick={handleSave}
              disabled={isSaving || !hasChanges}
              className="bg-violet-600 hover:bg-violet-700"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Lưu thay đổi
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}