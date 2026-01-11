/**
 * ViewEcardModal - Xem E-Card của connection trong modal
 * Kế thừa EnhancedModal theo AI-CODING-RULES
 * 
 * Features:
 * - Hiển thị E-Card với template/theme đã thiết kế
 * - KHÔNG có nút kết nối (đã kết nối rồi)
 * - Có nút liên hệ nhanh (gọi, email, website)
 * - Responsive, touch-friendly
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Icon } from "@/components/ui/AnimatedIcon";
import EnhancedModal from "@/components/EnhancedModal";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { EcardShopSection } from "@/components/features/ecard";

const TEMPLATE_STYLES = {
  minimal: {
    bg: 'bg-white',
    text: 'text-gray-900',
    accent: 'text-[#7CB342]',
    border: 'border-gray-200',
    cardBg: 'bg-gray-50'
  },
  nature: {
    bg: 'bg-gradient-to-br from-green-50 to-green-100',
    text: 'text-green-900',
    accent: 'text-green-600',
    border: 'border-green-300',
    cardBg: 'bg-white/80'
  },
  professional: {
    bg: 'bg-gradient-to-br from-blue-50 to-indigo-50',
    text: 'text-indigo-900',
    accent: 'text-blue-600',
    border: 'border-blue-300',
    cardBg: 'bg-white/80'
  },
  creative: {
    bg: 'bg-gradient-to-br from-purple-50 to-pink-50',
    text: 'text-purple-900',
    accent: 'text-pink-600',
    border: 'border-purple-300',
    cardBg: 'bg-white/80'
  },
  elegant: {
    bg: 'bg-gradient-to-br from-amber-50 to-orange-50',
    text: 'text-orange-900',
    accent: 'text-amber-600',
    border: 'border-amber-300',
    cardBg: 'bg-white/80'
  }
};

const THEME_OVERRIDES = {
  dark: {
    bg: 'bg-gray-900',
    text: 'text-white',
    accent: 'text-[#7CB342]',
    cardBg: 'bg-gray-800',
    border: 'border-gray-700'
  },
  green: {
    bg: 'bg-green-900',
    text: 'text-green-50',
    accent: 'text-green-300',
    cardBg: 'bg-green-800',
    border: 'border-green-700'
  }
};

export default function ViewEcardModal({ isOpen, onClose, connection }) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showShopSection, setShowShopSection] = useState(false);

  // Fetch full profile when modal opens
  useEffect(() => {
    if (isOpen && connection?.target_user_id) {
      fetchProfile();
    }
  }, [isOpen, connection?.target_user_id]);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const profiles = await base44.entities.EcardProfile.filter({
        user_id: connection.target_user_id
      });
      if (profiles.length > 0) {
        setProfile(profiles[0]);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user has posts
  const { data: userPosts = [] } = useQuery({
    queryKey: ['view-ecard-posts', connection?.target_user_id],
    queryFn: async () => {
      if (!connection?.target_user_id) return [];
      // Find profile email first
      const profiles = await base44.entities.EcardProfile.filter({ user_id: connection.target_user_id });
      if (!profiles.length) return [];
      const createdBy = profiles[0].created_by;
      if (!createdBy) return [];
      const posts = await base44.entities.UserPost.filter({ created_by: createdBy, status: 'active' }, '-created_date', 3);
      return posts || [];
    },
    enabled: isOpen && !!connection?.target_user_id
  });

  // Check if user has E-Card shop products (from EcardProfile.shop_products → Product entity)
  const { data: userProducts = [] } = useQuery({
    queryKey: ['view-ecard-shop-products', profile?.id],
    queryFn: async () => {
      if (!profile?.shop_enabled || !profile?.shop_products?.length) return [];
      const productIds = profile.shop_products.map(p => p.product_id);
      const products = await Promise.all(
        productIds.map(async (id) => {
          const results = await base44.entities.Product.filter({ id });
          return results?.[0];
        })
      );
      return products.filter(p => p && p.status === 'active');
    },
    enabled: isOpen && !!profile?.shop_enabled && profile?.shop_products?.length > 0
  });

  const hasPosts = userPosts.length > 0;
  const hasShop = userProducts.length > 0 && profile?.shop_enabled;

  const handleViewPosts = () => {
    if (profile?.public_url_slug) {
      navigate(createPageUrl(`Community?author=${profile.public_url_slug}`));
      onClose();
    }
  };

  // E-Card shop hiển thị inline, không navigate ra ngoài

  if (!connection) return null;

  const themeColor = profile?.theme_color || '#7CB342';
  const templateStyle = TEMPLATE_STYLES[profile?.template || 'minimal'];
  const themeOverride = profile?.theme && profile.theme !== 'light' ? THEME_OVERRIDES[profile.theme] : null;
  const style = themeOverride || templateStyle;

  return (
    <EnhancedModal
      isOpen={isOpen}
      onClose={onClose}
      title={`E-Card - ${connection.target_name?.length > 25 ? connection.target_name.substring(0, 25) + '...' : connection.target_name}`}
      maxWidth="lg"
      showControls={true}
      enableDrag={false}
      positionKey="view-ecard-modal"
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Icon.Spinner size={48} />
        </div>
      ) : profile ? (
        <div className={`${style.bg} min-h-[400px]`}>
          {/* E-Card Content */}
          <div className="p-6 md:p-8">
            {/* Avatar */}
            <div className="flex justify-center mb-6">
              {profile.profile_image_url ? (
                <img
                  src={profile.profile_image_url}
                  alt={profile.display_name}
                  className="w-28 h-28 md:w-36 md:h-36 rounded-full object-cover border-4 border-white shadow-xl"
                />
              ) : (
                <div className="w-28 h-28 md:w-36 md:h-36 rounded-full bg-gradient-to-br from-[#7CB342] to-[#558B2F] flex items-center justify-center text-white text-4xl md:text-5xl font-bold shadow-xl">
                  {profile.display_name?.charAt(0)?.toUpperCase()}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="text-center mb-6">
              <h2 className={`text-2xl md:text-3xl font-bold ${style.text} mb-2`}>
                {profile.display_name}
              </h2>
              {profile.title_profession && (
                <p className={`text-lg ${style.accent} mb-1 font-medium`}>
                  {profile.title_profession}
                </p>
              )}
              {profile.company_name && (
                <p className={`${style.text} opacity-70`}>
                  {profile.company_name}
                </p>
              )}
            </div>

            {profile.bio && (
              <p className={`text-center ${style.text} opacity-80 mb-6 italic max-w-md mx-auto`}>
                "{profile.bio}"
              </p>
            )}

            {/* Quick Hub Actions - Posts & Shop */}
            {(hasPosts || hasShop) && (
              <div className="flex flex-col gap-4 mb-6">
              <div className="flex justify-center gap-3">
                {hasPosts && profile?.show_posts !== false && (
                  <button
                    onClick={handleViewPosts}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all hover:scale-105 shadow-sm"
                    style={{ 
                      backgroundColor: `${themeColor}20`, 
                      color: themeColor,
                      border: `1px solid ${themeColor}30`
                    }}
                  >
                    <Icon.FileText size={18} />
                    <span className="font-medium">Bài viết ({userPosts.length})</span>
                  </button>
                )}
                {hasShop && (
                  <button
                    onClick={() => setShowShopSection(!showShopSection)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all hover:scale-105 shadow-sm"
                    style={{ 
                      backgroundColor: showShopSection ? themeColor : `${themeColor}20`, 
                      color: showShopSection ? 'white' : themeColor,
                      border: `1px solid ${themeColor}30`
                    }}
                  >
                    <Icon.Store size={18} />
                    <span className="font-medium">Gian hàng ({userProducts.length})</span>
                    <Icon.ChevronDown size={14} className={`transition-transform ${showShopSection ? 'rotate-180' : ''}`} />
                  </button>
                )}
              </div>
              
              {/* E-Card Shop Section - Inline */}
              {showShopSection && hasShop && profile && (
                <div className={`${style.cardBg} rounded-xl p-4 border ${style.border}`}>
                  <EcardShopSection profile={profile} themeColor={themeColor} />
                </div>
              )}
              </div>
            )}

            {/* Quick Contact Actions */}
            <div className="flex justify-center gap-3 mb-6">
              {profile.phone && (
                <a
                  href={`tel:${profile.phone}`}
                  className={`flex items-center gap-2 px-4 py-2 ${style.cardBg} rounded-xl ${style.accent} font-medium hover:scale-105 transition-transform shadow-md`}
                >
                  <Icon.Phone size={18} />
                  <span className="hidden sm:inline">Gọi điện</span>
                </a>
              )}
              {profile.email && (
                <a
                  href={`mailto:${profile.email}`}
                  className={`flex items-center gap-2 px-4 py-2 ${style.cardBg} rounded-xl ${style.accent} font-medium hover:scale-105 transition-transform shadow-md`}
                >
                  <Icon.Mail size={18} />
                  <span className="hidden sm:inline">Email</span>
                </a>
              )}
              {profile.website && (
                <a
                  href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2 px-4 py-2 ${style.cardBg} rounded-xl ${style.accent} font-medium hover:scale-105 transition-transform shadow-md`}
                >
                  <Icon.Globe size={18} />
                  <span className="hidden sm:inline">Website</span>
                </a>
              )}
            </div>

            {/* Contact Details */}
            <div className="space-y-3 mb-6">
              {profile.phone && (
                <ContactItem icon="Phone" label="Điện thoại" value={profile.phone} style={style} />
              )}
              {profile.email && (
                <ContactItem icon="Mail" label="Email" value={profile.email} style={style} />
              )}
              {profile.website && (
                <ContactItem icon="Globe" label="Website" value={profile.website} style={style} />
              )}
              {profile.address && (
                <ContactItem icon="MapPin" label="Địa chỉ" value={profile.address} style={style} />
              )}
            </div>

            {/* Social Links */}
            {profile.social_links && profile.social_links.length > 0 && (
              <div className="mb-6">
                <p className={`text-sm ${style.text} opacity-60 mb-3 text-center`}>Mạng xã hội</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {profile.social_links.map((link, index) => (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`px-4 py-2 ${style.cardBg} rounded-lg ${style.accent} font-medium text-sm hover:scale-105 transition-transform shadow-sm`}
                    >
                      {link.platform}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Fields */}
            {profile.custom_fields && profile.custom_fields.length > 0 && (
              <div className="space-y-2 mb-6">
                {profile.custom_fields.map((field, index) => {
                  const FieldIcon = Icon[field.icon] || Icon.Info;
                  return (
                    <div key={index} className={`flex items-center gap-3 p-3 ${style.cardBg} rounded-lg`}>
                      <FieldIcon size={16} className={style.accent} />
                      <div>
                        <span className={`text-xs ${style.text} opacity-60`}>{field.label}: </span>
                        <span className={`text-sm font-medium ${style.text}`}>{field.value}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* QR Code */}
            {profile.qr_code_url && (
              <div className="text-center mb-6">
                <p className={`text-xs ${style.text} opacity-60 mb-3`}>Chia sẻ E-Card</p>
                <img
                  src={profile.qr_code_url}
                  alt="QR Code"
                  className={`w-32 h-32 mx-auto rounded-xl border-2 ${style.border} shadow-md`}
                />
              </div>
            )}

            {/* Connection Info Footer */}
            <div className={`text-center pt-4 border-t ${style.border}`}>
              <p className={`text-xs ${style.text} opacity-50`}>
                Đã kết nối từ {new Date(connection.connected_date).toLocaleDateString('vi-VN')}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Icon.AlertCircle size={48} className="text-gray-300 mb-4" />
          <p className="text-gray-600">Không thể tải E-Card</p>
          <p className="text-sm text-gray-400">Người dùng chưa tạo E-Card hoặc đã ẩn profile</p>
        </div>
      )}
    </EnhancedModal>
  );
}

function ContactItem({ icon, label, value, style }) {
  const ContactIcon = Icon[icon];
  return (
    <div className={`flex items-center gap-3 p-3 ${style.cardBg} rounded-lg`}>
      <ContactIcon size={18} className={style.accent} />
      <div className="min-w-0 flex-1">
        <p className={`text-xs ${style.text} opacity-60`}>{label}</p>
        <p className={`text-sm font-medium ${style.text} truncate`}>{value}</p>
      </div>
    </div>
  );
}