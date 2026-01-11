import React, { useState, useEffect } from 'react';
import {
  Settings, Save, Plus, Trash2, AlertTriangle, DollarSign, Shield, Clock, Users
} from 'lucide-react';
import { Icon } from '@/components/ui/AnimatedIcon.jsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminLayout from '@/components/AdminLayout';
import AdminGuard from '@/components/AdminGuard';
import { useReferralSettings, useUpdateReferralSettings } from '@/components/hooks/useReferralSystem';
import { toast } from 'sonner';

function AdminReferralSettingsContent() {
  const { data: settings, isLoading } = useReferralSettings();
  const updateMutation = useUpdateReferralSettings();
  
  const [localSettings, setLocalSettings] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  
  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);
  
  const updateLocal = (key, value) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };
  
  const updateTier = (index, field, value) => {
    const newTiers = [...(localSettings.commission_tiers || [])];
    newTiers[index] = { ...newTiers[index], [field]: value };
    updateLocal('commission_tiers', newTiers);
  };
  
  const addTier = () => {
    const newTiers = [...(localSettings.commission_tiers || [])];
    newTiers.push({ min_revenue: 0, max_revenue: null, rate: 1, label: 'Mới' });
    updateLocal('commission_tiers', newTiers);
  };
  
  const removeTier = (index) => {
    const newTiers = localSettings.commission_tiers.filter((_, i) => i !== index);
    updateLocal('commission_tiers', newTiers);
  };
  
  const updateFraudRule = (key, value) => {
    updateLocal('fraud_rules', { ...localSettings.fraud_rules, [key]: value });
  };
  
  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({ settingId: localSettings.id, updates: localSettings });
      setHasChanges(false);
      toast.success('Đã lưu cài đặt');
    } catch (error) {
      toast.error('Lỗi khi lưu cài đặt');
    }
  };
  
  if (isLoading || !localSettings) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4" />
        <div className="h-64 bg-gray-200 rounded" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Cài Đặt Chương Trình Giới Thiệu</h1>
          <p className="text-gray-500">Cấu hình chính sách và quy tắc</p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={!hasChanges || updateMutation.isPending}
          className="bg-green-600 hover:bg-green-700"
        >
          {updateMutation.isPending ? (
            <>
              <Icon.Spinner size={16} />
              Đang lưu...
            </>
          ) : (
            <>
              <Icon.Check size={16} />
              Lưu thay đổi
            </>
          )}
        </Button>
      </div>
      
      {hasChanges && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-2 text-amber-700">
          <AlertTriangle className="w-4 h-4" />
          <span>Có thay đổi chưa lưu</span>
        </div>
      )}
      
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">Chung</TabsTrigger>
          <TabsTrigger value="commission">Hoa hồng</TabsTrigger>
          <TabsTrigger value="fraud">Chống gian lận</TabsTrigger>
          <TabsTrigger value="payout">Thanh toán</TabsTrigger>
        </TabsList>
        
        {/* General Settings */}
        <TabsContent value="general" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Cài đặt chung
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Bật chương trình giới thiệu</Label>
                  <p className="text-sm text-gray-500">Cho phép người dùng tham gia chương trình</p>
                </div>
                <Switch
                  checked={localSettings.is_program_enabled}
                  onCheckedChange={(v) => updateLocal('is_program_enabled', v)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Yêu cầu admin duyệt thành viên mới</Label>
                  <p className="text-sm text-gray-500">Thành viên mới cần được admin duyệt trước khi kích hoạt</p>
                </div>
                <Switch
                  checked={localSettings.require_admin_approval}
                  onCheckedChange={(v) => updateLocal('require_admin_approval', v)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Kiểm tra đơn hàng của người giới thiệu</Label>
                  <p className="text-sm text-gray-500">Chỉ user có đơn hàng thành công mới được tham gia</p>
                </div>
                <Switch
                  checked={localSettings.enable_referrer_order_check}
                  onCheckedChange={(v) => updateLocal('enable_referrer_order_check', v)}
                />
              </div>
              
              {localSettings.enable_referrer_order_check && (
                <div className="pl-6 border-l-2 border-gray-200">
                  <Label>Số đơn hàng tối thiểu</Label>
                  <Input
                    type="number"
                    min={1}
                    value={localSettings.min_orders_for_referrer}
                    onChange={(e) => updateLocal('min_orders_for_referrer', parseInt(e.target.value))}
                    className="w-32 mt-2"
                  />
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Chặn tự giới thiệu</Label>
                  <p className="text-sm text-gray-500">Không cho phép sử dụng mã của chính mình</p>
                </div>
                <Switch
                  checked={localSettings.block_self_referral}
                  onCheckedChange={(v) => updateLocal('block_self_referral', v)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Cho phép đổi mã trước đơn đầu tiên</Label>
                  <p className="text-sm text-gray-500">Khách hàng có thể thay đổi người giới thiệu trước khi đặt đơn</p>
                </div>
                <Switch
                  checked={localSettings.allow_referral_code_change_before_first_order}
                  onCheckedChange={(v) => updateLocal('allow_referral_code_change_before_first_order', v)}
                />
              </div>
              
              <div>
                <Label>Thời hạn tính hoa hồng (ngày)</Label>
                <p className="text-sm text-gray-500 mb-2">Đơn hàng phải trong thời hạn này để tính hoa hồng (0 = không giới hạn)</p>
                <Input
                  type="number"
                  min={0}
                  value={localSettings.referral_validity_days}
                  onChange={(e) => updateLocal('referral_validity_days', parseInt(e.target.value))}
                  className="w-32"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Commission Settings */}
        <TabsContent value="commission" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Các mức hoa hồng
              </CardTitle>
              <CardDescription>
                Tỉ lệ hoa hồng theo doanh số trong tháng của người được giới thiệu
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {localSettings.commission_tiers?.map((tier, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <Label className="text-xs">Từ (VNĐ)</Label>
                    <Input
                      type="number"
                      value={tier.min_revenue}
                      onChange={(e) => updateTier(index, 'min_revenue', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs">Đến (VNĐ, để trống = không giới hạn)</Label>
                    <Input
                      type="number"
                      value={tier.max_revenue || ''}
                      onChange={(e) => updateTier(index, 'max_revenue', e.target.value ? parseInt(e.target.value) : null)}
                    />
                  </div>
                  <div className="w-24">
                    <Label className="text-xs">Tỉ lệ (%)</Label>
                    <Input
                      type="number"
                      step="0.5"
                      value={tier.rate}
                      onChange={(e) => updateTier(index, 'rate', parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs">Nhãn</Label>
                    <Input
                      value={tier.label}
                      onChange={(e) => updateTier(index, 'label', e.target.value)}
                    />
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeTier(index)}
                    className="text-red-500 hover:text-red-600 mt-5"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              
              <Button variant="outline" onClick={addTier}>
                <Plus className="w-4 h-4 mr-2" />
                Thêm mức
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Fraud Detection Settings */}
        <TabsContent value="fraud" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Chống gian lận
              </CardTitle>
              <CardDescription>
                Cấu hình các quy tắc phát hiện hành vi gian lận
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Bật phát hiện gian lận</Label>
                  <p className="text-sm text-gray-500">Tự động kiểm tra các đơn hàng có dấu hiệu bất thường</p>
                </div>
                <Switch
                  checked={localSettings.enable_fraud_detection}
                  onCheckedChange={(v) => updateLocal('enable_fraud_detection', v)}
                />
              </div>
              
              {localSettings.enable_fraud_detection && (
                <div className="space-y-4 pl-6 border-l-2 border-gray-200">
                  <div>
                    <Label>Ngưỡng điểm gian lận</Label>
                    <p className="text-sm text-gray-500 mb-2">Đánh dấu "nghi ngờ" khi điểm {'>='} ngưỡng này</p>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={localSettings.fraud_threshold_score}
                      onChange={(e) => updateLocal('fraud_threshold_score', parseInt(e.target.value))}
                      className="w-32"
                    />
                  </div>
                  
                  <div>
                    <Label>Số tài khoản tối đa cùng địa chỉ</Label>
                    <Input
                      type="number"
                      min={1}
                      value={localSettings.fraud_rules?.same_address_threshold || 3}
                      onChange={(e) => updateFraudRule('same_address_threshold', parseInt(e.target.value))}
                      className="w-32 mt-2"
                    />
                  </div>
                  
                  <div>
                    <Label>Số tài khoản tối đa cùng SĐT</Label>
                    <Input
                      type="number"
                      min={1}
                      value={localSettings.fraud_rules?.same_phone_threshold || 2}
                      onChange={(e) => updateFraudRule('same_phone_threshold', parseInt(e.target.value))}
                      className="w-32 mt-2"
                    />
                  </div>
                  
                  <div>
                    <Label>Số đơn COD không nhận tối đa</Label>
                    <Input
                      type="number"
                      min={1}
                      value={localSettings.fraud_rules?.cod_non_delivery_limit || 2}
                      onChange={(e) => updateFraudRule('cod_non_delivery_limit', parseInt(e.target.value))}
                      className="w-32 mt-2"
                    />
                  </div>
                  
                  <div>
                    <Label>Ngưỡng doanh số cuối kỳ (%)</Label>
                    <p className="text-sm text-gray-500 mb-2">Cảnh báo nếu &gt; X% doanh số trong 3 ngày cuối tháng</p>
                    <Input
                      type="number"
                      min={0}
                      max={1}
                      step={0.1}
                      value={localSettings.fraud_rules?.end_of_period_spike_threshold || 0.8}
                      onChange={(e) => updateFraudRule('end_of_period_spike_threshold', parseFloat(e.target.value))}
                      className="w-32"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Payout Settings */}
        <TabsContent value="payout" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Thanh toán hoa hồng
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Chu kỳ thanh toán</Label>
                <Select 
                  value={localSettings.payout_cycle}
                  onValueChange={(v) => updateLocal('payout_cycle', v)}
                >
                  <SelectTrigger className="w-[200px] mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Hàng tháng</SelectItem>
                    <SelectItem value="quarterly">Hàng quý</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Ngày thanh toán trong tháng</Label>
                <Input
                  type="number"
                  min={1}
                  max={28}
                  value={localSettings.payout_day_of_month}
                  onChange={(e) => updateLocal('payout_day_of_month', parseInt(e.target.value))}
                  className="w-32 mt-2"
                />
              </div>
              
              <div>
                <Label>Số tiền tối thiểu để thanh toán (VNĐ)</Label>
                <Input
                  type="number"
                  min={0}
                  value={localSettings.min_payout_amount}
                  onChange={(e) => updateLocal('min_payout_amount', parseInt(e.target.value))}
                  className="w-48 mt-2"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Tự động thanh toán</Label>
                  <p className="text-sm text-gray-500">Tự động xử lý thanh toán theo chu kỳ</p>
                </div>
                <Switch
                  checked={localSettings.enable_auto_payout}
                  onCheckedChange={(v) => updateLocal('enable_auto_payout', v)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function AdminReferralSettings() {
  return (
    <AdminGuard>
      <AdminLayout>
        <AdminReferralSettingsContent />
      </AdminLayout>
    </AdminGuard>
  );
}