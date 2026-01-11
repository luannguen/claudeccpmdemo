import { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import {
  buildOrderData,
  createOrder,
  updateLoyaltyAccount,
  updateCustomerRecord,
  clearShopCart,
  getShopCart,
  saveShopCart,
  calculateLoyaltyPoints
} from "@/components/services/ShopCheckoutService";

// ========== INITIAL FORM STATE ==========

const INITIAL_FORM_DATA = {
  customer_name: '',
  customer_email: '',
  customer_phone: '',
  shipping_address: '',
  shipping_city: '',
  shipping_district: '',
  shipping_ward: '',
  note: ''
};

// ========== URL PARAMS ==========

export function useShopSlug() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('shop');
}

// ========== DATA HOOKS ==========

export function useCurrentUser() {
  return useQuery({
    queryKey: ['checkout-user'],
    queryFn: async () => {
      try {
        return await base44.auth.me();
      } catch (error) {
        return null;
      }
    },
    retry: false
  });
}

export function useShopInfo(shopSlug) {
  return useQuery({
    queryKey: ['shop-checkout', shopSlug],
    queryFn: async () => {
      const tenants = await base44.entities.Tenant.list('-created_date', 100);
      return tenants.find(t => t.slug === shopSlug);
    },
    enabled: !!shopSlug
  });
}

export function useExistingCustomer(userEmail) {
  return useQuery({
    queryKey: ['customer-info', userEmail],
    queryFn: async () => {
      if (!userEmail) return null;
      const customers = await base44.entities.Customer.list('-created_date', 500);
      return customers.find(c => c.email === userEmail);
    },
    enabled: !!userEmail
  });
}

// ========== FORM STATE ==========

export function useCheckoutForm(existingCustomer, currentUser) {
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [saveInfo, setSaveInfo] = useState(true);

  // Auto-fill form when customer data is loaded
  useEffect(() => {
    if (existingCustomer) {
      setFormData({
        customer_name: existingCustomer.full_name || currentUser?.full_name || '',
        customer_email: existingCustomer.email || currentUser?.email || '',
        customer_phone: existingCustomer.phone || '',
        shipping_address: existingCustomer.address || '',
        shipping_city: existingCustomer.city || '',
        shipping_district: existingCustomer.district || '',
        shipping_ward: existingCustomer.ward || '',
        note: ''
      });
    } else if (currentUser) {
      setFormData(prev => ({
        ...prev,
        customer_name: currentUser.full_name || prev.customer_name,
        customer_email: currentUser.email || prev.customer_email
      }));
    }
  }, [existingCustomer, currentUser]);

  const updateField = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  return {
    formData, setFormData, updateField,
    paymentMethod, setPaymentMethod,
    saveInfo, setSaveInfo
  };
}

// ========== CART STATE ==========

export function useShopCart(shopId) {
  const [cart, setCart] = useState([]);

  // Initialize cart from localStorage
  useEffect(() => {
    if (shopId) {
      setCart(getShopCart(shopId));
    }
  }, [shopId]);

  const updateQuantity = useCallback((productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }
    const updatedCart = cart.map(item =>
      item.id === productId ? { ...item, quantity: newQuantity } : item
    );
    setCart(updatedCart);
    saveShopCart(shopId, updatedCart);
  }, [cart, shopId]);

  const removeFromCart = useCallback((productId) => {
    const updatedCart = cart.filter(item => item.id !== productId);
    setCart(updatedCart);
    saveShopCart(shopId, updatedCart);
  }, [cart, shopId]);

  return { cart, setCart, updateQuantity, removeFromCart };
}

// ========== CALCULATIONS ==========

export function useCheckoutCalculations(cart) {
  return useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingFee = subtotal >= 200000 ? 0 : 30000;
    const total = subtotal + shippingFee;
    const freeShipping = subtotal >= 200000;
    
    return { subtotal, shippingFee, total, freeShipping };
  }, [cart]);
}

// ========== ORDER SUBMISSION ==========

export function useOrderSubmission(shop, formData, cart, paymentMethod, calculations, existingCustomer, currentUser, saveInfo) {
  const [isProcessing, setIsProcessing] = useState(false);

  const createOrderMutation = useMutation({
    mutationFn: async (orderData) => createOrder(orderData),
    onSuccess: async (order) => {
      const pointsEarned = calculateLoyaltyPoints(calculations.total);
      
      // Update loyalty
      if (currentUser?.email) {
        await updateLoyaltyAccount(
          currentUser.email,
          formData.customer_name,
          calculations.total,
          order
        );
      }
      
      // Update customer record
      if (saveInfo) {
        await updateCustomerRecord(formData, existingCustomer, shop, calculations.total);
      }

      // Clear cart
      clearShopCart(shop?.id);
      
      // Show success
      alert(`🎉 Đặt hàng thành công!\n\n✅ Mã đơn: ${order.order_number || order.id?.slice(-8)}\n⭐ Bạn nhận được ${pointsEarned} điểm tích lũy!\n\nChúng tôi sẽ liên hệ với bạn sớm nhất.`);
      
      window.location.href = createPageUrl('MyOrders');
    },
    onError: (error) => {
      alert('Đặt hàng thất bại: ' + error.message);
    }
  });

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (cart.length === 0) {
      alert('Giỏ hàng trống!');
      return;
    }

    setIsProcessing(true);

    try {
      const orderData = buildOrderData(formData, cart, shop, paymentMethod, calculations);
      await createOrderMutation.mutateAsync(orderData);
    } catch (error) {
      console.error('Order error:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [cart, formData, shop, paymentMethod, calculations, createOrderMutation]);

  return { isProcessing, handleSubmit };
}

// ========== MAIN HOOK ==========

export function useShopCheckout() {
  const shopSlug = useShopSlug();
  
  // Data
  const { data: currentUser } = useCurrentUser();
  const { data: shop, isLoading: isLoadingShop } = useShopInfo(shopSlug);
  const { data: existingCustomer } = useExistingCustomer(currentUser?.email);
  
  // Form
  const form = useCheckoutForm(existingCustomer, currentUser);
  
  // Cart
  const cartState = useShopCart(shop?.id);
  
  // Calculations
  const calculations = useCheckoutCalculations(cartState.cart);
  
  // Submission
  const { isProcessing, handleSubmit } = useOrderSubmission(
    shop, form.formData, cartState.cart, form.paymentMethod,
    calculations, existingCustomer, currentUser, form.saveInfo
  );

  return {
    // Data
    shopSlug,
    shop,
    currentUser,
    existingCustomer,
    isLoadingShop,
    
    // Form
    ...form,
    
    // Cart
    ...cartState,
    
    // Calculations
    ...calculations,
    
    // Actions
    isProcessing,
    handleSubmit
  };
}