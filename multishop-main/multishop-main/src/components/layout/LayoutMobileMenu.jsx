import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronRight, ChevronDown } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import NotificationBellEnhanced from "@/components/notifications/NotificationBellEnhanced";
import { navigationItems } from "./LayoutNavbar";

export default function LayoutMobileMenu({ 
  isOpen, 
  setIsOpen, 
  currentUser, 
  setIsUserMenuOpen 
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedDropdown, setExpandedDropdown] = useState(null);

  // ✅ Fetch UserProfile for avatar (same pattern as LayoutNavbar)
  const { data: userProfile } = useQuery({
    queryKey: ['user-profile-mobile', currentUser?.email],
    queryFn: async () => {
      if (!currentUser?.email) return null;
      const profiles = await base44.entities.UserProfile.list('-created_date', 500);
      return profiles.find(p => p.user_email === currentUser.email);
    },
    enabled: !!currentUser?.email && isOpen,
    staleTime: 10 * 60 * 1000
  });

  // Avatar from UserProfile entity (community profile)
  const avatarUrl = userProfile?.avatar_url || currentUser?.avatar_url;

  if (!isOpen) return null;

  const handleNavigation = (url) => {
    setIsOpen(false);
    setTimeout(() => {
      navigate(url);
    }, 100);
  };

  const toggleDropdown = (name) => {
    setExpandedDropdown(prev => prev === name ? null : name);
  };

  return (
    <div
      id="mobile-menu"
      className="fixed inset-0 bg-[#F5F9F3]/95 backdrop-blur-lg z-40 flex flex-col items-center justify-center lg:hidden overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Mobile navigation menu"
    >
      <div className="flex flex-col items-center gap-4 py-8">
        {navigationItems.map((item) => (
          item.isDropdown ? (
            <div key={item.name} className="flex flex-col items-center">
              <button
                onClick={() => toggleDropdown(item.name)}
                className="text-2xl font-medium text-[#0F0F0F] hover:text-[#7CB342] transition-colors flex items-center gap-2"
              >
                {item.name}
                <ChevronDown className={`w-5 h-5 transition-transform ${expandedDropdown === item.name ? 'rotate-180' : ''}`} />
              </button>
              {expandedDropdown === item.name && (
                <div className="flex flex-col items-center gap-2 mt-2 pl-4">
                  {item.items.map((subItem) => (
                    <button
                      key={subItem.name}
                      onClick={() => handleNavigation(subItem.url)}
                      className={`text-lg font-medium transition-colors ${
                        location.pathname === subItem.url ? 'text-[#7CB342]' : 'text-gray-600 hover:text-[#7CB342]'
                      }`}
                    >
                      {subItem.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <button
              key={item.name}
              onClick={() => handleNavigation(item.url)}
              className={`text-2xl font-medium transition-all duration-300 hover:text-[#7CB342] focus:outline-none focus:ring-2 focus:ring-[#7CB342] focus:ring-offset-2 rounded px-2 py-1 ${
                location.pathname === item.url ? 'text-[#7CB342]' : 'text-[#0F0F0F]'
              }`}
              aria-current={location.pathname === item.url ? 'page' : undefined}
            >
              {item.name}
            </button>
          )
        ))}
        
        {currentUser ? (
          <div className="flex items-center gap-3 mt-4">
            <NotificationBellEnhanced currentUser={currentUser} />
            <button
              onClick={() => {
                setIsOpen(false);
                setTimeout(() => setIsUserMenuOpen(true), 100);
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-full bg-white shadow-lg hover:shadow-xl transition-all active:scale-95"
            >
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt={currentUser.full_name || 'User'}
                  className="w-8 h-8 rounded-full object-cover border-2 border-[#7CB342]"
                />
              ) : (
                <div className="w-8 h-8 bg-gradient-to-br from-[#7CB342] to-[#FF9800] rounded-full flex items-center justify-center text-white font-bold">
                  {currentUser.full_name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={() => {
                setIsOpen(false);
                base44.auth.redirectToLogin(window.location.href);
              }}
              className="text-xl font-medium text-[#0F0F0F] hover:text-[#7CB342] transition-colors"
            >
              Đăng Nhập
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                window.dispatchEvent(new CustomEvent('open-booking-modal'));
              }}
              className="mt-8 bg-[#7CB342] text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-[#0F0F0F] transition-all duration-300 hover:scale-105 shadow-lg focus:outline-none focus:ring-2 focus:ring-[#7CB342] focus:ring-offset-2"
              aria-label="Đặt hàng ngay"
            >
              Đặt Hàng Ngay
            </button>
          </>
        )}
      </div>
    </div>
  );
}