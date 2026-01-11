import React from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@/components/ui/AnimatedIcon";
import { createPageUrl } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { VerificationBadges, PortfolioGallery, EcardShopSection } from "@/components/features/ecard";

export default function EcardPublicView({ profile, onConnect, isConnecting, isAuthenticated = true }) {
  const navigate = useNavigate();
  const SocialIcon = Icon.Globe;
  const themeColor = profile?.theme_color || '#7CB342';

  // Check if user has posts
  const { data: userPosts = [] } = useQuery({
    queryKey: ['user-posts-count', profile?.created_by],
    queryFn: async () => {
      if (!profile?.created_by) return [];
      const posts = await base44.entities.UserPost.filter({ created_by: profile.created_by, status: 'active' }, '-created_date', 3);
      return posts || [];
    },
    enabled: !!profile?.created_by && profile?.show_posts !== false
  });

  // Check if user has E-Card shop products (from EcardProfile.shop_products → Product entity)
  const { data: userProducts = [] } = useQuery({
    queryKey: ['user-ecard-shop-products', profile?.id],
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
    enabled: !!profile?.shop_enabled && profile?.shop_products?.length > 0
  });

  const hasPosts = userPosts.length > 0;
  const hasShop = userProducts.length > 0 && profile?.shop_enabled;

  const handleViewPosts = () => {
    navigate(createPageUrl(`Community?author=${profile.public_url_slug}`));
  };

  const handleViewShop = () => {
    navigate(createPageUrl(`ShopPublicStorefront?slug=${profile.public_url_slug}`));
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl mx-auto">
      {/* Theme color accent */}
      <style>{`:root { --ecard-primary: ${themeColor}; }`}</style>

      {/* Avatar */}
      <div className="flex justify-center mb-6">
        {profile.profile_image_url ? (
          <img
            src={profile.profile_image_url}
            alt={profile.display_name}
            className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
          />
        ) : (
          <div 
            className="w-32 h-32 rounded-full flex items-center justify-center text-white text-4xl font-bold"
            style={{ background: `linear-gradient(135deg, ${themeColor}, ${adjustColor(themeColor, -30)})` }}
          >
            {profile.display_name?.charAt(0)}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <h1 className="text-3xl font-bold text-gray-900">{profile.display_name}</h1>
          {/* Verification Badge */}
          {profile.verification_status === 'verified' && (
            <VerificationBadges 
              badges={profile.verification_badges} 
              status={profile.verification_status}
              compact
            />
          )}
        </div>
        {profile.title_profession && (
          <p className="text-lg text-gray-600 mb-1">{profile.title_profession}</p>
        )}
        {profile.company_name && (
          <p className="text-gray-500">{profile.company_name}</p>
        )}
      </div>

      {profile.bio && (
        <p className="text-center text-gray-600 mb-6 italic">"{profile.bio}"</p>
      )}

      {/* Quick Actions - Posts & Shop */}
      {(hasPosts || hasShop) && (
        <div className="flex gap-3 justify-center mb-6">
          {hasPosts && profile?.show_posts !== false && (
            <button
              onClick={handleViewPosts}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-colors text-sm font-medium"
              style={{ 
                backgroundColor: `${themeColor}15`, 
                color: themeColor 
              }}
            >
              <Icon.FileText size={18} />
              Bài viết ({userPosts.length})
            </button>
          )}
          {hasShop && profile?.show_shop !== false && (
            <button
              onClick={handleViewShop}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-colors text-sm font-medium"
              style={{ 
                backgroundColor: `${themeColor}15`, 
                color: themeColor 
              }}
            >
              <Icon.Store size={18} />
              Gian hàng ({userProducts.length})
            </button>
          )}
        </div>
      )}

      {/* Contact */}
      {profile?.show_contact !== false && (
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {profile.phone && <ContactCard icon="Phone" label="Điện thoại" value={profile.phone} themeColor={themeColor} />}
          {profile.email && <ContactCard icon="Mail" label="Email" value={profile.email} themeColor={themeColor} />}
          {profile.website && <ContactCard icon="Globe" label="Website" value={profile.website} themeColor={themeColor} />}
          {profile.address && <ContactCard icon="MapPin" label="Địa chỉ" value={profile.address} themeColor={themeColor} />}
        </div>
      )}

      {/* Social Links */}
      {profile.social_links && profile.social_links.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-bold text-gray-900 mb-3">Mạng xã hội</h3>
          <div className="grid grid-cols-2 gap-2">
            {profile.social_links.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <SocialIcon size={16} style={{ color: themeColor }} />
                <span className="text-sm font-medium text-gray-700">{link.platform}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Custom Fields */}
      {profile.custom_fields && profile.custom_fields.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-bold text-gray-900 mb-3">Thông tin khác</h3>
          <div className="space-y-2">
            {profile.custom_fields.map((field, index) => {
              const FieldIcon = Icon[field.icon] || Icon.Info;
              return (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <FieldIcon size={16} style={{ color: themeColor }} />
                  <div>
                    <p className="text-xs text-gray-500">{field.label}</p>
                    <p className="text-sm font-medium text-gray-900">{field.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Portfolio Gallery - Public View */}
      <PortfolioGallery profileId={profile.id} themeColor={themeColor} maxItems={4} />

      {/* Shop Section - ECARD-F16 */}
      <EcardShopSection profile={profile} themeColor={themeColor} />

      {/* Connect Button */}
      <button
        onClick={onConnect}
        disabled={isConnecting}
        className="w-full py-4 text-white rounded-xl font-bold text-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        style={{ backgroundColor: themeColor }}
      >
        {isConnecting ? (
          <>
            <Icon.Spinner size={24} />
            Đang kết nối...
          </>
        ) : isAuthenticated ? (
          <>
            <Icon.UserPlus size={24} />
            Kết nối ngay
          </>
        ) : (
          <>
            <Icon.User size={24} />
            Đăng nhập để kết nối
          </>
        )}
      </button>
      
      {/* Guest hint */}
      {!isAuthenticated && (
        <p className="text-center text-sm text-gray-500 mt-3">
          Đăng nhập để lưu kết nối. Kết nối sẽ tự động hoàn tất sau khi đăng nhập.
        </p>
      )}
    </div>
  );
}

// Helper to darken/lighten color
function adjustColor(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + percent));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + percent));
  const b = Math.min(255, Math.max(0, (num & 0x0000FF) + percent));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

function ContactCard({ icon, label, value, themeColor = '#7CB342' }) {
  const CardIcon = Icon[icon];
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
      <CardIcon size={20} style={{ color: themeColor }} />
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-900">{value}</p>
      </div>
    </div>
  );
}