/**
 * AdminEcardDetailModal - Full profile view for admin
 * UI Layer - Uses EnhancedModal
 * 
 * @module admin/ecards
 */

import React, { useState } from 'react';
import EnhancedModal from '@/components/EnhancedModal';
import { Icon } from '@/components/ui/AnimatedIcon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/NotificationToast';

export default function AdminEcardDetailModal({ isOpen, onClose, profile }) {
  const [activeTab, setActiveTab] = useState('info');
  const { addToast } = useToast();

  // Fetch connections for this profile
  const { data: connections = [], isLoading: loadingConnections } = useQuery({
    queryKey: ['admin-profile-connections', profile?.user_id],
    queryFn: async () => {
      const result = await base44.entities.UserConnection.filter({
        initiator_user_id: profile.user_id
      }, '-created_date', 100);
      return result || [];
    },
    enabled: !!profile?.user_id && isOpen
  });

  // Fetch gifts
  const { data: gifts = [], isLoading: loadingGifts } = useQuery({
    queryKey: ['admin-profile-gifts', profile?.user_id],
    queryFn: async () => {
      const result = await base44.entities.GiftTransaction.filter({
        receiver_user_id: profile.user_id
      }, '-created_date', 50);
      return result || [];
    },
    enabled: !!profile?.user_id && isOpen
  });

  if (!profile) return null;

  const handleCopyLink = () => {
    const url = `${window.location.origin}/ecard-view?slug=${profile.public_url_slug}`;
    navigator.clipboard.writeText(url);
    addToast('Đã sao chép link E-Card', 'success');
  };

  return (
    <EnhancedModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Chi tiết: ${profile.display_name}`}
      maxWidth="3xl"
    >
      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="info" className="gap-1.5">
              <Icon.User size={14} />
              Thông tin
            </TabsTrigger>
            <TabsTrigger value="connections" className="gap-1.5">
              <Icon.Users size={14} />
              Kết nối ({connections.length})
            </TabsTrigger>
            <TabsTrigger value="gifts" className="gap-1.5">
              <Icon.Gift size={14} />
              Quà tặng ({gifts.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Profile Preview */}
              <div className="bg-gray-50 rounded-xl p-6 text-center">
                {profile.profile_image_url ? (
                  <img
                    src={profile.profile_image_url}
                    alt={profile.display_name}
                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover ring-4 ring-white shadow-lg"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#7CB342] to-[#558B2F] mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold ring-4 ring-white shadow-lg">
                    {profile.display_name?.charAt(0)}
                  </div>
                )}
                <h3 className="text-xl font-bold text-gray-900">{profile.display_name}</h3>
                <p className="text-gray-600">{profile.title_profession || '-'}</p>
                <p className="text-gray-500 text-sm">{profile.company_name || '-'}</p>
                
                <div className="flex justify-center gap-2 mt-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    profile.is_public ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {profile.is_public ? 'Công khai' : 'Riêng tư'}
                  </span>
                  {profile.verification_status === 'verified' && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 flex items-center gap-1">
                      <Icon.CheckCircle size={12} />
                      Đã xác thực
                    </span>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyLink}
                  className="mt-4 gap-1.5"
                >
                  <Icon.Link size={14} />
                  Sao chép link
                </Button>
              </div>

              {/* Details */}
              <div className="space-y-3">
                <InfoRow label="User ID" value={profile.user_id} />
                <InfoRow label="Email" value={profile.email} />
                <InfoRow label="SĐT" value={profile.phone} />
                <InfoRow label="Website" value={profile.website} />
                <InfoRow label="Slug" value={profile.public_url_slug} />
                <InfoRow label="Lượt xem" value={profile.view_count || 0} />
                <InfoRow label="Lượt share" value={profile.share_count || 0} />
                <InfoRow label="Ngày tạo" value={new Date(profile.created_date).toLocaleDateString('vi-VN')} />
                <InfoRow label="Cập nhật" value={new Date(profile.updated_date).toLocaleDateString('vi-VN')} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="connections">
            {loadingConnections ? (
              <div className="flex justify-center py-8">
                <Icon.Spinner size={32} />
              </div>
            ) : connections.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Icon.Users size={48} className="mx-auto mb-2 text-gray-300" />
                <p>Chưa có kết nối nào</p>
              </div>
            ) : (
              <div className="max-h-[400px] overflow-y-auto space-y-2">
                {connections.map(conn => (
                  <div key={conn.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {conn.target_avatar ? (
                        <img src={conn.target_avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <Icon.User size={18} className="text-gray-500" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{conn.target_name || 'Unknown'}</p>
                        <p className="text-xs text-gray-500">
                          {conn.care_level} • {conn.connection_method}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(conn.created_date).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="gifts">
            {loadingGifts ? (
              <div className="flex justify-center py-8">
                <Icon.Spinner size={32} />
              </div>
            ) : gifts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Icon.Gift size={48} className="mx-auto mb-2 text-gray-300" />
                <p>Chưa có giao dịch quà tặng</p>
              </div>
            ) : (
              <div className="max-h-[400px] overflow-y-auto space-y-2">
                {gifts.map(gift => (
                  <div key={gift.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                        <Icon.Gift size={18} className="text-amber-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{gift.product_name || 'Quà tặng'}</p>
                        <p className="text-xs text-gray-500">
                          Từ: {gift.sender_name || 'Anonymous'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {gift.amount?.toLocaleString('vi-VN')}đ
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(gift.created_date).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </EnhancedModal>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between py-2 border-b border-gray-100">
      <span className="text-gray-500 text-sm">{label}</span>
      <span className="font-medium text-gray-900 text-sm truncate max-w-[60%]">{value || '-'}</span>
    </div>
  );
}