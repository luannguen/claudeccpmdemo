import React, { useState, useMemo, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  LayoutDashboard, Package, ShoppingCart, TrendingUp,
  Settings, LogOut, Menu, X, Leaf, Store, Eye,
  Users, Gift, BarChart3
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/AuthProvider";
import { useTenantAccess } from "@/components/TenantGuard";

const NavigationItem = React.memo(({ item, location, isCollapsed }) => {
  const isActive = location.pathname === item.url;

  return (
    <Link
      to={item.url}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
        isActive
          ? "bg-[#7CB342] text-white"
          : "text-gray-300 hover:bg-white/10"
      }`}
    >
      <item.icon className="w-5 h-5 flex-shrink-0" />
      {!isCollapsed && <span>{item.name}</span>}
      {!isCollapsed && item.badge && (
        <span className="ml-auto px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
          {item.badge}
        </span>
      )}
    </Link>
  );
});

NavigationItem.displayName = 'NavigationItem';

function ShopLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const { user, logout: authLogout } = useAuth();
  const { tenant, tenantId } = useTenantAccess();

  const handleLogout = useCallback(async () => {
    if (confirm('Bạn có chắc muốn đăng xuất?')) {
      await authLogout();
      navigate(createPageUrl("Home"));
    }
  }, [authLogout, navigate]);

  // Shop navigation - không có admin menu
  const navigation = useMemo(() => {
    if (!tenantId) return [];
    
    return [
      {
        title: "QUẢN LÝ SHOP",
        items: [
          { 
            name: "Dashboard", 
            icon: LayoutDashboard, 
            url: createPageUrl(`ShopDashboard?tenant=${tenantId}`) 
          },
          { 
            name: "Sản Phẩm", 
            icon: Package, 
            url: createPageUrl(`ShopMyProducts?tenant=${tenantId}`) 
          },
          { 
            name: "Đơn Hàng", 
            icon: ShoppingCart, 
            url: createPageUrl(`ShopOrders?tenant=${tenantId}`),
            badge: "New"
          },
          { 
            name: "Doanh Thu", 
            icon: TrendingUp, 
            url: createPageUrl(`ShopSales?tenant=${tenantId}`) 
          },
          { 
            name: "Khách Hàng", 
            icon: Users, 
            url: createPageUrl(`ShopCustomers?tenant=${tenantId}`) 
          }
        ]
      },
      {
        title: "CÀI ĐẶT",
        items: [
          { 
            name: "Cài Đặt Shop", 
            icon: Settings, 
            url: createPageUrl(`TenantSettings?tenant=${tenantId}`) 
          },
          { 
            name: "Storefront", 
            icon: Eye, 
            url: createPageUrl(`ShopPublicStorefront?shop=${tenant?.slug}`) 
          }
        ]
      }
    ];
  }, [tenantId, tenant?.slug]);

  if (!tenant || !tenantId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">Không tìm thấy thông tin shop</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F9F3] flex">
      {/* Sidebar */}
      <aside className={`${isCollapsed ? 'w-20' : 'w-72'} bg-gradient-to-b from-[#0F0F0F] to-[#1a1a1a] text-white transition-all duration-300 flex flex-col fixed h-full overflow-y-auto z-50`}>
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <Store className="w-8 h-8 text-[#7CB342]" />
              <div>
                <h1 className="font-serif text-lg font-bold">{tenant.organization_name}</h1>
                <p className="text-xs text-[#7CB342]">Shop Management</p>
              </div>
            </div>
          )}
        </div>

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
                <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs bg-orange-500/20 text-orange-300">
                  Shop Owner
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
          {navigation.map((section) => (
            <div key={section.title}>
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
                    isCollapsed={isCollapsed}
                  />
                ))}
              </div>
            </div>
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
      <div className={`flex-1 ${isCollapsed ? 'ml-20' : 'ml-72'} transition-all duration-300 min-h-screen`}>
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="px-6 py-4 flex items-center justify-between">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isCollapsed ? <Menu className="w-6 h-6" /> : <X className="w-6 h-6" />}
            </button>

            <div className="flex items-center gap-4">
              {tenant && (
                <a
                  href={createPageUrl(`ShopPublicStorefront?shop=${tenant.slug}`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  <Eye className="w-4 h-4" />
                  Xem Storefront
                </a>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default React.memo(ShopLayout);