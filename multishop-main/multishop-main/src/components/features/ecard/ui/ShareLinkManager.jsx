/**
 * ShareLinkManager - Manage share links with analytics
 * UI Layer - Presentation only
 * 
 * @module features/ecard/ui
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@/components/ui/AnimatedIcon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useShareLinks, useShareLinkAnalytics } from '../hooks/useShareLinks';
import { useToast } from '@/components/NotificationToast';

const SOURCE_OPTIONS = [
  { value: 'facebook', label: 'Facebook' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'twitter', label: 'Twitter' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'email', label: 'Email' },
  { value: 'qr', label: 'QR Code' },
  { value: 'other', label: 'Khác' }
];

const MEDIUM_OPTIONS = [
  { value: 'social', label: 'Mạng xã hội' },
  { value: 'email', label: 'Email' },
  { value: 'print', label: 'In ấn' },
  { value: 'direct', label: 'Trực tiếp' }
];

export default function ShareLinkManager({ profileId, originalUrl }) {
  const { links, isLoading, createLink, deleteLink, buildShortUrl, isCreating } = useShareLinks(profileId);
  const { analytics } = useShareLinkAnalytics();
  const { addToast } = useToast();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newLinkData, setNewLinkData] = useState({
    title: '',
    utm_source: '',
    utm_medium: '',
    utm_campaign: ''
  });

  const handleCreate = async () => {
    if (!newLinkData.title) {
      addToast('Vui lòng nhập tên cho link', 'warning');
      return;
    }
    
    try {
      await createLink({
        profile_id: profileId,
        original_url: originalUrl,
        ...newLinkData
      });
      
      addToast('Tạo link thành công!', 'success');
      setShowCreateModal(false);
      setNewLinkData({ title: '', utm_source: '', utm_medium: '', utm_campaign: '' });
    } catch (err) {
      addToast('Không thể tạo link', 'error');
    }
  };

  const handleCopy = (shortCode) => {
    const url = buildShortUrl(shortCode);
    navigator.clipboard.writeText(url);
    addToast('Đã copy link!', 'success');
  };

  const handleDelete = async (id) => {
    try {
      await deleteLink(id);
      addToast('Đã xóa link', 'success');
    } catch (err) {
      addToast('Không thể xóa link', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Analytics Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard 
          icon="Link" 
          label="Tổng link" 
          value={analytics.totalLinks} 
          color="blue"
        />
        <StatsCard 
          icon="Eye" 
          label="Tổng click" 
          value={analytics.totalClicks} 
          color="green"
        />
        <StatsCard 
          icon="Users" 
          label="Unique clicks" 
          value={analytics.totalUniqueClicks} 
          color="purple"
        />
        <StatsCard 
          icon="TrendingUp" 
          label="Tỷ lệ unique" 
          value={analytics.totalClicks > 0 
            ? `${Math.round((analytics.totalUniqueClicks / analytics.totalClicks) * 100)}%`
            : '0%'
          } 
          color="amber"
        />
      </div>

      {/* Links List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Danh sách link</h3>
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="bg-[#7CB342] hover:bg-[#689F38] text-white"
          >
            <Icon.Plus size={16} className="mr-2" />
            Tạo link mới
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Icon.Spinner size={32} className="text-[#7CB342]" />
          </div>
        ) : links.length === 0 ? (
          <div className="text-center py-12">
            <Icon.Link size={48} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Chưa có link nào</p>
          </div>
        ) : (
          <div className="divide-y">
            <AnimatePresence>
              {links.map((link, idx) => (
                <LinkRow
                  key={link.id}
                  link={link}
                  index={idx}
                  shortUrl={buildShortUrl(link.short_code)}
                  onCopy={() => handleCopy(link.short_code)}
                  onDelete={() => handleDelete(link.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tạo link chia sẻ mới</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label>Tên link *</Label>
              <Input
                value={newLinkData.title}
                onChange={(e) => setNewLinkData({ ...newLinkData, title: e.target.value })}
                placeholder="VD: Link Facebook, Link email..."
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nguồn (Source)</Label>
                <Select 
                  value={newLinkData.utm_source}
                  onValueChange={(v) => setNewLinkData({ ...newLinkData, utm_source: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn nguồn" />
                  </SelectTrigger>
                  <SelectContent>
                    {SOURCE_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Phương tiện (Medium)</Label>
                <Select 
                  value={newLinkData.utm_medium}
                  onValueChange={(v) => setNewLinkData({ ...newLinkData, utm_medium: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn" />
                  </SelectTrigger>
                  <SelectContent>
                    {MEDIUM_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label>Campaign (tuỳ chọn)</Label>
              <Input
                value={newLinkData.utm_campaign}
                onChange={(e) => setNewLinkData({ ...newLinkData, utm_campaign: e.target.value })}
                placeholder="VD: winter_2026"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Hủy
            </Button>
            <Button 
              onClick={handleCreate}
              disabled={isCreating}
              className="bg-[#7CB342] hover:bg-[#689F38] text-white"
            >
              {isCreating ? <Icon.Spinner size={16} /> : 'Tạo link'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatsCard({ icon, label, value, color }) {
  const IconComponent = Icon[icon];
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    amber: 'bg-amber-50 text-amber-600'
  };
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className={`inline-flex p-2 rounded-lg ${colorClasses[color]} mb-2`}>
        {IconComponent && <IconComponent size={20} />}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}

function LinkRow({ link, index, shortUrl, onCopy, onDelete }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ delay: index * 0.05 }}
      className="p-4 hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-gray-900">{link.title || 'Không tên'}</span>
            {link.utm_source && (
              <Badge variant="outline" className="text-xs">
                {link.utm_source}
              </Badge>
            )}
          </div>
          
          <p className="text-sm text-[#7CB342] truncate">{shortUrl}</p>
          
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Icon.Eye size={14} />
              {link.click_count || 0} clicks
            </span>
            <span className="flex items-center gap-1">
              <Icon.Users size={14} />
              {link.unique_clicks || 0} unique
            </span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onCopy}>
            <Icon.Copy size={14} />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-red-500 hover:text-red-700"
            onClick={onDelete}
          >
            <Icon.Trash size={14} />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export { StatsCard, LinkRow };