/**
 * SocialLinksEditor - Quản lý social media links
 * UI Component
 */

import React, { useState } from 'react';
import { Icon } from '@/components/ui/AnimatedIcon';
import { useConfirmDialog } from '@/components/hooks/useConfirmDialog';

const SOCIAL_PLATFORMS = [
  { platform: 'facebook', label: 'Facebook', icon: 'Globe' },
  { platform: 'linkedin', label: 'LinkedIn', icon: 'Globe' },
  { platform: 'twitter', label: 'Twitter', icon: 'Globe' },
  { platform: 'instagram', label: 'Instagram', icon: 'Globe' },
  { platform: 'youtube', label: 'YouTube', icon: 'Globe' },
  { platform: 'tiktok', label: 'TikTok', icon: 'Globe' },
  { platform: 'zalo', label: 'Zalo', icon: 'Phone' },
  { platform: 'telegram', label: 'Telegram', icon: 'Phone' }
];

export default function SocialLinksEditor({ socialLinks = [], onChange }) {
  const [links, setLinks] = useState(socialLinks);
  const [isAdding, setIsAdding] = useState(false);
  const [newLink, setNewLink] = useState({ platform: 'facebook', url: '' });
  const { showConfirm } = useConfirmDialog();

  const handleAdd = () => {
    if (!newLink.url.trim()) return;
    
    const platform = SOCIAL_PLATFORMS.find(p => p.platform === newLink.platform);
    const updated = [...links, {
      platform: newLink.platform,
      url: newLink.url,
      icon: platform?.icon || 'Globe'
    }];
    
    setLinks(updated);
    onChange(updated);
    setNewLink({ platform: 'facebook', url: '' });
    setIsAdding(false);
  };

  const handleRemove = async (index) => {
    const confirmed = await showConfirm({
      title: 'Xóa liên kết',
      message: 'Bạn có chắc muốn xóa liên kết này?',
      type: 'warning',
      confirmText: 'Xóa'
    });

    if (confirmed) {
      const updated = links.filter((_, i) => i !== index);
      setLinks(updated);
      onChange(updated);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Liên kết mạng xã hội
        </label>
        <button
          type="button"
          onClick={() => setIsAdding(!isAdding)}
          className="text-sm text-[#7CB342] hover:text-[#689F38] flex items-center gap-1"
        >
          <Icon.Plus size={16} />
          Thêm
        </button>
      </div>

      {/* Existing Links */}
      <div className="space-y-2">
        {links.map((link, index) => {
          const platform = SOCIAL_PLATFORMS.find(p => p.platform === link.platform);
          return (
            <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
              <Icon.Globe size={16} className="text-gray-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{platform?.label || link.platform}</p>
                <p className="text-xs text-gray-500 truncate">{link.url}</p>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
              >
                <Icon.Trash size={16} className="text-red-600" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Add New Link */}
      {isAdding && (
        <div className="p-3 bg-blue-50 rounded-lg space-y-2">
          <select
            value={newLink.platform}
            onChange={(e) => setNewLink({ ...newLink, platform: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            {SOCIAL_PLATFORMS.map(p => (
              <option key={p.platform} value={p.platform}>{p.label}</option>
            ))}
          </select>
          
          <input
            type="url"
            value={newLink.url}
            onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
            placeholder="https://..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleAdd}
              className="flex-1 px-3 py-2 bg-[#7CB342] text-white rounded-lg text-sm hover:bg-[#689F38] transition-colors"
            >
              Thêm
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setNewLink({ platform: 'facebook', url: '' });
              }}
              className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300 transition-colors"
            >
              Hủy
            </button>
          </div>
        </div>
      )}

      {links.length === 0 && !isAdding && (
        <p className="text-sm text-gray-500 text-center py-3">
          Chưa có liên kết nào
        </p>
      )}
    </div>
  );
}