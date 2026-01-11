import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, MessageCircle, Heart, 
  Users, Package, ArrowUp 
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function BottomNavBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Update cart count
  useEffect(() => {
    const updateCartCount = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('zerofarm-cart') || '[]');
        const total = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        setCartCount(total);
      } catch {
        setCartCount(0);
      }
    };

    const updateWishlistCount = () => {
      try {
        const wishlist = JSON.parse(localStorage.getItem('zerofarm-wishlist') || '[]');
        setWishlistCount(wishlist.length);
      } catch {
        setWishlistCount(0);
      }
    };

    updateCartCount();
    updateWishlistCount();

    window.addEventListener('cart-updated', updateCartCount);
    window.addEventListener('wishlist-updated', updateWishlistCount);
    window.addEventListener('storage', () => {
      updateCartCount();
      updateWishlistCount();
    });

    return () => {
      window.removeEventListener('cart-updated', updateCartCount);
      window.removeEventListener('wishlist-updated', updateWishlistCount);
    };
  }, []);

  // Show back to top
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // ✅ Use event to open cart modal (handled by ShoppingCartEnhanced in Layout)
  const handleOpenCart = useCallback(() => {
    window.dispatchEvent(new Event('open-cart-widget'));
  }, []);

  // ✅ Use event to open chatbot (handled by ChatBot in Layout)
  const handleOpenChat = useCallback(() => {
    window.dispatchEvent(new Event('open-chatbot'));
  }, []);

  // ✅ Use event to open wishlist modal (handled in Layout)
  const handleOpenWishlist = useCallback(() => {
    window.dispatchEvent(new Event('open-wishlist-modal'));
  }, []);

  // ✅ Use React Router navigate instead of window.location.href
  const handleNavigate = useCallback((path) => {
    navigate(path);
  }, [navigate]);

  const isActive = (path) => {
    const homePath = createPageUrl('Home');
    if (path === homePath) return location.pathname === homePath || location.pathname === '/';
    return location.pathname.includes(path.replace('/', ''));
  };

  const navItems = [
    {
      id: 'community',
      icon: Users,
      label: 'Cộng đồng',
      action: () => handleNavigate(createPageUrl('Community')),
      isLink: true,
      path: '/Community'
    },
    {
      id: 'products',
      icon: Package,
      label: 'Sản phẩm',
      action: () => handleNavigate(createPageUrl('Services')),
      isLink: true,
      path: '/Services'
    },
    {
      id: 'cart',
      icon: ShoppingCart,
      label: 'Giỏ hàng',
      action: handleOpenCart,
      badge: cartCount,
      highlight: true
    },
    {
      id: 'wishlist',
      icon: Heart,
      label: 'Yêu thích',
      action: handleOpenWishlist,
      badge: wishlistCount
    },
    {
      id: 'chat',
      icon: MessageCircle,
      label: 'Trợ lý',
      action: handleOpenChat
    },
  ];

  return (
    <>
      {/* Back to Top - Positioned above nav bar */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            onClick={scrollToTop}
            className="fixed bottom-20 left-4 z-50 w-9 h-9 bg-white/90 backdrop-blur-sm text-[#7CB342] rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:bg-[#7CB342] hover:text-white transition-colors"
            aria-label="Về đầu trang"
          >
            <ArrowUp className="w-4 h-4" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-lg safe-area-bottom">
        <div className="max-w-lg mx-auto px-2">
          <div className="flex items-center justify-around py-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = item.isLink && isActive(item.path);
              
              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  className={`
                    relative flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all
                    ${item.highlight 
                      ? 'bg-[#7CB342] text-white shadow-md -mt-3 px-4' 
                      : active 
                        ? 'text-[#7CB342]' 
                        : 'text-gray-500 hover:text-[#7CB342]'
                    }
                  `}
                >
                  <div className="relative">
                    <Icon className={`${item.highlight ? 'w-5 h-5' : 'w-5 h-5'}`} />
                    {item.badge > 0 && (
                      <span className={`
                        absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 
                        ${item.highlight ? 'bg-white text-[#7CB342]' : 'bg-red-500 text-white'} 
                        rounded-full text-[10px] font-bold flex items-center justify-center
                      `}>
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )}
                  </div>
                  <span className={`text-[10px] mt-0.5 font-medium ${item.highlight ? 'text-white' : ''}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <style>{`
          .safe-area-bottom {
            padding-bottom: env(safe-area-inset-bottom, 0px);
          }
        `}</style>
      </nav>

      {/* Spacer for bottom nav */}
      <div className="h-16" />
    </>
  );
}