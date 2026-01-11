/**
 * ReferralCampaigns - Campaign management for special bonuses
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/AnimatedIcon.jsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Plus, Calendar as CalendarIcon } from 'lucide-react';

function CampaignCard({ campaign, onEdit, onActivate, onDeactivate }) {
  const isActive = campaign.status === 'active';
  const isUpcoming = new Date(campaign.start_date) > new Date();
  const isExpired = new Date(campaign.end_date) < new Date();
  
  return (
    <Card className={`${isActive ? 'border-green-300 bg-green-50' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon.Gift size={20} className="text-amber-500" />
            <CardTitle className="text-lg">{campaign.name}</CardTitle>
          </div>
          <Badge className={
            isActive ? 'bg-green-500 text-white' :
            isUpcoming ? 'bg-blue-500 text-white' :
            isExpired ? 'bg-gray-400 text-white' :
            'bg-amber-500 text-white'
          }>
            {isActive ? 'Đang chạy' : isUpcoming ? 'Sắp diễn ra' : isExpired ? 'Đã kết thúc' : 'Tạm dừng'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">{campaign.description}</p>
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white rounded-lg p-3">
            <p className="text-xs text-gray-500">Bonus</p>
            <p className="text-lg font-bold text-amber-600">+{campaign.bonus_rate}%</p>
          </div>
          <div className="bg-white rounded-lg p-3">
            <p className="text-xs text-gray-500">Mục tiêu</p>
            <p className="text-lg font-bold text-blue-600">{campaign.target_referrals} GT</p>
          </div>
        </div>
        
        <div className="text-xs text-gray-500 space-y-1">
          <p>📅 {format(new Date(campaign.start_date), 'dd/MM/yyyy')} - {format(new Date(campaign.end_date), 'dd/MM/yyyy')}</p>
          <p>👥 {campaign.participants || 0} người tham gia</p>
        </div>
        
        <div className="flex gap-2 mt-4">
          <Button onClick={() => onEdit(campaign)} variant="outline" size="sm" className="flex-1">
            Chỉnh sửa
          </Button>
          {isActive ? (
            <Button onClick={() => onDeactivate(campaign)} variant="outline" size="sm" className="flex-1">
              Tạm dừng
            </Button>
          ) : (
            <Button onClick={() => onActivate(campaign)} size="sm" className="flex-1 bg-green-500 hover:bg-green-600">
              Kích hoạt
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function ReferralCampaigns({ campaigns = [], onCreateCampaign, onUpdateCampaign }) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    bonus_rate: 5,
    target_referrals: 5,
    start_date: new Date(),
    end_date: new Date(),
    status: 'draft'
  });
  
  const handleSubmit = () => {
    if (editingCampaign) {
      onUpdateCampaign({ ...editingCampaign, ...formData });
    } else {
      onCreateCampaign(formData);
    }
    setShowCreateDialog(false);
    setEditingCampaign(null);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Icon.Zap size={24} className="text-amber-500" />
            Campaign Đặc Biệt
          </h2>
          <p className="text-sm text-gray-500">Tạo campaign với bonus hấp dẫn</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="bg-amber-500 hover:bg-amber-600">
          <Plus className="w-4 h-4 mr-2" />
          Tạo Campaign
        </Button>
      </div>
      
      {campaigns.length === 0 ? (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <Icon.Gift size={48} className="mx-auto mb-4 opacity-30 text-gray-400" />
            <p className="text-gray-500">Chưa có campaign nào</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {campaigns.map(campaign => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              onEdit={(c) => {
                setEditingCampaign(c);
                setFormData(c);
                setShowCreateDialog(true);
              }}
              onActivate={(c) => onUpdateCampaign({ ...c, status: 'active' })}
              onDeactivate={(c) => onUpdateCampaign({ ...c, status: 'paused' })}
            />
          ))}
        </div>
      )}
      
      {/* Create/Edit Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingCampaign ? 'Chỉnh sửa' : 'Tạo'} Campaign</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Tên campaign</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Vd: Tết 2025 - Giới thiệu nhận x2"
              />
            </div>
            
            <div>
              <Label>Mô tả</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Mô tả chi tiết về campaign..."
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Bonus thêm (%)</Label>
                <Input
                  type="number"
                  min={0}
                  step={0.5}
                  value={formData.bonus_rate}
                  onChange={(e) => setFormData({ ...formData, bonus_rate: parseFloat(e.target.value) })}
                />
              </div>
              
              <div>
                <Label>Số khách mục tiêu</Label>
                <Input
                  type="number"
                  min={1}
                  value={formData.target_referrals}
                  onChange={(e) => setFormData({ ...formData, target_referrals: parseInt(e.target.value) })}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Ngày bắt đầu</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {format(formData.start_date, 'dd/MM/yyyy', { locale: vi })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <Calendar
                      mode="single"
                      selected={formData.start_date}
                      onSelect={(date) => setFormData({ ...formData, start_date: date })}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div>
                <Label>Ngày kết thúc</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {format(formData.end_date, 'dd/MM/yyyy', { locale: vi })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <Calendar
                      mode="single"
                      selected={formData.end_date}
                      onSelect={(date) => setFormData({ ...formData, end_date: date })}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Hủy</Button>
            <Button onClick={handleSubmit} className="bg-amber-500 hover:bg-amber-600">
              {editingCampaign ? 'Cập nhật' : 'Tạo Campaign'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}