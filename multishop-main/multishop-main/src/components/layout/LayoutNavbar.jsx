import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Leaf, X, Menu, ChevronRight, ChevronDown } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
// ✅ MIGRATED: Using features/notification module (v2.1)
import { ClientNotificationBell } from "@/components/features/notification";
import { useSiteSettings } from "@/components/cms/useSiteConfig";

// ✅ Navigation items config with dropdown support
export const navigationItems = [
  { name: "Sản Phẩm", url: createPageUrl("Services") },
  { name: "Bán Trước", url: createPageUrl("PreOrderLots") },
  { name: "Cộng Đồng", url: createPageUrl("Community") },
  { name: "E-Card", url: createPageUrl("MyEcard") },
  { 
    name: "Khám Phá", 
    isDropdown: true,
    items: [
      { name: "Trang Chủ", url: createPageUrl("Home") },
      { name: "Về Chúng Tôi", url: createPageUrl("AboutUs") },
      { name: "Blog", url: createPageUrl("Blog") },
      { name: "Đội Ngũ", url: createPageUrl("Team") },
      { name: "Liên Hệ", url: createPageUrl("Contact") }
    ]
  }
];

// Dropdown component - Fixed: added padding-bottom to create hover bridge
function NavDropdown({ item, isScrolled, isMenuOpen, location }) {
  const [isOpen, setIsOpen] = useState(false);
  const hasActiveChild = item.items?.some(sub => location.pathname === sub.url);

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        className={`text-sm font-medium transition-all duration-300 hover:text-[#7CB342] flex items-center gap-1 ${
          hasActiveChild
            ? 'text-[#7CB342]'
            : (isScrolled || isMenuOpen ? 'text-[#0F0F0F]' : 'text-white text-shadow-dark')
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {item.name}
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <>
          {/* Invisible bridge to prevent gap */}
          <div className="absolute top-full left-0 w-full h-3" />
          <div className="absolute top-full left-0 pt-1">
            <div className="py-2 bg-white rounded-xl shadow-xl border border-gray-100 min-w-[160px] z-50">
              {item.items.map((subItem) => (
                <Link
                  key={subItem.name}
                  to={subItem.url}
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-2.5 text-sm transition-colors hover:bg-[#7CB342]/10 hover:text-[#7CB342] ${
                    location.pathname === subItem.url ? 'text-[#7CB342] bg-[#7CB342]/5' : 'text-gray-700'
                  }`}
                >
                  {subItem.name}
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function LayoutNavbar({ 
  isScrolled, 
  scrollDirection = 'up',
  isMenuOpen, 
  setIsMenuOpen,
  currentUser,
  setIsUserMenuOpen,
  enableAutoHide = false
}) {
  const location = useLocation();
  const { siteName, siteTagline } = useSiteSettings();
  
  // Auto-hide navbar khi scroll xuống (chỉ trên trang Home)
  const isHidden = enableAutoHide && scrollDirection === 'down' && !isMenuOpen;

  // ✅ Fetch UserProfile for avatar (same pattern as UserDropdownMenu)
  const { data: userProfile } = useQuery({
    queryKey: ['user-profile-navbar', currentUser?.email],
    queryFn: async () => {
      if (!currentUser?.email) return null;
      const profiles = await base44.entities.UserProfile.list('-created_date', 500);
      return profiles.find(p => p.user_email === currentUser.email);
    },
    enabled: !!currentUser?.email,
    staleTime: 10 * 60 * 1000
  });

  // Avatar from UserProfile entity (community profile)
  const avatarUrl = userProfile?.avatar_url || currentUser?.avatar_url;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
        isScrolled || isMenuOpen ? 'glass-nav py-3' : 'bg-transparent py-5'
      } ${
        isHidden ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'
      }`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between pt-4">
          {/* Logo */}
          <Link
            to={createPageUrl("Home")}
            className="flex items-center gap-3 group transform transition-transform hover:scale-105"
            aria-label={`${siteName || 'Farmer Smart'} - Trang chủ`}
          >
            <div className="relative">
              <Leaf
                className={`w-8 h-8 sparkle-animation ${isScrolled || isMenuOpen ? 'text-[#7CB342]' : 'text-white text-shadow-dark'}`}
                aria-hidden="true"
              />
            </div>
            <div>
              <h1 className={`text-[#7CB342] text-lg font-bold text-center glow-text`} style={{ fontFamily: 'var(--font-sans)' }}>
                {siteName || 'FARMER SMART'}
              </h1>
              <p className={`text-xs text-center tracking-widest ${isScrolled || isMenuOpen ? 'text-[#7CB342]' : 'text-[#7CB342] text-shadow-dark'}`}>
                {siteTagline || '100% Organic'}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6" role="menubar">
            {navigationItems.map((item) => (
              item.isDropdown ? (
                <NavDropdown 
                  key={item.name} 
                  item={item} 
                  isScrolled={isScrolled} 
                  isMenuOpen={isMenuOpen}
                  location={location}
                />
              ) : (
                <Link
                  key={item.name}
                  to={item.url}
                  role="menuitem"
                  className={`text-sm font-medium transition-all duration-300 hover:text-[#7CB342] relative group ${
                    location.pathname === item.url
                      ? 'text-[#7CB342]'
                      : (isScrolled || isMenuOpen ? 'text-[#0F0F0F]' : 'text-white text-shadow-dark')
                  }`}
                  aria-current={location.pathname === item.url ? 'page' : undefined}
                >
                  {item.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#7CB342] transition-all duration-300 group-hover:w-full" aria-hidden="true" />
                </Link>
              )
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">
            {currentUser ? (
              <>
                <ClientNotificationBell currentUser={currentUser} />
                <div className="relative group">
                  <button
                    onClick={() => setIsUserMenuOpen(prev => !prev)}
                    className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-100 transition-all"
                  >
                    {avatarUrl ? (
                      <img 
                        src={avatarUrl} 
                        alt={currentUser.full_name || 'User'}
                        className="w-8 h-8 rounded-full object-cover border-2 border-[#7CB342]"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-br from-[#7CB342] to-[#FF9800] rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {currentUser.full_name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    )}
                    <span className="text-sm font-medium text-gray-700 max-w-[120px] truncate">
                      {currentUser.full_name || 'User'}
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => base44.auth.redirectToLogin(window.location.href)}
                  className="text-sm font-medium transition-all duration-300 hover:text-[#7CB342] relative group px-4 py-2"
                >
                  Đăng Nhập
                </button>
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('open-booking-modal'))}
                  className="bg-[#7CB342] text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-[#0F0F0F] transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#7CB342] focus:ring-offset-2"
                  aria-label="Đặt hàng ngay"
                >
                  Đặt Hàng Ngay
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className={`lg:hidden p-2 z-50 focus:outline-none focus:ring-2 focus:ring-[#7CB342] focus:ring-offset-2 rounded ${isScrolled || isMenuOpen ? 'text-[#0F0F0F]' : 'text-white text-shadow-dark'}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            aria-label={isMenuOpen ? 'Đóng menu' : 'Mở menu'}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>
    </nav>
  );
}