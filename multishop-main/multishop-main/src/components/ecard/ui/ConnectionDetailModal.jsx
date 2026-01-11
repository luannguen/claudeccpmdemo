/**
 * ConnectionDetailModal - View/Edit/Delete connection
 * Kế thừa EnhancedModal
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@/components/ui/AnimatedIcon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EnhancedModal from "@/components/EnhancedModal";
import { CARE_LEVEL_CONFIG } from "@/components/ecard";
import { useConfirmDialog } from "@/components/hooks/useConfirmDialog";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useToast } from "@/components/NotificationToast";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import ViewEcardModal from "./ViewEcardModal";
import ConnectionChatTab from "./ConnectionChatTab";
import { SendGiftModal } from "@/components/features/gift";
import { EcardShopSection } from "@/components/features/ecard";

export default function ConnectionDetailModal({ 
  isOpen, 
  onClose, 
  connection,
  onDeleted,
  initialTab = 'info' // Support opening directly to chat tab
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const { dialog, showConfirm, handleConfirm, handleCancel } = useConfirmDialog();
  
  const [isEditing, setIsEditing] = useState(false);
  const [showEcardModal, setShowEcardModal] = useState(false);
  const [showSendGiftModal, setShowSendGiftModal] = useState(false);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [editData, setEditData] = useState({
    care_level: connection?.care_level || 'normal',
    notes: connection?.notes || '',
    tags: connection?.tags?.join(', ') || ''
  });

  // Get current user
  const { data: currentUser } = useQuery({
    queryKey: ['current-user-connection-detail'],
    queryFn: () => base44.auth.me(),
    enabled: isOpen
  });

  // Fetch target's EcardProfile
  const { data: targetProfile } = useQuery({
    queryKey: ['target-ecard-profile', connection?.target_user_id],
    queryFn: async () => {
      if (!connection?.target_user_id) return null;
      const profiles = await base44.entities.EcardProfile.filter({ user_id: connection.target_user_id }, undefined, 1);
      return profiles?.[0] || null;
    },
    enabled: isOpen && !!connection?.target_user_id
  });

  // Check if target has posts
  const { data: targetPosts = [] } = useQuery({
    queryKey: ['target-posts', connection?.target_user_id],
    queryFn: async () => {
      if (!targetProfile?.created_by) return [];
      const posts = await base44.entities.UserPost.filter({ created_by: targetProfile.created_by, status: 'active' }, '-created_date', 3);
      return posts || [];
    },
    enabled: isOpen && !!targetProfile?.created_by
  });

  // Check if target has E-Card shop products (from EcardProfile.shop_products → Product entity)
  const { data: targetProducts = [] } = useQuery({
    queryKey: ['target-ecard-shop-products', targetProfile?.id],
    queryFn: async () => {
      if (!targetProfile?.shop_enabled || !targetProfile?.shop_products?.length) return [];
      const productIds = targetProfile.shop_products.map(p => p.product_id);
      const products = await Promise.all(
        productIds.map(async (id) => {
          const results = await base44.entities.Product.filter({ id });
          return results?.[0];
        })
      );
      return products.filter(p => p && p.status === 'active');
    },
    enabled: isOpen && !!targetProfile?.shop_enabled && targetProfile?.shop_products?.length > 0
  });

  const hasPosts = targetPosts.length > 0 && targetProfile?.show_posts !== false;
  const hasShop = targetProducts.length > 0 && targetProfile?.shop_enabled;
  const themeColor = targetProfile?.theme_color || '#7CB342';

  const handleViewPosts = () => {
    if (targetProfile?.public_url_slug) {
      navigate(createPageUrl(`Community?author=${targetProfile.public_url_slug}`));
      onClose();
    }
  };

  // E-Card shop hiển thị inline trong modal, không navigate ra ngoài
  const [showShopSection, setShowShopSection] = useState(false);

  // Reset/set tab when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab || 'info');
      setIsEditing(false);
    }
  }, [isOpen, initialTab]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data) => {
      return base44.entities.UserConnection.update(connection.id, {
        care_level: data.care_level,
        notes: data.notes,
        tags: data.tags.split(',').map(t => t.trim()).filter(Boolean),
        last_interaction_date: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userConnections'] });
      addToast('Đã cập nhật kết nối', 'success');
      setIsEditing(false);
    },
    onError: () => {
      addToast('Không thể cập nhật', 'error');
    }
  });

  // Delete mutation - uses repository function
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const user = await base44.auth.me();
      if (!user) throw new Error('NOT_AUTHENTICATED');
      
      // Import and use repository function
      const { deleteConnectionFull } = await import('../data/connectionRepository');
      return deleteConnectionFull(user.id, connection.target_user_id);
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['userConnections'] });
      queryClient.invalidateQueries({ queryKey: ['connection-messages'] });
      addToast(`Đã xóa kết nối${result.deletedMessages > 0 ? ` và ${result.deletedMessages} tin nhắn` : ''}`, 'success');
      onClose();
      onDeleted?.();
    },
    onError: (error) => {
      console.error('Delete connection error:', error);
      addToast('Không thể xóa kết nối', 'error');
    }
  });

  const handleDelete = async () => {
    const confirmed = await showConfirm({
      title: 'Xóa kết nối',
      message: `Bạn có chắc muốn xóa kết nối với ${connection?.target_name}? Hành động này không thể hoàn tác và sẽ xóa kết nối cả 2 phía.`,
      type: 'danger',
      confirmText: 'Xóa',
      cancelText: 'Hủy'
    });

    if (confirmed) {
      deleteMutation.mutate();
    }
  };

  const handleSave = () => {
    updateMutation.mutate(editData);
  };

  const handleViewProfile = () => {
    setShowEcardModal(true);
  };

  const careLevelInfo = CARE_LEVEL_CONFIG[connection?.care_level || 'normal'];

  if (!connection) return null;

  return (
    <>
      <EnhancedModal
        isOpen={isOpen}
        onClose={onClose}
        title={connection.target_name?.length > 30 ? connection.target_name.substring(0, 30) + '...' : connection.target_name}
        maxWidth="lg"
        showControls={true}
        enableDrag={true}
        positionKey="connection-detail"
      >
        {/* Custom Header with gradient */}
        <div className="bg-gradient-to-r from-[#7CB342] to-[#558B2F] p-6 text-white">
          <div className="flex items-center gap-4">
            {connection.target_avatar ? (
              <img
                src={connection.target_avatar}
                alt={connection.target_name}
                className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-4 border-white/30 flex-shrink-0"
              />
            ) : (
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/20 flex items-center justify-center text-2xl md:text-3xl font-bold flex-shrink-0">
                {connection.target_name?.charAt(0)?.toUpperCase()}
              </div>
            )}
            
            <div className="flex-1 min-w-0 overflow-hidden">
              <h2 className="text-lg md:text-2xl font-bold truncate" title={connection.target_name}>
                {connection.target_name}
              </h2>
              {connection.target_title && (
                <p className="text-white/90 text-sm md:text-base truncate" title={connection.target_title}>
                  {connection.target_title}
                </p>
              )}
              {connection.target_company && (
                <p className="text-white/70 text-xs md:text-sm truncate" title={connection.target_company}>
                  {connection.target_company}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Content with Tabs */}
        <div className="p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="info" className="flex items-center gap-2">
                <Icon.User size={16} />
                Thông tin
              </TabsTrigger>
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <Icon.MessageCircle size={16} />
                Nhắn tin
              </TabsTrigger>
              <TabsTrigger value="gift" className="flex items-center gap-2">
                <Icon.Gift size={16} />
                Gửi quà
              </TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="mt-0">
              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <Icon.Calendar size={20} className="text-[#7CB342] mx-auto mb-1" />
                  <p className="text-xs text-gray-500">Kết nối</p>
                  <p className="font-semibold text-sm">
                    {new Date(connection.connected_date).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <Icon.Gift size={20} className="text-pink-500 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">Quà tặng</p>
                  <p className="font-semibold text-sm">{connection.gift_count || 0}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <Icon.Star size={20} className="text-amber-500 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">Mức chăm sóc</p>
                  <p className="font-semibold text-sm">{careLevelInfo?.name}</p>
                </div>
              </div>

              {/* Hub Actions - Posts & Shop */}
              {(hasPosts || hasShop) && (
                <div className="flex flex-col gap-4 mb-6">
                <div className="flex justify-center gap-3">
                  {hasPosts && (
                    <button
                      onClick={handleViewPosts}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all hover:scale-105 shadow-sm"
                      style={{ 
                        backgroundColor: `${themeColor}15`, 
                        color: themeColor,
                        border: `1px solid ${themeColor}30`
                      }}
                    >
                      <Icon.FileText size={18} />
                      <span className="font-medium">Bài viết ({targetPosts.length})</span>
                    </button>
                  )}
                  {hasShop && (
                    <button
                      onClick={() => setShowShopSection(!showShopSection)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all hover:scale-105 shadow-sm"
                      style={{ 
                        backgroundColor: showShopSection ? themeColor : `${themeColor}15`, 
                        color: showShopSection ? 'white' : themeColor,
                        border: `1px solid ${themeColor}30`
                      }}
                    >
                      <Icon.Store size={18} />
                      <span className="font-medium">Gian hàng ({targetProducts.length})</span>
                      <Icon.ChevronDown size={14} className={`transition-transform ${showShopSection ? 'rotate-180' : ''}`} />
                    </button>
                  )}
                </div>
                
                {/* E-Card Shop Section - Inline */}
                {showShopSection && hasShop && targetProfile && (
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <EcardShopSection profile={targetProfile} themeColor={themeColor} />
                  </div>
                )}
                </div>
              )}

              {/* Edit Mode */}
              {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mức chăm sóc
                </label>
                <select
                  value={editData.care_level}
                  onChange={(e) => setEditData({ ...editData, care_level: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#7CB342] focus:border-transparent"
                >
                  <option value="normal">Normal - Bình thường</option>
                  <option value="vip">VIP - Quan trọng</option>
                  <option value="premium">Premium - Đặc biệt</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (phân cách bằng dấu phẩy)
                </label>
                <Input
                  value={editData.tags}
                  onChange={(e) => setEditData({ ...editData, tags: e.target.value })}
                  placeholder="Đồng nghiệp, Bạn thân, Khách hàng..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ghi chú
                </label>
                <Textarea
                  value={editData.notes}
                  onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                  placeholder="Ghi chú về người này..."
                  rows={4}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setIsEditing(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={updateMutation.isPending}
                  className="flex-1 bg-[#7CB342] hover:bg-[#689F38]"
                >
                  {updateMutation.isPending ? (
                    <Icon.Spinner className="mr-2" />
                  ) : (
                    <Icon.Save size={18} className="mr-2" />
                  )}
                  Lưu
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {connection.tags && connection.tags.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {connection.tags.map((tag, i) => (
                      <Badge key={i} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {connection.notes && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Ghi chú</p>
                  <div className="bg-gray-50 rounded-xl p-4 text-gray-700">
                    {connection.notes}
                  </div>
                </div>
              )}

              {connection.last_interaction_date && (
                <div className="text-sm text-gray-500">
                  Tương tác gần nhất: {new Date(connection.last_interaction_date).toLocaleDateString('vi-VN')}
                </div>
              )}

              <div className="text-sm text-gray-500 flex items-center gap-2">
                <Icon.Link size={14} />
                Kết nối qua: {connection.connection_method === 'qr_scan' ? 'Quét QR' : connection.connection_method}
              </div>
            </div>
          )}
            </TabsContent>

            <TabsContent value="chat" className="mt-0">
              <ConnectionChatTab 
                connection={connection} 
                currentUser={currentUser}
              />
            </TabsContent>

            <TabsContent value="gift" className="mt-0">
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-[#7CB342]/10 rounded-full flex items-center justify-center">
                  <Icon.Gift size={32} className="text-[#7CB342]" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Gửi quà tặng</h3>
                <p className="text-gray-500 mb-6 text-sm">
                  Tặng quà cho {connection.target_name} để thể hiện sự quan tâm
                </p>
                <Button 
                  onClick={() => setShowSendGiftModal(true)}
                  className="bg-[#7CB342] hover:bg-[#689F38]"
                >
                  <Icon.Gift size={18} className="mr-2" />
                  Chọn quà tặng
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer Actions - Only show on info tab */}
        {activeTab === 'info' && !isEditing && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="grid grid-cols-3 gap-3">
              <Button
                onClick={handleViewProfile}
                variant="outline"
                className="flex items-center justify-center gap-2"
              >
                <Icon.Eye size={18} />
                Xem E-Card
              </Button>
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                className="flex items-center justify-center gap-2"
              >
                <Icon.Edit size={18} />
                Sửa
              </Button>
              <Button
                onClick={handleDelete}
                variant="outline"
                disabled={deleteMutation.isPending}
                className="flex items-center justify-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
              >
                {deleteMutation.isPending ? (
                  <Icon.Spinner />
                ) : (
                  <Icon.Trash size={18} />
                )}
                Xóa
              </Button>
            </div>
          </div>
        )}
      </EnhancedModal>

      <ConfirmDialog 
        isOpen={dialog.isOpen}
        onClose={handleCancel}
        onConfirm={handleConfirm}
        title={dialog.title}
        message={dialog.message}
        confirmText={dialog.confirmText}
        cancelText={dialog.cancelText}
        type={dialog.type}
      />

      {/* View E-Card Modal */}
      <ViewEcardModal
        isOpen={showEcardModal}
        onClose={() => setShowEcardModal(false)}
        connection={connection}
      />

      {/* Send Gift Modal - New Gift Module */}
      <SendGiftModal
        isOpen={showSendGiftModal}
        onClose={() => setShowSendGiftModal(false)}
        connection={connection}
        onSent={() => {
          queryClient.invalidateQueries({ queryKey: ['userConnections'] });
          queryClient.invalidateQueries({ queryKey: ['sentGifts'] });
          addToast(`Đã gửi quà cho ${connection.target_name}!`, 'success');
        }}
      />
    </>
  );
}