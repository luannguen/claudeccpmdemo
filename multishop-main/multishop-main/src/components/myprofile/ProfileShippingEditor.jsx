/**
 * ProfileShippingEditor
 * UI Layer - Presentation only
 * 
 * Displays merged Customer+User shipping data with edit capability
 */

import React, { useState, useMemo } from 'react';
import { Icon } from '@/components/ui/AnimatedIcon.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  useProfileWithCustomer, 
  useUpdateShippingPreferences,
  useToggleAutoSync,
  useManualSync
} from '@/components/hooks/useCustomerSync';
import { VN_PROVINCES, VN_DISTRICTS } from '@/components/referral/vnAddressData';
import { cn } from '@/lib/utils';

export default function ProfileShippingEditor({ userEmail }) {
  const { data: profile, isLoading } = useProfileWithCustomer(userEmail);
  const updateShippingMutation = useUpdateShippingPreferences();
  const toggleAutoSyncMutation = useToggleAutoSync();
  const manualSyncMutation = useManualSync();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  
  // District options
  const districtOptions = useMemo(() => {
    if (!formData.city) return [];
    const provinceCode = VN_PROVINCES.find(p => p.name === formData.city)?.code;
    return VN_DISTRICTS[provinceCode] || [];
  }, [formData.city]);
  
  const handleEdit = () => {
    setFormData(profile?.shipping || {});
    setIsEditing(true);
  };
  
  const handleSave = async () => {
    await updateShippingMutation.mutateAsync(formData);
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setIsEditing(false);
    setFormData({});
  };
  
  const handleManualSync = async () => {
    await manualSyncMutation.mutateAsync(userEmail);
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-gray-500">
            <Icon.Spinner size={16} />
            <span>Đang tải...</span>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!profile) return null;
  
  const displayData = isEditing ? formData : (profile.shipping || {});
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Icon.MapPin size={18} />
            Địa Chỉ Giao Hàng Mặc Định
          </span>
          <div className="flex items-center gap-2">
            {profile.customer_exists && (
              <Badge variant="outline" className="text-xs">
                <Icon.CheckCircle size={11} className="mr-1" />
                Sync từ CTV
              </Badge>
            )}
            {profile.manually_edited && (
              <Badge variant="outline" className="text-xs">
                <Icon.Pencil size={11} className="mr-1" />
                Đã tùy chỉnh
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Auto-sync toggle */}
        {profile.customer_exists && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900">Tự động đồng bộ</p>
                <p className="text-xs text-blue-700">
                  Cập nhật địa chỉ từ hệ thống CTV khi có thay đổi
                </p>
              </div>
              <Switch
                checked={profile.allow_auto_sync}
                onCheckedChange={(checked) => toggleAutoSyncMutation.mutate(checked)}
                disabled={toggleAutoSyncMutation.isPending}
              />
            </div>
            
            {profile.synced_at && (
              <p className="text-xs text-blue-600 mt-2">
                Sync lần cuối: {new Date(profile.synced_at).toLocaleString('vi-VN')}
              </p>
            )}
            
            <Button
              size="sm"
              variant="outline"
              onClick={handleManualSync}
              disabled={manualSyncMutation.isPending}
              className="mt-2 w-full"
            >
              {manualSyncMutation.isPending ? (
                <Icon.Spinner size={14} className="mr-2" />
              ) : (
                <Icon.RefreshCw size={14} className="mr-2" />
              )}
              Đồng bộ ngay
            </Button>
          </div>
        )}
        
        {/* Form fields */}
        {isEditing ? (
          <div className="space-y-3">
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Họ tên *</Label>
                <Input
                  value={formData.full_name || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                  className="text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">SĐT *</Label>
                <Input
                  value={formData.phone || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="text-sm"
                />
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Tỉnh/Thành *</Label>
                <Select 
                  value={formData.city} 
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, city: value, district: '' }));
                  }}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Chọn tỉnh/thành" />
                  </SelectTrigger>
                  <SelectContent>
                    {VN_PROVINCES.map(p => (
                      <SelectItem key={p.code} value={p.name}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-xs">Quận/Huyện *</Label>
                <Select 
                  value={formData.district} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, district: value }))}
                  disabled={!formData.city || districtOptions.length === 0}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Chọn quận/huyện" />
                  </SelectTrigger>
                  <SelectContent>
                    {districtOptions.map(d => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label className="text-xs">Phường/Xã</Label>
              <Input
                value={formData.ward || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, ward: e.target.value }))}
                className="text-sm"
                placeholder="Tùy chọn"
              />
            </div>
            
            <div>
              <Label className="text-xs">Địa chỉ cụ thể *</Label>
              <Input
                value={formData.address || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                className="text-sm"
                placeholder="Số nhà, đường..."
              />
            </div>
            
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="flex-1"
              >
                Hủy
              </Button>
              <Button
                onClick={handleSave}
                disabled={updateShippingMutation.isPending}
                className="flex-1 bg-[#7CB342] hover:bg-[#5a8f31]"
              >
                {updateShippingMutation.isPending ? (
                  <Icon.Spinner size={14} className="mr-2" />
                ) : (
                  <Icon.Save size={14} className="mr-2" />
                )}
                Lưu
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div className="text-gray-500">Họ tên:</div>
              <div className="font-medium">{displayData.full_name || '—'}</div>
              
              <div className="text-gray-500">SĐT:</div>
              <div className="font-medium">{displayData.phone || '—'}</div>
              
              <div className="text-gray-500">Email:</div>
              <div className="font-medium">{displayData.email || '—'}</div>
              
              <div className="text-gray-500">Địa chỉ:</div>
              <div className="font-medium">
                {displayData.address && displayData.city ? (
                  <>
                    {displayData.address}, {displayData.ward && `${displayData.ward}, `}
                    {displayData.district}, {displayData.city}
                  </>
                ) : '—'}
              </div>
            </div>
            
            <Button
              variant="outline"
              onClick={handleEdit}
              className="w-full mt-4"
            >
              <Icon.Edit size={14} className="mr-2" />
              Chỉnh sửa
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}