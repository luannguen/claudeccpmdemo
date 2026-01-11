import React, { useState, useRef } from "react";
import { Icon } from "@/components/ui/AnimatedIcon";
import { useEcardProfile } from "@/components/ecard";
import { useNetworkStatus } from "@/components/features/ecard/hooks/useOfflineMode";
import EcardProfileForm from "./EcardProfileForm";
import EcardPreview from "./EcardPreview";
import EcardStatsDashboard from "./EcardStatsDashboard";
import EcardThemeSwitcher from "./EcardThemeSwitcher";
import EcardTemplateGallery from "./EcardTemplateGallery";
import QuickActionsBar from "./QuickActionsBar";
import EcardLiveShowModal from "./EcardLiveShowModal";
import DownloadEcardButton from "./DownloadEcardButton";
import { useToast } from "@/components/NotificationToast";
import ExperienceSettingsCard from "@/components/features/ecard/ui/ExperienceSettingsCard";
import EcardExtensionsPanel from "@/components/features/ecard/ui/EcardExtensionsPanel";
import { 
  useEcardCache, 
  EcardAnalyticsDashboard, 
  BirthdayWidget,
  VerificationBadges,
  ShareLinkManager,
  PortfolioManager,
  EcardShopManager 
} from "@/components/features/ecard";
import ThemePreviewStyles from "@/components/features/ecard/ui/ThemePreviewStyles";

