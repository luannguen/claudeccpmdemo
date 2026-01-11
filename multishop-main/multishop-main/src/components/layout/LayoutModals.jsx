import React, { useState, useEffect } from "react";
import BookingModal from "@/components/BookingModal";
import CheckoutModal from "@/components/CheckoutModal";
// ✅ MIGRATED: Using features/notification module (v2.1)
import { ClientNotificationModal } from "@/components/features/notification";
import WishlistModal from "@/components/modals/WishlistModal";
import UserMobileMenu from "@/components/UserMobileMenu";
import OrderDetailModalEnhanced from "@/components/modals/OrderDetailModalEnhanced";
import { base44 } from "@/api/base44Client";

export default function LayoutModals({
  // Booking Modal
  isBookingOpen,
  setIsBookingOpen,
  initialService,
  setInitialService,
  // Checkout Modal
  isCheckoutOpen,
  setIsCheckoutOpen,
  checkoutCartItems,
  setCheckoutCartItems,
  // Notification Modal
  isNotificationModalOpen,
  setIsNotificationModalOpen,
  // Wishlist Modal
  isWishlistModalOpen,
  setIsWishlistModalOpen,
  // User Menu
  isUserMenuOpen,
  setIsUserMenuOpen,
  currentUser
}) {
  // Order Detail Modal state
  const [isOrderDetailOpen, setIsOrderDetailOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Listen for open-order-detail event from chatbot
  useEffect(() => {
    const handleOpenOrderDetail = async (e) => {
      const { orderId, order } = e.detail || {};
      
      // Always fetch fresh order data from server for complete info
      const idToFetch = orderId || order?.id;
      if (idToFetch) {
        try {
          const orders = await base44.entities.Order.filter({ id: idToFetch });
          if (orders.length > 0) {
            setSelectedOrder(orders[0]);
            setIsOrderDetailOpen(true);
            return;
          }
        } catch (err) {
          console.error('Failed to fetch order:', err);
        }
      }
      
      // Fallback: use provided order data if fetch failed
      if (order) {
        setSelectedOrder(order);
        setIsOrderDetailOpen(true);
      }
    };

    window.addEventListener('open-order-detail', handleOpenOrderDetail);
    return () => window.removeEventListener('open-order-detail', handleOpenOrderDetail);
  }, []);

  const handleCloseBookingModal = React.useCallback(() => {
    setIsBookingOpen(false);
    setInitialService(null);
  }, [setIsBookingOpen, setInitialService]);

  const handleCloseCheckout = React.useCallback(() => {
    setIsCheckoutOpen(false);
    setCheckoutCartItems([]);
  }, [setIsCheckoutOpen, setCheckoutCartItems]);

  const handleCloseOrderDetail = React.useCallback(() => {
    setIsOrderDetailOpen(false);
    setSelectedOrder(null);
  }, []);

  return (
    <>
      <UserMobileMenu
        isOpen={isUserMenuOpen}
        onClose={() => setIsUserMenuOpen(false)}
        user={currentUser}
      />
      
      <BookingModal
        isOpen={isBookingOpen}
        onClose={handleCloseBookingModal}
        initialService={initialService}
      />
      
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={handleCloseCheckout}
        cartItems={checkoutCartItems}
      />
      
      <ClientNotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        currentUser={currentUser}
      />
      
      <WishlistModal
        isOpen={isWishlistModalOpen}
        onClose={() => setIsWishlistModalOpen(false)}
      />
      
      <OrderDetailModalEnhanced
        isOpen={isOrderDetailOpen}
        onClose={handleCloseOrderDetail}
        order={selectedOrder}
      />
    </>
  );
}