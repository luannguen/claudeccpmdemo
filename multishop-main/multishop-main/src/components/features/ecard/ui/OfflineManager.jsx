/**
 * OfflineManager - Manage offline saved data
 * UI Layer - Presentation only
 * 
 * @module features/ecard/ui
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@/components/ui/AnimatedIcon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  useOfflineProfile,
  useOfflineStats,
  useNetworkStatus
} from '../hooks/useOfflineMode';
import { useToast } from '@/components/NotificationToast';
import { useConfirmDialog } from '@/components/hooks/useConfirmDialog';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

export default function OfflineManager() {
  const { savedProfiles, removeOfflineProfile, isSupported } = useOfflineProfile();
  const { stats, clearAll, refresh } = useOfflineStats();
  const { isOnline } = useNetworkStatus();
  const { addToast } = useToast();
  const { showConfirm, ConfirmDialogComponent } = useConfirmDialog();

  const handleRemove = async (id, name) => {
    const confirmed = await showConfirm({
      title: 'Xóa profile offline',
      message: `Xóa "${name}" khỏi danh sách offline?`,
      confirmText: 'Xóa'
    });

    if (confirmed) {
      const success = await removeOfflineProfile(id);
      if (success) {
        addToast('Đã xóa khỏi offline', 'success');
      }
    }
  };

  const handleClearAll = async () => {
    const confirmed = await showConfirm({
      title: 'Xóa tất cả dữ liệu offline',
      message: 'Điều này sẽ xóa tất cả profiles đã lưu và thay đổi chờ đồng bộ.',
      type: 'danger',
      confirmText: 'Xóa tất cả'
    });

    if (confirmed) {
      const success = await clearAll();
      if (success) {
        addToast('Đã xóa tất cả dữ liệu offline', 'success');
        refresh();
      }
    }
  };

  if (!isSupported) {
    return (
      <div className="bg-amber-50 rounded-xl p-6 text-center">
        <Icon.AlertCircle size={48} className="text-amber-500 mx-auto mb-3" />
        <h3 className="font-semibold text-amber-800 mb-2">
          Trình duyệt không hỗ trợ
        </h3>
        <p className="text-amber-600 text-sm">
          Tính năng offline cần IndexedDB. Vui lòng sử dụng trình duyệt mới hơn.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {ConfirmDialogComponent}

      {/* Status Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${isOnline ? 'bg-green-100' : 'bg-amber-100'}`}>
              {isOnline ? (
                <Icon.Wifi size={24} className="text-green-600" />
              ) : (
                <Icon.WifiOff size={24} className="text-amber-600" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {isOnline ? 'Đang online' : 'Đang offline'}
              </h3>
              <p className="text-sm text-gray-500">
                {isOnline 
                  ? 'Dữ liệu được đồng bộ real-time' 
                  : 'Đang dùng dữ liệu đã lưu'
                }
              </p>
            </div>
          </div>
          
          <Button variant="outline" size="sm" onClick={refresh}>
            <Icon.RefreshCw size={14} className="mr-1" />
            Làm mới
          </Button>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatItem
              icon="Folder"
              label="Profiles đã lưu"
              value={stats.savedProfiles || 0}
              color="blue"
            />
            <StatItem
              icon="Users"
              label="Connections"
              value={stats.savedConnections || 0}
              color="green"
            />
            <StatItem
              icon="Clock"
              label="Thay đổi chờ"
              value={stats.pendingActions || 0}
              color={stats.pendingActions > 0 ? 'amber' : 'gray'}
            />
            <StatItem
              icon="User"
              label="Profile của tôi"
              value={stats.hasMyProfile ? 'Đã lưu' : 'Chưa lưu'}
              color={stats.hasMyProfile ? 'green' : 'gray'}
            />
          </div>
        )}
      </div>

      {/* Saved Profiles */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon.Download size={20} className="text-[#7CB342]" />
            <h3 className="font-semibold text-gray-900">Profiles đã lưu offline</h3>
            <Badge variant="outline">{savedProfiles.length}</Badge>
          </div>
          
          {savedProfiles.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm"
              className="text-red-500 hover:text-red-700"
              onClick={handleClearAll}
            >
              <Icon.Trash size={14} className="mr-1" />
              Xóa tất cả
            </Button>
          )}
        </div>

        {savedProfiles.length === 0 ? (
          <div className="text-center py-12">
            <Icon.Folder size={48} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-2">Chưa có profile nào được lưu</p>
            <p className="text-sm text-gray-400">
              Khi xem profile, nhấn "Lưu offline" để xem khi không có mạng
            </p>
          </div>
        ) : (
          <div className="divide-y">
            <AnimatePresence>
              {savedProfiles.map((profile, idx) => (
                <SavedProfileRow
                  key={profile.id}
                  profile={profile}
                  index={idx}
                  onRemove={() => handleRemove(profile.id, profile.display_name)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="bg-blue-50 rounded-xl p-4">
        <div className="flex gap-3">
          <Icon.Lightbulb size={20} className="text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-800 mb-1">Mẹo sử dụng offline</h4>
            <ul className="text-sm text-blue-600 space-y-1">
              <li>• Lưu các profile quan trọng để xem khi không có mạng</li>
              <li>• Các thay đổi offline sẽ tự động đồng bộ khi có mạng</li>
              <li>• Dữ liệu offline được lưu trữ an toàn trên thiết bị</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatItem({ icon, label, value, color }) {
  const IconComponent = Icon[icon];
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    amber: 'bg-amber-100 text-amber-600',
    gray: 'bg-gray-100 text-gray-600'
  };

  return (
    <div className="text-center p-3 bg-gray-50 rounded-lg">
      <div className={`inline-flex p-2 rounded-lg ${colorClasses[color]} mb-2`}>
        {IconComponent && <IconComponent size={16} />}
      </div>
      <p className="text-lg font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}

function SavedProfileRow({ profile, index, onRemove }) {
  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  };

  const savedDate = profile._savedAt 
    ? new Date(profile._savedAt).toLocaleDateString('vi-VN')
    : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ delay: index * 0.05 }}
      className="p-4 hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12">
          <AvatarImage src={profile.profile_image_url} />
          <AvatarFallback className="bg-[#7CB342]/10 text-[#7CB342]">
            {getInitials(profile.display_name)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <Link 
            to={createPageUrl('EcardView') + `?slug=${profile.public_url_slug}`}
            className="font-medium text-gray-900 hover:text-[#7CB342] transition-colors"
          >
            {profile.display_name}
          </Link>
          <p className="text-sm text-gray-500 truncate">
            {profile.title_profession}
            {profile.company_name && ` • ${profile.company_name}`}
          </p>
          {savedDate && (
            <p className="text-xs text-gray-400 mt-1">
              Lưu ngày {savedDate}
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <Link to={createPageUrl('EcardView') + `?slug=${profile.public_url_slug}`}>
            <Button variant="outline" size="sm">
              <Icon.Eye size={14} />
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            size="sm"
            className="text-red-500 hover:text-red-700"
            onClick={onRemove}
          >
            <Icon.Trash size={14} />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export { StatItem, SavedProfileRow };