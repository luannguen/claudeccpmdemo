import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@/components/ui/AnimatedIcon.jsx';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

export default function UserMobileMenu({ isOpen, onClose, user }) {
  const navigate = useNavigate();
  // ✅ Fetch user profile for avatar
  const { data: profile } = useQuery({
    queryKey: ['user-profile-mobile', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const profiles = await base44.entities.UserProfile.list('-created_date', 500);
      return profiles.find(p => p.user_email === user.email);
    },
    enabled: !!user?.email && isOpen,
    staleTime: 10 * 60 * 1000
  });
  const [showPWAInstall, setShowPWAInstall] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [installUrl, setInstallUrl] = useState('');

  // Fetch tenant info
  const { data: myTenant } = useQuery({
    queryKey: ['my-tenant-mobile', user?.email],
    queryFn: async () => {
      const tenants = await base44.entities.Tenant.list('-created_date', 500);
      return tenants.find(t => t.owner_email === user.email && t.status === 'active');
    },
    enabled: !!user?.email,
    staleTime: 5 * 60 * 1000
  });

  // Fetch loyalty
  const { data: loyalty } = useQuery({
    queryKey: ['my-loyalty-mobile', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const accounts = await base44.entities.LoyaltyAccount.list('-created_date', 500);
      return accounts.find(la => la.user_email === user.email);
    },
    enabled: !!user?.email,
    staleTime: 5 * 60 * 1000
  });

  const isAdmin = ['admin', 'super_admin', 'manager', 'staff'].includes(user?.role);

  // Cart count
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

  // ✅ Generate PWA Install URL + QR Code (using external API)
  useEffect(() => {
    if (isOpen) {
      const appUrl = window.location.origin;
      setInstallUrl(appUrl);
      
      // ✅ Generate QR code using external API (no package needed)
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(appUrl)}&color=7CB342&bgcolor=FFFFFF`;
      setQrCodeUrl(qrApiUrl);
    }
  }, [isOpen]);

  const handleLogout = async () => {
    await base44.auth.logout();
    onClose();
    navigate(createPageUrl('Home'));
  };

  const handleNavigation = (callback) => {
    onClose();
    setTimeout(() => callback(), 100);
  };

  // Fetch feedback count
  const { data: myFeedback = [] } = useQuery({
    queryKey: ['my-feedback-count', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const feedback = await base44.entities.Feedback.list('-created_date', 500);
      return feedback.filter(f => f.user_email === user.email);
    },
    enabled: !!user?.email,
    staleTime: 2 * 60 * 1000
  });

  const unreadFeedbackCount = myFeedback.filter(f => 
    f.admin_response && f.status !== 'resolved'
  ).length;

  const menuGroups = [
    {
      title: 'Tài Khoản',
      items: [
        {
          iconName: 'User',
          label: 'Hồ Sơ',
          url: createPageUrl('MyProfile'),
          iconColor: 'text-blue-600',
          bgColor: 'bg-blue-50'
        },
        {
          iconName: 'Award',
          label: 'Điểm Thưởng',
          url: createPageUrl('MyProfile') + '?tab=loyalty',
          iconColor: 'text-yellow-500',
          bgColor: 'bg-yellow-50'
        },
        {
          iconName: 'Settings',
          label: 'Cài Đặt',
          url: createPageUrl('MyProfile') + '?tab=settings',
          iconColor: 'text-gray-600',
          bgColor: 'bg-gray-50'
        }
      ]
    },
    {
      title: 'Mua Sắm',
      items: [
        {
          iconName: 'ShoppingCart',
          label: 'Giỏ Hàng',
          action: () => window.dispatchEvent(new Event('open-cart-widget')),
          iconColor: 'text-purple-600',
          bgColor: 'bg-purple-50',
          badge: cartCount > 0 ? cartCount : null
        },
        {
          iconName: 'ShoppingBag',
          label: 'Đơn Hàng',
          url: createPageUrl('MyOrders'),
          iconColor: 'text-green-600',
          bgColor: 'bg-green-50'
        },
        {
          iconName: 'Package',
          label: 'Trả Hàng',
          url: createPageUrl('MyReturns'),
          iconColor: 'text-orange-600',
          bgColor: 'bg-orange-50'
        },
        {
          iconName: 'Heart',
          label: 'Yêu Thích',
          url: createPageUrl('MyWishlist'),
          iconColor: 'text-red-500',
          bgColor: 'bg-red-50'
        }
      ]
    },
    {
      title: 'Cộng Đồng',
      items: [
        {
          iconName: 'Bookmark',
          label: 'Bài Đã Lưu',
          url: createPageUrl('MySavedPosts'),
          iconColor: 'text-indigo-600',
          bgColor: 'bg-indigo-50'
        },
        {
          iconName: 'ThumbsUp',
          label: 'Bài Đã Thích',
          url: createPageUrl('MyLikedPosts'),
          iconColor: 'text-pink-600',
          bgColor: 'bg-pink-50'
        }
      ]
    },
    {
      title: 'Hợp Tác',
      items: [
        {
          iconName: 'Leaf',
          label: 'Gieo Hạt',
          url: createPageUrl('MyReferrals'),
          iconColor: 'text-green-500',
          bgColor: 'bg-green-50'
        },
        {
          iconName: 'MessageCircle',
          label: 'Feedback & Góp Ý',
          url: createPageUrl('MyFeedback'),
          iconColor: 'text-blue-500',
          bgColor: 'bg-blue-50',
          badge: unreadFeedbackCount > 0 ? unreadFeedbackCount : null,
          pulse: unreadFeedbackCount > 0
        }
      ]
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - only on desktop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="hidden lg:block fixed inset-0 bg-black/30 backdrop-blur-sm z-[59]"
          />
          
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-y-0 right-0 bg-white z-[60] overflow-y-auto w-full lg:w-[40%] lg:max-w-md shadow-2xl"
          >
          {/* ✅ Header with Back Button */}
          <div className="sticky top-0 bg-gradient-to-br from-[#7CB342] to-[#5a8f31] text-white p-4 shadow-lg z-10">
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={onClose}
                className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <Icon.ArrowLeft size={20} />
              </button>
              <h2 className="text-xl font-bold">Tài Khoản</h2>
            </div>

            {/* User Info */}
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <div className="w-14 h-14 bg-white/30 rounded-full flex items-center justify-center text-2xl font-bold overflow-hidden">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt={user?.full_name} className="w-full h-full object-cover" />
                ) : (
                  <span>{user?.full_name?.charAt(0)?.toUpperCase() || 'U'}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold truncate">{user?.full_name}</p>
                <p className="text-sm text-white/80 truncate">{user?.email}</p>
                {loyalty && (
                  <div className="flex items-center gap-1 mt-1">
                    <Icon.Award size={12} className="text-yellow-300" />
                    <span className="text-xs font-bold text-yellow-300">
                      {loyalty.total_points} điểm
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ✅ Menu Items - Grouped */}
          <div className="p-4 space-y-4">
            {menuGroups.map((group, groupIndex) => (
              <div key={groupIndex}>
                <p className="px-2 py-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  {group.title}
                </p>
                <div className="space-y-1.5">
                  {group.items.map((item, itemIndex) => {
                    const IconComponent = Icon[item.iconName];
                    if (!IconComponent) {
                      console.warn(`Icon "${item.iconName}" not found in AnimatedIcon library`);
                      return null;
                    }
                    
                    if (item.url) {
                      return (
                        <Link
                          key={itemIndex}
                          to={item.url}
                          onClick={() => handleNavigation(() => {})}
                          className="relative flex items-center gap-3 px-3 py-3 bg-white rounded-xl border border-gray-200 hover:border-[#7CB342] hover:shadow-sm transition-all active:scale-[0.98]"
                        >
                          <div className={`relative w-10 h-10 ${item.bgColor} rounded-xl flex items-center justify-center flex-shrink-0 transition-transform hover:scale-110`}>
                            <IconComponent className={`w-5 h-5 ${item.iconColor}`} />
                            {item.pulse && (
                              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                            )}
                          </div>
                          <span className="text-sm font-medium text-gray-900 flex-1">{item.label}</span>
                          {item.badge && (
                            <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full font-bold animate-pulse">
                              {item.badge}
                            </span>
                          )}
                          <Icon.ChevronRight className="w-4 h-4 text-gray-400" />
                        </Link>
                      );
                    } else {
                      return (
                        <button
                          key={itemIndex}
                          onClick={() => handleNavigation(item.action)}
                          className="w-full flex items-center gap-3 px-3 py-3 bg-white rounded-xl border border-gray-200 hover:border-[#7CB342] hover:shadow-sm transition-all active:scale-[0.98]"
                        >
                          <div className={`w-10 h-10 ${item.bgColor} rounded-xl flex items-center justify-center flex-shrink-0 transition-transform hover:scale-110`}>
                            <IconComponent className={`w-5 h-5 ${item.iconColor}`} />
                          </div>
                          <span className="text-sm font-medium text-gray-900 flex-1">{item.label}</span>
                          {item.badge && (
                            <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full font-bold">
                              {item.badge}
                            </span>
                          )}
                          <Icon.ChevronRight className="w-4 h-4 text-gray-400" />
                        </button>
                      );
                    }
                  })}
                </div>
              </div>
            ))}

            {/* ✅ PWA INSTALL SECTION - Compact */}
            <div className="mt-4 pt-3 border-t border-gray-200">
              <button
                onClick={() => setShowPWAInstall(!showPWAInstall)}
                className="w-full flex items-center gap-3 px-3 py-2.5 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200 hover:border-blue-400 transition-all"
              >
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon.Download size={16} className="text-white" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-bold text-gray-900">Cài Đặt App</p>
                  <p className="text-[10px] text-gray-600">Trải nghiệm tốt hơn</p>
                </div>
                <Icon.ChevronRight className={`text-gray-400 transition-transform ${showPWAInstall ? 'rotate-90' : ''}`} size={16} />
              </button>

              <AnimatePresence>
                {showPWAInstall && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 p-4 bg-white rounded-xl border border-gray-200 space-y-4"
                  >
                    {/* QR Code */}
                    {qrCodeUrl && (
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-700 mb-3">Quét QR Code để cài đặt:</p>
                        <div className="inline-block p-3 bg-white rounded-xl shadow-md border-2 border-[#7CB342]">
                          <img src={qrCodeUrl} alt="QR Code" className="w-40 h-40" />
                        </div>
                      </div>
                    )}

                    {/* Install Link */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">Hoặc copy link:</p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={installUrl}
                          readOnly
                          className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                        />
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(installUrl);
                            const toast = document.createElement('div');
                            toast.className = 'fixed bottom-24 right-6 bg-green-600 text-white px-6 py-4 rounded-2xl shadow-2xl z-[200] animate-slide-up';
                            toast.innerHTML = '<span class="font-medium">✅ Đã copy link!</span>';
                            document.body.appendChild(toast);
                            setTimeout(() => toast.remove(), 2000);
                          }}
                          className="px-4 py-2 bg-[#7CB342] text-white rounded-lg hover:bg-[#FF9800] transition-colors flex-shrink-0"
                        >
                          Copy
                        </button>
                      </div>
                    </div>

                    {/* Share Button */}
                    <button
                      onClick={async () => {
                        if (navigator.share) {
                          try {
                            await navigator.share({
                              title: 'Farmer Smart App',
                              text: 'Tải app Farmer Smart để mua sắm sản phẩm organic!',
                              url: installUrl
                            });
                          } catch (err) {
                            console.log('Share cancelled');
                          }
                        } else {
                          alert('Trình duyệt không hỗ trợ chia sẻ');
                        }
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
                    >
                      <Icon.Share size={20} />
                      Chia Sẻ App
                    </button>

                    {/* iOS Instructions */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                      <p className="text-xs font-bold text-blue-900 mb-2">📱 Hướng dẫn cài iOS:</p>
                      <ol className="text-xs text-blue-800 space-y-1 ml-4 list-decimal">
                        <li>Mở Safari</li>
                        <li>Nhấn nút Share (⬆️)</li>
                        <li>Chọn "Add to Home Screen"</li>
                        <li>Nhấn "Add"</li>
                      </ol>
                    </div>

                    {/* Android Instructions */}
                    <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                      <p className="text-xs font-bold text-green-900 mb-2">🤖 Hướng dẫn cài Android:</p>
                      <ol className="text-xs text-green-800 space-y-1 ml-4 list-decimal">
                        <li>Mở Chrome</li>
                        <li>Nhấn menu (⋮)</li>
                        <li>Chọn "Install app" hoặc "Add to Home screen"</li>
                        <li>Nhấn "Install"</li>
                      </ol>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Admin Section */}
            {isAdmin && (
              <div className="border-t border-gray-200 pt-4">
                <p className="px-2 py-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  QUẢN TRỊ
                </p>
                <Link
                  to={createPageUrl('AdminDashboard')}
                  onClick={() => handleNavigation(() => {})}
                  className="flex items-center gap-3 px-3 py-3 bg-white rounded-xl border border-gray-200 hover:border-purple-400 hover:shadow-sm transition-all active:scale-[0.98]"
                >
                  <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center transition-transform hover:scale-110">
                    <Icon.Settings size={20} className="text-purple-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-900 flex-1">Admin Panel</span>
                  <Icon.ChevronRight size={16} className="text-gray-400" />
                </Link>
              </div>
            )}

            {/* Shop Section */}
            <div className="border-t border-gray-200 pt-4">
              <p className="px-2 py-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                SHOP
              </p>
              
              {myTenant ? (
                <div className="space-y-1.5">
                  <Link
                    to={createPageUrl(`ShopDashboard?tenant=${myTenant.id}`)}
                    onClick={() => handleNavigation(() => {})}
                    className="flex items-center gap-3 px-3 py-3 bg-white rounded-xl border border-gray-200 hover:border-[#7CB342] hover:shadow-sm transition-all active:scale-[0.98]"
                  >
                    <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center transition-transform hover:scale-110">
                      <Icon.BarChart size={20} className="text-[#7CB342]" />
                    </div>
                    <span className="text-sm font-medium text-gray-900 flex-1">Dashboard</span>
                    <Icon.ChevronRight size={16} className="text-gray-400" />
                  </Link>

                  <Link
                    to={createPageUrl(`ShopPublicStorefront?shop=${myTenant.slug}`)}
                    onClick={() => handleNavigation(() => {})}
                    target="_blank"
                    className="flex items-center gap-3 px-3 py-3 bg-white rounded-xl border border-gray-200 hover:border-blue-400 hover:shadow-sm transition-all active:scale-[0.98]"
                  >
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center transition-transform hover:scale-110">
                      <Icon.Eye size={20} className="text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-900 flex-1">Storefront</span>
                    <Icon.ChevronRight size={16} className="text-gray-400" />
                  </Link>

                  <Link
                    to={createPageUrl(`ShopMyProducts?tenant=${myTenant.id}`)}
                    onClick={() => handleNavigation(() => {})}
                    className="flex items-center gap-3 px-3 py-3 bg-white rounded-xl border border-gray-200 hover:border-orange-400 hover:shadow-sm transition-all active:scale-[0.98]"
                  >
                    <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center transition-transform hover:scale-110">
                      <Icon.Package size={20} className="text-orange-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-900 flex-1">Sản Phẩm</span>
                    <Icon.ChevronRight size={16} className="text-gray-400" />
                  </Link>
                </div>
              ) : (
                <Link
                  to={createPageUrl('TenantSignup')}
                  onClick={() => handleNavigation(() => {})}
                  className="flex items-center gap-3 px-3 py-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-[#7CB342] hover:shadow-lg transition-all active:scale-[0.98]"
                >
                  <div className="w-10 h-10 bg-[#7CB342] rounded-xl flex items-center justify-center transition-transform hover:scale-110">
                    <Icon.Store size={20} className="text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-bold text-gray-900">Đăng Ký Shop</p>
                    <p className="text-[10px] text-gray-600">Bán hàng trên nền tảng</p>
                  </div>
                  <Icon.ChevronRight size={16} className="text-gray-400" />
                </Link>
              )}
            </div>

            {/* Logout */}
            <div className="border-t border-gray-200 pt-4 pb-4">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-3 bg-white rounded-xl border border-red-200 hover:bg-red-50 hover:shadow-sm transition-all text-red-600 active:scale-[0.98]"
              >
                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center transition-transform hover:scale-110">
                  <Icon.X size={20} />
                </div>
                <span className="text-sm font-medium flex-1">Đăng Xuất</span>
                <Icon.ChevronRight size={16} className="text-gray-400" />
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 text-center text-xs text-gray-500 pb-safe">
            <p>Farmer Smart © 2024</p>
            <p className="mt-1">Phiên bản 1.0.0</p>
          </div>
        </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}