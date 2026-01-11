import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@/components/ui/AnimatedIcon.jsx';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Link, useNavigate } from 'react-router-dom'; // Added useNavigate
import { hasAdminLevelRole } from '@/components/hooks/useRBACPermissions';

export default function UserDropdownMenu({ user, onNavigate }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const navigate = useNavigate(); // Initialize useNavigate hook
  
  // ✅ Fetch user profile for avatar
  const { data: profile } = useQuery({
    queryKey: ['user-profile-dropdown', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const profiles = await base44.entities.UserProfile.list('-created_date', 500);
      return profiles.find(p => p.user_email === user.email);
    },
    enabled: !!user?.email,
    staleTime: 10 * 60 * 1000
  });

  // ✅ Handle menu item click - close dropdown AND notify parent (mobile menu)
  const handleMenuItemClick = (callback) => {
    setIsOpen(false);
    callback?.();
    onNavigate?.(); // ✅ Close mobile menu if in mobile context
  };

  // Fetch tenant info if user is owner
  const { data: myTenant } = useQuery({
    queryKey: ['my-tenant', user?.email],
    queryFn: async () => {
      const tenants = await base44.entities.Tenant.list('-created_date', 500);
      return tenants.find(t => t.owner_email === user.email && t.status === 'active');
    },
    enabled: !!user?.email,
    staleTime: 5 * 60 * 1000
  });

  // Fetch PLATFORM loyalty for points display
  const { data: loyalty } = useQuery({
    queryKey: ['my-loyalty-dropdown', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const accounts = await base44.entities.LoyaltyAccount.list('-created_date', 500);
      return accounts.find(la => la.user_email === user.email);
    },
    enabled: !!user?.email,
    staleTime: 5 * 60 * 1000
  });

  // Check if user is admin (hỗ trợ Multi-Role RBAC)
  const isAdmin = hasAdminLevelRole(user);

  const handleLogout = async () => {
    if (confirm('Bạn có chắc muốn đăng xuất?')) {
      await base44.auth.logout();
      navigate(createPageUrl('Home'));
    }
  };

  // ✅ Get cart count
  const [cartCount, setCartCount] = useState(0);
  
  useEffect(() => {
    const updateCartCount = () => {
      try {
        const saved = localStorage.getItem('zerofarm-cart');
        const items = saved ? JSON.parse(saved) : [];
        const count = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
        setCartCount(count);
      } catch (error) {
        setCartCount(0);
      }
    };
    
    updateCartCount();
    window.addEventListener('cart-updated', updateCartCount);
    
    return () => window.removeEventListener('cart-updated', updateCartCount);
  }, []);

  // ✅ Organized menu groups for better UX
  // Fetch feedback count
  const { data: myFeedback = [] } = useQuery({
    queryKey: ['my-feedback-count-dropdown', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const feedback = await base44.entities.Feedback.list('-created_date', 500);
      return feedback.filter(f => f.user_email === user.email);
    },
    enabled: !!user?.email,
    staleTime: 2 * 60 * 1000
  });

  const unreadFeedbackCount = myFeedback.filter(f => 
    f.admin_response && !f.user_read_response
  ).length;

  const menuGroups = [
    {
      title: 'Tài Khoản',
      items: [
        {
          icon: 'User',
          label: 'Hồ Sơ',
          url: createPageUrl('MyProfile'),
          iconColor: 'text-blue-600',
          bgColor: 'hover:bg-blue-50'
        },
        {
          icon: 'Award',
          label: 'Điểm Thưởng',
          url: createPageUrl('MyProfile') + '?tab=loyalty',
          iconColor: 'text-yellow-500',
          bgColor: 'hover:bg-yellow-50'
        },
        {
          icon: 'Settings',
          label: 'Cài Đặt',
          url: createPageUrl('MyProfile') + '?tab=settings',
          iconColor: 'text-gray-600',
          bgColor: 'hover:bg-gray-50'
        }
      ]
    },
    {
      title: 'Mua Sắm',
      items: [
        {
          icon: 'ShoppingCart',
          label: 'Giỏ Hàng',
          action: () => {
            setIsOpen(false);
            window.dispatchEvent(new Event('open-cart-widget'));
          },
          iconColor: 'text-purple-600',
          bgColor: 'hover:bg-purple-50',
          badge: cartCount > 0 ? cartCount : null
        },
        {
          icon: 'ShoppingBag',
          label: 'Đơn Hàng',
          url: createPageUrl('MyOrders'),
          iconColor: 'text-green-600',
          bgColor: 'hover:bg-green-50'
        },
        {
          icon: 'PackageX',
          label: 'Trả Hàng',
          url: createPageUrl('MyReturns'),
          iconColor: 'text-orange-600',
          bgColor: 'hover:bg-orange-50'
        },
        {
          icon: 'Heart',
          label: 'Yêu Thích',
          url: createPageUrl('MyWishlist'),
          iconColor: 'text-red-500',
          bgColor: 'hover:bg-red-50'
        }
      ]
    },
    {
      title: 'Cộng Đồng',
      items: [
        {
          icon: 'Bookmark',
          label: 'Bài Đã Lưu',
          url: createPageUrl('MySavedPosts'),
          iconColor: 'text-indigo-600',
          bgColor: 'hover:bg-indigo-50'
        },
        {
          icon: 'ThumbsUp',
          label: 'Bài Đã Thích',
          url: createPageUrl('MyLikedPosts'),
          iconColor: 'text-pink-600',
          bgColor: 'hover:bg-pink-50'
        }
      ]
    },
    {
      title: 'Hợp Tác',
      items: [
        {
          icon: 'Sprout',
          label: 'Gieo Hạt',
          url: createPageUrl('MyReferrals'),
          iconColor: 'text-green-500',
          bgColor: 'hover:bg-green-50',
          description: 'Chương trình giới thiệu'
        },
        {
          icon: 'MessageCircle',
          label: 'Feedback',
          url: createPageUrl('MyFeedback'),
          iconColor: 'text-blue-500',
          bgColor: 'hover:bg-blue-50',
          badge: unreadFeedbackCount > 0 ? unreadFeedbackCount : null,
          pulse: unreadFeedbackCount > 0
        }
      ]
    }
  ];

  if (!user) return null;

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={(e) => {
          e.stopPropagation(); // ✅ Prevent bubble to mobile menu wrapper
          setIsOpen(!isOpen);
        }}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-lg hover:shadow-xl transition-all"
      >
        <div className="w-8 h-8 bg-gradient-to-br from-[#7CB342] to-[#FF9800] rounded-full flex items-center justify-center text-white font-bold overflow-hidden">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
          ) : (
            <span>{user.full_name?.charAt(0)?.toUpperCase() || 'U'}</span>
          )}
        </div>
        <span className="hidden md:block text-sm font-medium text-gray-700">
          {user.full_name}
        </span>
        <Icon.ChevronDown size={16} className={`text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 top-14 w-80 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden border border-gray-100"
            >
              {/* ✅ COMPACT User Info Header */}
              <div className="p-4 bg-gradient-to-br from-[#7CB342] to-[#FF9800] text-white">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Icon.User size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{user.full_name}</p>
                    <p className="text-xs text-white/80 truncate">{user.email}</p>
                  </div>
                </div>

                {/* ✅ Compact Loyalty + Tenant in one row */}
                <div className="mt-3 pt-3 border-t border-white/20 flex items-center justify-between text-xs">
                  {loyalty && (
                    <div className="flex items-center gap-1">
                      <Icon.Award size={12} />
                      <span className="font-bold text-yellow-300">{loyalty.total_points}đ</span>
                    </div>
                  )}
                  {myTenant && (
                    <div className="flex items-center gap-1 truncate">
                      <Icon.Store size={12} />
                      <span className="text-xs font-medium truncate">{myTenant.organization_name}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-3 max-h-[70vh] overflow-y-auto">
                {/* ✅ Grouped menu items */}
                {menuGroups.map((group, groupIndex) => (
                  <div key={groupIndex} className="mb-3">
                    <p className="px-3 py-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      {group.title}
                    </p>
                    <div className="space-y-0.5">
                      {group.items.map((item, itemIndex) => {
                        const IconComponent = item.icon;
                        
                        if (item.url) {
                          return (
                            <Link
                              key={itemIndex}
                              to={item.url}
                              onClick={() => handleMenuItemClick()}
                              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${item.bgColor || 'hover:bg-gray-50'}`}
                            >
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.iconColor?.replace('text-', 'bg-').replace('-600', '-100').replace('-500', '-100')} transition-all group-hover:scale-110`}>
                                <IconComponent className={`w-4 h-4 ${item.iconColor}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="font-medium text-gray-900 text-sm block">{item.label}</span>
                                {item.description && (
                                  <span className="text-xs text-gray-500">{item.description}</span>
                                )}
                              </div>
                              {item.badge && (
                                <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full font-bold">
                                  {item.badge}
                                </span>
                              )}
                            </Link>
                          );
                        } else {
                          return (
                            <button
                              key={itemIndex}
                              onClick={() => handleMenuItemClick(item.action)}
                              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left group ${item.bgColor || 'hover:bg-gray-50'}`}
                            >
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.iconColor?.replace('text-', 'bg-').replace('-600', '-100').replace('-500', '-100')} transition-all group-hover:scale-110`}>
                                <IconComponent className={`w-4 h-4 ${item.iconColor}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="font-medium text-gray-900 text-sm block">{item.label}</span>
                                {item.description && (
                                  <span className="text-xs text-gray-500">{item.description}</span>
                                )}
                              </div>
                              {item.badge && (
                                <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full font-bold">
                                  {item.badge}
                                </span>
                              )}
                            </button>
                          );
                        }
                      })}
                    </div>
                  </div>
                ))}

                {/* ✅ Admin Options */}
                {isAdmin && (
                  <div className="mb-3 border-t border-gray-100 pt-3">
                    <p className="px-3 py-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Quản Trị
                    </p>
                    <Link
                      to={createPageUrl('AdminDashboard')}
                      onClick={() => handleMenuItemClick()}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-purple-50 transition-all group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center transition-all group-hover:scale-110">
                        <Icon.LayoutDashboard size={16} className="text-purple-600" />
                      </div>
                      <span className="font-medium text-gray-900 text-sm">Admin Panel</span>
                    </Link>
                  </div>
                )}

                {/* ✅ Shop Owner Options */}
                {myTenant ? (
                  <div className="mb-3 border-t border-gray-100 pt-3">
                    <p className="px-3 py-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Shop Của Tôi
                    </p>
                    <div className="space-y-0.5">
                      <Link
                        to={createPageUrl(`ShopDashboard?tenant=${myTenant.id}`)}
                        onClick={() => handleMenuItemClick()}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-green-50 transition-all group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center transition-all group-hover:scale-110">
                          <Icon.LayoutDashboard size={16} className="text-[#7CB342]" />
                        </div>
                        <span className="font-medium text-gray-900 text-sm">Dashboard</span>
                      </Link>

                      <Link
                        to={createPageUrl(`ShopPublicStorefront?shop=${myTenant.slug}`)}
                        onClick={() => handleMenuItemClick()}
                        target="_blank"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-blue-50 transition-all group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center transition-all group-hover:scale-110">
                          <Icon.Eye size={16} className="text-blue-600" />
                        </div>
                        <span className="font-medium text-gray-900 text-sm">Storefront</span>
                      </Link>

                      <Link
                        to={createPageUrl(`ShopMyProducts?tenant=${myTenant.id}`)}
                        onClick={() => handleMenuItemClick()}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-orange-50 transition-all group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center transition-all group-hover:scale-110">
                          <Icon.Package size={16} className="text-orange-600" />
                        </div>
                        <span className="font-medium text-gray-900 text-sm">Sản Phẩm</span>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="mb-3 border-t border-gray-100 pt-3">
                    <Link
                      to={createPageUrl('TenantSignup')}
                      onClick={() => handleMenuItemClick()}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 hover:from-green-100 hover:to-emerald-100 transition-all group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#7CB342] flex items-center justify-center transition-all group-hover:scale-110">
                        <Icon.Store size={16} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <span className="font-bold text-gray-900 text-sm block">Đăng Ký Shop</span>
                        <span className="text-xs text-gray-600">Bán hàng trên nền tảng</span>
                      </div>
                    </Link>
                  </div>
                )}

                {/* ✅ Logout */}
                <div className="border-t border-gray-100 pt-2">
                  <button
                    onClick={() => handleMenuItemClick(handleLogout)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-50 transition-all text-red-600 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center transition-all group-hover:scale-110">
                      <Icon.LogOut size={16} />
                    </div>
                    <span className="font-medium text-sm">Đăng Xuất</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}