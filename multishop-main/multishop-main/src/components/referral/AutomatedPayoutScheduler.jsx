/**
 * AutomatedPayoutScheduler - Tự động lên lịch thanh toán
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Icon } from '@/components/ui/AnimatedIcon.jsx';
import { AlertCircle } from 'lucide-react';
import { format, addMonths } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function AutomatedPayoutScheduler({ 
  settings, 
  members = [], 
  onToggleAuto, 
  onUpdateSchedule,
  onPreviewPayout 
}) {
  const [previewData, setPreviewData] = useState(null);
  
  // Tính toán payout tiếp theo
  const nextPayoutDate = useMemo(() => {
    const today = new Date();
    const payoutDay = settings?.payout_day_of_month || 15;
    
    let nextDate = new Date(today.getFullYear(), today.getMonth(), payoutDay);
    if (nextDate <= today) {
      nextDate = addMonths(nextDate, 1);
    }
    
    return nextDate;
  }, [settings]);
  
  // Eligible members cho payout
  const eligibleForPayout = useMemo(() => {
    return members.filter(m => 
      m.status === 'active' &&
      (m.unpaid_commission || 0) >= (settings?.min_payout_amount || 100000)
    );
  }, [members, settings]);
  
  const totalUnpaid = eligibleForPayout.reduce((sum, m) => sum + (m.unpaid_commission || 0), 0);
  
  const handlePreview = () => {
    setPreviewData({
      members: eligibleForPayout,
      totalAmount: totalUnpaid,
      payoutDate: nextPayoutDate
    });
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon.Clock size={20} className="text-blue-600" />
            Lịch Thanh Toán Tự Động
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Auto Toggle */}
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
            <div>
              <Label className="font-medium">Thanh toán tự động</Label>
              <p className="text-sm text-gray-600">
                Hệ thống sẽ tự động thanh toán vào ngày {settings?.payout_day_of_month || 15} mỗi tháng
              </p>
            </div>
            <Switch
              checked={settings?.enable_auto_payout}
              onCheckedChange={onToggleAuto}
            />
          </div>
          
          {/* Next Payout Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Icon.Calendar size={16} className="text-blue-600" />
                <span className="text-xs text-gray-600">Ngày thanh toán</span>
              </div>
              <p className="text-lg font-bold text-blue-600">
                {format(nextPayoutDate, 'dd/MM/yyyy', { locale: vi })}
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Icon.Users size={16} className="text-green-600" />
                <span className="text-xs text-gray-600">Đủ điều kiện</span>
              </div>
              <p className="text-lg font-bold text-green-600">
                {eligibleForPayout.length}
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Icon.DollarSign size={16} className="text-amber-600" />
                <span className="text-xs text-gray-600">Tổng số tiền</span>
              </div>
              <p className="text-lg font-bold text-amber-600">
                {(totalUnpaid / 1000000).toFixed(1)}M
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Icon.Clock size={16} className="text-purple-600" />
                <span className="text-xs text-gray-600">Còn lại</span>
              </div>
              <p className="text-lg font-bold text-purple-600">
                {Math.ceil((nextPayoutDate - new Date()) / (1000 * 60 * 60 * 24))} ngày
              </p>
            </div>
          </div>
          
          {/* Preview Button */}
          <Button onClick={handlePreview} variant="outline" className="w-full">
            <Icon.Eye size={16} />
            Xem trước danh sách thanh toán
          </Button>
          
          {/* Preview List */}
          {previewData && (
            <div className="border rounded-xl p-4 space-y-3 max-h-96 overflow-auto">
              <div className="flex items-center justify-between pb-3 border-b">
                <h4 className="font-medium">Danh sách thanh toán</h4>
                <Badge className="bg-green-500 text-white">
                  {previewData.members.length} thành viên
                </Badge>
              </div>
              
              {previewData.members.map(m => (
                <div key={m.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{m.full_name}</p>
                    <p className="text-xs text-gray-500">{m.user_email}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      {(m.unpaid_commission || 0).toLocaleString('vi-VN')}đ
                    </p>
                    <p className="text-xs text-gray-500">{m.bank_name}</p>
                  </div>
                </div>
              ))}
              
              <div className="pt-3 border-t flex items-center justify-between">
                <span className="font-medium">Tổng cộng:</span>
                <span className="text-xl font-bold text-green-600">
                  {totalUnpaid.toLocaleString('vi-VN')}đ
                </span>
              </div>
            </div>
          )}
          
          {/* Warning */}
          {settings?.enable_auto_payout && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-700">
                <p className="font-medium mb-1">Lưu ý về thanh toán tự động:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Chỉ thanh toán cho thành viên có fraud score {'<'} 30</li>
                  <li>Yêu cầu thông tin ngân hàng đầy đủ</li>
                  <li>Tối thiểu {(settings?.min_payout_amount || 0).toLocaleString('vi-VN')}đ</li>
                  <li>Admin sẽ nhận thông báo trước 24h</li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}