export default function EcardProfileTab({ profile, isLoading }) {
  // Use cached stats instead of direct fetch
  const { stats } = useEcardCache();
  const { isOffline } = useNetworkStatus();
  const [isEditing, setIsEditing] = useState(false);
  const [showTemplateGallery, setShowTemplateGallery] = useState(false);
  const [showLiveShow, setShowLiveShow] = useState(false);
  const [activeSection, setActiveSection] = useState(null); // 'portfolio', 'sharelinks', null
  const previewRef = useRef(null);
  const { updateProfile, updateProfileAsync, isUpdating } = useEcardProfile();
  const { addToast } = useToast();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Icon.Spinner size={40} className="text-[#7CB342]" />
        <p className="text-gray-500 text-sm mt-3">Đang tải thông tin...</p>
      </div>
    );
  }

  // Show offline message if no profile data available
  if (!profile && isOffline) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-4">
          <Icon.WifiOff size={40} className="text-amber-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Không có kết nối internet</h3>
        <p className="text-gray-600 mb-4 max-w-md">
          Vui lòng kiểm tra kết nối mạng của bạn và thử lại.
        </p>
      </div>
    );
  }

  // Show loading state if profile not ready yet
  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Icon.Spinner size={40} className="text-[#7CB342]" />
        <p className="text-gray-500 text-sm mt-3">Đang tải hồ sơ...</p>
      </div>
    );
  }

  const handleSave = async (updates) => {
    if (!profile?.id) {
      addToast('Không tìm thấy profile để cập nhật', 'error');
      return;
    }
    
    if (isOffline) {
      addToast('Không thể cập nhật khi offline. Vui lòng kiểm tra kết nối.', 'warning');
      return;
    }
    
    try {
      await updateProfileAsync({ profileId: profile.id, updates });
      setIsEditing(false);
    } catch (err) {
      // Error already handled by mutation onError
    }
  };

  const handleShare = async () => {
    const shareUrl = window.location.origin + `/ecard-view?slug=${profile.public_url_slug}`;
    
    if (navigator.share && navigator.canShare) {
      try {
        await navigator.share({
          title: `E-Card - ${profile.display_name}`,
          text: `Xem E-Card của ${profile.display_name}`,
          url: shareUrl
        });
        updateProfile({ 
          profileId: profile.id, 
          updates: { share_count: (profile.share_count || 0) + 1 } 
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          navigator.clipboard.writeText(shareUrl);
          addToast('Đã sao chép link E-Card', 'success');
        }
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      addToast('Đã sao chép link E-Card', 'success');
    }
  };

  const handleThemeChange = (theme) => {
    if (isOffline) {
      addToast('Không thể thay đổi giao diện khi offline', 'warning');
      return;
    }
    updateProfile({ profileId: profile.id, updates: { theme } });
  };

  const handleTemplateChange = (template) => {
    if (isOffline) {
      addToast('Không thể thay đổi template khi offline', 'warning');
      return;
    }
    updateProfile({ profileId: profile.id, updates: { template } });
    setShowTemplateGallery(false);
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/ecard-view?slug=${profile.public_url_slug}`;
    navigator.clipboard.writeText(url);
    addToast('Đã sao chép link E-Card', 'success');
  };

  const handleBirthdayWish = (connection) => {
    addToast(`Gửi lời chúc sinh nhật tới ${connection.target_name}`, 'info');
    // TODO: Implement birthday wish modal/flow
  };

  const handleToggleShop = (enabled) => {
    if (isOffline) {
      addToast('Không thể thay đổi khi offline', 'warning');
      return;
    }
    updateProfile({ profileId: profile.id, updates: { shop_enabled: enabled } });
  };

  return (
    <div className="space-y-4">
      <ThemePreviewStyles color={profile?.theme_color || '#7CB342'} />
      {/* Verification Badge + Stats Bar */}
      {profile && (
        <div className="flex items-center gap-4 mb-2">
          <VerificationBadges 
            badges={profile?.verification_badges || []} 
            status={profile?.verification_status || 'unverified'}
            showRequestButton
            profileId={profile?.id}
          />
        </div>
      )}
      
      {/* Stats Bar - Compact */}
      <EcardStatsDashboard profile={profile} />

      {/* Analytics Dashboard */}
      <EcardAnalyticsDashboard compact />

      {/* Birthday Widget */}
      <BirthdayWidget onSendWish={handleBirthdayWish} maxItems={3} />

      {/* Feature Sections - Portfolio & Share Links */}
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveSection(activeSection === 'portfolio' ? null : 'portfolio')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
              activeSection === 'portfolio'
                ? 'bg-[#7CB342] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Icon.Briefcase size={18} />
            Portfolio
          </button>
          <button
            onClick={() => setActiveSection(activeSection === 'sharelinks' ? null : 'sharelinks')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
              activeSection === 'sharelinks'
                ? 'bg-[#7CB342] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Icon.Share size={18} />
            Share Links
          </button>
        </div>

        {activeSection === 'portfolio' && (
          <PortfolioManager profileId={profile.id} />
        )}

        {activeSection === 'sharelinks' && (
          <ShareLinkManager profileId={profile.id} profileSlug={profile.public_url_slug} />
        )}
      </div>

      {/* Shop Manager - ECARD-F16 */}
      <EcardShopManager 
        profileId={profile.id} 
        shopEnabled={profile.shop_enabled} 
        onToggle={handleToggleShop}
      />

      {/* Main Content - 2 columns on desktop */}
      <div className="grid lg:grid-cols-5 gap-4">
        {/* Left: Preview Card */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm p-4 sticky top-24">
            <EcardPreview ref={previewRef} profile={profile} compact />
            
            {/* Quick Actions */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setShowLiveShow(true)}
                className="flex-1 px-3 py-2.5 bg-[#7CB342] text-white rounded-xl hover:bg-[#689F38] transition-colors flex items-center justify-center gap-2 text-sm font-medium"
              >
                <Icon.QrCode size={16} />
                Live Show
              </button>
              <DownloadEcardButton profile={profile} previewRef={previewRef} compact />
              <button
                onClick={handleCopyLink}
                className="px-3 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
              >
                <Icon.Link size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Settings & Info */}
        <div className="lg:col-span-3 space-y-4">
          {/* Intro & Extensions Settings */}
          <ExperienceSettingsCard profile={profile} />

          {/* Theme & Template - Collapsed */}
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Icon.Sparkles size={18} className="text-[#7CB342]" />
                Giao diện
              </h3>
            </div>
            
            <EcardThemeSwitcher 
              currentTheme={profile.theme || 'light'}
              onThemeChange={handleThemeChange}
            />

            <button
              onClick={() => setShowTemplateGallery(!showTemplateGallery)}
              className="w-full mt-3 px-3 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-between text-sm"
            >
              <span>Đổi template</span>
              <Icon.ChevronRight size={16} className={`transition-transform ${showTemplateGallery ? 'rotate-90' : ''}`} />
            </button>

            {showTemplateGallery && (
              <div className="mt-3">
                <EcardTemplateGallery 
                  currentTemplate={profile.template || 'minimal'}
                  onSelectTemplate={handleTemplateChange}
                />
              </div>
            )}
          </div>

          {/* Extensions Hub - uses cached stats */}
          <EcardExtensionsPanel profile={profile} stats={stats || {}} />

          {/* Profile Info */}
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Icon.User size={18} className="text-[#7CB342]" />
                Thông tin
              </h3>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  isEditing 
                    ? 'bg-gray-100 text-gray-700' 
                    : 'bg-[#7CB342]/10 text-[#7CB342] hover:bg-[#7CB342]/20'
                }`}
              >
                {isEditing ? <Icon.X size={14} /> : <Icon.Edit size={14} />}
                {isEditing ? 'Hủy' : 'Sửa'}
              </button>
            </div>

            {isEditing ? (
              <EcardProfileForm 
                profile={profile} 
                onSave={handleSave}
                isSaving={isUpdating}
              />
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                <InfoCard icon="User" label="Tên" value={profile.display_name} />
                <InfoCard icon="Briefcase" label="Chức danh" value={profile.title_profession} />
                <InfoCard icon="Building" label="Công ty" value={profile.company_name} />
                <InfoCard icon="Phone" label="SĐT" value={profile.phone} />
                <InfoCard icon="Mail" label="Email" value={profile.email} />
                <InfoCard icon="Globe" label="Website" value={profile.website} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Draggable Quick Actions */}
      <QuickActionsBar
        profile={profile}
        onShare={handleShare}
        onEdit={() => setIsEditing(true)}
        onShowQR={() => setShowLiveShow(true)}
      />

      {/* Live Show Modal */}
      {showLiveShow && (
        <EcardLiveShowModal 
          profile={profile}
          onClose={() => setShowLiveShow(false)}
        />
      )}
    </div>
  );
}

function InfoCard({ icon, label, value }) {
  const IconComp = Icon[icon];
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
        <IconComp size={16} className="text-gray-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-900 truncate">{value || '-'}</p>
      </div>
    </div>
  );
}