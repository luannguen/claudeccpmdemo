import React, { useState, useMemo, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  LayoutDashboard, Package, ShoppingCart, Users, TrendingUp,
  FileText, MessageSquare, Mail, Settings, LogOut, Menu, X,
  Leaf, ChevronDown, ChevronRight, Store, DollarSign, Crown,
  CheckCircle, BarChart3, Shield, Box, Zap, Award, CreditCard, Tag, Wallet, Bell, PackageX, Calendar,
  Gift, PanelLeftClose, PanelLeft, MessageCircle, CircleX
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
// ✅ MIGRATED: Using features/notification module (v2.1) - ZERO LEGACY
import { AdminNotificationBell, AdminNotificationModal } from "@/components/features/notification";
import AdminMobileMenu from "@/components/admin/layout/AdminMobileMenu";
import { useAuth } from "@/components/AuthProvider";
// ✅ RBAC Navigation
import { useAdminNavigation } from "@/components/hooks/useAdminNavigation";

// Memoized Navigation Item Component
const NavigationItem = React.memo(({ item, location, openMenus, toggleMenu, isCollapsed }) => {
  const isActive = location.pathname === item.url;
  const hasSubItems = item.subItems && item.subItems.length > 0;
  const isSubmenuOpen = openMenus[item.name];
  
  // Check if any subitem is active
  const hasActiveSubItem = hasSubItems && item.subItems.some(
    subItem => location.pathname === subItem.url
  );

  const handleToggle = React.useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleMenu(item.name);
  }, [toggleMenu, item.name]);

  if (hasSubItems) {
    return (
      <div className="relative">
        <button
          onClick={handleToggle}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${
            hasActiveSubItem || isSubmenuOpen
              ? "bg-[#7CB342]/20 text-[#7CB342]"
              : "text-gray-300 hover:bg-white/10 hover:text-white"
          }`}
        >
          <item.icon className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && (
            <>
              <span className="flex-1 text-left text-sm font-medium">{item.name}</span>
              <motion.div
                animate={{ rotate: isSubmenuOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-4 h-4" />
              </motion.div>
            </>
          )}
        </button>
        <AnimatePresence initial={false}>
          {isSubmenuOpen && !isCollapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="ml-4 mt-1 pl-4 border-l-2 border-white/10 space-y-0.5">
                {item.subItems.map((subItem) => {
                  const isSubActive = location.pathname === subItem.url;
                  return (
                    <Link
                      key={subItem.name}
                      to={subItem.url}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                        isSubActive
                          ? "bg-[#7CB342] text-white font-medium shadow-lg shadow-[#7CB342]/20"
                          : "text-gray-400 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isSubActive ? 'bg-white' : 'bg-gray-500'}`} />
                      {subItem.name}
                      {subItem.badge && (
                        <span className="ml-auto px-2 py-0.5 bg-red-500 text-white text-xs rounded-full animate-pulse">
                          {subItem.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <Link
      to={item.url}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${
        isActive
          ? "bg-[#7CB342] text-white font-medium shadow-lg shadow-[#7CB342]/20"
          : "text-gray-300 hover:bg-white/10 hover:text-white"
      }`}
    >
      <item.icon className="w-5 h-5 flex-shrink-0" />
      {!isCollapsed && <span className="text-sm">{item.name}</span>}
    </Link>
  );
});

NavigationItem.displayName = 'NavigationItem';

// Memoized Navigation Section
const NavigationSection = React.memo(({ section, location, openMenus, toggleMenu, isCollapsed }) => (
  <div>
    {!isCollapsed && (
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
        {section.title}
      </p>
    )}
    <div className="space-y-1">
      {section.items.map((item) => (
        <NavigationItem
          key={item.name}
          item={item}
          location={location}
          openMenus={openMenus}
          toggleMenu={toggleMenu}
          isCollapsed={isCollapsed}
        />
      ))}
    </div>
  </div>
));

NavigationSection.displayName = 'NavigationSection';

// Main Layout Component
function AdminLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  
  // ✅ Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  
  // ✅ Persist sidebar collapsed state
  const [isCollapsed, setIsCollapsed] = React.useState(() => {
    try {
      return sessionStorage.getItem('admin-sidebar-collapsed') === 'true';
    } catch { return false; }
  });
  
  // ✅ Persist openMenus state across page navigations
  const [openMenus, setOpenMenus] = React.useState(() => {
    try {
      const saved = sessionStorage.getItem('admin-open-menus');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });
  const [isAdminNotificationModalOpen, setIsAdminNotificationModalOpen] = React.useState(false);

  // Use auth context instead of query
  const { user, logout: authLogout } = useAuth();
  
  // ✅ RBAC: Get filtered navigation based on user permissions
  const { navigation: rbacNavigation, isLoading: isRbacLoading } = useAdminNavigation();

  const isSuperAdmin = useMemo(() => 
    user?.role === 'super_admin' || user?.role === 'admin',
    [user?.role]
  );

  const isShopOwner = useMemo(() => 
    user?.role === 'owner',
    [user?.role]
  );

  const toggleMenu = useCallback((menuKey) => {
    setOpenMenus(prev => {
      const newState = { ...prev, [menuKey]: !prev[menuKey] };
      try { sessionStorage.setItem('admin-open-menus', JSON.stringify(newState)); } catch {}
      return newState;
    });
  }, []);
  
  // ✅ Persist collapsed state
  const handleCollapse = useCallback((collapsed) => {
    setIsCollapsed(collapsed);
    try { sessionStorage.setItem('admin-sidebar-collapsed', String(collapsed)); } catch {}
  }, []);

  const handleLogout = useCallback(async () => {
    if (confirm('Bạn có chắc muốn đăng xuất?')) {
      await authLogout();
      navigate(createPageUrl("Home"));
    }
  }, [authLogout, navigate]);

  // ✅ RBAC: Use filtered navigation from hook instead of hardcoded
  const navigation = rbacNavigation;

  // ✅ Keep parent menu open when navigating to submenu items - only on initial load
  React.useEffect(() => {
    const currentPath = location.pathname;
    
    navigation.forEach(section => {
      section.items.forEach(item => {
        if (item.subItems) {
          const hasActiveChild = item.subItems.some(sub => sub.url === currentPath);
          if (hasActiveChild && !openMenus[item.name]) {
            setOpenMenus(prev => {
              const newState = { ...prev, [item.name]: true };
              try { sessionStorage.setItem('admin-open-menus', JSON.stringify(newState)); } catch {}
              return newState;
            });
          }
        }
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // ✅ Preserve sidebar scroll position using sessionStorage (persists across re-renders)
  const sidebarNavRef = React.useRef(null);
  
  // Save scroll on every scroll event
  React.useEffect(() => {
    const sidebar = sidebarNavRef.current;
    if (!sidebar) return;

    const saveScroll = () => {
      try { sessionStorage.setItem('admin-sidebar-scroll', String(sidebar.scrollTop)); } catch {}
    };

    sidebar.addEventListener('scroll', saveScroll, { passive: true });
    return () => sidebar.removeEventListener('scroll', saveScroll);
  }, []);
  
  // Restore scroll after each navigation (location change)
  React.useEffect(() => {
    const sidebar = sidebarNavRef.current;
    if (!sidebar) return;
    
    // Use RAF to ensure DOM is ready
    requestAnimationFrame(() => {
      try {
        const savedScroll = sessionStorage.getItem('admin-sidebar-scroll');
        if (savedScroll) {
          sidebar.scrollTop = parseInt(savedScroll, 10);
        }
      } catch {}
    });
  }, [location.pathname]);

  // Listen for admin notification modal open
  React.useEffect(() => {
    const openModal = () => setIsAdminNotificationModalOpen(true);
    window.addEventListener('open-admin-notifications-modal', openModal);
    return () => window.removeEventListener('open-admin-notifications-modal', openModal);
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F9F3] flex font-sans" style={{ fontFamily: "var(--font-sans, 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif)" }}>
      {/* Mobile Menu */}
      <AdminMobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        navigation={navigation}
        user={user}
        onLogout={handleLogout}
      />
      
      {/* Sidebar - Desktop Only */}
      <aside className={`hidden lg:flex ${isCollapsed ? 'w-20' : 'w-64'} bg-gradient-to-b from-[#0F0F0F] to-[#1a1a1a] text-white transition-all duration-300 flex-col fixed h-full z-50`}>
        <style>{`
          .admin-nav-scroll {
            overflow-y: auto;
            overflow-x: hidden;
            scrollbar-width: thin;
            scrollbar-color: rgba(124, 179, 66, 0.5) transparent;
            overscroll-behavior: contain;
          }
          .admin-nav-scroll::-webkit-scrollbar {
            width: 6px;
          }
          .admin-nav-scroll::-webkit-scrollbar-track {
            background: transparent;
            margin: 8px 0;
          }
          .admin-nav-scroll::-webkit-scrollbar-thumb {
            background: linear-gradient(180deg, rgba(124, 179, 66, 0.6), rgba(255, 152, 0, 0.6));
            border-radius: 10px;
          }
          .admin-nav-scroll::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(180deg, rgba(124, 179, 66, 0.9), rgba(255, 152, 0, 0.9));
          }
        `}</style>
        {/* ✅ LOGO with Link to Home */}
        <Link to={createPageUrl("Home")} className="p-6 border-b border-white/10 block hover:bg-white/5 transition-colors">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex items-center gap-3">
                <Leaf className="w-8 h-8 text-[#7CB342]" />
                <div>
                  <h1 className="font-serif text-xl font-bold">FARMER SMART</h1>
                  <p className="text-xs text-[#7CB342]">Admin Panel</p>
                </div>
              </div>
            )}
            {isCollapsed && (
              <Leaf className="w-8 h-8 text-[#7CB342] mx-auto" />
            )}
          </div>
        </Link>

        {/* User Info */}
        {!isCollapsed && user && (
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#7CB342] rounded-full flex items-center justify-center font-bold flex-shrink-0">
                {user.full_name?.charAt(0)?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{user.full_name}</p>
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
                <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs ${
                  isSuperAdmin ? 'bg-purple-500/20 text-purple-300' : 
                  isShopOwner ? 'bg-orange-500/20 text-orange-300' : 
                  'bg-blue-500/20 text-blue-300'
                }`}>
                  {user.role}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav ref={sidebarNavRef} className="flex-1 p-4 space-y-6 admin-nav-scroll">
          {navigation.map((section) => (
            <NavigationSection
              key={section.title}
              section={section}
              location={location}
              openMenus={openMenus}
              toggleMenu={toggleMenu}
              isCollapsed={isCollapsed}
            />
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            {!isCollapsed && <span>Đăng Xuất</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'} transition-all duration-300 min-h-screen`}>
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="px-4 lg:px-6 py-3 lg:py-4 flex items-center justify-between">
            {/* Mobile: Hamburger + Logo */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
              
              {/* Desktop: Collapse toggle */}
              <button
                onClick={() => handleCollapse(!isCollapsed)}
                className="hidden lg:flex p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title={isCollapsed ? "Mở rộng menu" : "Thu gọn menu"}
              >
                {isCollapsed ? <PanelLeft className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
              </button>
              
              {/* Mobile Logo */}
              <Link to={createPageUrl("Home")} className="lg:hidden flex items-center gap-2">
                <Leaf className="w-6 h-6 text-[#7CB342]" />
                <span className="font-serif font-bold text-[#0F0F0F]">Admin</span>
              </Link>
            </div>

            <div className="flex items-center gap-2 lg:gap-4">
              <AdminNotificationBell user={user} />
            </div>
          </div>
        </header>

        {/* Page Content - Responsive padding */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>

      {/* Admin Notification Modal - v2.1 */}
      <AdminNotificationModal
        isOpen={isAdminNotificationModalOpen}
        onClose={() => setIsAdminNotificationModalOpen(false)}
        currentUser={user}
      />
    </div>
  );
}

export default React.memo(AdminLayout);