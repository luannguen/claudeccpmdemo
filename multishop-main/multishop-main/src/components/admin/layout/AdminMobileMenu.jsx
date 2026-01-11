/**
 * AdminMobileMenu - Mobile navigation drawer for admin
 * 
 * - Overlay full screen khi mở
 * - Swipe để đóng
 * - Compact navigation
 */

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Leaf, LogOut, ChevronDown, ChevronRight } from "lucide-react";
import { createPageUrl } from "@/utils";

// Memoized Navigation Item
const MobileNavItem = React.memo(({ item, location, openMenus, toggleMenu, onNavigate }) => {
  const isActive = location.pathname === item.url;
  const hasSubItems = item.subItems && item.subItems.length > 0;
  const isSubmenuOpen = openMenus[item.name];
  
  const hasActiveSubItem = hasSubItems && item.subItems.some(
    subItem => location.pathname === subItem.url
  );

  if (hasSubItems) {
    return (
      <div>
        <button
          onClick={() => toggleMenu(item.name)}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
            hasActiveSubItem || isSubmenuOpen
              ? "bg-[#7CB342]/20 text-[#7CB342]"
              : "text-gray-300 hover:bg-white/10"
          }`}
        >
          <item.icon className="w-5 h-5 flex-shrink-0" />
          <span className="flex-1 text-left text-sm font-medium">{item.name}</span>
          <motion.div animate={{ rotate: isSubmenuOpen ? 180 : 0 }}>
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </button>
        
        <AnimatePresence>
          {isSubmenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="ml-4 mt-1 pl-4 border-l-2 border-white/10 space-y-1">
                {item.subItems.map((subItem) => {
                  const isSubActive = location.pathname === subItem.url;
                  return (
                    <Link
                      key={subItem.name}
                      to={subItem.url}
                      onClick={onNavigate}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-all ${
                        isSubActive
                          ? "bg-[#7CB342] text-white font-medium"
                          : "text-gray-400 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isSubActive ? 'bg-white' : 'bg-gray-500'}`} />
                      {subItem.name}
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
      onClick={onNavigate}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        isActive
          ? "bg-[#7CB342] text-white font-medium"
          : "text-gray-300 hover:bg-white/10"
      }`}
    >
      <item.icon className="w-5 h-5 flex-shrink-0" />
      <span className="text-sm">{item.name}</span>
    </Link>
  );
});

MobileNavItem.displayName = 'MobileNavItem';

export default function AdminMobileMenu({ 
  isOpen, 
  onClose, 
  navigation, 
  user, 
  onLogout 
}) {
  const location = useLocation();
  const [openMenus, setOpenMenus] = React.useState({});

  const toggleMenu = (menuKey) => {
    setOpenMenus(prev => ({ ...prev, [menuKey]: !prev[menuKey] }));
  };

  // Auto open parent menu of active item
  React.useEffect(() => {
    navigation.forEach(section => {
      section.items.forEach(item => {
        if (item.subItems) {
          const hasActiveChild = item.subItems.some(sub => sub.url === location.pathname);
          if (hasActiveChild) {
            setOpenMenus(prev => ({ ...prev, [item.name]: true }));
          }
        }
      });
    });
  }, [location.pathname, navigation]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-[100] lg:hidden"
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-y-0 left-0 w-[280px] bg-gradient-to-b from-[#0F0F0F] to-[#1a1a1a] z-[101] lg:hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <Link to={createPageUrl("Home")} onClick={onClose} className="flex items-center gap-2">
                <Leaf className="w-7 h-7 text-[#7CB342]" />
                <div>
                  <h1 className="font-serif text-lg font-bold text-white">FARMER SMART</h1>
                  <p className="text-[10px] text-[#7CB342]">Admin Panel</p>
                </div>
              </Link>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Info */}
            {user && (
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#7CB342] rounded-full flex items-center justify-center text-white font-bold">
                    {user.full_name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate text-sm">{user.full_name}</p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-3 space-y-4">
              {navigation.map((section) => (
                <div key={section.title}>
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
                    {section.title}
                  </p>
                  <div className="space-y-1">
                    {section.items.map((item) => (
                      <MobileNavItem
                        key={item.name}
                        item={item}
                        location={location}
                        openMenus={openMenus}
                        toggleMenu={toggleMenu}
                        onNavigate={onClose}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-white/10">
              <button
                onClick={() => { onLogout(); onClose(); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Đăng Xuất</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}