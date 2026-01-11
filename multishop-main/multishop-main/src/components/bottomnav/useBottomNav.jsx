/**
 * useBottomNav Hook
 * 
 * Hook quản lý state và logic cho Bottom Navigation.
 * Tuân thủ kiến trúc 3 lớp - đây là Feature Logic Layer.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { getNavItemsForPage, getPageTheme } from './bottomNavConfig';

/**
 * Hook quản lý Bottom Navigation
 */
export function useBottomNav(currentPageName) {
  const navigate = useNavigate();
  const location = useLocation();
  
  // State
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [readingCount, setReadingCount] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Get nav items based on current page
  const navItems = useMemo(() => {
    return getNavItemsForPage(currentPageName);
  }, [currentPageName]);

  // Get theme
  const theme = useMemo(() => {
    return getPageTheme(currentPageName);
  }, [currentPageName]);

  // ========== CART & WISHLIST COUNT ==========
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

    const updateReadingCount = () => {
      try {
        const reading = JSON.parse(localStorage.getItem('farmersmart-reading-progress') || '{}');
        const count = Object.keys(reading).filter(k => reading[k]?.hasProgress).length;
        setReadingCount(count);
      } catch {
        setReadingCount(0);
      }
    };

    updateCartCount();
    updateWishlistCount();
    updateReadingCount();

    window.addEventListener('cart-updated', updateCartCount);
    window.addEventListener('wishlist-updated', updateWishlistCount);
    window.addEventListener('reading-progress-updated', updateReadingCount);
    window.addEventListener('storage', () => {
      updateCartCount();
      updateWishlistCount();
      updateReadingCount();
    });

    return () => {
      window.removeEventListener('cart-updated', updateCartCount);
      window.removeEventListener('wishlist-updated', updateWishlistCount);
      window.removeEventListener('reading-progress-updated', updateReadingCount);
    };
  }, []);

  // ========== SCROLL HANDLING ==========
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

  // ========== ITEM ACTION HANDLER ==========
  const handleItemAction = useCallback((item) => {
    switch (item.type) {
      case 'navigate':
        const url = item.params 
          ? `${createPageUrl(item.path)}${item.params}`
          : createPageUrl(item.path);
        navigate(url);
        break;
        
      case 'event':
        window.dispatchEvent(new CustomEvent(item.event, { detail: item }));
        break;
        
      case 'external':
        window.open(item.href, '_self');
        break;
        
      case 'action':
        if (item.action === 'share') {
          if (navigator.share) {
            navigator.share({
              title: document.title,
              url: window.location.href
            }).catch(() => {});
          } else {
            navigator.clipboard.writeText(window.location.href);
            window.dispatchEvent(new CustomEvent('show-toast', {
              detail: { message: 'Đã sao chép link!', type: 'success' }
            }));
          }
        }
        break;
        
      default:
        console.warn('Unknown action type:', item.type);
    }
  }, [navigate]);

  // ========== ACTIVE STATE ==========
  const isItemActive = useCallback((item) => {
    if (item.type !== 'navigate') return false;
    
    const itemPath = createPageUrl(item.path);
    const currentPath = location.pathname;
    
    // Exact match or starts with (for nested pages)
    return currentPath === itemPath || 
           currentPath.toLowerCase().includes(item.path.toLowerCase());
  }, [location.pathname]);

  // ========== GET BADGE COUNT ==========
  const getBadgeCount = useCallback((item) => {
    if (!item.showBadge) return 0;
    
    switch (item.showBadge) {
      case 'cart':
        return cartCount;
      case 'wishlist':
        return wishlistCount;
      case 'reading':
        return readingCount;
      default:
        return 0;
    }
  }, [cartCount, wishlistCount, readingCount]);

  return {
    navItems,
    theme,
    showBackToTop,
    scrollToTop,
    handleItemAction,
    isItemActive,
    getBadgeCount,
    cartCount,
    wishlistCount,
    readingCount
  };
}

export default useBottomNav;