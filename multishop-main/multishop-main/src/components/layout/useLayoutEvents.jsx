import { useEffect, useCallback, useRef } from 'react';

// ✅ Hook xử lý scroll với direction detection
export function useScrollEffect(setIsScrolled, setScrollDirection) {
  const lastScrollY = useRef(0);
  
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Update isScrolled
      setIsScrolled(currentScrollY > 80);
      
      // Update scroll direction (nếu có setter)
      if (setScrollDirection) {
        if (currentScrollY > lastScrollY.current && currentScrollY > 120) {
          setScrollDirection('down');
        } else if (currentScrollY < lastScrollY.current) {
          setScrollDirection('up');
        }
      }
      
      lastScrollY.current = currentScrollY;
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [setIsScrolled, setScrollDirection]);
}

// ✅ Hook xử lý smooth scroll
export function useSmoothScroll() {
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);
}

// ✅ Hook xử lý các custom events từ app
export function useLayoutEvents({
  setIsBookingOpen,
  setInitialService,
  setIsCheckoutOpen,
  setCheckoutCartItems,
  setIsNotificationModalOpen,
  setIsWishlistModalOpen
}) {
  useEffect(() => {
    const openBookingModal = () => {
      const cart = localStorage.getItem('zerofarm-cart');
      const cartItems = cart ? JSON.parse(cart) : [];

      if (cartItems.length > 0) {
        setCheckoutCartItems(cartItems);
        setIsCheckoutOpen(true);
      } else {
        setInitialService(null);
        setIsBookingOpen(true);
      }
    };

    const openBookingModalWithService = (event) => {
      setInitialService(event.detail.service);
      setIsBookingOpen(true);
    };

    const openCheckoutModal = (event) => {
      setCheckoutCartItems(event.detail.cartItems || []);
      setIsCheckoutOpen(true);
    };

    const openNotificationModal = () => setIsNotificationModalOpen(true);
    const openWishlistModal = () => setIsWishlistModalOpen(true);

    window.addEventListener('open-booking-modal', openBookingModal);
    window.addEventListener('open-booking-modal-with-service', openBookingModalWithService);
    window.addEventListener('open-checkout-modal', openCheckoutModal);
    window.addEventListener('open-user-notifications-modal', openNotificationModal);
    window.addEventListener('open-wishlist-modal', openWishlistModal);

    return () => {
      window.removeEventListener('open-booking-modal', openBookingModal);
      window.removeEventListener('open-booking-modal-with-service', openBookingModalWithService);
      window.removeEventListener('open-checkout-modal', openCheckoutModal);
      window.removeEventListener('open-user-notifications-modal', openNotificationModal);
      window.removeEventListener('open-wishlist-modal', openWishlistModal);
    };
  }, [setIsBookingOpen, setInitialService, setIsCheckoutOpen, setCheckoutCartItems, setIsNotificationModalOpen, setIsWishlistModalOpen]);
}

// ✅ Hook xử lý newsletter subscription
export function useNewsletterSubscription(base44) {
  const handleNewsletterSubmit = useCallback(async (email, setStatus, setEmail) => {
    if (!email.trim()) return;

    try {
      const existing = await base44.entities.NewsletterSubscriber.list('-created_date', 500);
      const alreadySubscribed = existing.find(s => s.email.toLowerCase() === email.toLowerCase());

      if (alreadySubscribed) {
        setStatus('exists');
      } else {
        await base44.entities.NewsletterSubscriber.create({
          email: email.toLowerCase(),
          status: 'active',
          source: 'website_footer',
          subscribed_date: new Date().toISOString()
        });
        setStatus('success');
      }
      
      setEmail('');
      setTimeout(() => setStatus(null), 5000);
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      setStatus('error');
    }
  }, [base44]);

  return { handleNewsletterSubmit };
}